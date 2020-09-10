import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, RequestArguments, JsonRpcError, ConnectionError } from './Connector';
import * as WebSocket from 'rpc-websockets';

export type WsJsonRpcConnectionOptions = string | { url: string, token?: string };
type WebSocketRequestCallback = (error?: Error, result?: any) => void;
type WebSocketChannel = {
  key: string,
  cb: (data: any) => void,
}

type WebSocketRequest = {
  req: RequestArguments,
  cb: WebSocketRequestCallback,
  channel?: WebSocketChannel,
}

export class WsJsonRpcConnector extends EventEmitter implements Connector {
  public url: string;
  public token?: string | undefined;
  private connected: boolean;
  private client?: WebSocket.Client;
  private requests: WebSocketRequest[];

  constructor(
    protected options: WsJsonRpcConnectionOptions,
  ) {
    super();
    this.connected = false;
    this.requests = [];

    if (typeof options === 'string') {
      this.url = options;
    } else {
      this.url = options.url;
      this.token = options.token;
    }
  }

  public async connect(): Promise<any> {
    this.client = new WebSocket.Client(this.fullUrl());

    this.client.on('open', () => {
      this.connected = true;
      this.emit('connected');
      this.handleWaitingRequests();
    });
    this.client.on('error', (error: any) => {
      this.emit('error', new ConnectionError(error));
    });
    this.client.on('close', () => {
      this.connected = false;
      this.emit('disconnected');
    });
  }

  public async disconnect(): Promise<any> {
    this.client?.close();
  }

  private handleWaitingRequests() {
    for (let i = this.requests.length - 1; i >= 0; --i) {
      if (!this.connected) {
        continue;
      }
      const { req, cb, channel } = this.requests[i];
      const { params, method } = req;

      this.requests.splice(i, 1);
      this.performRequest({
        params,
        method
      })
        .then((result: any) => {
          cb(undefined, result);

          if (channel) {
            this.client?.on(channel.key, (response) => {
              if (response[0] === result) {
                channel.cb(response[1]);
              }
            });
          }
        })
        .catch(error => cb(error, undefined))
    }
  }

  public async request(req: RequestArguments): Promise<unknown> {
    if (this.connected) {
      return this.performRequest(req);
    } else {
      return new Promise((resolve, reject) => {
        const cb = (error?: Error, result?: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }

        this.requests.push({
          req,
          cb,
        });
      });
    }
  }

  public async requestWithChannel(req: RequestArguments, channelKey: string, channelCb: (data: any) => void ) {
    if (this.connected) {
      const id = await this.performRequest(req);
      this.client?.on(channelKey, (response) => {
        if (response[0] === id) {
          channelCb(response[1]);
        }
      });
    } else {
      return new Promise((resolve, reject) => {
        const channel: WebSocketChannel = {
          key: channelKey,
          cb: channelCb,
        };
        const cb = (error?: Error, result?: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }

        this.requests.push({
          req,
          cb,
          channel,
        });
      })
    }
  }

  public removeChannelListener(channelKey: string) {
    if (this.connected) {
      this.client?.removeListener(channelKey);
    }
  }

  public on(event: 'connected' | 'disconnected' | 'error', listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private async performRequest(req: RequestArguments): Promise<unknown> {
    try {
      const ret = await this.client?.call(req.method, req.params);
      return ret;
    } catch (e) {
      /* TODO: does this actualy expose jsonrpc codes? */
      throw new JsonRpcError({ code: 0, message: e.message });
    }
  }

  private fullUrl() {
    let url = this.url;

    if (this.token) {
      url = `${url}?token=${this.token}`
    }

    return url;
  }
}
