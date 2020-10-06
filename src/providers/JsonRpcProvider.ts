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
import { JsonRpcMsigMethodGroup } from './method-groups/msig';

export class JsonRpcProvider {
  public conn: Connector;
  public chain: JsonRpcChainMethodGroup;
  public state: JsonRpcStateMethodGroup;
  public auth: JsonRpcAuthMethodGroup;
  public client: JsonRpcClientMethodGroup;
  public msig: JsonRpcMsigMethodGroup;

  constructor(connector: Connector) {
    this.conn = connector;
    this.conn.connect();

    this.state = new JsonRpcStateMethodGroup(this.conn);
    this.chain = new JsonRpcChainMethodGroup(this.conn);
    this.auth = new JsonRpcAuthMethodGroup(this.conn);
    this.client = new JsonRpcClientMethodGroup(this.conn);
    this.msig = new JsonRpcMsigMethodGroup(this.conn);
  }

  public async release() {
    return this.conn.disconnect();
  }

  //Payment channel methods
  /**
   * PaychGet
   * @param from
   * @param to
   * @param amount
   */
  public async getPaymentChannel(from: string, to: string, amount: string): Promise<ChannelInfo> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychGet', params: [from, to, amount] });
    return ret;
  }

  /**
   * PaychGetWaitReady
   * @param cid
   */
  public async getWaitReadyPaymentChannel(cid: Cid): Promise<Address> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychGetWaitReady', params: [cid] });
    return ret;
  }

  /**
    * PaychList
    */
  public async getPaymentChannelList(): Promise<[Address]> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychList', params: [] });
    return ret;
  }

  /**
   * PaychStatus
   * @param address
   */
  public async getPaymentChannelStatus(address: string): Promise<PaychStatus> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychStatus', params: [address] });
    return ret;
  }

  /**
   * PaychAllocateLane
   * @param address
   */
  public async PaymentChannelAllocateLane(address: string): Promise<number> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychAllocateLane', params: [address] });
    return ret;
  }

  /**
   * PaychSettle
   * @param address
   */
  public async PaymentChannelSettle(address: string): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychSettle', params: [address] });
    return ret;
  }

  /**
   * PaychCollect
   * @param address
   */
  public async PaymentChannelCollect(address: string): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychCollect', params: [address] });
    return ret;
  }

  /**
   * PaychAvailableFunds
   * @param address
   */
  public async getPaymentChannelAvailableFunds(address: string): Promise<ChannelAvailableFunds> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychAvailableFunds', params: [address] });
    return ret;
  }

  /**
   * PaychAvailableFundsByFromTo
   * @param from
   * @param to
   */
  public async getPaymentChannelAvailableFundsByFromTo(from: string, to: string): Promise<ChannelAvailableFunds> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychAvailableFundsByFromTo', params: [from, to] });
    return ret;
  }

  /**
   * PaychNewPayment
   * @param from
   * @param to
   * @param vouchers
   */
  public async paymentChannelNewPayment(from: string, to: string, vouchers: [VoucherSpec]): Promise<PaymentInfo> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychNewPayment', params: [from, to, vouchers] });
    return ret;
  }

  //Payment channel vouchers methods
  /**
   * PaychVoucherCreate
   * @param address
   * @param amount
   * @param lane
   */
  public async PaymentChannelVoucherCreate(address: string, amount: string, lane: number): Promise<VoucherCreateResult> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCreate', params: [address, amount, lane] });
    return ret;
  }

  /**
   * PaychVoucherList
   * @param address
   */
  public async PaymentChannelVoucherList(address: string): Promise<[SignedVoucher]> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherList', params: [address] });
    return ret;
  }

  /**
   * PaychVoucherCheckValid
   * @param address
   * @param signedVoucher
   */
  public async PaymentChannelVoucherCheckValid(address: string, signedVoucher: SignedVoucher): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCheckValid', params: [address, signedVoucher] });
    return ret;
  }

  /**
   * PaychVoucherAdd
   * @param address
   * @param signedVoucher
   * @param proof
   * @param minDelta
   */
  public async PaymentChannelVoucherAdd(address: string, signedVoucher: SignedVoucher, proof: any, minDelta: string): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherAdd', params: [address, signedVoucher, proof, minDelta] });
    return ret;
  }

  /**
   * PaychVoucherCheckSpendable
   * @param address
   * @param signedVoucher
   * @param secret
   * @param proof
   */
  public async PaymentChannelVoucherCheckSpendable(address: string, signedVoucher: SignedVoucher, secret: any, proof: any): Promise<boolean> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCheckSpendable', params: [address, signedVoucher, secret, proof] });
    return ret;
  }

  /**
   * PaychVoucherSubmit
   * @param address
   * @param signedVoucher
   * @param secret
   * @param proof
   */
  public async PaymentChannelVoucherSubmit(address: string, signedVoucher: SignedVoucher, secret: any, proof: any): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherSubmit', params: [address, signedVoucher, secret, proof] });
    return ret;
  }

  //Mpool
  /**
    * returns (a copy of) the current mpool config
    */
  public async getMpoolConfig(): Promise<MpoolConfig> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolGetConfig', params: [] });
    return ret;
  }

  /**
    * sets the mpool config to (a copy of) the supplied config
    * @param config
    */
  public async setMpoolConfig(config: MpoolConfig): Promise<MpoolConfig> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolSetConfig', params: [config] });
    return ret;
  }

  /**
    * clears pending messages from the mpool
    */
  public async mpoolClear(): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolClear', params: [true] });
    return ret;
  }

  /**
    * get all mpool messages
    * @param tipSetKey
    */
  public async getMpoolPending(tipSetKey: TipSetKey): Promise<[SignedMessage]> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolPending', params: [tipSetKey] });
    return ret;
  }

  /**
    * returns a list of pending messages for inclusion in the next block
    * @param tipSetKey
    * @param ticketQuality
    */
  public async mpoolSelect(tipSetKey: TipSetKey, ticketQuality: number): Promise<[SignedMessage]> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolSelect', params: [tipSetKey, ticketQuality] });
    return ret;
  }

  /**
    * returns a list of pending messages for inclusion in the next block
    * @param tipSetKey
    * @param ticketQuality
    */
   public async mpoolSub(cb: (data: MpoolUpdate) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      const subscriptionId = await this.conn.request({
        method: 'Filecoin.MpoolSub',
      });
      this.conn.on(subscriptionId, cb);
    }
  }
  /*
  needs implementing
  MpoolSub(context.Context) (<-chan MpoolUpdate, error)
  */

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
