/// <reference types="node" />
import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, RequestArguments } from './Connector';
export declare type JsonRpcConnectionOptions = {
    url: string;
    token?: string;
};
export declare class HttpJsonRpcConnector extends EventEmitter implements Connector {
    protected options: string | JsonRpcConnectionOptions;
    protected reqId: number;
    private url;
    private token;
    constructor(options: string | JsonRpcConnectionOptions);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    request(req: RequestArguments): Promise<JsonRpcResponse>;
    on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
    private headers;
}
//# sourceMappingURL=HttpJsonRpcConnector.d.ts.map