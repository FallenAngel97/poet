"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poet_1 = __importDefault(require("../poet"));
const express_1 = __importDefault(require("express"));
const chai_1 = __importDefault(require("chai"));
const expect = chai_1.default.expect;
describe('Init', function () {
    it('should set up the posts, helpers on completion', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.init().then(function () {
            expect(poet.posts['test-post-one']).to.be.ok;
            expect(poet.helpers.getPosts().length).to.be.ok;
            done();
        }).then(null, done);
    });
    it('should return a promise on initialization that resolves to the instance', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.init().then(function (poetRes) {
            expect(poet).to.be.equal(poetRes);
            done();
        }).then(null, done);
    });
    it('should reject when initialization fails', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_\m/'
        });
        poet.init().then(null, function (reason) {
            expect(reason).to.be.ok;
            done();
        });
    });
    it('should accept a callback and return an instance on success', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson'
        });
        poet.init(function (err, poetRes) {
            expect(poet).to.be.equal(poetRes);
            expect(err).to.not.be.ok;
            done();
        });
    });
    it('should accept a callback and return an error on failure', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_notADir'
        });
        poet.init(function (err, poetRes) {
            expect(poetRes).to.not.be.ok;
            expect(err).to.be.ok;
            done();
        });
    });
    it('should accept initialization options that are not in the defaults', function (done) {
        var app = (0, express_1.default)(), poet = (0, poet_1.default)(app, {
            posts: './test/_postsJson',
            mycat: 'IsCool'
        });
        poet.init().then(function () {
            expect(poet.options.posts).to.be.ok;
            expect(poet.options.mycat).to.be.ok;
            poet.options.mycat.should.equal('IsCool');
            done();
        });
    });
});
