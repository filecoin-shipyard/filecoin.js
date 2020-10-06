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
import { JsonRpcMsigMethodGroup } from './method-groups/msig';

export class JsonRpcProvider {
  public conn: Connector;
  public chain: JsonRpcChainMethodGroup;
  public state: JsonRpcStateMethodGroup;
  public auth: JsonRpcAuthMethodGroup;
  public client: JsonRpcClientMethodGroup;
  public paych: JsonRpcPaychMethodGroup;
  public mpool: JsonRpcMPoolMethodGroup;
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

  /**
   * Net
   */

  public async netConnectedness(peerId: PeerID): Promise<Connectedness> {
    const connectedness: Connectedness = await this.conn.request({ method: 'Filecoin.NetConnectedness', params: [peerId] });
    return connectedness;
  }

  public async netPeers(): Promise<AddrInfo[]> {
    const peers: AddrInfo[] = await this.conn.request({ method: 'Filecoin.NetPeers' });
    return peers;
  }

  public async netConnect(addrInfo: AddrInfo): Promise<any> {
    const result: any = await this.conn.request({ method: 'Filecoin.NetConnect', params: [addrInfo] });
    return result;
  }

  public async netAddrsListen(): Promise<AddrInfo> {
    const addr: AddrInfo = await this.conn.request({ method: 'Filecoin.NetAddrsListen' });
    return addr;
  }

  public async netDisconnect(peerID: PeerID) {
    await this.conn.request({ method: 'Filecoin.NetDisconnect', params: [peerID] });
  }

  public async findPeer(peerID: PeerID): Promise<AddrInfo> {
    const peer: AddrInfo = await this.conn.request({ method: 'Filecoin.NetFindPeer', params: [peerID] });
    return peer;
  }

  public async netPubsubScores(): Promise<PubsubScore[]> {
    const score: PubsubScore[] = await this.conn.request({ method: 'Filecoin.NetPubsubScores' });
    return score;
  }

  public async netAutoNatStatus(): Promise<NatInfo> {
    const natInfo: NatInfo = await this.conn.request({ method: 'Filecoin.NetAutoNatStatus' });
    return natInfo;
  }

  // TODO: This method throws an error: "method 'Filecoin.NetAgentVersion' not found"
  // public async netAgentVersion(peerId: PeerID): Promise<string> {
  //   const agentVersion: string = await this.conn.request({ method: 'Filecoin.NetAgentVersion', params: [peerId] });
  //   return agentVersion;
  // }

  // TODO: This method throws an error: "method 'Filecoin.NetBandwidthStats' not found"
  // public async netBandwidthStats(): Promise<Stats> {
  //   const stats: Stats = await this.conn.request({ method: 'Filecoin.NetBandwidthStats' });
  //   return stats;
  // }

  // TODO: This method throws an error: "method 'NetBandwidthStatsByPeer' not found"
  // /**
  //  * returns statistics about the nodes bandwidth usage and current rate per peer
  //  */
  // public async netBandwidthStatsByPeer(): Promise<any> {
  //   const stats: any = await this.conn.request({ method: 'Filecoin.NetBandwidthStatsByPeer' });
  //   return stats;
  // }

  // TODO: This method throws an error: "method 'Filecoin.NetBandwidthStatsByProtocol' not found"
  // /**
  //  * returns statistics about the nodes bandwidth usage and current rate per protocol
  //  */
  // public async netBandwidthStatsByProtocol(): Promise<any> {
  //   const stats: any = await this.conn.request({ method: 'Filecoin.NetBandwidthStatsByProtocol' });
  //   return stats;
  // }

}
