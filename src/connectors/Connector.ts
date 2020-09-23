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
  public method?: string;
  public params?: any;
}

export class JsonRpcError extends Error {

  public code: number;
  public message: string;
  public data: any;

  constructor(e: JsonRpcErrorResponse) {
    super(e.message);
    this.code = e.code;
    this.message = e.message;
    this.data = e.data;
    Object.setPrototypeOf(this, JsonRpcError.prototype);
  }
}

export class ResponseError extends Error {
  constructor(
    public code: number,
    public message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, ResponseError.prototype);
  }
}

export class ConnectionError extends Error {
  constructor(e: Error) {
    super(e.message);
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

export interface Connector {
  url: string;
  token?: string | undefined;
  disconnect(): Promise<any>;
  connect(): Promise<any>;
  request(req: RequestArguments): Promise<any>;
  on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
}
