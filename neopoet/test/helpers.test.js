"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poet_1 = __importDefault(require("../poet"));
const express_1 = __importDefault(require("express"));
const chai_1 = __importDefault(require("chai"));
const expect = chai_1.default.expect;
describe('helpers.getTags()', function () {
    it('should return all tags, sorted and unique', function (done) {
        setup(function (poet) {
            var tags = poet.helpers.getTags();
            expect(tags).to.have.length(4);
            expect(tags[0]).to.be.equal('a');
            expect(tags[1]).to.be.equal('b');
            expect(tags[2]).to.be.equal('c');
            expect(tags[3]).to.be.equal('d');
            done();
        }, done);
    });
});
describe('helpers.getCategories()', function () {
    it('should return all categories, sorted and unique', function (done) {
        setup(function (poet) {
            var cats = poet.helpers.getCategories();
            expect(cats).to.have.length(2);
            expect(cats[0]).to.be.equal('other cat');
            expect(cats[1]).to.be.equal('testing');
            done();
        }, done);
    });
});
describe('helpers[tag|category|page]URL()', function () {
    it('replaces the parameter with value for [tag|page|category]URL', function (done) {
        setup(function (poet) {
            expect(poet.helpers.tagURL('glitchstep')).to.be.equal('/tag/glitchstep');
            expect(poet.helpers.categoryURL('glitchstep')).to.be.equal('/category/glitchstep');
            expect(poet.helpers.pageURL('glitchstep')).to.be.equal('/page/glitchstep');
            done();
        }, done);
    });
    it('encodes the URL safely in [tag|category|page]URL', function (done) {
        setup(function (poet) {
            expect(poet.helpers.categoryURL('phat bass')).to.be.equal('/category/phat%20bass');
            expect(poet.helpers.pageURL('phat bass')).to.be.equal('/page/phat%20bass');
            expect(poet.helpers.tagURL('phat bass')).to.be.equal('/tag/phat%20bass');
            done();
        }, done);
    });
});
describe('helpers.getPostCount()', function () {
    it('should return correct count of posts', function (done) {
        setup(function (poet) {
            expect(poet.helpers.getPostCount()).to.be.equal(6);
            expect(poet.helpers.getPosts().length).to.be.equal(6);
            done();
        }, done);
    });
    it('should return correct count of posts with `showDrafts` false', function (done) {
        setup(function (poet) {
            poet.options.showDrafts = false;
            expect(poet.helpers.getPostCount()).to.be.equal(5);
            expect(poet.helpers.getPosts().length).to.be.equal(5);
            done();
        }, done);
    });
    it('should return correct count of posts with `showFuture` false', function (done) {
        setup(function (poet) {
            poet.options.showFuture = false;
            expect(poet.helpers.getPostCount()).to.be.equal(5);
            expect(poet.helpers.getPosts().length).to.be.equal(5);
            done();
        }, done);
    });
});
describe('helpers.getPost(title)', function () {
    it('should return the correct post associated with `title`', function (done) {
        setup(function (poet) {
            var post = poet.helpers.getPost('pug-test');
            expect(post.slug).to.be.equal('pug-test');
            expect(post.title).to.be.equal('Pug Test');
            done();
        }, done);
    });
});
describe('helpers.getPosts()', function () {
    it('should return all posts if both `from` or `to` are not specified', function (done) {
        setup(function (poet) {
            expect(poet.helpers.getPosts().length).to.be.equal(6);
            expect(poet.helpers.getPosts(3).length).to.be.equal(6);
            expect(poet.helpers.getPosts(undefined, 3).length).to.be.equal(6);
            done();
        }, done);
    });
    it('should return a range if both `from` and `to` are specified', function (done) {
        setup(function (poet) {
            expect(poet.helpers.getPosts(1, 3).length).to.be.equal(2);
            done();
        }, done);
    });
});
describe('helpers.getPageCount()', function () {
    it('returns the correct number of pages', function (done) {
        setup(function (poet) {
            // Based off of 6 posts and default postsPerPage of 5
            expect(poet.helpers.getPageCount()).to.be.equal(2);
            done();
        }, done);
    });
    it('returns the correct number of pages based off of drafts', function (done) {
        setup(function (poet) {
            // Based off of 5 non-draft posts and default postsPerPage of 5
            poet.options.showDrafts = false;
            expect(poet.helpers.getPageCount()).to.be.equal(1);
            done();
        }, done);
    });
});
describe('helpers.postsWithTag()', function () {
    it('should return posts ordered by date, newest first', function (done) {
        setup(function (poet) {
            var posts = poet.helpers.postsWithTag('a');
            (posts[0].date.getTime() > posts[1].date.getTime()).should.equal(true);
            (posts[1].date.getTime() > posts[2].date.getTime()).should.equal(true);
            done();
        }, done);
    });
    it('should not see drafts when `showDrafts` false', function (done) {
        setup(function (poet) {
            poet.options.showDrafts = false;
            expect(poet.helpers.postsWithTag('d').length).to.be.equal(1);
            done();
        }, done);
    });
    it('should not see future posts when `showFuture` false', function (done) {
        setup(function (poet) {
            poet.options.showFuture = false;
            expect(poet.helpers.postsWithTag('c').length).to.be.equal(0);
            done();
        }, done);
    });
});
describe('helpers.postsWithCategories()', function () {
    it('should return posts ordered by date, newest first', function (done) {
        setup(function (poet) {
            var posts = poet.helpers.postsWithCategory('testing');
            (posts[0].date.getTime() > posts[1].date.getTime()).should.equal(true);
            (posts[1].date.getTime() > posts[2].date.getTime()).should.equal(true);
            done();
        }, done);
    });
    it('should not see drafts when `showDrafts` false', function (done) {
        setup(function (poet) {
            poet.options.showDrafts = false;
            var posts = poet.helpers.postsWithCategory('other cat');
            (posts.length).should.equal(1);
            done();
        }, done);
    });
    it('should not see future posts when `showFuture` false', function (done) {
        setup(function (poet) {
            poet.options.showFuture = false;
            expect(poet.helpers.postsWithCategory('testing').length).to.be.equal(2);
            done();
        }, done);
    });
});
function setup(callback, done) {
    var app = (0, express_1.default)();
    var poet = (0, poet_1.default)(app, {
        posts: './test/_postsJson'
    });
    poet.init().then(callback, done).then(null, done);
}
