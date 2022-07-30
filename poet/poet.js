const
  fs = require('fs'),
  templateSources = require('./poet/templates'),
  createHelpers = require('./poet/helpers'),
  routes = require('./poet/routes'),
  methods = require('./poet/methods'),
  utils = require('./poet/utils'),
  method = utils.method;

class Poet {
  // Set up a hash of posts and a cache for storing sorted array
  // versions of posts, tags, and categories for the helper
  posts = {};
  cache = {};

  // Initialize empty watchers list
  watchers = [];

  // Initialize empty "futures" list
  futures = [];

  constructor(app, options) {
    this.app = app;

    // Merge options with defaults
    this.options = utils.createOptions(options);

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
}

module.exports = function (app, options) {
  return new Poet(app, options);
};

Poet.prototype.addTemplate = method(methods.addTemplate);
Poet.prototype.init = method(methods.init);
Poet.prototype.clearCache = method(methods.clearCache);
Poet.prototype.addRoute = method(routes.addRoute);
Poet.prototype.watch = method(methods.watch);
Poet.prototype.unwatch = method(methods.unwatch);