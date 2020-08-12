import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, RequestArguments } from './Connector';
import * as WebSocket from 'rpc-websockets';

export type WsJsonRpcConnectionOptions = string | { url: string, token?: string };

export class WsJsonRpcConnector extends EventEmitter implements Connector {
  private url: string;
  private connected: boolean;
  private token?: string;
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

  public async request(req: RequestArguments): Promise<JsonRpcResponse> {
    const result = await this.client?.call(req.method, undefined);

    return {
      result,
    }
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
