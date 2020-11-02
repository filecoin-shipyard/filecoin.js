import { Connector } from '../../connectors/Connector';
import {
  BlockHeader,
  BlockMessages, ChainEpoch,
  Cid,
  HeadChange,
  Message,
  MessageReceipt,
  ObjStat,
  TipSet, TipSetKey,
  WrappedMessage,
} from '../Types';
import { WsJsonRpcConnector } from '../../connectors/WsJsonRpcConnector';
import { HttpJsonRpcConnector } from '../../connectors/HttpJsonRpcConnector';

const CHAIN_NOTIFY_INTERVAL = 2000;
/**
 * The Chain method group contains methods for interacting with the blockchain, but that do not require any form of state computation.
 */
export class JsonRpcChainMethodGroup {
  private conn: Connector;

  constructor(conn: Connector) {
    this.conn = conn;
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
   * deletes node referenced by the given CID
   * @param cid
   */
  public async deleteObj(cid: Cid): Promise<string> {
    const error = await this.conn.request({ method: 'Filecoin.ChainDeleteObj', params: [cid] });
    return error as string;
  }

  /**
   * returns messages stored in the specified block.
   * @param blockCid
   */
  public async getBlockMessages(blockCid: Cid): Promise<BlockMessages> {
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
   * call back on chain head updates.
   * @param cb
   * @returns interval id
   */
  public async chainNotify(cb: (headChange: HeadChange[]) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      const subscriptionId = await this.conn.request({ method: 'Filecoin.ChainNotify' });
      this.conn.on(subscriptionId, cb);
    } else if (this.conn instanceof HttpJsonRpcConnector) {
      let head: TipSet;

      return setInterval(async () => {
        const currentHead = await this.getHead();
        if (head !== currentHead) {
          head = currentHead;
          cb([{ Type: '', Val: currentHead }])
        }
      }, CHAIN_NOTIFY_INTERVAL);
    }
  }

  public stopChainNotify(id?: any) {
    if (this.conn instanceof HttpJsonRpcConnector && id) {
      clearInterval(id);
    } else if (this.conn instanceof WsJsonRpcConnector) {
      this.conn.closeSubscription(id);
    }
  }

  /**
   * returns the block specified by the given CID
   * @param blockCid
   */
  public async getBlock(blockCid: Cid): Promise<BlockHeader> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlock', params: [blockCid] });
    return ret as BlockHeader;
  }

  /**
   * reads a message referenced by the specified CID from the chain blockstore
   * @param messageCid
   */
  public async getMessage(messageCid: Cid): Promise<Message> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetMessage', params: [messageCid] });
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

  /**
   * returns messages stored in parent tipset of the specified block.
   * @param blockCid
   */
  public async getParentMessages(blockCid: Cid): Promise<WrappedMessage[]> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetParentMessages', params: [blockCid] });
    return ret as WrappedMessage[];
  }

  /**
   * checks if a given CID exists in the chain blockstore
   * @param cid
   */
  public async hasObj(cid: Cid): Promise<boolean> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainHasObj', params: [cid] });
    return ret as boolean;
  }

  /**
   * returns statistics about the graph referenced by 'obj'.
   *
   * @remarks
   * If 'base' is also specified, then the returned stat will be a diff between the two objects.
   */
  public async statObj(obj: Cid, base?: Cid): Promise<ObjStat> {
    const stat: ObjStat = await this.conn.request({ method: 'Filecoin.ChainStatObj', params: [obj, base] });
    return stat;
  }

  /**
   * Forcefully sets current chain head. Use with caution.
   * @param tipSetKey
   */
  public async setHead(tipSetKey: TipSetKey) {
    await this.conn.request({ method: 'Filecoin.ChainSetHead', params: [tipSetKey] });
  }

  /**
   * Returns the genesis tipset.
   * @param tipSet
   */
  public async getGenesis(): Promise<TipSet> {
    const genesis: TipSet = await this.conn.request({ method: 'Filecoin.ChainGetGenesis', params: [] });
    return genesis;
  }

  // TODO: Go API method signature returns BigInt. Replace string with BN
  /**
   * Computes weight for the specified tipset.
   * @param tipSetKey
   */
  public async getTipSetWeight(tipSetKey?: TipSetKey): Promise<string> {
    const weight: string = await this.conn.request({ method: 'Filecoin.ChainTipSetWeight', params: [tipSetKey] });
    return weight;
  }

  /**
   * looks back for a tipset at the specified epoch.
   * @param epochNumber
   */
  public async getTipSetByHeight(epochNumber: number): Promise<TipSet> {
    const ret: TipSet = await this.conn.request({ method: 'Filecoin.ChainGetTipSetByHeight', params: [epochNumber, []] });
    return ret;
  }

  /**
   * Returns a set of revert/apply operations needed to get from
   * @param from
   * @param to
   */
  public async getPath(from: TipSetKey, to: TipSetKey): Promise<HeadChange[]> {
    const path: HeadChange[] = await this.conn.request({ method: 'Filecoin.ChainGetPath', params: [from, to] });
    return path;
  }

  // TODO: Fix error: 500 Internal Server Error
  /**
   * Returns a stream of bytes with CAR dump of chain data.
   * @param nroots
   * @param tipSetKey
   *
   * @remarks The exported chain data includes the header chain from the given tipset back to genesis, the entire genesis state, and the most recent 'nroots' state trees. If oldmsgskip is set, messages from before the requested roots are also not included.
   */
  public async export(nroots: ChainEpoch, oldmsgskip: boolean, tipSetKey: TipSetKey): Promise<any> {
    const path: HeadChange[] = await this.conn.request({ method: 'Filecoin.ChainExport', params: [nroots, oldmsgskip, tipSetKey] });
    return path;
  }
}
