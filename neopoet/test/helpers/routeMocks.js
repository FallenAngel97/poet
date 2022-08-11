"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.res = exports.req = void 0;
const req = (params) => {
    var req = {
        params: params
    };
    return req;
};
exports.req = req;
const res = (callback) => {
    return {
        viewName: '',
        data: {},
        _json: {},
        render: function (view, data) { this.viewName = view; this.data = data; callback(); },
        json: function (json) { this._json = json; callback(); }
    };
};
exports.res = res;
