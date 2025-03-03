import templateSources from './poet/templates';
import createHelpers from './poet/helpers';
import routes from './poet/routes';
import methods from './poet/methods';
import utils, { PoetRoutes } from './poet/utils';
import type { watch } from 'fs';
import { Application } from 'express';

const method = utils.method;

import type { PoetOptions, Post } from './poet/defaults';

type PoetInitCallback = (...args: any) => void;

type PoetWatchers = {
  watcher: ReturnType<typeof watch>;
  callback: () => void;
}

function getKeyByValue(options: Exclude<PoetOptions["routes"], null>, value: PoetRoutes): string {
  return Object.keys(options).find(key => options[key] === value) || '';
}

export interface Poet {
  addTemplate: (...args: any) => Poet;
  init: (callback?: PoetInitCallback, options?: PoetOptions) => Promise<any>;
  clearCache: () => void;
  addRoute: (...args: any) => void;
  watch: (...args: any) => void;
  unwatch: () => void;
  watchers: PoetWatchers[];
}

export type PostsMap = { [postTitle: Post['title']]: Post };

export type PoetCache = {
  posts: Post[];
  tags: string[];
  categories: string[];
};

export class Poet {
  app: Application;
  options: PoetOptions;
  templates: any;
  templateEngines: any;
  helpers: ReturnType<typeof createHelpers>;
  // Set up a hash of posts and a cache for storing sorted array
  // versions of posts, tags, and categories for the helper
  posts = {} as PostsMap;
  cache = {} as PoetCache;

  // Initialize empty watchers list
  watchers = [] as PoetWatchers[];

  // Initialize empty "futures" list
  futures = [] as NodeJS.Timeout[];

  constructor(app: any, options?: Partial<PoetOptions>) {
    this.app = app;

    // Merge options with defaults
    this.options = utils.createOptions(options || {});

    // Set up default templates (markdown, pug)
    this.templates = templateSources.templates;

    // Template engines are exposed so you may do additional configuration
    this.templateEngines = templateSources.templateEngines;

    // Construct helper methods
    this.helpers = createHelpers(this);

    // Bind locals for view access
    utils.createLocals(this.app, this.helpers);

    // Bind routes to express app based off of options
    routes.bindRoutes(this);
  }

  getLinks(flatten: boolean) {
    const postCount = this.helpers.getPostCount();
    const posts = this.helpers.getPosts(0, postCount).map((post) => post.url);
    const tags = this.helpers.getTags().map((tag) => {
      const tagUrl = getKeyByValue(this.options.routes || {}, 'tag');
      return tagUrl.replace(':tag',tag);
    });
    const categories = this.helpers.getCategories().map((category) => {
      const categoryUrl = getKeyByValue(this.options.routes || {}, 'category');
      return categoryUrl.replace(':category',category);
    });
    if(flatten) {
      return [
        ...posts,
        ...tags,
        ...categories
      ]
    }
    return { posts, tags, categories };
  }
}

export default function (app: Application, options?: Partial<PoetOptions>) {
  return new Poet(app, options);
};

Poet.prototype.addTemplate = method(methods.addTemplate);
Poet.prototype.init = method(methods.init);
Poet.prototype.clearCache = method(methods.clearCache);
Poet.prototype.addRoute = method(routes.addRoute);
Poet.prototype.watch = method(methods.watch);
Poet.prototype.unwatch = method(methods.unwatch);
