import { Poet } from '../poet';
import { Post } from './defaults';
import utils from './utils';

function createHelpers (poet: Poet) {
  var options = poet.options;
  var helpers = {
    getTags: getTags.bind(null, poet),
    getCategories: getCategories.bind(null, poet),
    tagURL: (val: string) => {
      const route = utils.getRoute(options.routes || {}, 'tag');
      return utils.createURL(route, val);
    },
    categoryURL: (val: string) => {
      const route = utils.getRoute(options.routes || {}, 'category');
      return utils.createURL(route, val);
    },
    pageURL: (val: string) => {
      const route = utils.getRoute(options.routes || {}, 'page');
      return utils.createURL(route, val);
    },
    getPostCount: function () { return this.getPosts().length; },
    getPost: (title: Post['title']) => poet.posts[title],
    getPosts: function (from?: number, to?: number) {
      let posts = getPosts(poet);
      if (from != null && to != null)
        posts = posts.slice(from, to);

      return posts;
    },
    getPageCount: () => Math.ceil(getPosts(poet).length / options.postsPerPage),
    postsWithTag: (tag: string) => getPosts(poet).filter((post) => post.tags && ~post.tags.indexOf(tag)),
    postsWithCategory: (category: string) => getPosts(poet).filter((post) => post.category === category),
    options: options
  };

  return helpers;
}
export default createHelpers;

/**
 * Takes a `poet` instance and returns the posts in sorted, array form
 *
 * @returns {Array}
 */

function getPosts (poet: Poet): Post[] {
  if (poet.cache.posts)
    return poet.cache.posts;

  const posts = utils.sortPosts(poet.posts, poet).filter((post) => {
    // Filter out draft posts if showDrafts is false
    return (poet.options.showDrafts || !post.draft) &&
    // Filter out posts in the future if showFuture is false
      // @ts-ignore
      (poet.options.showFuture || post.date < Date.now());
  });

  return poet.cache.posts = posts;
}

/**
 * Takes a `poet` instance and returns the tags in sorted, array form
 *
 * @params {Object} poet
 */

function getTags (poet: Poet) {
  return poet.cache.tags || (poet.cache.tags = utils.getTags(getPosts(poet)));
}

/**
 * Takes a `poet` instance and returns the categories in sorted, array form
 *
 * @params {Object} poet
 */

function getCategories (poet: Poet) {
  return poet.cache.categories ||
    (poet.cache.categories = utils.getCategories(getPosts(poet)));
}
