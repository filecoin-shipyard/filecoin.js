import { Message, SignedMessage, Cid, MessagePartial, HeadChange, TipSet, BlockHeader, BlockMessages, MessageReceipt, WrappedMessage, ObjStat, TipSetKey, SyncState, MpoolUpdate, PeerID, Address, StorageAsk, Actor, ActorState, NetworkName, SectorOnChainInfo, DeadlineInfo, MinerPower, MinerInfo, Deadline, Partition, BitField, ChainEpoch, Fault, SectorPreCommitInfo, SectorNumber, SectorPreCommitOnChainInfo, SectorExpiration, SectorLocation, MsgLookup, MarketBalance, MarketDeal, DealID, MinerSectors, MsigVesting } from '../Types';
import BigNumber from 'bignumber.js';
import { LotusClient } from '../..';

export class BaseWalletProvider {

  public client: LotusClient;

  constructor(client: LotusClient) {
    this.client = client;
  }

  public async release() {
    return this.client.release();
  }

  /**
   * get balance for address
   * @param address
   */
  public async getBalance(address: string): Promise<any> {
    const ret = await this.client.wallet.balance(address);
    return ret as string;
  }

  /**
   * get nonce for address.  Note that this method may not be atomic. Use MpoolPushMessage instead.
   * @param address
   */
  public async getNonce(address: string): Promise<number> {
    const ret = await this.client.mpool.getNonce(address);
    return ret as number;
  }

  /**
   * send signed message
   * @param msg
   */
  public async sendSignedMessage(msg: SignedMessage): Promise<Cid> {
    const ret = await this.client.mpool.push(msg)
    return ret as Cid;
  }

  /**
    * estimate gas fee cap
    * @param message
    * @param nblocksincl
    */
  public async estimateMessageGasFeeCap(message: Message, nblocksincl: number): Promise<string> {
    const ret = await this.client.gasEstimate.feeCap(message, nblocksincl);
    return ret as string;
  }

  /**
  * estimate gas limit, it fails if message fails to execute.
  * @param message
  */
  public async estimateMessageGasLimit(message: Message): Promise<number> {
    const ret = await this.client.gasEstimate.gasLimit(message);
    return ret as number;
  }

  /**
  * estimate gas to succesufully send message, and have it likely be included in the next nblocksincl blocks
  * @param nblocksincl
  * @param sender
  * @param gasLimit
  */
  public async estimateMessageGasPremium(nblocksincl: number, sender: string, gasLimit: number): Promise<string> {
    const ret = await this.client.gasEstimate.gasPremium(nblocksincl, sender, gasLimit);
    return ret as string;
  }

  /**
   * estimate gas to succesufully send message, and have it included in the next 10 blocks
   * @param message
   */
  public async estimateMessageGas(message: Message): Promise<Message> {
    const ret = await this.client.gasEstimate.messageGas(message);
    return ret as Message;
  }

  /**
   * prepare a message for signing, add defaults, and populate nonce and gas related parameters if not provided
   * @param message
   */
  public async createMessage(message: MessagePartial): Promise<Message> {
    let msg: Message = {
      To: message.To,
      From: message.From,
      Value: message.Value ? message.Value : new BigNumber(0),
      GasLimit: message.GasLimit ? message.GasLimit : 0,
      GasFeeCap: message.GasFeeCap ? message.GasFeeCap : new BigNumber(0),
      GasPremium: message.GasPremium ? message.GasPremium : new BigNumber(0),
      Method: message.Method ? message.Method : 0,
      Params: message.Params ? message.Params : '',
      Version: message.Version ? message.Version : 0,
      Nonce: message.Nonce ? message.Nonce : await this.getNonce(message.From),
    }

    if (msg.GasLimit === 0) msg = await this.estimateMessageGas(msg);

    return msg;
  }

  //Passtrough methods

  //Chain methods

  /**
   * call back on chain head updates.
   * @param cb
   * @returns interval id
   */
  public async chainNotify(cb: (headChange: HeadChange[]) => void) {
    this.client.chain.chainNotify(cb);
  }

  /**
   * returns the current head of the chain
   */
  public async getHead(): Promise<TipSet> {
    const ret = await this.client.chain.getHead();
    return ret as TipSet;
  }

