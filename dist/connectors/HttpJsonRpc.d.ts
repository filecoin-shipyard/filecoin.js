/// <reference types="node" />
import { EventEmitter } from 'events';
import { Connector } from './Connector';
export declare class JsonRpcResponse {
    jsonrpc: string;
    result: any;
    id: number;
}
export declare class HttpConnector extends EventEmitter implements Connector {
    protected url: string;
    protected reqId: number;
    constructor(url: string);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    exec(method: string, params?: any[]): Promise<JsonRpcResponse>;
    on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
}
//# sourceMappingURL=HttpJsonRpc.d.ts.map