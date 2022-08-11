"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poet_1 = __importDefault(require("../poet"));
const express_1 = __importDefault(require("express"));
const chai_1 = __importDefault(require("chai"));
const routes_1 = __importDefault(require("../poet/routes"));
const routeMocks_1 = require("./helpers/routeMocks");
const routeInfo_1 = __importDefault(require("./helpers/routeInfo"));
const expect = chai_1.default.expect;
describe('Routes', function () {
    it('should make the correct auto routes by default', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, { posts: './test/_postsJson' });
        poet.init().then(function () {
            routeInfo_1.default.getCallback(app, '/post/:post')
                .toString().should.equal(routes_1.default.postRouteGenerator().toString());
            routeInfo_1.default.getCallback(app, '/page/:page')
                .toString().should.equal(routes_1.default.pageRouteGenerator().toString());
            routeInfo_1.default.getCallback(app, '/tag/:tag')
                .toString().should.equal(routes_1.default.tagRouteGenerator().toString());
            routeInfo_1.default.getCallback(app, '/category/:category')
                .toString().should.equal(routes_1.default.categoryRouteGenerator().toString());
            done();
        });
    });
    it('should use the default views', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, { posts: './test/_postsJson' });
        var reqPost = (0, routeMocks_1.req)({ post: 'test-post-one' }), reqPage = (0, routeMocks_1.req)({ page: 1 }), reqTag = (0, routeMocks_1.req)({ tag: 'a' }), reqCategory = (0, routeMocks_1.req)({ category: 'testing' }), resPost = (0, routeMocks_1.res)(function () {
            resPost.viewName.should.equal('post');
            checkDone();
        }), resPage = (0, routeMocks_1.res)(function () {
            resPage.viewName.should.equal('page');
            checkDone();
        }), resTag = (0, routeMocks_1.res)(function () {
            resTag.viewName.should.equal('tag');
            checkDone();
        }), resCategory = (0, routeMocks_1.res)(function () {
            resCategory.viewName.should.equal('category');
            checkDone();
        });
        var checkDone = (function () {
            var count = 0;
            return function () {
                if (++count === 4) {
                    done();
                }
            };
        })();
        poet.init().then(function () {
            routeInfo_1.default.getCallback(app, '/post/:post')(reqPost, resPost);
            routeInfo_1.default.getCallback(app, '/page/:page')(reqPage, resPage);
            routeInfo_1.default.getCallback(app, '/tag/:tag')(reqTag, resTag);
            routeInfo_1.default.getCallback(app, '/category/:category')(reqCategory, resCategory);
        });
    });
    it('should allow configurable routes in the config', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson',
            routes: {
                '/myposts/:post': 'post',
                '/pagesss/:page': 'page',
                '/mytags/:tag': 'tag',
                '/mycats/:category': 'category'
            }
        });
        poet.init().then(function () {
            routeInfo_1.default.getCallback(app, '/myposts/:post')
                .toString().should.equal(routes_1.default.postRouteGenerator().toString());
            routeInfo_1.default.getCallback(app, '/pagesss/:page')
                .toString().should.equal(routes_1.default.pageRouteGenerator().toString());
            routeInfo_1.default.getCallback(app, '/mytags/:tag')
                .toString().should.equal(routes_1.default.tagRouteGenerator().toString());
            routeInfo_1.default.getCallback(app, '/mycats/:category')
                .toString().should.equal(routes_1.default.categoryRouteGenerator().toString());
            done();
        });
    });
    it('should allow empty routes in config', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson',
            routes: {}
        });
        poet.init().then(function () {
            //make sure the posts actually get created
            Object.keys(poet.posts).should.have.length(6);
            done();
        });
    });
    it('should allow manually added routes', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app), handler = function () { };
        poet.addRoute('/myposts/:post', handler);
        poet.addRoute('/pagesss/:page', handler);
        poet.addRoute('/mytags/:tag', handler);
        poet.addRoute('/mycats/:category', handler);
        poet.addRoute('/', handler);
        poet.init();
        routeInfo_1.default.getCallback(app, '/myposts/:post')
            .should.equal(handler);
        routeInfo_1.default.getCallback(app, '/pagesss/:page')
            .should.equal(handler);
        routeInfo_1.default.getCallback(app, '/mytags/:tag')
            .should.equal(handler);
        routeInfo_1.default.getCallback(app, '/mycats/:category')
            .should.equal(handler);
        routeInfo_1.default.getCallback(app, '/')
            .should.equal(handler);
        done();
    });
    it('should use configurable views', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson',
            routes: {
                '/myposts/:post': 'postView',
                '/pagesss/:page': 'pageView',
                '/mytags/:tag': 'tagView',
                '/mycats/:category': 'categoryView'
            }
        }), reqPost = (0, routeMocks_1.req)({ post: 'test-post-one' }), reqPage = (0, routeMocks_1.req)({ page: 1 }), reqTag = (0, routeMocks_1.req)({ tag: 'a' }), reqCategory = (0, routeMocks_1.req)({ category: 'testing' }), resPost = (0, routeMocks_1.res)(function () {
            resPost.viewName.should.equal('postView');
            checkDone();
        }), resPage = (0, routeMocks_1.res)(function () {
            resPage.viewName.should.equal('pageView');
            checkDone();
        }), resTag = (0, routeMocks_1.res)(function () {
            resTag.viewName.should.equal('tagView');
            checkDone();
        }), resCategory = (0, routeMocks_1.res)(function () {
            resCategory.viewName.should.equal('categoryView');
            checkDone();
        });
        var checkDone = (function () {
            var count = 0;
            return function () {
                if (++count === 4) {
                    done();
                }
            };
        })();
        poet.init().then(function () {
            routeInfo_1.default.getCallback(app, '/myposts/:post')(reqPost, resPost);
            routeInfo_1.default.getCallback(app, '/pagesss/:page')(reqPage, resPage);
            routeInfo_1.default.getCallback(app, '/mytags/:tag')(reqTag, resTag);
            routeInfo_1.default.getCallback(app, '/mycats/:category')(reqCategory, resCategory);
        });
    });
    it('if routes object passed, no other routes should exist', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson',
            routes: {
                '/myposts/:post': 'postView',
                '/pagesss/:page': 'pageView'
            }
        }), reqPost = (0, routeMocks_1.req)({ post: 'test-post-one' }), reqPage = (0, routeMocks_1.req)({ page: 1 }), reqTag = (0, routeMocks_1.req)({ tag: 'a' }), reqCategory = (0, routeMocks_1.req)({ category: 'testing' }), resPost = (0, routeMocks_1.res)(function () {
            resPost.viewName.should.equal('postView');
            checkDone();
        }), resPage = (0, routeMocks_1.res)(function () {
            resPage.viewName.should.equal('pageView');
            checkDone();
        });
        var checkDone = (function () {
            var count = 0;
            return function () {
                if (++count === 2) {
                    done();
                }
            };
        })();
        poet.init().then(function () {
            expect(routeInfo_1.default.getCallback(app, '/mytags/:tag')).to.not.be.ok;
            expect(routeInfo_1.default.getCallback(app, '/mycats/:category')).to.not.be.ok;
            routeInfo_1.default.getCallback(app, '/myposts/:post')(reqPost, resPost);
            routeInfo_1.default.getCallback(app, '/pagesss/:page')(reqPage, resPage);
        });
    });
    [null, {}].forEach(function (routeVal) {
        it('if route: ' + routeVal + ', no routes should exist', function (done) {
            var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
                posts: './test/_postsJson',
                routes: routeVal
            });
            poet.init().then(function () {
                expect(poet.posts).to.be.ok;
                expect(Object.keys(poet.posts)).to.have.length(6);
                expect(routeInfo_1.default.getCallback(app, '/post/:post')).to.not.be.ok;
                expect(routeInfo_1.default.getCallback(app, '/page/:page')).to.not.be.ok;
                expect(routeInfo_1.default.getCallback(app, '/tag/:tag')).to.not.be.ok;
                expect(routeInfo_1.default.getCallback(app, '/category/:category')).to.not.be.ok;
                done();
            }, done);
        });
    });
});