  /**
   * returns the block specified by the given CID
   * @param blockCid
   */
  public async getBlock(blockCid: Cid): Promise<BlockHeader> {
    const ret = await this.client.chain.getBlock(blockCid);
    return ret as BlockHeader;
  }

  /**
   * returns messages stored in the specified block.
   * @param blockCid
   */
  public async getBlockMessages(blockCid: Cid): Promise<BlockMessages> {
    const ret = await this.client.chain.getBlockMessages(blockCid);
    return ret as BlockMessages;
  }

  /**
   * returns receipts for messages in parent tipset of the specified block
   * @param blockCid
   */
  public async getParentReceipts(blockCid: Cid): Promise<MessageReceipt[]> {
    const ret = await this.client.chain.getParentReceipts(blockCid);
    return ret as MessageReceipt[];
  }

  /**
   * returns messages stored in parent tipset of the specified block.
   * @param blockCid
   */
  public async getParentMessages(blockCid: Cid): Promise<WrappedMessage[]> {
    const ret = await this.client.chain.getParentMessages(blockCid);
    return ret as WrappedMessage[];
  }

  /**
   * looks back for a tipset at the specified epoch.
   * @param epochNumber
   */
  public async getTipSetByHeight(epochNumber: number): Promise<TipSet> {
    const ret: TipSet = await this.client.chain.getTipSetByHeight(epochNumber);
    return ret;
  }

  /**
   * reads ipld nodes referenced by the specified CID from chain blockstore and returns raw bytes.
   * @param cid
   */
  public async readObj(cid: Cid): Promise<string> {
    const ret = await this.client.chain.readObj(cid);
    return ret as string;
  }

  /**
   * checks if a given CID exists in the chain blockstore
   * @param cid
   */
  public async hasObj(cid: Cid): Promise<boolean> {
    const ret = await this.client.chain.hasObj(cid);
    return ret as boolean;
  }

  /**
   * returns statistics about the graph referenced by 'obj'.
   *
   * @remarks
   * If 'base' is also specified, then the returned stat will be a diff between the two objects.
   */
  public async statObj(obj: Cid, base?: Cid): Promise<ObjStat> {
    const stat: ObjStat = await this.client.chain.statObj(obj, base);
    return stat;
  }

  /**
   * Returns the genesis tipset.
   * @param tipSet
   */
  public async getGenesis(): Promise<TipSet> {
    const genesis: TipSet = await this.client.chain.getGenesis();
    return genesis;
  }

  // TODO: Go API method signature returns BigInt. Replace string with BN
  /**
   * Computes weight for the specified tipset.
   * @param tipSetKey
   */
  public async getTipSetWeight(tipSetKey?: TipSetKey): Promise<string> {
    const weight: string = await this.client.chain.getTipSetWeight(tipSetKey);
    return weight;
  }

  /**
   * reads a message referenced by the specified CID from the chain blockstore
   * @param messageCid
   */
  public async getMessage(messageCid: Cid): Promise<Message> {
    const ret = await this.client.chain.getMessage(messageCid);
    return ret as Message;
  }

  /**
   * Returns a set of revert/apply operations needed to get from
   * @param from
   * @param to
   */
  public async getPath(from: TipSetKey, to: TipSetKey): Promise<HeadChange[]> {
    const path: HeadChange[] = await this.client.chain.getPath(from, to);
    return path;
  }

  //Sync methods

  /**
   * returns the current status of the lotus sync system.
   */
  public async state(): Promise<SyncState> {
    const state: SyncState = await this.client.sync.state();
    return state;
  }

  /**
   * returns a channel streaming incoming, potentially not yet synced block headers.
   * @param cb
   */
  public async incomingBlocks(cb: (blockHeader: BlockHeader) => void) {
    await this.client.sync.incomingBlocks(cb);
  }

  //Mpool methods

  /**
   * get all mpool messages
   * @param tipSetKey
   */
  public async getMpoolPending(tipSetKey: TipSetKey): Promise<[SignedMessage]> {
    const ret = await this.client.mpool.getMpoolPending(tipSetKey);
    return ret;
  }

