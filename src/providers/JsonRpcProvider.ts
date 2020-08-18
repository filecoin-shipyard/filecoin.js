import { HttpJsonRpcConnector, JsonRpcConnectionOptions } from '../connectors/HttpJsonRpcConnector';
import { Version, Cid, TipSet, BlockMessages, Message, MessageReceipt } from './Types';
import { Connector, JsonRpcResponse, JsonRpcError } from '../connectors/Connector';

export class JsonRpcProvider {
  public conn: Connector;

  constructor(connector: Connector) {
    this.conn = connector;
  }

  public async version(): Promise<Version> {
    const ret = await this.conn.request({ method: 'Filecoin.Version' });
    return ret as Version;
  }

  /**
   * reads ipld nodes referenced by the specified CID from chain blockstore and returns raw bytes.
   * @param cid
   */
  public async readObj(cid: Cid): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainReadObj', params: [cid] });
    return ret as string;
  }

  /**
   * returns messages stored in the specified block.
   * @param blockCid
   */
  public async getBlockMessages(blockCid: Cid): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlockMessages', params: [blockCid] });
    return ret as BlockMessages;
  }

  /**
   * returns the current head of the chain
   */
  public async getHead(): Promise<TipSet> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainHead' });
    return ret as TipSet;
  }

  /**
   * returns the block specified by the given CID
   * @param blockCid
   */
  public async getBlock(blockCid: Cid): Promise<TipSet> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlock', params: [blockCid] });
    return ret as TipSet;
  }

  /**
   * reads a message referenced by the specified CID from the chain blockstore
   * @param messageCid
   */
  public async getMessage(messageCid: Cid): Promise<Message> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlock', params: [messageCid] });
    return ret as Message;
  }

  /**
   * returns receipts for messages in parent tipset of the specified block
   * @param blockCid
   */
  public async getParentReceipts(blockCid: Cid): Promise<MessageReceipt[]> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetParentReceipts', params: [blockCid] });
    return ret as MessageReceipt[];
  }
}
