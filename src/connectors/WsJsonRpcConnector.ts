import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, RequestArguments, JsonRpcError, ConnectionError } from './Connector';
import WebSocket from 'isomorphic-ws';

type SubscriptionCallback = (data: any) => void;

type InflightRequest = {
  payload: string,
  cb?: (error: Error | undefined, result: any) => void,
  subscriptionCb?: SubscriptionCallback,
}

export type WebSocketConnectionOptions = { url: string, token?: string };
let id = 1;

// See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
const WEBSOCKET_CLOSE_CODE = 1000;

export class WsJsonRpcConnector extends EventEmitter implements Connector {
  url: string;
  token?: string;
  private websocket!: WebSocket;
  private requests: {[id: string]: InflightRequest } = {};
  private subscriptions: {[id: string]: SubscriptionCallback} = {};
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

  public async requestWithChannel(args: RequestArguments, cb: (data: any) => void) {
    const currentId = id++;
    const { method, params } = args;
    const payload = JSON.stringify({
      method,
      params,
      id: currentId,
      jsonrpc: "2.0",
    });

    this.requests[`${currentId}`] = {
      payload,
      subscriptionCb: cb,
    }

    if (this.websocketReady) {
      this.websocket.send(payload);
    }
  }

  public async removeChannelListener(key: string) {

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

  public on(event: 'connected' | 'disconnected' | 'error', listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private onSocketClose = () => {
    this.websocketReady = false;
    this.requests = {};
    this.subscriptions = {};
  }

  private onSocketError = () => {
    this.websocketReady = false;
    this.requests = {};
    this.subscriptions = {};
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

      if (response.result) {
        if (request.cb) {
          request.cb(undefined, response.result);
        } else if (request.subscriptionCb) {
          this.subscriptions[response.result] = request.subscriptionCb;
        }
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
        const subscriptionCb = isValid && this.subscriptions[subscriptionId];

        if (subscriptionCb) {
          subscriptionCb(response.params[1]);
        }
      }
    }
  }
}
