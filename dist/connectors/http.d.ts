/// <reference types="node" />
import { EventEmitter } from 'events';
interface Connector {
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    exec(method: string, params: any[]): Promise<any>;
    on(event: 'connected', listener: (...args: any[]) => void): this;
    on(event: 'disconnected', listener: (...args: any[]) => void): this;
}
export declare class HttpConnector extends EventEmitter implements Connector {
    protected url: string;
    protected reqId: number;
    constructor(url: string);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    exec(method: string, params?: any[]): Promise<any>;
}
export {};
//# sourceMappingURL=http.d.ts.map