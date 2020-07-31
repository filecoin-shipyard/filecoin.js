import { HttpConnector } from '../connectors/HttpJsonRpc';
import { Version, Cid, TipSet } from './Types';
import { Connector } from '../connectors/Connector';

export class JsonRpcProvider {

  public conn: Connector;

  constructor(
    public url: string,
  ) {
    this.conn = new HttpConnector(url);
  }

  public async version(): Promise<Version> {
    const ret = await this.conn.exec('Filecoin.Version');
    return ret.result;
  }

  public async readObj(cid: Cid): Promise<string> {
    const ret = await this.conn.exec('Filecoin.ChainReadObj', [cid]);
    return ret.result;
  }

  public async getBlockMessages(blockCid: Cid): Promise<any> {
    const ret = await this.conn.exec('Filecoin.ChainGetBlockMessages', [blockCid]);
    return ret.result;
  }

  public async getHead(): Promise<TipSet> {
    const ret = await this.conn.exec('Filecoin.ChainHead');
    return ret.result;
  }

  public async getBlock(blockCid: Cid): Promise<TipSet> {
    const ret = await this.conn.exec('Filecoin.ChainGetBlock', [blockCid]);
    return ret.result;
  }


}
