export interface RequestArguments {
  readonly method: string;
	readonly params?: readonly unknown[];
}

export class JsonRpcErrorResponse {
  public code!: number;
  public message!: string;
  public data?: any;
}

export class JsonRpcResponse {
  public id!: number;
  public jsonrpc!: string;
  public result?: any;
  public error?: JsonRpcErrorResponse;
}

export interface Connector {
  connect(): Promise<any>;
  disconnect(): Promise<any>;
  request(req: RequestArguments): Promise<JsonRpcResponse>;
  on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
}
