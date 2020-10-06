import { Connector } from '../../connectors/Connector';
import { BlockMsg, BlockTemplate, ChainEpoch, MiningBaseInfo, TipSetKey } from '../Types';

export class JsonRpcMinerMethodGroup {
  private conn: Connector;

  constructor(conn: Connector) {
    this.conn = conn;
  }

  /**
   * MinerGetBaseInfo
   * @param address
   * @param chainEpoch
   * @param tipSetKey
   */
  public async getBaseInfo(address: string, chainEpoch: ChainEpoch, tipSetKey: TipSetKey): Promise<MiningBaseInfo> {
    const ret = await this.conn.request({ method: 'Filecoin.MinerGetBaseInfo', params: [address, chainEpoch, tipSetKey] });
    return ret;
  }

  /**
   * MinerCreateBlock
   * @param blockTemplate
   */
  public async createBlock(blockTemplate: BlockTemplate): Promise<BlockMsg> {
    const ret = await this.conn.request({ method: 'Filecoin.MinerCreateBlock', params: [blockTemplate] });
    return ret;
  }
}
