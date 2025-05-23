// colyseus.js@0.16.16
import NodeWebSocket from 'ws';

const WebSocket = NodeWebSocket;
class WebSocketTransport {
    events;
    agent;
    ws;
    protocols;
    constructor(events, agent) {
        this.events = events;
        this.agent = agent;
    }
    send(data) {
        this.ws.send(data);
    }
    sendUnreliable(data) {
        console.warn("colyseus.js: The WebSocket transport does not support unreliable messages");
    }
    /**
     * @param url URL to connect to
     * @param headers custom headers to send with the connection (only supported in Node.js. Web Browsers do not allow setting custom headers)
     */
    connect(url, headers) {
        try {
            // Node or Bun environments (supports custom headers)
            this.ws = new WebSocket(url, { agent: this.agent, headers, protocols: this.protocols });
        }
        catch (e) {
            // browser environment (custom headers not supported)
            this.ws = new WebSocket(url, this.protocols);
        }
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = this.events.onopen;
        this.ws.onmessage = this.events.onmessage;
        this.ws.onclose = this.events.onclose;
        this.ws.onerror = this.events.onerror;
    }
    close(code, reason) {
        this.ws.close(code, reason);
    }
    get isOpen() {
        return this.ws.readyState === WebSocket.OPEN;
    }
}

export { WebSocketTransport };
//# sourceMappingURL=WebSocketTransport.mjs.map