  /**
   * returns a list of pending messages for inclusion in the next block
   * @param tipSetKey
   * @param ticketQuality
   */
  public async sub(cb: (data: MpoolUpdate) => void) {
    await this.client.mpool.sub(cb);
  }

  //Client methods

  /**
   * returns a signed StorageAsk from the specified miner.
   * @param peerId
   * @param miner
   */
  public async queryAsk(peerId: PeerID, miner: Address): Promise<StorageAsk> {
    const queryAsk: StorageAsk = await this.client.client.queryAsk(peerId, miner);
    return queryAsk;
  }

  //State methods

  /**
   * returns the indicated actor's nonce and balance
   * @param address
   * @param tipSetKey
   */
  public async getActor(address: string, tipSetKey?: TipSetKey): Promise<Actor> {
    const data = await this.client.state.getActor(address, tipSetKey);
    return data as Actor;
  }

  /**
   * returns the indicated actor's state
   * @param address
   * @param tipSetKey
   */
  public async readState(address: string, tipSetKey?: TipSetKey): Promise<ActorState> {
    const data = await this.client.state.readState(address, tipSetKey);
    return data as ActorState;
  }

  /**
   * looks back and returns all messages with a matching to or from address, stopping at the given height.
   * @param filter
   * @param tipSetKey
   * @param toHeight
   */
  public async listMessages(filter: { To?: string, From?: string }, tipSetKey?: TipSetKey, toHeight?: number): Promise<Cid[]> {
    const messages: Cid[] = await this.client.state.listMessages(filter, tipSetKey, toHeight);
    return messages ? messages : [];
  }

  /**
   * returns the name of the network the node is synced to
   */
  public async networkName(): Promise<NetworkName> {
    const network: string = await this.client.state.networkName();
    return network;
  }

  /**
   * returns info about the given miner's sectors
   * @param address
   * @param tipSetKey
   */
  public async minerSectors(address: string, tipSetKey?: TipSetKey): Promise<SectorOnChainInfo[]> {
    const sectorsInfo: SectorOnChainInfo[] = await this.client.state.minerSectors(address, tipSetKey);
    return sectorsInfo;
  }

  /**
   * returns info about sectors that a given miner is actively proving.
   * @param address
   * @param tipSetKey
   */
  public async minerActiveSectors(address: string, tipSetKey?: TipSetKey): Promise<SectorOnChainInfo[]> {
    const activeSectors: SectorOnChainInfo[] = await this.minerActiveSectors(address, tipSetKey);
    return activeSectors;
  }

  /**
   * calculates the deadline at some epoch for a proving period and returns the deadline-related calculations.
   * @param address
   * @param tipSetKey
   */
  public async minerProvingDeadline(address: string, tipSetKey?: TipSetKey): Promise<DeadlineInfo> {
    const provingDeadline: DeadlineInfo = await this.client.state.minerProvingDeadline(address, tipSetKey);
    return provingDeadline;
  }

  /**
   * returns the power of the indicated miner
   * @param address
   * @param tipSetKey
   */
  public async minerPower(address: string, tipSetKey?: TipSetKey): Promise<MinerPower> {
    const power: MinerPower = await this.client.state.minerPower(address, tipSetKey);
    return power;
  }

  /**
   * returns info about the indicated miner
   * @param address
   * @param tipSetKey
   */
  public async minerInfo(address: string, tipSetKey?: TipSetKey): Promise<MinerInfo> {
    const minerInfo: MinerInfo = await this.client.state.minerInfo(address, tipSetKey);
    return minerInfo;
  }

  /**
   * returns all the proving deadlines for the given miner
   * @param address
   * @param tipSetKey
   */
  public async minerDeadlines(address: string, tipSetKey?: TipSetKey): Promise<Deadline[]> {
    const minerDeadlines: Deadline[] = await this.client.state.minerDeadlines(address, tipSetKey);
    return minerDeadlines;
  }

  /**
   * Loads miner partitions for the specified miner and deadline
   * @param address
   * @param idx
   * @param tipSetKey
   */
  public async minerPartitions(address: string, idx?: number, tipSetKey?: TipSetKey): Promise<Partition[]> {
    const minerPartitions: Partition[] = await this.client.state.minerPartitions(address, idx, tipSetKey);
    return minerPartitions;
  }

