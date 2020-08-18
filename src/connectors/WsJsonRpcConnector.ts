import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, RequestArguments, JsonRpcError } from './Connector';
import * as WebSocket from 'rpc-websockets';

export type WsJsonRpcConnectionOptions = string | { url: string, token?: string };

export class WsJsonRpcConnector extends EventEmitter implements Connector {
  private url: string;
  private token?: string;
  private connected: boolean;
  private client?: WebSocket.Client;

  constructor(
    protected options: WsJsonRpcConnectionOptions,
  ) {
    super();

    if (typeof options === 'string') {
      this.url = options;
    } else {
      this.url = options.url;
      this.token = options.token;
    }

    this.connected = false;
  }

  public async connect(): Promise<any> {
    return new Promise((resolve) => {
      this.client = new WebSocket.Client(this.fullUrl());

      this.client.on('open', () => {
        this.emit('connected');
        resolve();
      });
      this.client.on('error', (error: any) => { this.emit('error', error) });
      this.client.on('close', () => {
        this.emit('disconnected');
      });
    });
  }

  public async disconnect(): Promise<any> {
    this.client?.close();
  }

  public async request(req: RequestArguments): Promise<unknown> {
    try {
      const ret = await this.client?.call(req.method, undefined);
      return ret;
    } catch (e) {
      /* TODO: does this actualy expose jsonrpc codes? */
      throw new JsonRpcError({ code: 0, message: e.message });
    }
  }

  public requestWithCallback(req: RequestArguments, cbKey: string, cb: (data: any) => void ) {
    this.client?.call(req.method, req.params);
    this.client?.on(cbKey, cb);
  }

  public on(event: 'connected' | 'disconnected' | 'error', listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private fullUrl() {
    let url = this.url;

    if (this.token) {
      url = `${url}?token=${this.token}`
    }

    return url;
  }
}
