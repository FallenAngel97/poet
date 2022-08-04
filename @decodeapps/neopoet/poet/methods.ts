import fs from "fs";
import when, { all, defer } from "when";
import nodefn from "when/node/function";
import fn from "when/function";
import utils from "./utils";
import type { Post } from './defaults';
import type { Poet } from '../poet';

/**
 * Adds `data.fn` as a template formatter for all files with
 * extension `data.ext`, which may be a string or an array of strings.
 * Adds to `poet` instance templates.
 *
 * @params {Poet} poet
 * @params {Object} data
 * @returns {Poet}
 */


export function addTemplate(poet: Poet, data) {
  if (!data.ext || !data.fn)
    throw new Error(
      "Template must have both an extension and formatter function"
    );

  [].concat(data.ext).map(function (ext) {
    poet.templates[ext] = data.fn;
  });

  return poet;
}

/**
 * Takes a `poet` instance and an optional `callback` -- reads
 * all post files and constructs the instance's `posts` data structure
 * with post objects and creates the instance's helper functions.
 * Returns a promise for completion.
 *
 * @params {Object} poet
 * @params {Function} [callback]
 * @returns {Promise}
 */

export function init(poet: Poet, callback) {
  const options = poet.options;

  // Get list of files in `options.posts` directory
  var promise = utils
    .getPostPaths(options.posts)
    .then((files) => {
      // Generate a collection of promises that resolve
      // to post objects
      var collection = files.reduce((coll, file) => {
        var template = utils.getTemplate(poet.templates, file);

        // If no template found, ignore (swap file, etc.)
        if (!template) return coll;

        // If template function accepts more than one argument, then handle 2nd
        // argument as asynchronous node-style callback function
        if (template.length > 1) {
          template = function (template, string) {
            var result = defer();
            // @ts-ignore
            template(string, nodefn.createCallback(result.resolver));
            return result.promise;
          }.bind(null, template);
        }

        // Do the templating and adding to poet instance
        // here for access to the file name
        var post = utils
          .createPost(file, options)
          .then(function (post) {
            const viewOpts = {
              source: "",
              filename: file,
              locals: poet.app ? poet.app.locals : {},
            };
            return when
              .join(
                fn.call(
                  template,
                  Object.assign({}, viewOpts, { source: post.content })
                ),
                fn.call(
                  template,
                  Object.assign({}, viewOpts, { source: post.preview })
                )
              )
              .then(
                function (contents) {
                  post.content = contents[0];
                  post.preview = contents[1] + options.readMoreLink(post);
                  return post;
                },
                function (err) {
                  console.error("Unable to parse file " + file + ": " + err);
                  if (process.env.NODE_ENV === "production") {
                    return err;
                  }
                  post.content = post.preview =
                    '<pre style="font-family: monospace">' + err + "</pre>";
                  return post;
                }
              );
          })
          .then(function (post: Post) {
            if (!(post instanceof Error)) return (poet.posts[post.slug] = post);
            delete poet.posts[(post as Post).slug];
            return null;
          });

        return coll.concat(post);
      }, []);

      return all(collection);
    })
    .then(function (allPosts) {
      // Schedule posts that need scheduling
      scheduleFutures(poet, allPosts);

      // Clear out the cached sorted posts, tags, categories, as this point they
      // could have changed from new posts
      clearCache(poet);
      return poet;
    });

  if (callback) promise.then(callback.bind(null, null), callback.bind(null));

  return promise;
}

/**
 * Clears the `poet` instance's 'cache' object -- useful when modifying
 * posts dynamically
 *
 */
export function clearCache(poet: Poet) {
  poet.cache = {};
  return poet;
}

/**
 * Sets up the `poet` instance to watch the posts directory for any changes
 * and calls the callback whenever a change is made
 */
export function watch(poet: Poet, callback) {
  const watcher = fs.watch(poet.options.posts, () => {
    poet.init().then(callback);
  });
  poet.watchers.push({ watcher, callback });
  return poet;
}

/**
 * Removes all watchers from the `poet` instance so previously registered
 * callbacks are not called again
 */
export function unwatch(poet: Poet) {
  poet.watchers.forEach((watcher) => {
    watcher.watcher.close();
  });
  poet.futures.forEach((future) => {
    clearTimeout(future);
  });
  poet.watchers = [];
  poet.futures = [];
  return poet;
}

/**
 * Schedules a watch event for all posts that are posted in a future date.
 */
export function scheduleFutures(poet: Poet, allPosts: Post[]) {
  const now = Date.now();
  const extraTime = 5 * 1000; // 10 seconds buffer
  const min = now - extraTime;

  allPosts.forEach(function (post, i) {
    if (!post) return;
    const postTime = post.date.getTime();

    // if post is in the future
    if (postTime - min > 0) {
      // Prevent setTimeout overflow when scheduling more than 24 days out. See https://github.com/jsantell/poet/issues/119
      const delay = Math.min(postTime - min, Math.pow(2, 31) - 1);
      const future = setTimeout(() => {
        poet.watchers.forEach((watcher) => {
          poet.init().then(watcher.callback);
        });
      }, delay);

      poet.futures.push(future);
    }
  });
}

export default {
  scheduleFutures,
  unwatch,
  watch,
  clearCache,
  init,
  addTemplate,
};
