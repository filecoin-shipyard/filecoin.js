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

export class JsonRpcProvider {
  public conn: Connector;
  public chain: JsonRpcChainMethodGroup;
  public state: JsonRpcStateMethodGroup;
  public auth: JsonRpcAuthMethodGroup;

  constructor(connector: Connector) {
    this.conn = connector;

    this.conn.connect();
    this.state = new JsonRpcStateMethodGroup(this.conn);
    this.chain = new JsonRpcChainMethodGroup(this.conn);
    this.auth = new JsonRpcAuthMethodGroup(this.conn);
  }

  public async release() {
    return this.conn.disconnect();
  }

  /**
   * Client
   * The Client methods all have to do with interacting with the storage and retrieval markets as a client.
   */

  /**
   * Imports file under the specified path into filestore.
   * @param fileRef
   */
  public async import(fileRef: FileRef): Promise<ImportRes> {
    const result: ImportRes = await this.conn.request({
      method: 'Filecoin.ClientImport',
      params: [fileRef],
    });
    return result;
  }

  /**
   * Removes file import
   * @param importId
   */
  public async removeImport(importId: StoreID) {
    const result: ImportRes = await this.conn.request({
      method: 'Filecoin.ClientRemoveImport',
      params: [importId],
    });
    return result;
  }

  /**
   * Proposes a deal with a miner.
   * @param dealParams
   */
  public async startDeal(dealParams: StartDealParams): Promise<Cid> {
    const cid: Cid = await this.conn.request({
      method: 'Filecoin.ClientStartDeal',
      params: [dealParams],
    });
    return cid;
  }

  /**
   * Returns the latest information about a given deal.
   * @param dealCid
   */
  public async getDealInfo(dealCid: Cid): Promise<DealInfo> {
    const dealInfo: DealInfo = await this.conn.request({
      method: 'Filecoin.ClientGetDealInfo',
      params: [dealCid],
    });
    return dealInfo;
  }

  /**
   * Returns information about the deals made by the local client.
   */
  public async listDeals(): Promise<DealInfo[]> {
    const deals: DealInfo[] = await this.conn.request({
      method: 'Filecoin.ClientListDeals',
      params: [],
    });
    return deals;
  }

  public async hasLocal(cid: Cid): Promise<boolean> {
    const hasLocal: boolean = await this.conn.request({
      method: 'Filecoin.ClientHasLocal',
      params: [cid],
    });
    return hasLocal;
  }

  /**
   * Identifies peers that have a certain file, and returns QueryOffers (one per peer).
   * @param cid
   * @param pieceCid
   */
  public async findData(cid: Cid, pieceCid?: Cid): Promise<QueryOffer[]> {
    const data: QueryOffer[] = await this.conn.request({
      method: 'Filecoin.ClientFindData',
      params: [cid, pieceCid],
    });
    return data;
  }

  /**
   * returns a QueryOffer for the specific miner and file.
   * @param miner
   * @param root
   * @param pieceCid
   */
  public async minerQueryOffer(miner: Address, root: Cid, pieceCid?: Cid): Promise<QueryOffer> {
    const queryOffer: QueryOffer = await this.conn.request({
      method: 'Filecoin.ClientMinerQueryOffer',
      params: [miner, root, pieceCid],
    });
    return queryOffer;
  }

  /**
   * initiates the retrieval of a file, as specified in the order.
   * @param order
   * @param ref
   */
  public async retrieve(order: RetrievalOrder, ref: FileRef) {
    await this.conn.request({
      method: 'Filecoin.ClientRetrieve',
      params: [order, ref],
    });
  }

  /**
   * returns a signed StorageAsk from the specified miner.
   * @param peerId
   * @param miner
   */
  public async queryAsk(peerId: PeerID, miner: Address): Promise<StorageAsk> {
    const queryAsk: StorageAsk = await this.conn.request({
      method: 'Filecoin.ClientQueryAsk',
      params: [peerId, miner],
    });

    return queryAsk;
  }

  /**
   * calculates the CommP for a specified file
   * @param path
   */
  public async calcCommP(path: string): Promise<CommPRet> {
    const commP: CommPRet = await this.conn.request({
      method: 'Filecoin.ClientCalcCommP',
      params: [path],
    });

    return commP;
  }

  /**
   * generates a CAR file for the specified file.
   * @param ref
   * @param outpath
   */
  public async genCar(ref: FileRef, outpath: string) {
    const car = await this.conn.request({
      method: 'Filecoin.ClientGenCar',
      params: [ref, outpath],
    });

    return car;
  }

  /**
   * calculates real deal data size
   * @param root
   */
  public async dealSize(root: Cid): Promise<DataSize> {
    const dataSize: DataSize = await this.conn.request({
      method: 'Filecoin.ClientDealSize',
      params: [root],
    });

    return dataSize;
  }

