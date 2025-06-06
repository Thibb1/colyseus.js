// colyseus.js@0.16.16
'use strict';

var H3Transport = require('./transport/H3Transport.js');
var WebSocketTransport = require('./transport/WebSocketTransport.js');

class Connection {
    constructor(protocol, agent) {
        this.events = {};
        this.agent = agent;
        switch (protocol) {
            case "h3":
                this.transport = new H3Transport.H3TransportTransport(this.events);
                break;
            default:
                this.transport = new WebSocketTransport.WebSocketTransport(this.events, this.agent);
                break;
        }
    }
    connect(url, options) {
        this.transport.connect.call(this.transport, url, options);
    }
    send(data) {
        this.transport.send(data);
    }
    sendUnreliable(data) {
        this.transport.sendUnreliable(data);
    }
    close(code, reason) {
        this.transport.close(code, reason);
    }
    get isOpen() {
        return this.transport.isOpen;
    }
}

exports.Connection = Connection;
//# sourceMappingURL=Connection.js.map
