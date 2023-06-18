import { Connector } from '../../connectors/Connector';
import {
  BlockHeader,
  BlockMessages, ChainEpoch,
  Cid,
  HeadChange,
  IpldObject,
  Message,
  MessageReceipt,
  ObjStat,
  PruneOpts,
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
  public async getBlock(blockCid: Cid): Promise<BlockHeader> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlock', params: [blockCid] });
    return ret as BlockHeader;
  }

  /**
   * Returns the tipset specified by the given TipSetKey.
   * @param tipSetKey
   */
  public async getTipSet(tipSetKey: TipSetKey): Promise<TipSet> {
    const ret: TipSet = await this.conn.request({ method: 'Filecoin.ChainGetTipSet', params: [tipSetKey] });
    return ret;
  }

  /**
   * returns messages stored in the specified block.
   * @param blockCid
   * 
   * Note: If there are multiple blocks in a tipset, it's likely that some
   * messages will be duplicated. It's also possible for blocks in a tipset to have
   * different messages from the same sender at the same nonce. When that happens,
   * only the first message (in a block with lowest ticket) will be considered
   * for execution
   *
   * NOTE: THIS METHOD SHOULD ONLY BE USED FOR GETTING MESSAGES IN A SPECIFIC BLOCK
   *
   * DO NOT USE THIS METHOD TO GET MESSAGES INCLUDED IN A TIPSET
   * Use ChainGetParentMessages, which will perform correct message deduplication
   */
  public async getBlockMessages(blockCid: Cid): Promise<BlockMessages> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlockMessages', params: [blockCid] });
    return ret as BlockMessages;
  }

  /**
   * returns receipts for messages in parent tipset of the specified block. The receipts in the list returned are one-to-one with the
   * messages returned by a call to ChainGetParentMessages with the same blockCid.
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
   * returns message stores in current tipset
   * @param tipSetKey
   */
  public async getMessagesInTipset(tipSetKey: TipSetKey): Promise<WrappedMessage[]> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetMessagesInTipset', params: [tipSetKey] });
    return ret as WrappedMessage[];
  }

  /**
   * looks back for a tipset at the specified epoch. If there are no blocks at the specified epoch, a tipset at an earlier epoch will be returned.
   * @param epochNumber
   */
  public async getTipSetByHeight(epochNumber: number): Promise<TipSet> {
    const ret: TipSet = await this.conn.request({ method: 'Filecoin.ChainGetTipSetByHeight', params: [epochNumber, []] });
    return ret;
  }

  /**
   * looks back for a tipset at the specified epoch. If there are no blocks at the specified epoch, the first non-nil tipset at a later epoch
   * will be returned.
   * @param epochNumber
   */
  public async getTipSetAfterHeight(epochNumber: number, tipSetKey?: TipSetKey): Promise<TipSet> {
    const ret: TipSet = await this.conn.request({ method: 'Filecoin.ChainGetTipSetAfterHeight', params: [epochNumber, tipSetKey] });
    return ret;
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
   * @param p 
   */
  public async getNode(p: string): Promise<IpldObject> {
    const node: IpldObject = await this.conn.request({ method: 'Filecoin.ChainGetNode', params: [p] });
    return node;
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
   * Returns a set of revert/apply operations needed to get from one tipset to another, for example:
   *
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

  /**
   * Prunes the stored chain state and garbage collects; only supported if you are using the splitstore
   *
   * @param opts
   */
  public async prune(opts: PruneOpts) {
    return this.conn.request({ method: 'Filecoin.ChainPrune', params: [opts] });
  }

  /**
   * Performs an (asynchronous) health check on the chain/state blockstore if supported by the underlying implementation.
   */
  public async checkBlockstore() {
    return this.conn.request({ method: 'Filecoin.ChainCheckBlockstore', params: [] });
  }

  /**
   * Returns some basic information about the blockstore
   */
  public async blockstoreInfo(): Promise<any> {
    return this.conn.request({ method: 'Filecoin.ChainBlockstoreInfo', params: [] });
  }

  /**
   * Estimates gas fee cap
   * @param message 
   * @param n 
   * @param tipSetKey 
   */
  public async gasEstimateFeeCap(message: Message, n: number, tipSetKey?: TipSetKey): Promise<string> {
    return this.conn.request({ method: 'Filecoin.GasEstimateFeeCap', params: [message, n, tipSetKey] });
  }

  /**
   * Estimates gas used by the message and returns it. It fails if message fails to execute.
   * @param message 
   * @param tipSetKey 
   */
  public async gasEstimateGasLimit(message: Message, tipSetKey?: TipSetKey): Promise<number> {
    return this.conn.request({ method: 'Filecoin.GasEstimateGasLimit', params: [message, tipSetKey] });
  }

  public stopChainNotify(id?: any) {
    if (this.conn instanceof HttpJsonRpcConnector && id) {
      clearInterval(id);
    } else if (this.conn instanceof WsJsonRpcConnector) {
      this.conn.closeSubscription(id);
    }
  }
}
