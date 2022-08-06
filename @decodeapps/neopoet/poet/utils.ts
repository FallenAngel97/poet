import fs from "fs-then";
import path from "path";
import { all } from "when";
import yamlFm from "front-matter";
import { parse as jsonFm } from "json-front-matter";
import createDefaults, { PoetOptions, Post } from "./defaults";
import type { Stats } from 'fs';
import { Application } from "express";
import type createHelpers from "./helpers";
import { PostsMap } from "../poet";

/**
 * Takes an `options` object and merges with the default, creating
 * a new object with
 */

export function createOptions(options: Partial<PoetOptions>): PoetOptions {
  return Object.assign({}, createDefaults(), options || {});
}

/**
 * Takes a `route` string (ex: '/posts/:post') and replaces the parameter with
 * the `value` (ex: '/posts/my-post');
 *
 */

export function createURL(route: string | null, value: string) {
  if (!route) {
    return "";
  }
  return encodeURI(route.match(/[^\:]*/)?.[0] + value);
}

/**
 * Recursively search `dir` and return all file paths as strings in
 * an array
 */

export function getPostPaths(dir: string): Promise<string[]> {
  return fs
    .readdir(dir)
    .then((files: string[]) => {
      return all(
        files.map((file) => {
          const path = pathify(dir, file);
          return fs.stat(path).then((stats: Stats) => {
            return stats.isDirectory() ? getPostPaths(path) : path;
          });
        })
      );
    })
    .then((files: string[] | string[][]) => files.flat());
}

/**
 * Takes an express `app` and object of `helpers`
 * that are to be attached to `app` for use in
 * view templates
 *
 * @params {Object} app
 * @params {Object} helpers
 */

export function createLocals(app: Application, helpers: ReturnType<typeof createHelpers>) {
  Object.assign(app.locals, helpers);
}

/**
 * Takes a `post` object, `body` text and an `options` object
 * and generates preview text in order of priority of a `preview`
 * property on the post, then `previewLength`, followed by
 * finding a `readMoreTag` in the body.
 *
 * Otherwise, use the first paragraph in `body`.
 */

export function getPreview(post: Post, body: string, options: PoetOptions) {
  const readMoreTag = options.readMoreTag || post.readMoreTag;
  let preview: string;
  if (post.preview) {
    preview = post.preview;
  } else if (post.previewLength) {
    preview = body.trim().substring(0, post.previewLength);
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
 */

export function method<T>(lambda: Function): () => T {
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
 */

export function getTemplate(templates: Record<string, Function>, fileName: string): Function | null {
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
 */

export function createPost(filePath: string, options: PoetOptions): Promise<Post> {
  return fs.readFile(filePath, "utf-8").then((data: string) => {
    const parsed = (options.metaFormat === "yaml" ? yamlFm : jsonFm)(data);
    const body = parsed.body;
    const post = parsed.attributes as Post;
    // If no date defined, create one for current date
    post.date = new Date(post.date);
    post.content = body;
    // url slug for post
    post.slug = convertStringToSlug(post.slug || post.title);
    post.url = createURL(getRoute(options.routes || {}, "post"), post.slug);
    post.preview = getPreview(post, body, options);
    return post;
  });
}

/**
 * Takes an array `posts` of post objects and returns a
 * new, sorted version based off of date
 *
 */

export function sortPosts(posts: PostsMap): Post[] {
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

export type PoetRoutes = 'post' | 'page' | 'tag' | 'category';

export function getRouteType(route: string): PoetRoutes | null {
  const match = route.match(/\:(post|page|tag|category)\b/);
  if (match && match.length > 1) return match[1] as PoetRoutes;
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
