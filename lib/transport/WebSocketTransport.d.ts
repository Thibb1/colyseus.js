import NodeWebSocket from "ws";
import { ITransport, ITransportEventMap } from "./ITransport";
export declare class WebSocketTransport implements ITransport {
    events: ITransportEventMap;
    agent?: any;
    ws: WebSocket | NodeWebSocket;
    protocols?: string | string[];
    constructor(events: ITransportEventMap, agent?: any);
    send(data: Buffer | Uint8Array): void;
    sendUnreliable(data: ArrayBuffer | Array<number>): void;
    /**
     * @param url URL to connect to
     * @param headers custom headers to send with the connection (only supported in Node.js. Web Browsers do not allow setting custom headers)
     */
    connect(url: string, headers?: any): void;
    close(code?: number, reason?: string): void;
    get isOpen(): boolean;
}
