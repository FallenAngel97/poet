"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poet_1 = __importDefault(require("../poet"));
const express_1 = __importDefault(require("express"));
const chai_1 = __importDefault(require("chai"));
const should = chai_1.default.should();
const expect = chai_1.default.expect;
const readMoreLink = '<a href="/post/test-post-two">Test Post Two</a>';
describe('Options', function () {
    describe('readMoreLink', function () {
        it('should be a function that returns markup appended to the preview', function (done) {
            var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
                posts: './test/_postsJson',
                readMoreLink: function (post) {
                    return '<a href="' + post.url + '">' + post.title + '</a>';
                }
            });
            poet.init().then(function () {
                poet.posts['test-post-two'].preview.should.equal('<p><em>some content</em></p>' + "\n" + readMoreLink);
                done();
            }).then(null, done);
        });
    });
    describe('readMoreTag', function () {
        var customPreview = '<p><em>Lorem ipsum</em></p>\n<p class="poet-read-more"><a href="/post/read-more-test" title="Read more of Read More Test">read more</a></p>', defaultPreview = '<p><em>Lorem ipsum</em>\n!!!more!!!\n<em>more ipsum</em></p>\n<p class="poet-read-more"><a href="/post/read-more-test" title="Read more of Read More Test">read more</a></p>';
        it('should by default use <!--more-->', function (done) {
            var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
                posts: './test/_postsJson'
            });
            poet.init().then(function () {
                poet.posts['read-more-test'].preview.should.equal(defaultPreview);
                done();
            }).then(null, done);
        });
        it('should be an option that specifies where the preview is cut off', function (done) {
            var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
                posts: './test/_postsJson',
                readMoreTag: '!!!more!!!'
            });
            poet.init().then(function () {
                poet.posts['read-more-test'].preview.should.equal(customPreview);
                done();
            }).then(null, done);
        });
    });
    describe('showDrafts', function () {
        it('should include drafts when true', function (done) {
            var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
                posts: './test/_postsJson',
                showDrafts: true
            });
            poet.init().then(function () {
                expect(poet.helpers.getPosts().length).to.equal(6);
                expect(poet.helpers.getPostCount()).to.equal(6);
                done();
            }).then(null, done);
        });
        it('should ignore drafts when false', function (done) {
            var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
                posts: './test/_postsJson',
                showDrafts: false
            });
            poet.init().then(function () {
                expect(poet.helpers.getPosts().length).to.equal(5);
                expect(poet.helpers.getPostCount()).to.equal(5);
                poet.helpers.getPosts().map(function (post) {
                    if (post.draft)
                        should.fail('Unexpected draft included in getPosts() result');
                });
                done();
            }).then(null, done);
        });
    });
});