  /**
   * Returns a bitfield indicating the faulty sectors of the given miner
   * @param address
   * @param tipSetKey
   */
  public async minerFaults(address: string, tipSetKey?: TipSetKey): Promise<BitField> {
    const minerFaults: BitField = await this.client.state.minerFaults(address, tipSetKey);
    return minerFaults;
  }

  // TODO: This method is not working on Lotus. See issue here: https://github.com/filecoin-project/lotus/issues/3063
  /**
   * returns all non-expired Faults that occur within lookback epochs of the given tipset
   * @param epoch
   * @param tipSetKey
   */
  public async allMinerFaults(epoch: ChainEpoch, tipSetKey?: TipSetKey): Promise<Fault[]> {
    const allFaults: Fault[] = await this.client.state.allMinerFaults(epoch, tipSetKey);
    return allFaults;
  }

  /**
   * returns a bitfield indicating the recovering sectors of the given miner
   * @param address
   * @param tipSetKey
   */
  public async minerRecoveries(address: string, tipSetKey?: TipSetKey): Promise<BitField> {
    const recoveries: BitField = await this.client.state.minerRecoveries(address, tipSetKey);
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
    const deposit: string = await this.client.state.minerPreCommitDepositForPower(address, sectorPreCommitInfo, tipSetKey);
    return deposit;
  }

  /**
   * returns the initial pledge collateral for the specified miner's sector
   * @param address
   * @param sectorPreCommitInfo
   * @param tipSetKey
   */
  public async minerInitialPledgeCollateral(address: string, sectorPreCommitInfo: SectorPreCommitInfo, tipSetKey?: TipSetKey): Promise<string> {
    const deposit: string = await this.client.state.minerInitialPledgeCollateral(address, sectorPreCommitInfo, tipSetKey);
    return deposit;
  }

  /**
   * returns the portion of a miner's balance that can be withdrawn or spent
   * @param address
   * @param tipSetKey
   */
  public async minerAvailableBalance(address: string, tipSetKey?: TipSetKey): Promise<string> {
    const balance: string = await this.client.state.minerAvailableBalance(address, tipSetKey);
    return balance;
  }

