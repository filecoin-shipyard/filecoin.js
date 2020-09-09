import nodeFetch, { Response as ResponseNode } from 'node-fetch';
import { EventEmitter } from 'events';
import { Connector, JsonRpcResponse, JsonRpcErrorResponse, RequestArguments, ConnectionError, ResponseError, JsonRpcError } from './Connector';

export type JsonRpcConnectionOptions = { url: string, token?: string };

export class HttpJsonRpcConnector extends EventEmitter implements Connector {

  protected reqId = 0;
  public url: string;
  public token?: string | undefined;

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

  public async request(req: RequestArguments): Promise<unknown> {
    const call = (typeof window === 'undefined') ? nodeFetch : fetch;

    const message = {
      jsonrpc: "2.0",
      method: req.method,
      params: req.params || null,
      id: this.reqId++,
    };

    let resp: ResponseNode | Response;

    try {
      resp = await call(this.url, {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify(message),
      });

    } catch (e) {
      throw new ConnectionError(e);
    }

    if (resp.ok === false) {
      throw new ResponseError(resp.status, resp.statusText);
    }

    const decoded: JsonRpcResponse = await resp.json();

    if (decoded.error) {
      throw new JsonRpcError(decoded.error);
    }

    return decoded.result;
  }

  public on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private _headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
    }
  }

}
