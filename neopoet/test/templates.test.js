"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poet_1 = __importDefault(require("../poet"));
const express_1 = __importDefault(require("express"));
var pEl = "<p><em>Lorem ipsum</em> dolor sit amet, consectetur adipisicing elit.</p>";
var h1El = "<h1>Header 1</h1>";
var scriptBody = '<script>console.log(\'test\');</script>';
describe('Templating', function () {
    it('should correctly compile markdown', function (done) {
        const app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.init().then(function () {
            const posts = poet.posts;
            posts['test-post-one'].content.should.contain(pEl);
            posts['test-post-one'].content.should.contain(h1El);
            done();
        }).then(null, done);
    });
    it('should correctly compile pug', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.init().then(function () {
            var posts = poet.posts;
            posts['pug-test'].content.should.contain(pEl);
            posts['pug-test'].content.should.contain(h1El);
            done();
        }).then(null, done);
    });
    it('should correctly compile pug with includes', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.init().then(function () {
            poet.posts['pug-test'].content.should.contain("Include Me!");
            done();
        }).then(null, done);
    });
    it('should correctly compile pug with app.locals.access', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        app.locals.foo = true;
        poet.init().then(function () {
            poet.posts['pug-test'].content.should.contain("foo is true");
            done();
        }).then(null, done);
    });
    it('should correctly render with any custom formatter', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.addTemplate({
            ext: 'custom',
            fn: function (opts) {
                return opts.source.replace(/\*(.*?)\*/g, '<$1>');
            }
        }).init().then(function () {
            var posts = poet.posts;
            posts['custom-test'].content.should.contain(pEl);
            posts['custom-test'].content.should.contain(h1El);
            done();
        }).then(null, done);
    });
    it('should correctly render with any custom formatter asynchronously', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.addTemplate({
            ext: 'custom',
            fn: function (opts, callback) {
                callback(null, opts.source.replace(/\*(.*?)\*/g, '<$1>'));
            }
        }).init().then(function () {
            var posts = poet.posts;
            posts['custom-test'].content.should.contain(pEl);
            posts['custom-test'].content.should.contain(h1El);
            done();
        }).then(null, done);
    });
    it('markdown should not strip out HTML elements', function () {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.init().then(function () {
            var posts = poet.posts;
            posts['test-post-three'].content.should.contain(scriptBody);
        });
    });
    describe('Errors', function () {
        let realEnv;
        beforeEach(function () { realEnv = process.env.NODE_ENV; });
        afterEach(function () { process.env.NODE_ENV = realEnv; });
        it('should not appear in production', function (done) {
            process.env.NODE_ENV = 'production';
            var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
                posts: './test/_postsWithErrorJson'
            });
            poet.init().then(function () {
                Object.keys(poet.posts).should.have.length(1);
                done();
            }).then(null, done);
        });
        it('should be rendered in non production env', function (done) {
            delete process.env.NODE_ENV;
            var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
                posts: './test/_postsWithErrorJson'
            });
            poet.init().then(function () {
                var posts = poet.posts;
                Object.keys(posts).should.have.length(2);
                poet.posts['pug-test-with-error'].content.should.contain("> 3| Foo?");
                done();
            }).then(null, done);
        });
    });
    it('should expose registered template engines on templateEngines', function () {
        const app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.init().then(function () {
            const posts = poet.posts;
            posts['test-post-three'].content.should.not.contain(scriptBody);
        });
    });
});
