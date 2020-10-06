import {
  Version,
  Cid,
  TipSet,
  BlockMessages,
  Message,
  MessageReceipt,
  WrappedMessage,
  InvocResult,
  TipSetKey,
  Actor,
  ActorState,
  NetworkName,
  ChainSectorInfo,
  DeadlineInfo,
  MinerPower,
  MinerInfo,
  Deadline,
  Partition,
  BitField,
  ChainEpoch,
  Fault,
  SectorPreCommitInfo,
  SectorNumber,
  SectorPreCommitOnChainInfo,
  SectorOnChainInfo,
  SectorExpiration,
  SectorLocation,
  MsgLookup,
  Address,
  MarketBalance,
  MarketDeal,
  DealID,
  MinerSectors,
  ComputeStateOutput,
  DataCap,
  PaddedPieceSize,
  DealCollateralBounds,
  CirculatingSupply,
  HeadChange,
  ObjStat,
  BlockHeader,
  FileRef,
  ImportRes,
  StoreID,
  DealInfo,
  StartDealParams,
  QueryOffer,
  RetrievalOrder,
  PeerID,
  SignedStorageAsk,
  CommPRet,
  DataSize,
  DataTransferChannel,
  Import,
  RetrievalEvent,
  Permission,
  ID,
  Connectedness,
  AddrInfo,
  PubsubScore,
  NatInfo,
  SyncState,
  ChannelAvailableFunds,
  VoucherSpec,
  PaymentInfo,
  ChannelInfo,
  PaychStatus,
  VoucherCreateResult,
  SignedVoucher,
  MpoolConfig,
  SignedMessage,
  MiningBaseInfo,
  BlockTemplate,
  BlockMsg,
  MpoolUpdate,
  StorageAsk,
} from './Types';
import { Connector } from '../connectors/Connector';
import { JsonRpcStateMethodGroup } from './method-groups/state';
import { JsonRpcChainMethodGroup } from './method-groups/chain';
import { JsonRpcPaychMethodGroup } from './method-groups/paych';
import { JsonRpcMPoolMethodGroup } from './method-groups/mpool';
import { JsonRpcNetMethodGroup } from './method-groups/net';
import { JsonRpcMsigMethodGroup } from './method-groups/msig';

export class JsonRpcProvider {
  public conn: Connector;
  public chain: JsonRpcChainMethodGroup;
  public state: JsonRpcStateMethodGroup;
  public auth: JsonRpcAuthMethodGroup;
  public client: JsonRpcClientMethodGroup;
  public paych: JsonRpcPaychMethodGroup;
  public mpool: JsonRpcMPoolMethodGroup;
  public net: JsonRpcNetMethodGroup;
  public msig: JsonRpcMsigMethodGroup;

  constructor(connector: Connector) {
    this.conn = connector;
    this.conn.connect();

    this.state = new JsonRpcStateMethodGroup(this.conn);
    this.chain = new JsonRpcChainMethodGroup(this.conn);
    this.auth = new JsonRpcAuthMethodGroup(this.conn);
    this.client = new JsonRpcClientMethodGroup(this.conn);
    this.paych = new JsonRpcPaychMethodGroup(this.conn);
    this.mpool = new JsonRpcMPoolMethodGroup(this.conn);
    this.msig = new JsonRpcMsigMethodGroup(this.conn);
  }

  public async release() {
    return this.conn.disconnect();
  }

  //Miner
  /**
    * MinerGetBaseInfo
    * @param address
    * @param chainEpoch
    * @param tipSetKey
    */
  public async minerGetBaseInfo(address: string, chainEpoch: ChainEpoch, tipSetKey: TipSetKey): Promise<MiningBaseInfo> {
    const ret = await this.conn.request({ method: 'Filecoin.MinerGetBaseInfo', params: [address, chainEpoch, tipSetKey] });
    return ret;
  }

  /**
    * MinerCreateBlock
    * @param blockTemplate
    */
   public async minerCreateBlock(blockTemplate: BlockTemplate): Promise<BlockMsg> {
    const ret = await this.conn.request({ method: 'Filecoin.MinerCreateBlock', params: [blockTemplate] });
    return ret;
  }

  /**
   * Common
   */

  /**
   * returns peerID of libp2p node backing this API
   */
  public async id(): Promise<ID> {
    const id: ID = await this.conn.request({ method: 'Filecoin.ID', params: [] });
    return id;
  }

  /**
   * provides information about API provider
   */
  public async version(): Promise<Version> {
    const ret = await this.conn.request({ method: 'Filecoin.Version' });
    return ret as Version;
  }

  public async logList(): Promise<string[]> {
    const list: string[] = await this.conn.request({ method: 'Filecoin.LogList' });
    return list;
  }

  public async logSetLevel(string1: string, string2: string): Promise<any> {
    const result = await this.conn.request({ method: 'Filecoin.LogSetLevel', params: [string1, string2] });
    return result;
  }

  /**
   * trigger graceful shutdown
   */
  public async shutdown() {
    await this.conn.request({ method: 'Filecoin.Shutdown' });
  }

}
