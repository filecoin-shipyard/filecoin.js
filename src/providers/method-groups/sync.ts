import { Connector } from '../../connectors/Connector';
import { BlockHeader, BlockMsg, Cid, SyncState, TipSetKey } from '../Types';

/**
 * The Sync method group contains methods for interacting with and observing the lotus sync service.
 */
export class JsonRpcSyncMethodGroup {
  private conn: Connector;

  constructor(conn: Connector) {
    this.conn = conn;
  }

  /**
   * returns the current status of the lotus sync system.
   */
  public async state(): Promise<SyncState> {
    const state: SyncState = await this.conn.request({ method: 'Filecoin.SyncState' });
    return state;
  }

//TODO: Method not working for the requests done through WebSocket
  /**
   * checks if a block was marked as bad, and if it was, returns the reason.
   * @param blockCid
   */
  public async checkBad(blockCid: Cid): Promise<string> {
    const check: string = await this.conn.request({ method: 'Filecoin.SyncCheckBad', params: [blockCid] });
    return check;
  }

  /**
   * marks a blocks as bad, meaning that it won't ever by synced. Use with extreme caution.
   * @param blockCid
   */
  public async markBad(blockCid: Cid) {
    await this.conn.request({ method: 'Filecoin.SyncMarkBad', params: [blockCid] });
  }

  /**
   * purges bad block cache, making it possible to sync to chains previously marked as bad
   */
  public async unmarkAllBad() {
    await this.conn.request({ method: 'Filecoin.SyncUnmarkAllBad', params: [] });
  }

// TODO: Method not working. Returns 500 "Internal Server Error"
  /**
   * unmarks a block as bad, making it possible to be validated and synced again.
   * @param blockCid
   */
  public async unmarkBad(blockCid: Cid) {
    await this.conn.request({ method: 'Filecoin.SyncUnmarkBad', params: [blockCid] });
  }

  /**
   * marks a blocks as checkpointed, meaning that it won't ever fork away from it.
   * @param tipSetKey
   */
  public async checkpoint(tipSetKey: TipSetKey) {
    const check: string = await this.conn.request({ method: 'Filecoin.SyncCheckpoint', params: [tipSetKey] });
    return check;
  }

  /**
   * can be used to submit a newly created block to the network
   * @param blockMsg
   */
  public async submitBlock(blockMsg: BlockMsg) {
    const check: string = await this.conn.request({ method: 'Filecoin.SyncSubmitBlock', params: [blockMsg] });
    return check;
  }

  /**
   * returns a channel streaming incoming, potentially not yet synced block headers.
   * @param cb
   */
  public async incomingBlocks(cb: (blockHeader: BlockHeader) => void) {
    const subscriptionId = await this.conn.request({ method: 'Filecoin.SyncIncomingBlocks' });
    this.conn.on(subscriptionId, cb);
  }

  /**
   * indicates whether the provided tipset is valid or not
   * @param tipSetKey
   */
  public async validateTipset(tipSetKey: TipSetKey): Promise<boolean> {
    const valid: boolean = await this.conn.request({ method: 'Filecoin.SyncValidateTipset', params: [tipSetKey] });
    return valid;
  }
}
