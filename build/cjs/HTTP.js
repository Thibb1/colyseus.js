// colyseus.js@0.16.16
'use strict';

var ServerError = require('./errors/ServerError.js');
var httpie = require('httpie');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var httpie__namespace = /*#__PURE__*/_interopNamespaceDefault(httpie);

class HTTP {
    constructor(client, headers = {}) {
        this.client = client;
        this.headers = headers;
    }
    get(path, options = {}) {
        return this.request("get", path, options);
    }
    post(path, options = {}) {
        return this.request("post", path, options);
    }
    del(path, options = {}) {
        return this.request("del", path, options);
    }
    put(path, options = {}) {
        return this.request("put", path, options);
    }
    request(method, path, options = {}) {
        return httpie__namespace[method](this.client['getHttpEndpoint'](path), this.getOptions(options)).catch((e) => {
            var _a;
            const status = e.statusCode; //  || -1
            const message = ((_a = e.data) === null || _a === void 0 ? void 0 : _a.error) || e.statusMessage || e.message; //  || "offline"
            if (!status && !message) {
                throw e;
            }
            throw new ServerError.ServerError(status, message);
        });
    }
    getOptions(options) {
        // merge default custom headers with user headers
        options.headers = Object.assign({}, this.headers, options.headers);
        if (this.authToken) {
            options.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        if (typeof (cc) !== 'undefined' && cc.sys && cc.sys.isNative) ;
        else {
            // always include credentials
            options.withCredentials = true;
        }
        return options;
    }
}

exports.HTTP = HTTP;
//# sourceMappingURL=HTTP.js.map