  /**
   * returns the status of all ongoing transfers of data
   */
  public async listDataTransfers(): Promise<DataTransferChannel[]> {
    const transfers: DataTransferChannel[] = await this.conn.request({
      method: 'Filecoin.ClientListDataTransfers',
      params: [],
    });

    return transfers;
  }

  /**
   * attempts to restart stalled retrievals on a given payment channel which are stuck due to insufficient funds.
   * @param paymentChannel
   */
  public async retrieveTryRestartInsufficientFunds(paymentChannel: Address) {
    await this.conn.request({
      method: 'Filecoin.ClientRetrieveTryRestartInsufficientFunds',
      params: [paymentChannel],
    });
  }

  /**
   * lists imported files and their root CIDs
   */
  public async listImports(): Promise<Import[]> {
    const imports: Import[] = await this.conn.request({
      method: 'Filecoin.ClientListImports',
      params: [],
    });

    return imports;
  }

  /**
   * returns the status of updated deals
   */
  public async getDealUpdates(cb: (data: DealInfo) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      const subscriptionId = await this.conn.request({
        method: 'Filecoin.ClientGetDealUpdates',
      });
      this.conn.on(subscriptionId, cb);
    }
  }

  /**
   * initiates the retrieval of a file, as specified in the order, and provides a channel of status updates.
   * @param order
   * @param ref
   * @param cb
   */
  public async retrieveWithEvents(order: RetrievalOrder, ref: FileRef, cb: (data: RetrievalEvent) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      const subscriptionId = await this.conn.request({
        method: 'Filecoin.ClientRetrieveWithEvents',
      });
      this.conn.on(subscriptionId, cb);
    }
  }

  public async dataTransferUpdates(cb: (data: DataTransferChannel) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      const subscriptionId = await this.conn.request({
        method: 'Filecoin.ClientDataTransferUpdates',
      });
      this.conn.on(subscriptionId, cb);
    }
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

  // MethodGroup: Msig
  // The Msig methods are used to interact with multisig wallets on the
  // filecoin network

  /**
    * multiSigGetAvailableBalance returns the portion of a multisig's balance that can be withdrawn or spent
    * @param address
    * @param tipSetKey
    */
  public async multiSigGetAvailableBalance(address: string, tipSetKey: TipSetKey): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.MsigGetAvailableBalance', params: [address, tipSetKey] });
    return ret;
  }

  /**
    * multiSigGetVested returns the amount of FIL that vested in a multisig in a certain period.
    * @param address
    * @param startEpoch
    * @param endEpoch
    */
  public async multiSigGetVested(address: string, startEpoch: TipSetKey, endEpoch: TipSetKey): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.MsigGetVested', params: [address, startEpoch, endEpoch] });
    return ret;
  }

  /**
    * multiSigCreate creates a multisig wallet
    * @param requiredNumberOfSenders
    * @param approvingAddresses
    * @param unlockDuration
    * @param initialBalance
    * @param senderAddressOfCreateMsg
    * @param gasPrice
    */
  public async multiSigCreate(
    requiredNumberOfSenders: number,
    approvingAddresses: string[],
    unlockDuration: ChainEpoch,
    initialBalance: string,
    senderAddressOfCreateMsg: string,
    gasPrice: string): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigCreate',
        params: [
          requiredNumberOfSenders,
          approvingAddresses,
          unlockDuration,
          initialBalance,
          senderAddressOfCreateMsg,
          gasPrice
        ]
      });
    return ret;
  }

  /**
    * multiSigPropose creates a multisig wallet
    * @param address
    * @param recipientAddres
    * @param value
    * @param senderAddressOfProposeMsg
    * @param methodToCallInProposeMsg
    * @param paramsToIncludeInProposeMsg
    */
  public async multiSigPropose(
    address: string,
    recipientAddres: string,
    value: string,
    senderAddressOfProposeMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigPropose',
        params: [
          address,
          recipientAddres,
          value,
          senderAddressOfProposeMsg,
          methodToCallInProposeMsg,
          paramsToIncludeInProposeMsg
        ]
      });
    return ret;
  }

  /**
    * multiSigApprove approves a previously-proposed multisig message
    * @param address
    * @param proposedMessageId
    * @param proposerAddress
    * @param recipientAddres
    * @param value
    * @param senderAddressOfApproveMsg
    * @param methodToCallInProposeMsg
    * @param paramsToIncludeInProposeMsg
    */
  public async multiSigApprove(
    address: string,
    proposedMessageId: number,
    proposerAddress: string,
    recipientAddres: string,
    value: string,
    senderAddressOfApproveMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigApprove',
        params: [
          address,
          proposedMessageId,
          proposerAddress,
          recipientAddres,
          value,
          senderAddressOfApproveMsg,
          methodToCallInProposeMsg,
          paramsToIncludeInProposeMsg
        ]
      });
    return ret;
  }

  /**
    * multiSigCancel cancels a previously-proposed multisig message
    * @param address
    * @param proposedMessageId
    * @param proposerAddress
    * @param recipientAddres
    * @param value
    * @param senderAddressOfCancelMsg
    * @param methodToCallInProposeMsg
    * @param paramsToIncludeInProposeMsg
    */
  public async multiSigCancel(
    address: string,
    proposedMessageId: number,
    proposerAddress: string,
    recipientAddres: string,
    value: string,
    senderAddressOfCancelMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigCancel',
        params: [
          address,
          proposedMessageId,
          proposerAddress,
          recipientAddres,
          value,
          senderAddressOfCancelMsg,
          methodToCallInProposeMsg,
          paramsToIncludeInProposeMsg
        ]
      });
    return ret;
  }

  /**
    * multiSigAddPropose proposes adding a signer in the multisig
    * @param address
    * @param senderAddressOfProposeMsg
    * @param newSignerAddress
    * @param increaseNumberOfRequiredSigners
    */
  public async multiSigAddPropose(
    address: string,
    senderAddressOfProposeMsg: string,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean,
  ): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigAddPropose',
        params: [
          address,
          senderAddressOfProposeMsg,
          newSignerAddress,
          increaseNumberOfRequiredSigners
        ]
      });
    return ret;
  }

  /**
    * multiSigAddApprove approves a previously proposed AddSigner message
    * @param address
    * @param senderAddressOfApproveMsg
    * @param proposedMessageId
    * @param proposerAddress
    * @param newSignerAddress
    * @param increaseNumberOfRequiredSigners
    */
  public async multiSigAddApprove(
    address: string,
    senderAddressOfApproveMsg: string,
    proposedMessageId: number,
    proposerAddress: string,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean
  ): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigAddApprove',
        params: [
          address,
          senderAddressOfApproveMsg,
          proposedMessageId,
          proposerAddress,
          newSignerAddress,
          increaseNumberOfRequiredSigners
        ]
      });
    return ret;
  }

  /**
    * multiSigAddCancel cancels a previously proposed AddSigner message
    * @param address
    * @param senderAddressOfCancelMsg
    * @param proposedMessageId
    * @param newSignerAddress
    * @param increaseNumberOfRequiredSigners
    */
  public async multiSigAddCancel(
    address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean
  ): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigAddCancel',
        params: [
          address,
          senderAddressOfCancelMsg,
          proposedMessageId,
          newSignerAddress,
          increaseNumberOfRequiredSigners
        ]
      });
    return ret;
  }

  /**
    * multiSigSwapPropose proposes swapping 2 signers in the multisig
    * @param address
    * @param senderAddressOfProposeMsg
    * @param oldSignerAddress
    * @param newSignerAddress
    */
  public async multiSigSwapPropose(
    address: string,
    senderAddressOfProposeMsg: string,
    oldSignerAddress: string,
    newSignerAddress: string,
  ): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigSwapPropose',
        params: [
          address,
          senderAddressOfProposeMsg,
          oldSignerAddress,
          newSignerAddress
        ]
      });
    return ret;
  }

  /**
    * multiSigSwapApprove approves a previously proposed SwapSigner
    * @param address
    * @param senderAddressOfApproveMsg
    * @param proposedMessageId
    * @param proposerAddress
    * @param oldSignerAddress
    * @param newSignerAddress
    */
   public async multiSigSwapApprove(
    address: string,
    senderAddressOfApproveMsg: string,
    proposedMessageId: number,
    proposerAddress: string,
    oldSignerAddress: string,
    newSignerAddress: string,
  ): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigSwapApprove',
        params: [
          address,
          senderAddressOfApproveMsg,
          proposedMessageId,
          proposerAddress,
          oldSignerAddress,
          newSignerAddress,
        ]
      });
    return ret;
  }

  /**
    * multiSigSwapCancel cancels a previously proposed SwapSigner message
    * @param address
    * @param senderAddressOfCancelMsg
    * @param proposedMessageId
    * @param oldSignerAddress
    * @param newSignerAddress
    */
   public async multiSigSwapCancel(
    address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    oldSignerAddress: string,
    newSignerAddress: string,
  ): Promise<Cid> {
    const ret = await this.conn.request(
      {
        method: 'Filecoin.MsigSwapCancel',
        params: [
          address,
          senderAddressOfCancelMsg,
          proposedMessageId,
          oldSignerAddress,
          newSignerAddress,
        ]
      });
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
