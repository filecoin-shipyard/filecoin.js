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
  DataTransferChannel, Import, RetrievalEvent,
} from './Types';
import { Connector } from '../connectors/Connector';
import { WsJsonRpcConnector } from '../connectors/WsJsonRpcConnector';
import { HttpJsonRpcConnector } from '../connectors/HttpJsonRpcConnector';
import Timeout = NodeJS.Timeout;

const CHAIN_NOTIFY_INTERVAL = 2000;

export class JsonRpcProvider {
  public conn: Connector;
  private intervals: { [key: string]: NodeJS.Timeout };

  constructor(connector: Connector) {
    this.intervals = {};
    this.conn = connector;

    this.conn.connect();
  }

  public async release() {
    return this.conn.disconnect();
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
      await this.conn.requestWithChannel(
        {
          method: 'Filecoin.ChainNotify',
        },
        data => {
          cb(data);
        });
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

  public stopChainNotify(intervalId?: Timeout) {
    if (this.conn instanceof HttpJsonRpcConnector && intervalId) {
      clearInterval(intervalId);
    } else if (this.conn instanceof WsJsonRpcConnector) {
      this.conn.removeChannelListener('xrpc.ch.val');
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
   * @remarks The exported chain data includes the header chain from the given tipset back to genesis, the entire genesis state, and the most recent 'nroots' state trees.
   */
  public async export(nroots: ChainEpoch, tipSetKey: TipSetKey): Promise<any> {
    const path: HeadChange[] = await this.conn.request({ method: 'Filecoin.ChainExport', params: [nroots, tipSetKey] });
    return path;
  }

  /**
   * State
   * The State methods are used to query, inspect, and interact with chain state.
   * All methods take a TipSetKey as a parameter. The state looked up is the state at that tipset.
   * If TipSetKey is not provided as a param, the heaviest tipset in the chain to be used.
   */

  /**
   * runs the given message and returns its result without any persisted changes.
   */
  public async stateCall(message: Message, tipSetKey?: TipSet): Promise<InvocResult> {
    const data = await this.conn.request({ method: 'Filecoin.StateCall', params: [message, tipSetKey] });
    return data as InvocResult;
  }

  /**
   * returns the result of executing the indicated message, assuming it was executed in the indicated tipset
   */
  public async stateReplay(tipSetKey: TipSetKey, cid: Cid): Promise<InvocResult> {
    const data = await this.conn.request({ method: 'Filecoin.StateReplay', params: [] });
    return data as InvocResult;
  }

  /**
   * returns the indicated actor's nonce and balance
   * @param address
   * @param tipSetKey
   */
  public async getActor(address: string, tipSetKey?: TipSetKey): Promise<Actor> {
    const data = await this.conn.request({ method: 'Filecoin.StateGetActor', params: [address, tipSetKey] });
    return data as Actor;
  }

  /**
   * returns the indicated actor's state
   * @param address
   * @param tipSetKey
   */
  public async readState(address: string, tipSetKey?: TipSetKey): Promise<ActorState> {
    const data = await this.conn.request({ method: 'Filecoin.StateReadState', params: [address, tipSetKey] });
    return data as ActorState;
  }

  /**
   * looks back and returns all messages with a matching to or from address, stopping at the given height.
   * @param filter
   * @param tipSetKey
   * @param toHeight
   */
  public async listMessages(filter: { To?: string, From?: string }, tipSetKey?: TipSetKey, toHeight?: number): Promise<Cid[]> {
    const messages: Cid[] = await this.conn.request({ method: 'Filecoin.StateListMessages', params: [filter, tipSetKey, toHeight] });

    return messages ? messages : [];
  }

  /**
   * returns the name of the network the node is synced to
   */
  public async networkName(): Promise<NetworkName> {
    const network: string = await this.conn.request({ method: 'Filecoin.StateNetworkName', params: [] });
    return network;
  }

  /**
   * returns info about the given miner's sectors
   * @param address
   * @param tipSetKey
   */
  public async minerSectors(address: string, tipSetKey?: TipSetKey): Promise<ChainSectorInfo[]> {
    const sectorsInfo: ChainSectorInfo[] = await this.conn.request({ method: 'Filecoin.StateMinerSectors', params: [address, undefined, true, tipSetKey] })
    return sectorsInfo;
  }

  /**
   * returns info about sectors that a given miner is actively proving.
   * @param address
   * @param tipSetKey
   */
  public async minerActiveSectors(address: string, tipSetKey?: TipSetKey): Promise<ChainSectorInfo[]> {
    const activeSectors: ChainSectorInfo[] = await this.conn.request({ method: 'Filecoin.StateMinerActiveSectors', params: [address, tipSetKey] });
    return activeSectors;
  }

  /**
   * calculates the deadline at some epoch for a proving period and returns the deadline-related calculations.
   * @param address
   * @param tipSetKey
   */
  public async minerProvingDeadline(address: string, tipSetKey?: TipSetKey): Promise<DeadlineInfo> {
    const provingDeadline: DeadlineInfo = await this.conn.request({ method: 'Filecoin.StateMinerProvingDeadline', params: [address, tipSetKey] });
    return provingDeadline;
  }

  /**
   * returns the power of the indicated miner
   * @param address
   * @param tipSetKey
   */
  public async minerPower(address: string, tipSetKey?: TipSetKey): Promise<MinerPower> {
    const power: MinerPower = await this.conn.request({ method: 'Filecoin.StateMinerPower', params: [address, tipSetKey] });
    return power;
  }

  /**
   * returns info about the indicated miner
   * @param address
   * @param tipSetKey
   */
  public async minerInfo(address: string, tipSetKey?: TipSetKey): Promise<MinerInfo> {
    const minerInfo: MinerInfo = await this.conn.request({ method: 'Filecoin.StateMinerInfo', params: [address, tipSetKey] });
    return minerInfo;
  }

  /**
   * returns all the proving deadlines for the given miner
   * @param address
   * @param tipSetKey
   */
  public async minerDeadlines(address: string, tipSetKey?: TipSetKey): Promise<Deadline[]> {
    const minerDeadlines: Deadline[] = await this.conn.request({ method: 'Filecoin.StateMinerDeadlines', params: [address, tipSetKey] });
    return minerDeadlines;
  }

  /**
   * Loads miner partitions for the specified miner and deadline
   * @param address
   * @param idx
   * @param tipSetKey
   */
  public async minerPartitions(address: string, idx?: number, tipSetKey?: TipSetKey): Promise<Partition[]> {
    const minerPartitions: Partition[] = await this.conn.request({ method: 'Filecoin.StateMinerPartitions', params: [address, idx, tipSetKey] });
    return minerPartitions;
  }

  /**
   * Returns a bitfield indicating the faulty sectors of the given miner
   * @param address
   * @param tipSetKey
   */
  public async minerFaults(address: string, tipSetKey?: TipSetKey): Promise<BitField> {
    const minerFaults: BitField = await this.conn.request({ method: 'Filecoin.StateMinerFaults', params: [address, tipSetKey] });
    return minerFaults;
  }

  // TODO: This method is not working on Lotus. See issue here: https://github.com/filecoin-project/lotus/issues/3063
  /**
   * returns all non-expired Faults that occur within lookback epochs of the given tipset
   * @param epoch
   * @param tipSetKey
   */
  public async allMinerFaults(epoch: ChainEpoch, tipSetKey?: TipSetKey): Promise<Fault[]> {
    const allFaults: Fault[] = await this.conn.request({ method: 'Filecoin.StateAllMinerFaults', params: [epoch, tipSetKey] });
    return allFaults;
  }

  /**
   * returns a bitfield indicating the recovering sectors of the given miner
   * @param address
   * @param tipSetKey
   */
  public async minerRecoveries(address: string, tipSetKey?: TipSetKey): Promise<BitField> {
    const recoveries: BitField = await this.conn.request({ method: 'Filecoin.StateMinerRecoveries', params: [address, tipSetKey] });
    return recoveries;
  }

  // TODO: this should be BigNumber instead of string
  /**
   * returns the precommit deposit for the specified miner's sector
   * @param address
   * @param sectorPreCommitInfo
   * @param tipSetKey
   */
  public async minerPreCommitDepositForPower(address: string, sectorPreCommitInfo: SectorPreCommitInfo, tipSetKey?: TipSetKey): Promise<string> {
    const deposit: string = await this.conn.request({
      method: 'Filecoin.StateMinerPreCommitDepositForPower',
      params: [address, sectorPreCommitInfo, tipSetKey]
    });
    return deposit;
  }

  /**
   * returns the initial pledge collateral for the specified miner's sector
   * @param address
   * @param sectorPreCommitInfo
   * @param tipSetKey
   */
  public async minerInitialPledgeCollateral(address: string, sectorPreCommitInfo: SectorPreCommitInfo, tipSetKey?: TipSetKey): Promise<string> {
    const deposit: string = await this.conn.request({
      method: 'Filecoin.StateMinerInitialPledgeCollateral',
      params: [address, sectorPreCommitInfo, tipSetKey]
    });
    return deposit;
  }

  /**
   * returns the portion of a miner's balance that can be withdrawn or spent
   * @param address
   * @param tipSetKey
   */
  public async minerAvailableBalance(address: string, tipSetKey?: TipSetKey): Promise<string> {
    const balance: string = await this.conn.request({
      method: 'Filecoin.StateMinerAvailableBalance',
      params: [address, tipSetKey]
    });
    return balance;
  }

  /**
   * returns the PreCommit info for the specified miner's sector
   * @param address
   * @param sector
   * @param tipSetKey
   */
  public async sectorPreCommitInfo(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorPreCommitOnChainInfo> {
    const preCommitInfo: SectorPreCommitOnChainInfo = await this.conn.request({
      method: 'Filecoin.StateSectorPreCommitInfo',
      params: [address, sector, tipSetKey]
    });
    return preCommitInfo;
  }

  /**
   * StateSectorGetInfo returns the on-chain info for the specified miner's sector
   * @param address
   * @param sector
   * @param tipSetKey
   *
   * @remarks
   * NOTE: returned Expiration may not be accurate in some cases, use StateSectorExpiration to get accurate expiration epoch
   */
  public async sectorGetInfo(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorOnChainInfo> {
    const sectorInfo: SectorOnChainInfo = await this.conn.request({
      method: 'Filecoin.StateSectorGetInfo',
      params: [address, sector, tipSetKey]
    });
    return sectorInfo;
  }

  /**
   * returns epoch at which given sector will expire
   * @param address
   * @param sector
   * @param tipSetKey
   */
  public async sectorExpiration(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorExpiration> {
    const sectorExpiration: SectorExpiration = await this.conn.request({
      method: 'Filecoin.StateSectorExpiration',
      params: [address, sector, tipSetKey]
    });
    return sectorExpiration;
  }

  /**
   * finds deadline/partition with the specified sector
   * @param address
   * @param sector
   * @param tipSetKey
   */
  public async sectorPartition(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorLocation> {
    const sectorLocation: SectorLocation = await this.conn.request({
      method: 'Filecoin.StateSectorPartition',
      params: [address, sector, tipSetKey]
    });
    return sectorLocation;
  }

  /**
   * searches for a message in the chain and returns its receipt and the tipset where it was executed
   * @param cid
   */
  public async searchMsg(cid: Cid): Promise<MsgLookup> {
    const lookup: MsgLookup = await this.conn.request({ method: 'Filecoin.StateSearchMsg', params: [cid] });
    return lookup;
  }

  /**
   * looks back in the chain for a message. If not found, it blocks until the message arrives on chain, and gets to the indicated confidence depth.
   * @param cid
   * @param confidence
   */
  public async waitMsg(cid: Cid, confidence: number): Promise<MsgLookup> {
    const lookup: MsgLookup = await this.conn.request({ method: 'Filecoin.StateWaitMsg', params: [cid, confidence] });
    return lookup;
  }

  /**
   * returns the addresses of every miner that has claimed power in the Power Actor
   * @param tipSetKey
   */
  public async listMiners(tipSetKey?: TipSetKey): Promise<Address[]> {
    const miners: Address[] = await this.conn.request({ method: 'Filecoin.StateListMiners', params: [tipSetKey] });
    return miners;
  }

  /**
   * returns the addresses of every actor in the state
   * @param tipSetKey
   */
  public async listActors(tipSetKey?: TipSetKey): Promise<Address[]> {
    const miners: Address[] = await this.conn.request({ method: 'Filecoin.StateListActors', params: [tipSetKey] });
    return miners;
  }

  /**
   * looks up the Escrow and Locked balances of the given address in the Storage Market
   * @param address
   * @param tipSetKey
   */
  public async marketBalance(address: Address, tipSetKey?: TipSetKey): Promise<MarketBalance> {
    const marketBalance: MarketBalance = await this.conn.request({ method: 'Filecoin.StateMarketBalance', params: [address, tipSetKey] });
    return marketBalance;
  }

  /**
   * returns the Escrow and Locked balances of every participant in the Storage Market
   * @param tipSetKey
   */
  public async marketParticipants(tipSetKey?: TipSetKey): Promise<{ [k: string]: MarketBalance }> {
    const marketBalanceMap = await this.conn.request({ method: 'Filecoin.StateMarketParticipants', params: [tipSetKey] });
    return marketBalanceMap;
  }

  /**
   * returns information about every deal in the Storage Market
   * @param tipSetKey
   */
  public async marketDeals(tipSetKey?: TipSetKey): Promise<{ [k: string]: MarketDeal }> {
    const marketDealsMap = await this.conn.request({ method: 'Filecoin.StateMarketDeals', params: [tipSetKey] });
    return marketDealsMap;
  }

  /**
   * returns information about the indicated deal
   * @param dealId
   * @param tipSetKey
   */
  public async marketStorageDeal(dealId: DealID, tipSetKey?: TipSetKey): Promise<MarketDeal> {
    const marketDeal: MarketDeal = await this.conn.request({
      method: 'Filecoin.StateMarketStorageDeal',
      params: [dealId, tipSetKey]
    });
    return marketDeal;
  }

  /**
   * retrieves the ID address of the given address
   * @param address
   * @param tipSetKey
   */
  public async lookupId(address: Address, tipSetKey?: TipSetKey): Promise<Address> {
    const id: Address = await this.conn.request({
      method: 'Filecoin.StateLookupID',
      params: [address, tipSetKey]
    });
    return id;
  }

  /**
   * returns the public key address of the given ID address
   * @param address
   * @param tipSetKey
   */
  public async accountKey(address: Address, tipSetKey?: TipSetKey): Promise<Address> {
    const key: Address = await this.conn.request({
      method: 'Filecoin.StateAccountKey',
      params: [address, tipSetKey]
    });
    return key;
  }

  /**
   * returns all the actors whose states change between the two given state CIDs
   * @param cid1
   * @param cid2
   */
  public async changedActors(cid1?: Cid, cid2?: Cid): Promise<{ [k: string]: Actor }> {
    const actors = await this.conn.request({
      method: 'Filecoin.StateChangedActors',
      params: [cid1, cid2]
    });
    return actors;
  }

  /**
   * returns the message receipt for the given message
   * @param cid
   * @param tipSetKey
   */
  public async getReceipt(cid: Cid, tipSetKey?: TipSetKey): Promise<MessageReceipt> {
    const receipt = await this.conn.request({
      method: 'Filecoin.StateGetReceipt',
      params: [cid, tipSetKey]
    });
    return receipt;
  }

  /**
   * returns the number of sectors in a miner's sector set and proving set
   * @param address
   * @param tipSetKey
   */
  public async minerSectorCount(address: Address, tipSetKey?: TipSetKey): Promise<MinerSectors> {
    const sectors = await this.conn.request({
      method: 'Filecoin.StateMinerSectorCount',
      params: [address, tipSetKey]
    });
    return sectors;
  }

  /**
   * Applies the given messages on the given tipset.
   * @param epoch
   * @param messages
   * @param tipSetKey
   *
   * @remarks
   * The messages are run as though the VM were at the provided height.
   */
  public async compute(epoch: ChainEpoch, messages: Message[], tipSetKey?: TipSetKey): Promise<ComputeStateOutput> {
    const state = await this.conn.request({
      method: 'Filecoin.StateCompute',
      params: [epoch, messages, tipSetKey],
    });
    return state;
  }

  /**
   * returns the data cap for the given address.
   * @param address
   * @param tipSetKey
   *
   * @remarks
   * Returns nil if there is no entry in the data cap table for the address.
   */
  public async verifiedClientStatus(address: Address, tipSetKey?: TipSetKey): Promise<DataCap | null> {
    const cap: DataCap = await this.conn.request({
      method: 'Filecoin.StateVerifiedClientStatus',
      params: [address, tipSetKey],
    });
    return cap;
  }

  /**
   * returns the min and max collateral a storage provider can issue
   * @param size
   * @param verified
   * @param tipSetKey
   */
  public async dealProviderCollateralBounds(size: PaddedPieceSize, verified: boolean, tipSetKey?: TipSetKey): Promise<DealCollateralBounds> {
    const collateral: DealCollateralBounds = await this.conn.request({
      method: 'Filecoin.StateDealProviderCollateralBounds',
      params: [size, verified, tipSetKey],
    });
    return collateral;
  }

  /**
   * returns the circulating supply of Filecoin at the given tipset
   * @param tipSetKey
   */
  public async circulatingSupply(tipSetKey?: TipSetKey): Promise<CirculatingSupply> {
    const supply: CirculatingSupply = await this.conn.request({
      method: 'Filecoin.StateCirculatingSupply',
      params: [tipSetKey],
    });
    return supply;
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
  public async queryAsk(peerId: PeerID, miner: Address): Promise<SignedStorageAsk> {
    const queryAsk: SignedStorageAsk = await this.conn.request({
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
      await this.conn.requestWithChannel(
        {
          method: 'Filecoin.ClientGetDealUpdates',
        },
        data => {
          cb(data);
        });
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
      await this.conn.requestWithChannel(
        {
          method: 'Filecoin.ClientRetrieveWithEvents',
        },
        data => {
          cb(data);
        });
    }
  }

  public async dataTransferUpdates(cb: (data: DataTransferChannel) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      await this.conn.requestWithChannel(
        {
          method: 'Filecoin.ClientDataTransferUpdates',
        },
        data => {
          cb(data);
        });
    }
  }

  //Payment channel methods
  /*
  PaychNewPayment(ctx context.Context, from, to address.Address, vouchers []VoucherSpec) (*PaymentInfo, error)
  */

  public async getPaymentChannel(from: string, to: string, amount: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychGet', params: [from, to, amount] });
    return ret;
  }

  public async getWaitReadyPaymentChannel(cid: Cid): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychGetWaitReady', params: [cid] });
    return ret;
  }

  public async getPaymentChannelList(): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychList', params: [] });
    return ret;
  }

  public async getPaymentChannelStatus(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychStatus', params: [address] });
    return ret;
  }

  public async PaymentChannelAllocateLane(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychAllocateLane', params: [address] });
    return ret;
  }

  public async PaymentChannelSettle(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychSettle', params: [address] });
    return ret;
  }

  public async PaymentChannelCollect(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychCollect', params: [address] });
    return ret;
  }

  //Payment channel vouchers methods
  public async PaymentChannelVoucherCreate(address: string, amount: string, lane: number): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCreate', params: [address, amount, lane] });
    return ret;
  }

  public async PaymentChannelVoucherList(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherList', params: [address] });
    return ret;
  }

  public async PaymentChannelVoucherCheckValid(address: string, signedVoucher: any): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCheckValid', params: [address, signedVoucher] });
    return ret;
  }

  public async PaymentChannelVoucherAdd(address: string, signedVoucher: any, proof: any, minDelta: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherAdd', params: [address, signedVoucher, proof, minDelta] });
    return ret;
  }

  public async PaymentChannelVoucherCheckSpendable(address: string, signedVoucher: any, secret: any, proof: any): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCheckSpendable', params: [address, signedVoucher, secret, proof] });
    return ret;
  }

  public async PaymentChannelVoucherVoucherSubmit(address: string, signedVoucher: any, secret: any, proof: any): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherSubmit', params: [address, signedVoucher, secret, proof] });
    return ret;
  }

  //Mpool
   /**
   * returns (a copy of) the current mpool config
   */
  public async getMpoolConfig(): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolGetConfig', params: [] });
    return ret;
  }
}
