import nodeFetch from 'node-fetch';
import { EventEmitter } from 'events';
import { Connector } from './Connector';

export class JsonRpcResponse {
  public jsonrpc!: string;
  result!: any;
  id!: number;
}

export class HttpConnector extends EventEmitter implements Connector {

  protected reqId = 0;

  constructor(
    protected url: string,
  ) {
    super();
  }

  public async connect(): Promise<any> {
    this.emit('connected');
  }

  public async disconnect(): Promise<any> {
    this.emit('disconnected');
  }

  public async exec(method: string, params?: any[]): Promise<JsonRpcResponse> {
    const message = {
      jsonrpc: "2.0",
      method: method,
      params: params || null,
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

}
