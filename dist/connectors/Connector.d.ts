export interface Connector {
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    exec(method: string, params?: any[]): Promise<any>;
    on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
}
//# sourceMappingURL=Connector.d.ts.map