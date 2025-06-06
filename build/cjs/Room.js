// colyseus.js@0.16.16
'use strict';

var Connection = require('./Connection.js');
var Protocol = require('./Protocol.js');
var Serializer = require('./serializer/Serializer.js');
var nanoevents = require('./core/nanoevents.js');
var signal = require('./core/signal.js');
var schema = require('@colyseus/schema');
var SchemaSerializer = require('./serializer/SchemaSerializer.js');
var ServerError = require('./errors/ServerError.js');
var msgpackr = require('@colyseus/msgpackr');

class Room {
    constructor(name, rootSchema, agent) {
        // Public signals
        this.onStateChange = signal.createSignal();
        this.onError = signal.createSignal();
        this.onLeave = signal.createSignal();
        this.onJoin = signal.createSignal();
        this.hasJoined = false;
        this.onMessageHandlers = nanoevents.createNanoEvents();
        this.roomId = null;
        this.name = name;
        this.agent = agent;
        this.packr = new msgpackr.Packr();
        // msgpackr workaround: force buffer to be created.
        this.packr.encode(undefined);
        if (rootSchema) {
            this.serializer = new (Serializer.getSerializer("schema"));
            this.rootSchema = rootSchema;
            this.serializer.state = new rootSchema();
        }
        this.onError((code, message) => { var _a; return (_a = console.warn) === null || _a === void 0 ? void 0 : _a.call(console, `colyseus.js - onError => (${code}) ${message}`); });
        this.onLeave(() => this.removeAllListeners());
    }
    connect(endpoint, devModeCloseCallback, room = this, // when reconnecting on devMode, re-use previous room intance for handling events.
    options, headers) {
        const connection = new Connection.Connection(options.protocol, this.agent);
        room.connection = connection;
        connection.events.onmessage = Room.prototype.onMessageCallback.bind(room);
        connection.events.onclose = function (e) {
            var _a;
            if (!room.hasJoined) {
                (_a = console.warn) === null || _a === void 0 ? void 0 : _a.call(console, `Room connection was closed unexpectedly (${e.code}): ${e.reason}`);
                room.onError.invoke(e.code, e.reason);
                return;
            }
            if (e.code === ServerError.CloseCode.DEVMODE_RESTART && devModeCloseCallback) {
                devModeCloseCallback();
            }
            else {
                room.onLeave.invoke(e.code, e.reason);
                room.destroy();
            }
        };
        connection.events.onerror = function (e) {
            var _a;
            (_a = console.warn) === null || _a === void 0 ? void 0 : _a.call(console, `Room, onError (${e.code}): ${e.reason}`);
            room.onError.invoke(e.code, e.reason);
        };
        // FIXME: refactor this.
        if (options.protocol === "h3") {
            const url = new URL(endpoint);
            connection.connect(url.origin, options);
        }
        else {
            connection.connect(endpoint, headers);
        }
    }
    leave(consented = true) {
        return new Promise((resolve) => {
            this.onLeave((code) => resolve(code));
            if (this.connection) {
                if (consented) {
                    this.packr.buffer[0] = Protocol.Protocol.LEAVE_ROOM;
                    this.connection.send(this.packr.buffer.subarray(0, 1));
                }
                else {
                    this.connection.close();
                }
            }
            else {
                this.onLeave.invoke(ServerError.CloseCode.CONSENTED);
            }
        });
    }
    onMessage(type, callback) {
        return this.onMessageHandlers.on(this.getMessageHandlerKey(type), callback);
    }
    send(type, message) {
        const it = { offset: 1 };
        this.packr.buffer[0] = Protocol.Protocol.ROOM_DATA;
        if (typeof (type) === "string") {
            schema.encode.string(this.packr.buffer, type, it);
        }
        else {
            schema.encode.number(this.packr.buffer, type, it);
        }
        // force packr to use beginning of the buffer
        this.packr.position = 0;
        const data = (message !== undefined)
            ? this.packr.pack(message, 2048 + it.offset) // 2048 = RESERVE_START_SPACE
            : this.packr.buffer.subarray(0, it.offset);
        this.connection.send(data);
    }
    sendUnreliable(type, message) {
        const it = { offset: 1 };
        this.packr.buffer[0] = Protocol.Protocol.ROOM_DATA;
        if (typeof (type) === "string") {
            schema.encode.string(this.packr.buffer, type, it);
        }
        else {
            schema.encode.number(this.packr.buffer, type, it);
        }
        // force packr to use beginning of the buffer
        this.packr.position = 0;
        const data = (message !== undefined)
            ? this.packr.pack(message, 2048 + it.offset) // 2048 = RESERVE_START_SPACE
            : this.packr.buffer.subarray(0, it.offset);
        this.connection.sendUnreliable(data);
    }
    sendBytes(type, bytes) {
        const it = { offset: 1 };
        this.packr.buffer[0] = Protocol.Protocol.ROOM_DATA_BYTES;
        if (typeof (type) === "string") {
            schema.encode.string(this.packr.buffer, type, it);
        }
        else {
            schema.encode.number(this.packr.buffer, type, it);
        }
        // check if buffer needs to be resized
        // TODO: can we avoid this?
        if (bytes.byteLength + it.offset > this.packr.buffer.byteLength) {
            const newBuffer = new Uint8Array(it.offset + bytes.byteLength);
            newBuffer.set(this.packr.buffer);
            this.packr.useBuffer(newBuffer);
        }
        this.packr.buffer.set(bytes, it.offset);
        this.connection.send(this.packr.buffer.subarray(0, it.offset + bytes.byteLength));
    }
    get state() {
        return this.serializer.getState();
    }
    removeAllListeners() {
        this.onJoin.clear();
        this.onStateChange.clear();
        this.onError.clear();
        this.onLeave.clear();
        this.onMessageHandlers.events = {};
        if (this.serializer instanceof SchemaSerializer.SchemaSerializer) {
            // Remove callback references
            this.serializer.decoder.root.callbacks = {};
        }
    }
    onMessageCallback(event) {
        const buffer = new Uint8Array(event.data);
        const it = { offset: 1 };
        const code = buffer[0];
        if (code === Protocol.Protocol.JOIN_ROOM) {
            const reconnectionToken = schema.decode.utf8Read(buffer, it, buffer[it.offset++]);
            this.serializerId = schema.decode.utf8Read(buffer, it, buffer[it.offset++]);
            // Instantiate serializer if not locally available.
            if (!this.serializer) {
                const serializer = Serializer.getSerializer(this.serializerId);
                this.serializer = new serializer();
            }
            if (buffer.byteLength > it.offset && this.serializer.handshake) {
                this.serializer.handshake(buffer, it);
            }
            this.reconnectionToken = `${this.roomId}:${reconnectionToken}`;
            this.hasJoined = true;
            this.onJoin.invoke();
            // acknowledge successfull JOIN_ROOM
            this.packr.buffer[0] = Protocol.Protocol.JOIN_ROOM;
            this.connection.send(this.packr.buffer.subarray(0, 1));
        }
        else if (code === Protocol.Protocol.ERROR) {
            const code = schema.decode.number(buffer, it);
            const message = schema.decode.string(buffer, it);
            this.onError.invoke(code, message);
        }
        else if (code === Protocol.Protocol.LEAVE_ROOM) {
            this.leave();
        }
        else if (code === Protocol.Protocol.ROOM_STATE) {
            this.serializer.setState(buffer, it);
            this.onStateChange.invoke(this.serializer.getState());
        }
        else if (code === Protocol.Protocol.ROOM_STATE_PATCH) {
            this.serializer.patch(buffer, it);
            this.onStateChange.invoke(this.serializer.getState());
        }
        else if (code === Protocol.Protocol.ROOM_DATA) {
            const type = (schema.decode.stringCheck(buffer, it))
                ? schema.decode.string(buffer, it)
                : schema.decode.number(buffer, it);
            const message = (buffer.byteLength > it.offset)
                ? msgpackr.unpack(buffer, { start: it.offset })
                : undefined;
            this.dispatchMessage(type, message);
        }
        else if (code === Protocol.Protocol.ROOM_DATA_BYTES) {
            const type = (schema.decode.stringCheck(buffer, it))
                ? schema.decode.string(buffer, it)
                : schema.decode.number(buffer, it);
            this.dispatchMessage(type, buffer.subarray(it.offset));
        }
    }
    dispatchMessage(type, message) {
        var _a;
        const messageType = this.getMessageHandlerKey(type);
        if (this.onMessageHandlers.events[messageType]) {
            this.onMessageHandlers.emit(messageType, message);
        }
        else if (this.onMessageHandlers.events['*']) {
            this.onMessageHandlers.emit('*', type, message);
        }
        else {
            (_a = console.warn) === null || _a === void 0 ? void 0 : _a.call(console, `colyseus.js: onMessage() not registered for type '${type}'.`);
        }
    }
    destroy() {
        if (this.serializer) {
            this.serializer.teardown();
        }
    }
    getMessageHandlerKey(type) {
        switch (typeof (type)) {
            // string
            case "string": return type;
            // number
            case "number": return `i${type}`;
            default: throw new Error("invalid message type.");
        }
    }
}

exports.Room = Room;
//# sourceMappingURL=Room.js.map
