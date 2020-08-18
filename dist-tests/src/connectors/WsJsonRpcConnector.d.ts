/// <reference types="node" />
import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, RequestArguments } from './Connector';
export declare type WsJsonRpcConnectionOptions = string | {
    url: string;
    token?: string;
};
export declare class WsJsonRpcConnector extends EventEmitter implements Connector {
    protected options: WsJsonRpcConnectionOptions;
    private url;
    private token?;
    private connected;
    private client?;
    constructor(options: WsJsonRpcConnectionOptions);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    request(req: RequestArguments): Promise<JsonRpcResponse>;
    requestWithCallback(req: RequestArguments, cbKey: string, cb: (data: any) => void): void;
    on(event: 'connected' | 'disconnected' | 'error', listener: (...args: any[]) => void): this;
    private fullUrl;
}
//# sourceMappingURL=WsJsonRpcConnector.d.ts.map