export type Post<T = {}> = {
  url: string;
  title: string;
  slug: string;
  date: Date;
  category: string;
  previewLength: number;
  draft: boolean;
  content: string;
  preview: string;
  readMoreTag: string;
  tags: string[];
} & T;

function readMoreLink (post: Post) {
  let anchor = `<a href="${post.url}"`;
  anchor += ' title="Read more of ' + post.title + '">read more</a>';
  return '<p class="poet-read-more">' + anchor + '</p>';
}

export type PoetOptions = {
  postsPerPage: number;
  posts: string;
  showDrafts: boolean;
  showFuture: boolean;
  metaFormat: 'json' | 'yaml';
  readMoreLink: (post: Post) => string;
  readMoreTag: string;
  routes: Record<string, string> | null;
  sortingFunction?: (a: any, b: any) => 1 | -1 | 0;

  [key: string]: any;
}

/**
 * Returns a fresh copy of default options
 *
 */

function createDefaultOptions (): PoetOptions {
 return {
    postsPerPage: 5,
    posts: './_posts/',
    showDrafts: process.env.NODE_ENV !== 'production',
    showFuture: process.env.NODE_ENV !== 'production',
    metaFormat: 'json',
    readMoreLink,
    readMoreTag: '<!--more-->',
    routes: {
      '/post/:post': 'post',
      '/page/:page': 'page',
      '/tag/:tag': 'tag',
      '/category/:category': 'category'
    }
  };
}

export default createDefaultOptions;
