import nodeFetch from 'node-fetch';
import { EventEmitter } from 'events';
import { Connector, RequestArguments } from './Connector';

export class JsonRpcResponse {
  public jsonrpc!: string;
  result!: any;
  id!: number;
}

export type JsonRpcConnectionOptions = { url: string, token?: string };

export class HttpJsonRpcConnector extends EventEmitter implements Connector {

  protected reqId = 0;
  private url: string;
  private token: string | undefined;

  constructor(
    protected options: string | JsonRpcConnectionOptions,
  ) {
    super();
    if (typeof options === 'string') {
      this.url = options;
    } else {
      this.url = options.url;
      this.token = options.token;
    }
  }

  public async connect(): Promise<any> {
    this.emit('connected');
  }

  public async disconnect(): Promise<any> {
    this.emit('disconnected');
  }

  public async request(req: RequestArguments): Promise<JsonRpcResponse> {
    const message = {
      jsonrpc: "2.0",
      method: req.method,
      params: req.params || null,
      id: this.reqId++,
    };
    let resp;

    if (typeof window === 'undefined') {
      resp = await nodeFetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message),
      });
    } else {
      resp = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message),
      });
    }

    return await resp.json();

  }

  public on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
    }
  }

}
