// colyseus.js@0.16.16
'use strict';

var tslib = require('tslib');
var Storage = require('./Storage.js');
var nanoevents = require('./core/nanoevents.js');

var _Auth__initialized, _Auth__initializationPromise, _Auth__signInWindow, _Auth__events;
class Auth {
    constructor(http) {
        this.http = http;
        this.settings = {
            path: "/auth",
            key: "colyseus-auth-token",
        };
        _Auth__initialized.set(this, false);
        _Auth__initializationPromise.set(this, void 0);
        _Auth__signInWindow.set(this, undefined);
        _Auth__events.set(this, nanoevents.createNanoEvents());
        Storage.getItem(this.settings.key, (token) => this.token = token);
    }
    set token(token) {
        this.http.authToken = token;
    }
    get token() {
        return this.http.authToken;
    }
    onChange(callback) {
        const unbindChange = tslib.__classPrivateFieldGet(this, _Auth__events, "f").on("change", callback);
        if (!tslib.__classPrivateFieldGet(this, _Auth__initialized, "f")) {
            tslib.__classPrivateFieldSet(this, _Auth__initializationPromise, new Promise((resolve, reject) => {
                this.getUserData().then((userData) => {
                    this.emitChange(Object.assign(Object.assign({}, userData), { token: this.token }));
                }).catch((e) => {
                    // user is not logged in, or service is down
                    this.emitChange({ user: null, token: undefined });
                }).finally(() => {
                    resolve();
                });
            }), "f");
        }
        tslib.__classPrivateFieldSet(this, _Auth__initialized, true, "f");
        return unbindChange;
    }
    getUserData() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (this.token) {
                return (yield this.http.get(`${this.settings.path}/userdata`)).data;
            }
            else {
                throw new Error("missing auth.token");
            }
        });
    }
    registerWithEmailAndPassword(email, password, options) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const data = (yield this.http.post(`${this.settings.path}/register`, {
                body: { email, password, options, },
            })).data;
            this.emitChange(data);
            return data;
        });
    }
    signInWithEmailAndPassword(email, password) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const data = (yield this.http.post(`${this.settings.path}/login`, {
                body: { email, password, },
            })).data;
            this.emitChange(data);
            return data;
        });
    }
    signInAnonymously(options) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const data = (yield this.http.post(`${this.settings.path}/anonymous`, {
                body: { options, }
            })).data;
            this.emitChange(data);
            return data;
        });
    }
    sendPasswordResetEmail(email) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return (yield this.http.post(`${this.settings.path}/forgot-password`, {
                body: { email, }
            })).data;
        });
    }
    signInWithProvider(providerName_1) {
        return tslib.__awaiter(this, arguments, void 0, function* (providerName, settings = {}) {
            return new Promise((resolve, reject) => {
                const w = settings.width || 480;
                const h = settings.height || 768;
                // forward existing token for upgrading
                const upgradingToken = this.token ? `?token=${this.token}` : "";
                // Capitalize first letter of providerName
                const title = `Login with ${(providerName[0].toUpperCase() + providerName.substring(1))}`;
                const url = this.http['client']['getHttpEndpoint'](`${(settings.prefix || `${this.settings.path}/provider`)}/${providerName}${upgradingToken}`);
                const left = (screen.width / 2) - (w / 2);
                const top = (screen.height / 2) - (h / 2);
                tslib.__classPrivateFieldSet(this, _Auth__signInWindow, window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left), "f");
                const onMessage = (event) => {
                    // TODO: it is a good idea to check if event.origin can be trusted!
                    // if (event.origin.indexOf(window.location.hostname) === -1) { return; }
                    // require 'user' and 'token' inside received data.
                    if (event.data.user === undefined && event.data.token === undefined) {
                        return;
                    }
                    clearInterval(rejectionChecker);
                    tslib.__classPrivateFieldGet(this, _Auth__signInWindow, "f").close();
                    tslib.__classPrivateFieldSet(this, _Auth__signInWindow, undefined, "f");
                    window.removeEventListener("message", onMessage);
                    if (event.data.error !== undefined) {
                        reject(event.data.error);
                    }
                    else {
                        resolve(event.data);
                        this.emitChange(event.data);
                    }
                };
                const rejectionChecker = setInterval(() => {
                    if (!tslib.__classPrivateFieldGet(this, _Auth__signInWindow, "f") || tslib.__classPrivateFieldGet(this, _Auth__signInWindow, "f").closed) {
                        tslib.__classPrivateFieldSet(this, _Auth__signInWindow, undefined, "f");
                        reject("cancelled");
                        window.removeEventListener("message", onMessage);
                    }
                }, 200);
                window.addEventListener("message", onMessage);
            });
        });
    }
    signOut() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            this.emitChange({ user: null, token: null });
        });
    }
    emitChange(authData) {
        if (authData.token !== undefined) {
            this.token = authData.token;
            if (authData.token === null) {
                Storage.removeItem(this.settings.key);
            }
            else {
                // store key in localStorage
                Storage.setItem(this.settings.key, authData.token);
            }
        }
        tslib.__classPrivateFieldGet(this, _Auth__events, "f").emit("change", authData);
    }
}
_Auth__initialized = new WeakMap(), _Auth__initializationPromise = new WeakMap(), _Auth__signInWindow = new WeakMap(), _Auth__events = new WeakMap();

exports.Auth = Auth;
//# sourceMappingURL=Auth.js.map