  /**
   * returns the PreCommit info for the specified miner's sector
   * @param address
   * @param sector
   * @param tipSetKey
   */
  public async sectorPreCommitInfo(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorPreCommitOnChainInfo> {
    const preCommitInfo: SectorPreCommitOnChainInfo = await this.client.state.sectorPreCommitInfo(address, sector, tipSetKey);
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
    const sectorInfo: SectorOnChainInfo = await this.client.state.sectorGetInfo(address, sector, tipSetKey);
    return sectorInfo;
  }

  /**
   * returns epoch at which given sector will expire
   * @param address
   * @param sector
   * @param tipSetKey
   */
  public async sectorExpiration(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorExpiration> {
    const sectorExpiration: SectorExpiration = await this.client.state.sectorExpiration(address, sector, tipSetKey);
    return sectorExpiration;
  }

  /**
   * finds deadline/partition with the specified sector
   * @param address
   * @param sector
   * @param tipSetKey
   */
  public async sectorPartition(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorLocation> {
    const sectorLocation: SectorLocation = await this.client.state.sectorPartition(address, sector, tipSetKey);
    return sectorLocation;
  }

  /**
   * searches for a message in the chain and returns its receipt and the tipset where it was executed
   * @param cid
   */
  public async searchMsg(cid: Cid): Promise<MsgLookup> {
    const lookup: MsgLookup = await this.client.state.searchMsg(cid);
    return lookup;
  }

  /**
   * returns the addresses of every miner that has claimed power in the Power Actor
   * @param tipSetKey
   */
  public async listMiners(tipSetKey?: TipSetKey): Promise<Address[]> {
    const miners: Address[] = await this.client.state.listMiners(tipSetKey);
    return miners;
  }

  /**
   * returns the addresses of every actor in the state
   * @param tipSetKey
   */
  public async listActors(tipSetKey?: TipSetKey): Promise<Address[]> {
    const miners: Address[] = await this.client.state.listActors(tipSetKey);
    return miners;
  }

  /**
   * looks up the Escrow and Locked balances of the given address in the Storage Market
   * @param address
   * @param tipSetKey
   */
  public async marketBalance(address: Address, tipSetKey?: TipSetKey): Promise<MarketBalance> {
    const marketBalance: MarketBalance = await this.client.state.marketBalance(address, tipSetKey);
    return marketBalance;
  }

  /**
   * returns the Escrow and Locked balances of every participant in the Storage Market
   * @param tipSetKey
   */
  public async marketParticipants(tipSetKey?: TipSetKey): Promise<{ [k: string]: MarketBalance }> {
    const marketBalanceMap = await this.client.state.marketParticipants(tipSetKey);
    return marketBalanceMap;
  }

  /**
   * returns information about every deal in the Storage Market
   * @param tipSetKey
   */
  public async marketDeals(tipSetKey?: TipSetKey): Promise<{ [k: string]: MarketDeal }> {
    const marketDealsMap = await this.client.state.marketDeals(tipSetKey);
    return marketDealsMap;
  }

  /**
   * returns information about the indicated deal
   * @param dealId
   * @param tipSetKey
   */
  public async marketStorageDeal(dealId: DealID, tipSetKey?: TipSetKey): Promise<MarketDeal> {
    const marketDeal: MarketDeal = await this.client.state.marketStorageDeal(dealId, tipSetKey);
    return marketDeal;
  }

  /**
   * retrieves the ID address of the given address
   * @param address
   * @param tipSetKey
   */
  public async lookupId(address: Address, tipSetKey?: TipSetKey): Promise<Address> {
    const id: Address = await this.client.state.lookupId(address, tipSetKey);
    return id;
  }

  /**
   * returns the public key address of the given ID address
   * @param address
   * @param tipSetKey
   */
  public async accountKey(address: Address, tipSetKey?: TipSetKey): Promise<Address> {
    const key: Address = await this.client.state.accountKey(address, tipSetKey);
    return key;
  }

  /**
   * returns all the actors whose states change between the two given state CIDs
   * @param cid1
   * @param cid2
   */
  public async changedActors(cid1?: Cid, cid2?: Cid): Promise<{ [k: string]: Actor }> {
    const actors = await this.client.state.changedActors(cid1, cid2);
    return actors;
  }

  /**
   * returns the message receipt for the given message
   * @param cid
   * @param tipSetKey
   */
  public async getReceipt(cid: Cid, tipSetKey?: TipSetKey): Promise<MessageReceipt> {
    const receipt = await this.client.state.getReceipt(cid, tipSetKey);
    return receipt;
  }

  /**
   * returns the number of sectors in a miner's sector set and proving set
   * @param address
   * @param tipSetKey
   */
  public async minerSectorCount(address: Address, tipSetKey?: TipSetKey): Promise<MinerSectors> {
    const sectors = await this.client.state.minerSectorCount(address, tipSetKey);
    return sectors;
  }

  //Multisig wallet methods

  /**
  * returns the vesting details of a given multisig.
  * @param address
  * @param tipSetKey
  */
  public async msigGetVestingSchedule(
    address: string,
    tipSetKey: TipSetKey,
  ): Promise<MsigVesting> {
    const schedule = await this.client.msig.getVestingSchedule(address, tipSetKey);
    return schedule;
  }

  /**
   * returns the portion of a multisig's balance that can be withdrawn or spent
   * @param address
   * @param tipSetKey
   */
  public async msigGetAvailableBalance(address: string, tipSetKey: TipSetKey): Promise<string> {
    const ret = await this.client.msig.getAvailableBalance(address, tipSetKey);
    return ret;
  }

  /**
   * returns the amount of FIL that vested in a multisig in a certain period.
   * @param address
   * @param startEpoch
   * @param endEpoch
   */
  public async msigGetVested(address: string, startEpoch: TipSetKey, endEpoch: TipSetKey): Promise<string> {
    const ret = await this.client.msig.getVested(address, startEpoch, endEpoch);
    return ret;
  }
}

