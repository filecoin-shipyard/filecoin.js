export interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[];
}
export interface JsonRpcResponse {
    jsonrpc?: string;
    result: any;
    id?: number;
}
export interface Connector {
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    request(req: RequestArguments): Promise<JsonRpcResponse>;
    on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
}
//# sourceMappingURL=Connector.d.ts.map