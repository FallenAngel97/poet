import utils from "./utils";
const routeMap = {
  post: postRouteGenerator,
  page: pageRouteGenerator,
  tag: tagRouteGenerator,
  category: categoryRouteGenerator,
};

/**
 * Takes a `poet` instance and generates routes based off of
 * `poet.options.routes` mappings.
 *
 * @params {Object} poet
 */

export function bindRoutes(poet) {
  var app = poet.app;
  const { routes } = poet.options;

  // If no routes specified, abort
  if (!routes) return;

  Object.keys(routes).map((route) => {
    var type = utils.getRouteType(route);
    if (!type) return;

    app.get(route, routeMap[type](poet, routes[route]));
  });
}

export function addRoute(poet, route, handler) {
  var routes = poet.options.routes;
  var type = utils.getRouteType(route);
  var currentRoute = utils.getRoute(routes, type);
  if (currentRoute) {
    // Remove current route
    poet.app._router.stack.forEach(function (stackItem, index) {
      if (
        stackItem.route &&
        stackItem.route.path &&
        stackItem.route.path === route
      ) {
        poet.app._router.stack.splice(index, 1);
      }
    });
    // Update options route hash
    delete poet.options.routes[currentRoute];
  }
  poet.options.routes[route] = handler;
  poet.app.get(route, handler);
  return poet;
}

export function postRouteGenerator(poet?, view?) {
  return function postRoute(req, res, next) {
    var post = poet.helpers.getPost(req.params.post);
    if (post) {
      res.render(view, { post: post });
    } else {
      next();
    }
  };
}

export function pageRouteGenerator(poet?, view?) {
  return function pageRoute(req, res, next) {
    var postsPerPage = poet.options.postsPerPage,
      page = req.params.page,
      lastPost = page * postsPerPage,
      posts = poet.helpers.getPosts(lastPost - postsPerPage, lastPost);
    if (posts.length) {
      res.render(view, { posts, page });
    } else {
      next();
    }
  };
}

export function categoryRouteGenerator(poet?, view?) {
  return function categoryRoute(req, res, next) {
    var category = req.params.category,
      posts = poet.helpers.postsWithCategory(category);
    if (posts.length) {
      res.render(view, { posts, category });
    } else {
      next();
    }
  };
}

export function tagRouteGenerator(poet?, view?) {
  return function tagRoute(req, res, next) {
    var tag = req.params.tag,
      posts = poet.helpers.postsWithTag(tag);
    if (posts.length) {
      res.render(view, { posts, tag });
    } else {
      next();
    }
  };
}

export default {
  postRouteGenerator,
  categoryRouteGenerator,
  bindRoutes,
  tagRouteGenerator,
  pageRouteGenerator,
  addRoute,
};
