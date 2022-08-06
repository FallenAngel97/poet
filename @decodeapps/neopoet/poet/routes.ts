import { NextFunction, Request, Response } from "express";
import { Poet } from "../poet";
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

export function bindRoutes(poet: Poet) {
  var app = poet.app;
  const { routes } = poet.options;

  // If no routes specified, abort
  if (!routes) return;

  Object.keys(routes).map((route) => {
    const type = utils.getRouteType(route);
    if (!type) return;

    app.get(route, routeMap[type](poet, routes[route]));
  });
}

export function addRoute(poet: Poet, route: string, handler: any) {
  var routes = poet.options.routes;
  var type = utils.getRouteType(route) || '';
  var currentRoute = utils.getRoute(routes || {}, type);
  if (currentRoute) {
    // Remove current route
    poet.app._router.stack.forEach(function (stackItem: any, index: number) {
      if (stackItem?.route?.path === route) {
        poet.app._router.stack.splice(index, 1);
      }
    });
    // Update options route hash
    delete poet.options.routes![currentRoute];
  }
  poet.options.routes![route] = handler;
  poet.app.get(route, handler);
  return poet;
}

export function postRouteGenerator(poet?: Poet, view?: string) {
  return function postRoute(req: Request, res: Response, next: NextFunction) {
    var post = poet!.helpers.getPost(req.params.post);
    if (post) {
      res.render(view || '', { post: post });
    } else {
      next();
    }
  };
}

export function pageRouteGenerator(poet?: Poet, view?: string) {
  return function pageRoute(req: Request, res: Response, next: NextFunction) {
    var postsPerPage = poet!.options.postsPerPage,
      page = parseInt(req.params.page),
      lastPost = page * postsPerPage,
      posts = poet!.helpers.getPosts(lastPost - postsPerPage, lastPost);
    if (posts.length) {
      res.render(view || '', { posts, page });
    } else {
      next();
    }
  };
}

export function categoryRouteGenerator(poet?: Poet, view?: string) {
  return function categoryRoute(req: Request, res: Response, next: NextFunction) {
    var category = req.params.category,
      posts = poet!.helpers.postsWithCategory(category);
    if (posts.length) {
      res.render(view || '', { posts, category });
    } else {
      next();
    }
  };
}

export function tagRouteGenerator(poet?: Poet, view?: string) {
  return function tagRoute(req: Request, res: Response, next: NextFunction) {
    var tag = req.params.tag,
      posts = poet!.helpers.postsWithTag(tag);
    if (posts.length) {
      res.render(view || '', { posts, tag });
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
