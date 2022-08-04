import Poet from '../poet';
import express from 'express';
import chai from 'chai';

const expect = chai.expect;

describe('Locals', function () {
  it('should pass in the locals for the view', function (done) {
    var
      app = express(),
      poet = Poet(app, {
        posts: './test/_postsYaml',
        metaFormat: 'yaml'
      });

    poet.init().then(function () {
      console.log(app.locals);
      expect(app.locals.getPostCount()).to.equal(4);
      expect(app.locals.getPosts()).to.have.length(4);
      expect(app.locals.getTags()).to.include('a');
      expect(app.locals.getTags()).to.include('b');
      expect(app.locals.getTags()).to.include('c');
      expect(app.locals.getTags()).to.include('d');
      expect(app.locals.getCategories()).to.include('testing');
      expect(app.locals.getCategories()).to.include('other cat');
      expect(app.locals.pageURL(3)).to.equal('/page/3');
      expect(app.locals.tagURL('sometag')).to.equal('/tag/sometag');
      expect(app.locals.categoryURL('somecat')).to.equal('/category/somecat');
      expect(app.locals.getPosts(2,3)).to.have.length(1);
      expect(app.locals.getPageCount()).to.equal(1);
      done();
    });
  });
});
