import WebSocket from 'isomorphic-ws';
import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, RequestArguments, JsonRpcError, ConnectionError } from './Connector';

type InflightRequest = {
  payload: string,
  cb: (error: Error | undefined, result: any) => void,
}

export type SubscriptionId = string;
export type WebSocketConnectionOptions = { url: string, token?: string };
let id = 1;

// See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
const WEBSOCKET_CLOSE_CODE = 1000;

export class WsJsonRpcConnector extends EventEmitter implements Connector {
  url: string;
  token?: string;
  private websocket!: WebSocket;
  private requests: {[id: string]: InflightRequest } = {};
  private websocketReady!: boolean;

  constructor(options: WebSocketConnectionOptions) {
    super();
    this.websocketReady = false;
    this.token = options.token;
    this.url = options.url;
  }

  connect(): Promise<any> {
    this.websocket = new WebSocket(this.fullUrl());
    this.websocket.onopen = this.onSocketOpen;
    this.websocket.onclose = this.onSocketClose;
    this.websocket.onerror = this.onSocketError;
    this.websocket.onmessage = this.onSocketMessage;

    return Promise.resolve();
  }

  public async request(args: RequestArguments): Promise<any> {
    const currentId = id++;
    const { params, method } = args;

    return new Promise((resolve, reject) => {
      function cb(error: Error | undefined, result: any) {
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
        cb,
      }

      if (this.websocketReady) {
        this.websocket.send(payload);
      }
    });
  }

  public async closeSubscription(subscriptionId: string) {
    this.websocket.removeEventListener(subscriptionId);
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

  private fullUrl() {
    return this.token ? `${this.url}?token=${this.token}` : `${this.url}`;
  }

  public on(event: 'connected' | 'disconnected' | 'error' | SubscriptionId, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private onSocketClose = () => {
    this.websocketReady = false;
    this.requests = {};
  }

  private onSocketError = () => {
    this.websocketReady = false;
  }

  private onSocketOpen = () => {
    this.websocketReady = true;

    Object.keys(this.requests).forEach((id) => {
      this.websocket.send(this.requests[id].payload);
    });
  }

  private onSocketMessage = (event: WebSocket.MessageEvent) => {
    const { data } = event;
    const response: JsonRpcResponse = JSON.parse(data as string);

    if (response.id) {
      const id = `${response.id}`;
      const request = this.requests[id];
      if (!request) { return; }
      delete this.requests[id];

      if (response.hasOwnProperty('result')) {
        request.cb(undefined, response.result);
      } else {
        if (response.error && request.cb) {
          const error = new JsonRpcError({
            code: response.error.code || 0,
            message: response.error.message,
            data: data,
          });

          request.cb(error, undefined);
        }
      }
    } else {
      if (response.method === "xrpc.ch.val") {
        const subscriptionId = response.params[0];
        const isValid = Number.isInteger(subscriptionId);

        if (isValid) {
          this.emit(subscriptionId, response.params[1]);
        }
      }
    }
  }
}
