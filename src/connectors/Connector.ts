export interface RequestArguments {
  readonly method: string;
	readonly params?: readonly unknown[];
}

export interface Connector {
  connect(): Promise<any>;
  disconnect(): Promise<any>;
  request(req: RequestArguments): Promise<unknown>;
  on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
}
