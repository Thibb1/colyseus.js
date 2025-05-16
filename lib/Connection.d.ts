import { ITransport, ITransportEventMap } from "./transport/ITransport";
export declare class Connection implements ITransport {
    transport: ITransport;
    events: ITransportEventMap;
    agent: any;
    constructor(protocol?: string, agent?: any);
    connect(url: string, options?: any): void;
    send(data: Buffer | Uint8Array): void;
    sendUnreliable(data: Buffer | Uint8Array): void;
    close(code?: number, reason?: string): void;
    get isOpen(): boolean;
}
