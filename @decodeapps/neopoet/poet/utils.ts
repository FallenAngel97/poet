import fs from "fs-then";
import path from "path";
import { all } from "when";
import yamlFm from "front-matter";
import { parse as jsonFm } from "json-front-matter";
import createDefaults, { Post } from "./defaults";

/**
 * Takes an `options` object and merges with the default, creating
 * a new object with
 *
 * @params {Object} options
 * @returns {Object}
 */

export function createOptions(options) {
  return Object.assign({}, createDefaults(), options || {});
}

/**
 * Takes a `route` string (ex: '/posts/:post') and replaces the parameter with
 * the `value` (ex: '/posts/my-post');
 *
 * @params {String} route
 * @params {String} value
 * @returns {String}
 */

export function createURL(route, value) {
  if (!route) {
    return "";
  }
  return encodeURI(route.match(/[^\:]*/)[0] + value);
}

/**
 * Recursively search `dir` and return all file paths as strings in
 * an array
 *
 * @params {String} dir
 * @returns {Array}
 */

export function getPostPaths(dir) {
  return fs
    .readdir(dir)
    .then((files) => {
      return all(
        files.map((file) => {
          const path = pathify(dir, file);
          return fs.stat(path).then((stats) => {
            return stats.isDirectory() ? getPostPaths(path) : path;
          });
        })
      );
    })
    .then((files) => files.flat());
}

/**
 * Takes an express `app` and object of `helpers`
 * that are to be attached to `app` for use in
 * view templates
 *
 * @params {Object} app
 * @params {Object} helpers
 */

function createLocals(app, helpers) {
  Object.assign(app.locals, helpers);
}
exports.createLocals = createLocals;

/**
 * Takes a `post` object, `body` text and an `options` object
 * and generates preview text in order of priority of a `preview`
 * property on the post, then `previewLength`, followed by
 * finding a `readMoreTag` in the body.
 *
 * Otherwise, use the first paragraph in `body`.
 *
 * @params {Object} post
 * @params {String} body
 * @params {Object} options
 * @return {String}
 */

export function getPreview(post, body, options) {
  const readMoreTag = options.readMoreTag || post.readMoreTag;
  let preview;
  if (post.preview) {
    preview = post.preview;
  } else if (post.previewLength) {
    preview = body.trim().substr(0, post.previewLength);
  } else if (~body.indexOf(readMoreTag)) {
    preview = body.split(readMoreTag)[0];
  } else {
    preview = body.trim().replace(/\n.*/g, "");
  }

  return preview;
}

/**
 * Takes `lambda` function and returns a method. When returned method is
 * invoked, it calls the wrapped `lambda` and passes `this` as a first argument
 * and given arguments as the rest.
 *
 * @params {Function} lambda
 * @returns {Function}
 */

export function method(lambda) {
  return function (this:any) {
    return lambda.apply(
      null,
      [this].concat(Array.prototype.slice.call(arguments, 0))
    );
  };
}

/**
 * Takes a templates hash `templates` and a fileName
 * and returns a templating function if found
 *
 * @params {Object} templates
 * @params {String} fileName
 * @returns {Function|null}
 */

export function getTemplate(templates, fileName) {
  const extMatch = fileName.match(/\.([^\.]*)$/);
  if (extMatch && extMatch.length > 1) return templates[extMatch[1]];
  return null;
}

function convertStringToSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w- ]+/g, "")
    .replace(/ +/g, "-");
}

/**
 * Accepts a name of a file and an options hash and returns an object
 * representing a post object
 *
 * @params {String} data
 * @params {String} fileName
 * @params {Object} options
 * @returns {Object}
 */

export function createPost(filePath: string, options) {
  return fs.readFile(filePath, "utf-8").then((data) => {
    const parsed = (options.metaFormat === "yaml" ? yamlFm : jsonFm)(data);
    const body = parsed.body;
    const post = parsed.attributes as Post;
    // If no date defined, create one for current date
    post.date = new Date(post.date);
    post.content = body;
    // url slug for post
    post.slug = convertStringToSlug(post.slug || post.title);
    post.url = createURL(getRoute(options.routes, "post"), post.slug);
    post.preview = getPreview(post, body, options);
    return post;
  });
}

/**
 * Takes an array `posts` of post objects and returns a
 * new, sorted version based off of date
 *
 */

export function sortPosts(posts: Post[]) {
  return Object.keys(posts)
    .map((post) => posts[post])
    .sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });
}

/**
 * Takes an array `posts` of sorted posts and returns
 * a sorted array with all tags
 */

export function getTags(posts: Post[]) {
  var tags = posts.reduce((tags, post) => {
    if (!post.tags || !Array.isArray(post.tags)) return tags;
    return tags.concat(post.tags);
  }, [] as string[]);

  return [...new Set(tags)].sort();
}

/**
 * Takes an array `posts` of sorted posts and returns
 * a sorted array with all categories
 *
 */

export function getCategories(posts: Post[]) {
  const categories = posts.reduce((categories, post) => {
    if (!post.category) return categories;
    return categories.concat(post.category);
  }, [] as string[]);

  return [...new Set(categories)].sort();
}

/**
 * Takes a `route` (ex: '/posts/:post') and returns
 * the name of the parameter (ex: 'post'), which should be a route type
 */

export function getRouteType(route: string) {
  var match = route.match(/\:(post|page|tag|category)\b/);
  if (match && match.length > 1) return match[1];
  return null;
}

/**
 * Takes a hash of `routes`, and a `type` (ex: 'post'), and returns
 * the corresponding route regex as a string. If no route found, returns `null`.
 *
 */

export function getRoute(routes: Record<string, unknown>, type: string): string | null {
  if (!routes) return null;

  return Object.keys(routes).reduce(
    (match: null | string, route) => (getRouteType(route) === type ? route : match),
    null
  );
}

/**
 * Normalizes and joins a path of `dir` and optionally `file`
 *
 */

export function pathify(dir: string, file: string) {
  if (file) return path.normalize(path.join(dir, file));

  return path.normalize(dir);
}

export default {
  pathify,
  createLocals,
  getCategories,
  getRoute,
  getRouteType,
  getTags,
  sortPosts,
  createPost,
  getTemplate,
  method,
  getPreview,
  getPostPaths,
  createURL,
  createOptions,
};
