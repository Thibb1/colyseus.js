// colyseus.js@0.16.16
import { ServerError } from './errors/ServerError.mjs';
import * as httpie from 'httpie';

class HTTP {
    client;
    headers;
    authToken;
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
        return httpie[method](this.client['getHttpEndpoint'](path), this.getOptions(options)).catch((e) => {
            const status = e.statusCode; //  || -1
            const message = e.data?.error || e.statusMessage || e.message; //  || "offline"
            if (!status && !message) {
                throw e;
            }
            throw new ServerError(status, message);
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

export { HTTP };
//# sourceMappingURL=HTTP.mjs.map
