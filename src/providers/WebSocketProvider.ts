import { HttpJsonRpcConnector, JsonRpcConnectionOptions } from '../connectors/HttpJsonRpcConnector';
import { Version, Cid, TipSet, HeadChange, BlockMessages } from './Types';
import { Connector } from '../connectors/Connector';
import { WsJsonRpcConnector } from '../connectors/WsJsonRpcConnector';

export class WebSocketProvider {
  private connector: WsJsonRpcConnector;

  constructor(url: string, token?: string) {
    this.connector = new WsJsonRpcConnector({
      url,
      token
    });
    this.connector.connect();
  }

  public async release() {
    return this.connector.disconnect();
  }
  public async version(): Promise<Version> {
    const ret = await this.connector.request({ method: 'Filecoin.Version' });
    return ret as Version;
  }

  /**
   * reads ipld nodes referenced by the specified CID from chain blockstore and returns raw bytes.
   * @param cid
   */
  public async readObj(cid: Cid): Promise<string> {
    const ret = await this.connector.request({ method: 'Filecoin.ChainReadObj', params: [cid] });
    return ret as string;
  }

  /**
   * returns messages stored in the specified block.
   * @param blockCid
   */
  public async getBlockMessages(blockCid: Cid): Promise<BlockMessages> {
    const ret = await this.connector.request({ method: 'Filecoin.ChainGetBlockMessages', params: [blockCid] });
    return ret as BlockMessages;
  }

  /**
   * returns the current head of the chain
   */
  public async getHead(): Promise<TipSet> {
    const ret = await this.connector.request({ method: 'Filecoin.ChainHead' });
    return ret as TipSet;
  }

  /**
   * returns the block specified by the given CID
   * @param blockCid
   */
  public async getBlock(blockCid: Cid): Promise<TipSet> {
    const ret = await this.connector.request({ method: 'Filecoin.ChainGetBlock', params: [blockCid] });
    return ret as TipSet;
  }

  /**
   * returns channel with chain head updates
   * @param cb
   */
  public chainNotify(cb: (headChange: HeadChange[]) => void) {
    this.connector.requestWithChannel(
      {
        method: 'Filecoin.ChainNotify',
      },
      'xrpc.ch.val',
      data => {
        cb(data[1]);
      });
  }
}
