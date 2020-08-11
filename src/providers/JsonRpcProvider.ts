import { HttpJsonRpcConnector, JsonRpcConnectionOptions } from '../connectors/HttpJsonRpc';
import { Version, Cid, TipSet } from './Types';

export class JsonRpcProvider {

  public conn: HttpJsonRpcConnector;

  constructor(url: string | JsonRpcConnectionOptions) {
    this.conn = new HttpJsonRpcConnector(url);
  }

  public async version(): Promise<Version> {
    const ret = await this.conn.request({ method: 'Filecoin.Version' });
    return ret.result;
  }

  public async readObj(cid: Cid): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainReadObj', params: [cid] });
    return ret.result;
  }

  public async getBlockMessages(blockCid: Cid): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlockMessages', params: [blockCid] });
    return ret.result;
  }

  public async getHead(): Promise<TipSet> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainHead' });
    return ret.result;
  }

  public async getBlock(blockCid: Cid): Promise<TipSet> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlock', params: [blockCid] });
    return ret.result;
  }


}
