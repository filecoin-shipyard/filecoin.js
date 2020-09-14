import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, RequestArguments, JsonRpcError, ConnectionError } from './Connector';
import WebSocket, { OpenEvent } from 'ws';

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

type InflightRequest = {
  payload: string,
  callback: (error: Error | undefined, result: any) => void,
}

type Subscription = {
  tag: string,
  callback: (payload: any) => void,
}

export type WebSocketConnectionOptions = { url: string, token?: string };

let id = 1;

// See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
const WEBSOCKET_CLOSE_CODE = 1000;

export class WebSocketRpcConnector extends EventEmitter implements Connector {
  private readonly websocket: WebSocket;
  private readonly subscriptionIds: { [tag: string]: Promise<string> };
  private readonly subscriptions: { [name: string]: Subscription };
  private requests: {[id: string]: InflightRequest };
  private websocketReady: boolean;

  constructor(options: WebSocketConnectionOptions) {
    super();


    this.websocket = new WebSocket(this.fullUrl(options.url, options.token));
    this.requests = {};
    this.websocketReady = false;

    this.websocket.onopen = () => {
      this.websocketReady = true;
      Object.keys(this.requests).forEach((id) => {
        this.websocket.send(this.requests[id].payload);
      });
    };

    this.websocket.onclose = () => {
      this.websocketReady = false;
      this.requests = {};
    };

    this.websocket.onmessage = (event) => {
      const { data } = event;
      const result = JSON.parse(data as string);

      if (!result.id) {
        return;
      }

      const id = `${result.id}`;
      const request = this.requests[id];
      delete this.requests[id];

      if (!request) { return; }

      if (result.result) {
        request.callback(undefined, result.result);
      } else {
        if (result.error) {
          const error = new JsonRpcError({
            code: result.error.code || null,
            message: result.error.message,
            data: data,
          });
          request.callback(error, undefined);
        } else {
          throw new JsonRpcError({ code: 0, message: "unknown error" });
        }
      }
    }
  }

  public async request(args: RequestArguments): Promise<any> {
    const currentId = id++;
    const { params, method } = args;

    return new Promise((resolve, reject) => {
      function callback(error: Error | undefined, result: any) {
        if (error) { return reject(error); }
        return resolve(result);
      }

      const payload = JSON.stringify({
        method,
        params,
        id: currentId,
        jsonrpc: "2.0",
      });

      this.requests[`${currentId}`] = {
        payload,
        callback,
      }

      if (this.websocketReady) {
        this.websocket.send(payload);
      }
    });
  }

  public async subscribe(args: RequestArguments, channelKey: string, channelCb: (data: any) => void ) {
    // make request: return id, listen with this id
    // 1. Check if already subscribed
  }

  async disconnect(): Promise<any> {
    if (this.websocket.readyState === WebSocket.CONNECTING) {
      await new Promise((resolve) => {
        this.websocket.onopen = function() {
          resolve(true);
        }

        this.websocket.onerror = function() {
          resolve(false);
        }
      });
    }

    this.websocket.close(WEBSOCKET_CLOSE_CODE);
  }

  private fullUrl(url: string, token?: string) {
    return token ? `${url}?token=${token}` : `${url}`;
  }


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
}
