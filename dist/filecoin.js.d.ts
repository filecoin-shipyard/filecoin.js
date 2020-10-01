/// <reference types="node" />
import { BigNumber } from 'bignumber.js';
import { EventEmitter } from 'events';
import { FilecoinSnapApi } from '@nodefactory/filsnap-types';

declare class ActiveSync {
    Base: TipSet;
    Target: TipSet;
    Stage: SyncStateStage;
    Height: ChainEpoch;
    Start: string;
    End: string;
    Message: string;
}

declare class Actor {
    Code: Cid;
    Head: Cid;
    Nonce: number;
    Balance: BigNumber;
}

declare class ActorState {
    Balance: string;
    State: any;
}

declare type Address = string;

/**
 * AddrInfo is a small struct used to pass around a peer with a set of addresses (and later, keys?).
 */
declare class AddrInfo {
    ID: ID;
    Addrs: Multiaddr[];
}

declare class BeaconEntry {
    Round: number;
    Data: [];
}

declare type BitField = number[];

declare class BlockHeader {
    Miner: string;
    Ticket: {
        VRFProof: string;
    };
    ElectionProof: {
        WinCount: number;
        VRFProof: string;
    };
    BeaconEntries: {
        Round: number;
        Data: string;
    }[];
    WinPoStProof: {
        PoStProof: number;
        ProofBytes: string;
    }[];
    Parents: Cid[];
    ParentWeight: string;
    Height: number;
    ParentStateRoot: Cid;
    ParentMessageReceipts: Cid;
    Messages: Cid;
    BLSAggregate: Signature;
    Timestamp: number;
    BlockSig: Signature;
    ForkSignaling: number;
}

declare class BlockMessages {
    BlsMessages: Message[];
    SecpkMessages: SignedMessage[];
    Cids: Cid[];
}

declare class BlockMsg {
    Header: BlockHeader;
    BlsMessages: Cid[];
    SecpkMessages: Cid[];
}

declare class BlockTemplate {
    Miner: Address;
    Parents: TipSetKey;
    Ticket: Ticket;
    Eproof: ElectionProof;
    BeaconValues: BeaconEntry[];
    Messages: SignedMessage[];
    Epoch: ChainEpoch;
    Timestamp: number;
    WinningPoStProof: PoStProof[];
}

declare type ChainEpoch = number;

/**
 * Payment Channel Types
 */
declare class ChannelAvailableFunds {
    Channel: Address;
    From: Address;
    To: Address;
    ConfirmedAmt: string;
    PendingAmt: string;
    PendingWaitSentinel: Cid;
    QueuedAmt: string;
    VoucherReedeemedAmt: string;
}

declare class ChannelInfo {
    Channel: Address;
    WaitSentinel: Cid;
}

declare class Cid {
    '/': string;
}

declare class CirculatingSupply {
    FilVested: TokenAmount;
    FilMined: TokenAmount;
    FilBurnt: TokenAmount;
    FilLocked: TokenAmount;
    FilCirculating: TokenAmount;
}

declare class Claim {
    /**
     * Sum of raw byte power for a miner's sectors.
     */
    RawBytePower: StoragePower;
    /**
     * Sum of quality adjusted power for a miner's sectors.
     */
    QualityAdjPower: StoragePower;
}

declare type ClientEvent = number;

declare class CommPRet {
    Root: Cid;
    Size: UnpaddedPieceSize;
}

declare class ComputeStateOutput {
    Root: Cid;
    Trace: InvocResult[];
}

declare type Connectedness = number;

declare interface Connector {
    url: string;
    token?: string | undefined;
    disconnect(): Promise<any>;
    connect(): Promise<any>;
    request(req: RequestArguments): Promise<any>;
    on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
}

/**
 * DataCap is an integer number of bytes.
 *
 * @remarks
 * This can be replaced in the future due to policy changes
 */
declare type DataCap = StoragePower;

/**
 * DataRef is a reference for how data will be transferred for a given storage deal
 */
declare class DataRef {
    TransferType: string;
    Root: Cid;
    /**
     * Optional for non-manual transfer, will be recomputed from the data if not given
     */
    PieceCid?: Cid;
    /**
     * Optional for non-manual transfer, will be recomputed from the data if not given
     */
    PieceSize?: UnpaddedPieceSize;
}

declare class DataSize {
    PayloadSize: number;
    PieceSize: PaddedPieceSize;
}

declare class DataTransferChannel {
    TransferID: TransferID;
    Status: number;
    BaseCID: Cid;
    IsInitiator: boolean;
    IsSender: boolean;
    Voucher: string;
    Message: string;
    OtherPeer: PeerID;
    Transferred: number;
}

declare class Deadline {
    /**
     * Partitions in this deadline, in order.
     *
     * @remarks
     * The keys of this AMT are always sequential integers beginning with zero.
     */
    Partitions: Cid;
    /**
     * Maps epochs to partitions that _may_ have sectors that expire in or before that epoch.
     *
     * @remarks
     * Partitions MUST NOT be removed from this queue (until the associated epoch has passed) even if they no longer have sectors expiring at that epoch.
     * Sectors expiring at this epoch may later be recovered, and this queue will not be updated at that time.
     */
    ExpirationsEpochs: Cid;
    /**
     * Partitions numbers with PoSt submissions since the proving period started.
     */
    PostSubmissions: BitField;
    /**
     * Partitions with sectors that terminated early.
     */
    EarlyTerminations: BitField;
    /**
     * The number of non-terminated sectors in this deadline (incl faulty).
     */
    LiveSectors: number;
    /**
     * The total number of sectors in this deadline (incl dead).
     */
    TotalSectors: number;
    /**
     * Memoized sum of faulty power in partitions.
     */
    FaultyPower: PowerPair;
}

/**
 * Deadline calculations with respect to a current epoch.
 *
 * @remarks
 * "Deadline" refers to the window during which proofs may be submitted. Windows are non-overlapping ranges [Open, Close), but the challenge epoch for a window occurs before the window opens.
 * The current epoch may not necessarily lie within the deadline or proving period represented here.
 */
declare class DeadlineInfo {
    /**
     * Epoch at which this info was calculated.
     */
    CurrentEpoch: ChainEpoch;
    /**
     * First epoch of the proving period (<= CurrentEpoch).
     */
    PeriodStart: ChainEpoch;
    /**
     * A deadline index, in [0..WPoStProvingPeriodDeadlines) unless period elapsed.
     */
    Index: number;
    /**
     * First epoch from which a proof may be submitted (>= CurrentEpoch).
     */
    Open: ChainEpoch;
    /**
     * First epoch from which a proof may no longer be submitted (>= Open).
     */
    Close: ChainEpoch;
    /**
     * Epoch at which to sample the chain for challenge (< Open).
     */
    Challenge: ChainEpoch;
    /**
     * First epoch at which a fault declaration is rejected (< Open).
     */
    FaultCutoff: ChainEpoch;
}

declare class DealCollateralBounds {
    Min: TokenAmount;
    Max: TokenAmount;
}

declare type DealID = number;

declare class DealInfo {
    ProposalCid: Cid;
    State: StorageDealStatus;
    /**
     * More information about deal state, particularly errors
     */
    Message: string;
    Provider: Address;
    DataRef: DataRef;
    PieceCID: Cid;
    Size: number;
    PricePerEpoch: any;
    Duration: number;
    DealID: DealID;
    CreationTime: string;
}

declare class DealProposal {
    PieceCID: Cid;
    PieceSize: PaddedPieceSize;
    VerifiedDeal: boolean;
    Client: Address;
    Provider: Address;
    /**
     * An arbitrary client chosen label to apply to the deal
     */
    Label: string;
    /**
     * Nominal start epoch.
     * @remarks
     * Deal payment is linear between StartEpoch and EndEpoch, with total amount StoragePricePerEpoch * (EndEpoch - StartEpoch).
     * Storage deal must appear in a sealed (proven) sector no later than StartEpoch, otherwise it is invalid.
     */
    StartEpoch: ChainEpoch;
    EndEpoch: ChainEpoch;
    StoragePricePerEpoch: TokenAmount;
    ProviderCollateral: TokenAmount;
    ClientCollateral: TokenAmount;
}

declare class DealState {
    /**
     * @remarks
     * -1 if not yet included in proven sector
     */
    SectorStartEpoch: ChainEpoch;
    /**
     * @remarks
     * -1 if deal state never updated
     */
    LastUpdatedEpoch: ChainEpoch;
    /**
     * @remarks
     * -1 if deal never slashed
     */
    SlashEpoch: ChainEpoch;
}

/**
 * DealStatus is the status of a retrieval deal returned by a provider in a DealResponse
 */
declare type DealStatus = number;

declare type DealWeight = number;

declare class ElectionProof {
    WinCount: number;
    VRFProof: [];
}

declare class ExecutionTrace {
    Msg: Message;
    MsgRct: MessageReceipt;
    Error: string;
    Duration: number;
    GasCharges: GasTrace[];
    Subcalls: ExecutionTrace[];
}

declare type ExitCode = number;

declare class Fault {
    Miner: Address;
    Epoch: ChainEpoch;
}

declare class FileRef {
    Path: string;
    IsCAR: boolean;
}

declare class GasTrace {
    Name: string;
    Location: Loc[];
    TotalGas: number;
    ComputeGas: number;
    StorageGas: number;
    TotalVirtualGas: number;
    VirtualComputeGas: number;
    VirtualStorageGas: number;
    TimeTaken: number;
    Extra: any;
    Callers: number[];
}

declare class HeadChange {
    Type: 'current' | string;
    Val: TipSet;
}

export declare class HttpJsonRpcConnector extends EventEmitter implements Connector {
    protected options: string | JsonRpcConnectionOptions;
    protected reqId: number;
    url: string;
    token?: string | undefined;
    constructor(options: string | JsonRpcConnectionOptions);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    request(req: RequestArguments): Promise<unknown>;
    on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
    private _headers;
}

export declare class HttpJsonRpcWalletProvider implements WalletProvider {
    private conn;
    constructor(connector: Connector);
    release(): Promise<any>;
    /**
     * create new wallet
     * @param type
     */
    newAccount(type?: number): Promise<string>;
    /**
     * get nonce for address.  Note that this method may not be atomic. Use MpoolPushMessage instead.
     * @param address
     */
    getNonce(address: string): Promise<number>;
    /**
     * get wallet list
     */
    getAccounts(): Promise<string[]>;
    /**
     * get balance for address
     * @param address
     */
    getBalance(address: string): Promise<any>;
    /**
     * delete address from lotus
     * @param address
     */
    deleteWallet(address: string): Promise<any>;
    /**
    * check if address is in keystore
    * @param address
    */
    hasWallet(address: string): Promise<any>;
    /**
     * set default address
     * @param address
     */
    setDefaultAccount(address: string): Promise<undefined>;
    /**
     * walletExport returns the private key of an address in the wallet.
     * @param address
     */
    walletExport(address: string): Promise<KeyInfo>;
    /**
     * walletImport returns the private key of an address in the wallet.
     * @param keyInfo
     */
    walletImport(keyInfo: KeyInfo): Promise<string>;
    /**
     * get default address
     */
    getDefaultAccount(): Promise<string>;
    /**
     * send message, signed with default lotus wallet
     *
     * @remarks
     * MpoolPushMessage atomically assigns a nonce, signs, and pushes a message
     * to mempool.
     * maxFee is only used when GasFeeCap/GasPremium fields aren't specified
     * When maxFee is set to 0, MpoolPushMessage will guess appropriate fee
     * based on current chain conditions
     * @param msg
     */
    sendMessage(msg: Message): Promise<SignedMessage>;
    /**
     * send signed message
     * @param msg
     */
    sendSignedMessage(msg: SignedMessage): Promise<Cid>;
    /**
    * estimate gas fee cap
    * @param message
    * @param nblocksincl
    */
    estimateMessageGasFeeCap(message: Message, nblocksincl: number): Promise<string>;
    /**
    * estimate gas limit, it fails if message fails to execute.
    * @param message
    */
    estimateMessageGasLimit(message: Message): Promise<number>;
    /**
    * estimate gas to succesufully send message, and have it likely be included in the next nblocksincl blocks
    * @param nblocksincl
    * @param sender
    * @param gasLimit
    */
    estimateMessageGasPremium(nblocksincl: number, sender: string, gasLimit: number): Promise<string>;
    /**
     * estimate gas to succesufully send message, and have it included in the next 10 blocks
     * @param message
     */
    estimateMessageGas(message: Message): Promise<Message>;
    /**
     * prepare a message for signing, add defaults, and populate nonce and gas related parameters if not provided
     * @param message
     */
    createMessage(message: MessagePartial): Promise<Message>;
    /**
     * sign message
     * @param msg
     */
    signMessage(msg: Message): Promise<SignedMessage>;
    /**
     * sign raw message
     * @param data
     */
    sign(data: string | ArrayBuffer): Promise<Signature>;
    /**
     * verify message signature
     * @param data
     * @param sign
     */
    verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}

/**
 * ID is a libp2p peer identity
 */
declare type ID = string;

declare class Import {
    Key: StoreID;
    Err: string;
    Root: Cid;
    Source: string;
    FilePath: string;
}

declare class ImportRes {
    Root: Cid;
    ImportID: StoreID;
}

declare class InvocResult {
    Msg: Message;
    MsgRct: MessageReceipt;
    ExecutionTrace: ExecutionTrace;
    Error: string;
    Duration: number;
}

declare type JsonRpcConnectionOptions = {
    url: string;
    token?: string;
};

export declare class JsonRpcProvider {
    conn: Connector;
    private intervals;
    constructor(connector: Connector);
    release(): Promise<any>;
    /**
     * reads ipld nodes referenced by the specified CID from chain blockstore and returns raw bytes.
     * @param cid
     */
    readObj(cid: Cid): Promise<string>;
    /**
     * returns messages stored in the specified block.
     * @param blockCid
     */
    getBlockMessages(blockCid: Cid): Promise<BlockMessages>;
    /**
     * returns the current head of the chain
     */
    getHead(): Promise<TipSet>;
    /**
     * call back on chain head updates.
     * @param cb
     * @returns interval id
     */
    chainNotify(cb: (headChange: HeadChange[]) => void): Promise<Timeout | undefined>;
    stopChainNotify(id?: any): void;
    /**
     * returns the block specified by the given CID
     * @param blockCid
     */
    getBlock(blockCid: Cid): Promise<BlockHeader>;
    /**
     * reads a message referenced by the specified CID from the chain blockstore
     * @param messageCid
     */
    getMessage(messageCid: Cid): Promise<Message>;
    /**
     * returns receipts for messages in parent tipset of the specified block
     * @param blockCid
     */
    getParentReceipts(blockCid: Cid): Promise<MessageReceipt[]>;
    /**
     * returns messages stored in parent tipset of the specified block.
     * @param blockCid
     */
    getParentMessages(blockCid: Cid): Promise<WrappedMessage[]>;
    /**
     * checks if a given CID exists in the chain blockstore
     * @param cid
     */
    hasObj(cid: Cid): Promise<boolean>;
    /**
     * returns statistics about the graph referenced by 'obj'.
     *
     * @remarks
     * If 'base' is also specified, then the returned stat will be a diff between the two objects.
     */
    statObj(obj: Cid, base?: Cid): Promise<ObjStat>;
    /**
     * Forcefully sets current chain head. Use with caution.
     * @param tipSetKey
     */
    setHead(tipSetKey: TipSetKey): Promise<void>;
    /**
     * Returns the genesis tipset.
     * @param tipSet
     */
    getGenesis(): Promise<TipSet>;
    /**
     * Computes weight for the specified tipset.
     * @param tipSetKey
     */
    getTipSetWeight(tipSetKey?: TipSetKey): Promise<string>;
    /**
     * looks back for a tipset at the specified epoch.
     * @param epochNumber
     */
    getTipSetByHeight(epochNumber: number): Promise<TipSet>;
    /**
     * Returns a set of revert/apply operations needed to get from
     * @param from
     * @param to
     */
    getPath(from: TipSetKey, to: TipSetKey): Promise<HeadChange[]>;
    /**
     * Returns a stream of bytes with CAR dump of chain data.
     * @param nroots
     * @param tipSetKey
     *
     * @remarks The exported chain data includes the header chain from the given tipset back to genesis, the entire genesis state, and the most recent 'nroots' state trees.
     */
    export(nroots: ChainEpoch, tipSetKey: TipSetKey): Promise<any>;
    /**
     * State
     * The State methods are used to query, inspect, and interact with chain state.
     * All methods take a TipSetKey as a parameter. The state looked up is the state at that tipset.
     * If TipSetKey is not provided as a param, the heaviest tipset in the chain to be used.
     */
    /**
     * runs the given message and returns its result without any persisted changes.
     */
    stateCall(message: Message, tipSetKey?: TipSet): Promise<InvocResult>;
    /**
     * returns the result of executing the indicated message, assuming it was executed in the indicated tipset
     */
    stateReplay(tipSetKey: TipSetKey, cid: Cid): Promise<InvocResult>;
    /**
     * returns the indicated actor's nonce and balance
     * @param address
     * @param tipSetKey
     */
    getActor(address: string, tipSetKey?: TipSetKey): Promise<Actor>;
    /**
     * returns the indicated actor's state
     * @param address
     * @param tipSetKey
     */
    readState(address: string, tipSetKey?: TipSetKey): Promise<ActorState>;
    /**
     * looks back and returns all messages with a matching to or from address, stopping at the given height.
     * @param filter
     * @param tipSetKey
     * @param toHeight
     */
    listMessages(filter: {
        To?: string;
        From?: string;
    }, tipSetKey?: TipSetKey, toHeight?: number): Promise<Cid[]>;
    /**
     * returns the name of the network the node is synced to
     */
    networkName(): Promise<NetworkName>;
    /**
     * returns info about the given miner's sectors
     * @param address
     * @param tipSetKey
     */
    minerSectors(address: string, tipSetKey?: TipSetKey): Promise<SectorOnChainInfo[]>;
    /**
     * returns info about sectors that a given miner is actively proving.
     * @param address
     * @param tipSetKey
     */
    minerActiveSectors(address: string, tipSetKey?: TipSetKey): Promise<SectorOnChainInfo[]>;
    /**
     * calculates the deadline at some epoch for a proving period and returns the deadline-related calculations.
     * @param address
     * @param tipSetKey
     */
    minerProvingDeadline(address: string, tipSetKey?: TipSetKey): Promise<DeadlineInfo>;
    /**
     * returns the power of the indicated miner
     * @param address
     * @param tipSetKey
     */
    minerPower(address: string, tipSetKey?: TipSetKey): Promise<MinerPower>;
    /**
     * returns info about the indicated miner
     * @param address
     * @param tipSetKey
     */
    minerInfo(address: string, tipSetKey?: TipSetKey): Promise<MinerInfo>;
    /**
     * returns all the proving deadlines for the given miner
     * @param address
     * @param tipSetKey
     */
    minerDeadlines(address: string, tipSetKey?: TipSetKey): Promise<Deadline[]>;
    /**
     * Loads miner partitions for the specified miner and deadline
     * @param address
     * @param idx
     * @param tipSetKey
     */
    minerPartitions(address: string, idx?: number, tipSetKey?: TipSetKey): Promise<Partition[]>;
    /**
     * Returns a bitfield indicating the faulty sectors of the given miner
     * @param address
     * @param tipSetKey
     */
    minerFaults(address: string, tipSetKey?: TipSetKey): Promise<BitField>;
    /**
     * returns all non-expired Faults that occur within lookback epochs of the given tipset
     * @param epoch
     * @param tipSetKey
     */
    allMinerFaults(epoch: ChainEpoch, tipSetKey?: TipSetKey): Promise<Fault[]>;
    /**
     * returns a bitfield indicating the recovering sectors of the given miner
     * @param address
     * @param tipSetKey
     */
    minerRecoveries(address: string, tipSetKey?: TipSetKey): Promise<BitField>;
    /**
     * returns the precommit deposit for the specified miner's sector
     * @param address
     * @param sectorPreCommitInfo
     * @param tipSetKey
     */
    minerPreCommitDepositForPower(address: string, sectorPreCommitInfo: SectorPreCommitInfo, tipSetKey?: TipSetKey): Promise<string>;
    /**
     * returns the initial pledge collateral for the specified miner's sector
     * @param address
     * @param sectorPreCommitInfo
     * @param tipSetKey
     */
    minerInitialPledgeCollateral(address: string, sectorPreCommitInfo: SectorPreCommitInfo, tipSetKey?: TipSetKey): Promise<string>;
    /**
     * returns the portion of a miner's balance that can be withdrawn or spent
     * @param address
     * @param tipSetKey
     */
    minerAvailableBalance(address: string, tipSetKey?: TipSetKey): Promise<string>;
    /**
     * returns the PreCommit info for the specified miner's sector
     * @param address
     * @param sector
     * @param tipSetKey
     */
    sectorPreCommitInfo(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorPreCommitOnChainInfo>;
    /**
     * StateSectorGetInfo returns the on-chain info for the specified miner's sector
     * @param address
     * @param sector
     * @param tipSetKey
     *
     * @remarks
     * NOTE: returned Expiration may not be accurate in some cases, use StateSectorExpiration to get accurate expiration epoch
     */
    sectorGetInfo(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorOnChainInfo>;
    /**
     * returns epoch at which given sector will expire
     * @param address
     * @param sector
     * @param tipSetKey
     */
    sectorExpiration(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorExpiration>;
    /**
     * finds deadline/partition with the specified sector
     * @param address
     * @param sector
     * @param tipSetKey
     */
    sectorPartition(address: string, sector: SectorNumber, tipSetKey?: TipSetKey): Promise<SectorLocation>;
    /**
     * searches for a message in the chain and returns its receipt and the tipset where it was executed
     * @param cid
     */
    searchMsg(cid: Cid): Promise<MsgLookup>;
    /**
     * looks back in the chain for a message. If not found, it blocks until the message arrives on chain, and gets to the indicated confidence depth.
     * @param cid
     * @param confidence
     */
    waitMsg(cid: Cid, confidence: number): Promise<MsgLookup>;
    /**
     * returns the addresses of every miner that has claimed power in the Power Actor
     * @param tipSetKey
     */
    listMiners(tipSetKey?: TipSetKey): Promise<Address[]>;
    /**
     * returns the addresses of every actor in the state
     * @param tipSetKey
     */
    listActors(tipSetKey?: TipSetKey): Promise<Address[]>;
    /**
     * looks up the Escrow and Locked balances of the given address in the Storage Market
     * @param address
     * @param tipSetKey
     */
    marketBalance(address: Address, tipSetKey?: TipSetKey): Promise<MarketBalance>;
    /**
     * returns the Escrow and Locked balances of every participant in the Storage Market
     * @param tipSetKey
     */
    marketParticipants(tipSetKey?: TipSetKey): Promise<{
        [k: string]: MarketBalance;
    }>;
    /**
     * returns information about every deal in the Storage Market
     * @param tipSetKey
     */
    marketDeals(tipSetKey?: TipSetKey): Promise<{
        [k: string]: MarketDeal;
    }>;
    /**
     * returns information about the indicated deal
     * @param dealId
     * @param tipSetKey
     */
    marketStorageDeal(dealId: DealID, tipSetKey?: TipSetKey): Promise<MarketDeal>;
    /**
     * retrieves the ID address of the given address
     * @param address
     * @param tipSetKey
     */
    lookupId(address: Address, tipSetKey?: TipSetKey): Promise<Address>;
    /**
     * returns the public key address of the given ID address
     * @param address
     * @param tipSetKey
     */
    accountKey(address: Address, tipSetKey?: TipSetKey): Promise<Address>;
    /**
     * returns all the actors whose states change between the two given state CIDs
     * @param cid1
     * @param cid2
     */
    changedActors(cid1?: Cid, cid2?: Cid): Promise<{
        [k: string]: Actor;
    }>;
    /**
     * returns the message receipt for the given message
     * @param cid
     * @param tipSetKey
     */
    getReceipt(cid: Cid, tipSetKey?: TipSetKey): Promise<MessageReceipt>;
    /**
     * returns the number of sectors in a miner's sector set and proving set
     * @param address
     * @param tipSetKey
     */
    minerSectorCount(address: Address, tipSetKey?: TipSetKey): Promise<MinerSectors>;
    /**
     * Applies the given messages on the given tipset.
     * @param epoch
     * @param messages
     * @param tipSetKey
     *
     * @remarks
     * The messages are run as though the VM were at the provided height.
     */
    compute(epoch: ChainEpoch, messages: Message[], tipSetKey?: TipSetKey): Promise<ComputeStateOutput>;
    /**
     * returns the data cap for the given address.
     * @param address
     * @param tipSetKey
     *
     * @remarks
     * Returns nil if there is no entry in the data cap table for the address.
     */
    verifiedClientStatus(address: Address, tipSetKey?: TipSetKey): Promise<DataCap | null>;
    /**
     * returns the min and max collateral a storage provider can issue
     * @param size
     * @param verified
     * @param tipSetKey
     */
    dealProviderCollateralBounds(size: PaddedPieceSize, verified: boolean, tipSetKey?: TipSetKey): Promise<DealCollateralBounds>;
    /**
     * returns the circulating supply of Filecoin at the given tipset
     * @param tipSetKey
     */
    circulatingSupply(tipSetKey?: TipSetKey): Promise<CirculatingSupply>;
    /**
     * Client
     * The Client methods all have to do with interacting with the storage and retrieval markets as a client.
     */
    /**
     * Imports file under the specified path into filestore.
     * @param fileRef
     */
    import(fileRef: FileRef): Promise<ImportRes>;
    /**
     * Removes file import
     * @param importId
     */
    removeImport(importId: StoreID): Promise<ImportRes>;
    /**
     * Proposes a deal with a miner.
     * @param dealParams
     */
    startDeal(dealParams: StartDealParams): Promise<Cid>;
    /**
     * Returns the latest information about a given deal.
     * @param dealCid
     */
    getDealInfo(dealCid: Cid): Promise<DealInfo>;
    /**
     * Returns information about the deals made by the local client.
     */
    listDeals(): Promise<DealInfo[]>;
    hasLocal(cid: Cid): Promise<boolean>;
    /**
     * Identifies peers that have a certain file, and returns QueryOffers (one per peer).
     * @param cid
     * @param pieceCid
     */
    findData(cid: Cid, pieceCid?: Cid): Promise<QueryOffer[]>;
    /**
     * returns a QueryOffer for the specific miner and file.
     * @param miner
     * @param root
     * @param pieceCid
     */
    minerQueryOffer(miner: Address, root: Cid, pieceCid?: Cid): Promise<QueryOffer>;
    /**
     * initiates the retrieval of a file, as specified in the order.
     * @param order
     * @param ref
     */
    retrieve(order: RetrievalOrder, ref: FileRef): Promise<void>;
    /**
     * returns a signed StorageAsk from the specified miner.
     * @param peerId
     * @param miner
     */
    queryAsk(peerId: PeerID, miner: Address): Promise<StorageAsk>;
    /**
     * calculates the CommP for a specified file
     * @param path
     */
    calcCommP(path: string): Promise<CommPRet>;
    /**
     * generates a CAR file for the specified file.
     * @param ref
     * @param outpath
     */
    genCar(ref: FileRef, outpath: string): Promise<any>;
    /**
     * calculates real deal data size
     * @param root
     */
    dealSize(root: Cid): Promise<DataSize>;
    /**
     * returns the status of all ongoing transfers of data
     */
    listDataTransfers(): Promise<DataTransferChannel[]>;
    /**
     * attempts to restart stalled retrievals on a given payment channel which are stuck due to insufficient funds.
     * @param paymentChannel
     */
    retrieveTryRestartInsufficientFunds(paymentChannel: Address): Promise<void>;
    /**
     * lists imported files and their root CIDs
     */
    listImports(): Promise<Import[]>;
    /**
     * returns the status of updated deals
     */
    getDealUpdates(cb: (data: DealInfo) => void): Promise<void>;
    /**
     * initiates the retrieval of a file, as specified in the order, and provides a channel of status updates.
     * @param order
     * @param ref
     * @param cb
     */
    retrieveWithEvents(order: RetrievalOrder, ref: FileRef, cb: (data: RetrievalEvent) => void): Promise<void>;
    dataTransferUpdates(cb: (data: DataTransferChannel) => void): Promise<void>;
    /**
     * PaychGet
     * @param from
     * @param to
     * @param amount
     */
    getPaymentChannel(from: string, to: string, amount: string): Promise<ChannelInfo>;
    /**
     * PaychGetWaitReady
     * @param cid
     */
    getWaitReadyPaymentChannel(cid: Cid): Promise<Address>;
    /**
      * PaychList
      */
    getPaymentChannelList(): Promise<[Address]>;
    /**
     * PaychStatus
     * @param address
     */
    getPaymentChannelStatus(address: string): Promise<PaychStatus>;
    /**
     * PaychAllocateLane
     * @param address
     */
    PaymentChannelAllocateLane(address: string): Promise<number>;
    /**
     * PaychSettle
     * @param address
     */
    PaymentChannelSettle(address: string): Promise<Cid>;
    /**
     * PaychCollect
     * @param address
     */
    PaymentChannelCollect(address: string): Promise<Cid>;
    /**
     * PaychAvailableFunds
     * @param address
     */
    getPaymentChannelAvailableFunds(address: string): Promise<ChannelAvailableFunds>;
    /**
     * PaychAvailableFundsByFromTo
     * @param from
     * @param to
     */
    getPaymentChannelAvailableFundsByFromTo(from: string, to: string): Promise<ChannelAvailableFunds>;
    /**
     * PaychNewPayment
     * @param from
     * @param to
     * @param vouchers
     */
    paymentChannelNewPayment(from: string, to: string, vouchers: [VoucherSpec]): Promise<PaymentInfo>;
    /**
     * PaychVoucherCreate
     * @param address
     * @param amount
     * @param lane
     */
    PaymentChannelVoucherCreate(address: string, amount: string, lane: number): Promise<VoucherCreateResult>;
    /**
     * PaychVoucherList
     * @param address
     */
    PaymentChannelVoucherList(address: string): Promise<[SignedVoucher]>;
    /**
     * PaychVoucherCheckValid
     * @param address
     * @param signedVoucher
     */
    PaymentChannelVoucherCheckValid(address: string, signedVoucher: SignedVoucher): Promise<any>;
    /**
     * PaychVoucherAdd
     * @param address
     * @param signedVoucher
     * @param proof
     * @param minDelta
     */
    PaymentChannelVoucherAdd(address: string, signedVoucher: SignedVoucher, proof: any, minDelta: string): Promise<string>;
    /**
     * PaychVoucherCheckSpendable
     * @param address
     * @param signedVoucher
     * @param secret
     * @param proof
     */
    PaymentChannelVoucherCheckSpendable(address: string, signedVoucher: SignedVoucher, secret: any, proof: any): Promise<boolean>;
    /**
     * PaychVoucherSubmit
     * @param address
     * @param signedVoucher
     * @param secret
     * @param proof
     */
    PaymentChannelVoucherSubmit(address: string, signedVoucher: SignedVoucher, secret: any, proof: any): Promise<Cid>;
    /**
      * returns (a copy of) the current mpool config
      */
    getMpoolConfig(): Promise<MpoolConfig>;
    /**
      * sets the mpool config to (a copy of) the supplied config
      * @param config
      */
    setMpoolConfig(config: MpoolConfig): Promise<MpoolConfig>;
    /**
      * clears pending messages from the mpool
      */
    mpoolClear(): Promise<any>;
    /**
      * get all mpool messages
      * @param tipSetKey
      */
    getMpoolPending(tipSetKey: TipSetKey): Promise<[SignedMessage]>;
    /**
      * returns a list of pending messages for inclusion in the next block
      * @param tipSetKey
      * @param ticketQuality
      */
    mpoolSelect(tipSetKey: TipSetKey, ticketQuality: number): Promise<[SignedMessage]>;
    /**
      * returns a list of pending messages for inclusion in the next block
      * @param tipSetKey
      * @param ticketQuality
      */
    mpoolSub(cb: (data: MpoolUpdate) => void): Promise<void>;
    /**
      * MinerGetBaseInfo
      * @param address
      * @param chainEpoch
      * @param tipSetKey
      */
    minerGetBaseInfo(address: string, chainEpoch: ChainEpoch, tipSetKey: TipSetKey): Promise<MiningBaseInfo>;
    /**
      * MinerCreateBlock
      * @param blockTemplate
      */
    minerCreateBlock(blockTemplate: BlockTemplate): Promise<BlockMsg>;
    /**
      * multiSigGetAvailableBalance returns the portion of a multisig's balance that can be withdrawn or spent
      * @param address
      * @param tipSetKey
      */
    multiSigGetAvailableBalance(address: string, tipSetKey: TipSetKey): Promise<string>;
    /**
      * multiSigGetVested returns the amount of FIL that vested in a multisig in a certain period.
      * @param address
      * @param startEpoch
      * @param endEpoch
      */
    multiSigGetVested(address: string, startEpoch: TipSetKey, endEpoch: TipSetKey): Promise<string>;
    /**
      * multiSigCreate creates a multisig wallet
      * @param requiredNumberOfSenders
      * @param approvingAddresses
      * @param unlockDuration
      * @param initialBalance
      * @param senderAddressOfCreateMsg
      * @param gasPrice
      */
    multiSigCreate(requiredNumberOfSenders: number, approvingAddresses: string[], unlockDuration: ChainEpoch, initialBalance: string, senderAddressOfCreateMsg: string, gasPrice: string): Promise<Cid>;
    /**
      * multiSigPropose creates a multisig wallet
      * @param address
      * @param recipientAddres
      * @param value
      * @param senderAddressOfProposeMsg
      * @param methodToCallInProposeMsg
      * @param paramsToIncludeInProposeMsg
      */
    multiSigPropose(address: string, recipientAddres: string, value: string, senderAddressOfProposeMsg: string, methodToCallInProposeMsg: number, paramsToIncludeInProposeMsg: []): Promise<Cid>;
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
    multiSigApprove(address: string, proposedMessageId: number, proposerAddress: string, recipientAddres: string, value: string, senderAddressOfApproveMsg: string, methodToCallInProposeMsg: number, paramsToIncludeInProposeMsg: []): Promise<Cid>;
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
    multiSigCancel(address: string, proposedMessageId: number, proposerAddress: string, recipientAddres: string, value: string, senderAddressOfCancelMsg: string, methodToCallInProposeMsg: number, paramsToIncludeInProposeMsg: []): Promise<Cid>;
    /**
      * multiSigAddPropose proposes adding a signer in the multisig
      * @param address
      * @param senderAddressOfProposeMsg
      * @param newSignerAddress
      * @param increaseNumberOfRequiredSigners
      */
    multiSigAddPropose(address: string, senderAddressOfProposeMsg: string, newSignerAddress: string, increaseNumberOfRequiredSigners: boolean): Promise<Cid>;
    /**
      * multiSigAddApprove approves a previously proposed AddSigner message
      * @param address
      * @param senderAddressOfApproveMsg
      * @param proposedMessageId
      * @param proposerAddress
      * @param newSignerAddress
      * @param increaseNumberOfRequiredSigners
      */
    multiSigAddApprove(address: string, senderAddressOfApproveMsg: string, proposedMessageId: number, proposerAddress: string, newSignerAddress: string, increaseNumberOfRequiredSigners: boolean): Promise<Cid>;
    /**
      * multiSigAddCancel cancels a previously proposed AddSigner message
      * @param address
      * @param senderAddressOfCancelMsg
      * @param proposedMessageId
      * @param newSignerAddress
      * @param increaseNumberOfRequiredSigners
      */
    multiSigAddCancel(address: string, senderAddressOfCancelMsg: string, proposedMessageId: number, newSignerAddress: string, increaseNumberOfRequiredSigners: boolean): Promise<Cid>;
    /**
      * multiSigSwapPropose proposes swapping 2 signers in the multisig
      * @param address
      * @param senderAddressOfProposeMsg
      * @param oldSignerAddress
      * @param newSignerAddress
      */
    multiSigSwapPropose(address: string, senderAddressOfProposeMsg: string, oldSignerAddress: string, newSignerAddress: string): Promise<Cid>;
    /**
      * multiSigSwapApprove approves a previously proposed SwapSigner
      * @param address
      * @param senderAddressOfApproveMsg
      * @param proposedMessageId
      * @param proposerAddress
      * @param oldSignerAddress
      * @param newSignerAddress
      */
    multiSigSwapApprove(address: string, senderAddressOfApproveMsg: string, proposedMessageId: number, proposerAddress: string, oldSignerAddress: string, newSignerAddress: string): Promise<Cid>;
    /**
      * multiSigSwapCancel cancels a previously proposed SwapSigner message
      * @param address
      * @param senderAddressOfCancelMsg
      * @param proposedMessageId
      * @param oldSignerAddress
      * @param newSignerAddress
      */
    multiSigSwapCancel(address: string, senderAddressOfCancelMsg: string, proposedMessageId: number, oldSignerAddress: string, newSignerAddress: string): Promise<Cid>;
    /**
     * Auth
     * The Auth method group is used to manage the authorization tokens.
     */
    /**
     * list the permissions for a given authorization token
     * @param token
     */
    authVerify(token: string): Promise<Permission[]>;
    /**
     * generate a new authorization token for a given permissions list
     * @param permissions
     */
    authNew(permissions: Permission[]): Promise<string>;
    /**
     * Common
     */
    /**
     * returns peerID of libp2p node backing this API
     */
    id(): Promise<ID>;
    /**
     * provides information about API provider
     */
    version(): Promise<Version>;
    logList(): Promise<string[]>;
    logSetLevel(string1: string, string2: string): Promise<any>;
    /**
     * trigger graceful shutdown
     */
    shutdown(): Promise<void>;
    /**
     * Net
     */
    netConnectedness(peerId: PeerID): Promise<Connectedness>;
    netPeers(): Promise<AddrInfo[]>;
    netConnect(addrInfo: AddrInfo): Promise<any>;
    netAddrsListen(): Promise<AddrInfo>;
    netDisconnect(peerID: PeerID): Promise<void>;
    findPeer(peerID: PeerID): Promise<AddrInfo>;
    netPubsubScores(): Promise<PubsubScore[]>;
    netAutoNatStatus(): Promise<NatInfo>;
    /**
     * Sync
     * The Sync method group contains methods for interacting with and observing the lotus sync service.
     */
    /**
     * returns the current status of the lotus sync system.
     */
    syncState(): Promise<SyncState>;
    /**
     * checks if a block was marked as bad, and if it was, returns the reason.
     * @param blockCid
     */
    syncCheckBad(blockCid: Cid): Promise<string>;
    /**
     * marks a blocks as bad, meaning that it won't ever by synced. Use with extreme caution.
     * @param blockCid
     */
    syncMarkBad(blockCid: Cid): Promise<void>;
    /**
     * unmarks a block as bad, making it possible to be validated and synced again.
     * @param blockCid
     */
    syncUnmarkBad(blockCid: Cid): Promise<void>;
    /**
     * marks a blocks as checkpointed, meaning that it won't ever fork away from it.
     * @param tipSetKey
     */
    syncCheckpoint(tipSetKey: TipSetKey): Promise<string>;
    /**
     * can be used to submit a newly created block to the network
     * @param blockMsg
     */
    syncSubmitBlock(blockMsg: BlockMsg): Promise<string>;
    /**
     * returns a channel streaming incoming, potentially not yet synced block headers.
     * @param cb
     */
    syncIncomingBlocks(cb: (blockHeader: BlockHeader) => void): Promise<void>;
}

/**
 * KeyInfo is used for storing keys in KeyStore
 */
declare class KeyInfo {
    Type: string;
    PrivateKey: [];
}

declare class Loc {
    File: string;
    Line: number;
    Function: string;
}

declare class MarketBalance {
    Escrow: string;
    Locked: string;
}

declare class MarketDeal {
    Proposal: DealProposal;
    State: DealState;
}

declare class Merge {
    Lane: number;
    Nonce: number;
}

declare class Message {
    Version?: number;
    To: string;
    From: string;
    Nonce: number;
    Value: BigNumber;
    GasLimit: number;
    GasFeeCap: BigNumber;
    GasPremium: BigNumber;
    Method: number;
    Params: string;
}

declare class MessagePartial {
    Version?: number;
    To: string;
    From: string;
    Nonce?: number;
    Value?: BigNumber;
    GasLimit?: number;
    GasFeeCap?: BigNumber;
    GasPremium?: BigNumber;
    Method?: number;
    Params?: string;
}

declare class MessageReceipt {
    ExitCode: ExitCode;
    Return: any;
    GasUsed: number;
}

export declare class MetamaskSigner implements Signer {
    private filecoinApi;
    constructor(filecoinApi: FilecoinSnapApi);
    sign(message: Message): Promise<SignedMessage>;
    getDefaultAccount(): Promise<string>;
    private messageToSigner;
    private messageFromSigner;
}

export declare class MetamaskSnapHelper {
    private connection;
    private isInstalled;
    private snap;
    filecoinApi: FilecoinSnapApi | undefined;
    error: string | undefined;
    constructor(connection: JsonRpcConnectionOptions);
    installFilecoinSnap(): Promise<any>;
}

export declare class MetamaskWalletProvider extends HttpJsonRpcWalletProvider {
    private signer;
    constructor(connector: Connector, filecoinApi: FilecoinSnapApi);
    getAccounts(): Promise<string[]>;
    getDefaultAccount(): Promise<string>;
    sendMessage(msg: Message): Promise<SignedMessage>;
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string | ArrayBuffer): Promise<Signature>;
    getSigner(): MetamaskSigner;
    verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}

declare class MinerInfo {
    /**
     * Account that owns the miner.
     *
     * @remarks
     * Income and returned collateral are paid to this address. This address is also allowed to change the worker address for the miner.
     */
    Owner: Address;
    /**
     * Worker account for the miner.
     *
     * @remarks
     * The associated pubkey-type address is used to sign blocks and messages on behalf of this miner.
     */
    Worker: Address;
    /**
     * Additional addresses that are permitted to submit messages controlling this actor
     */
    ControlAddresses?: Address[];
    PendingWorkerKey: WorkerKeyChange;
    /**
     * Libp2p identity that should be used when connecting to this miner.
     */
    PeerId: PeerID;
    /**
     * Libp2p multi-addresses used for establishing a connection with this miner.
     */
    Multiaddrs: Multiaddrs[] | null;
    /**
     * The proof type used by this miner for sealing sectors.
     */
    SealProofType: RegisteredSealProof;
    /**
     * Amount of space in each sector committed by this miner.
     *
     * @remarks
     * This is computed from the proof type and represented here redundantly.
     */
    SectorSize: SectorSize;
    /**
     * The number of sectors in each Window PoSt partition (proof).
     *
     * @remarks
     * This is computed from the proof type and represented here redundantly.
     */
    WindowPoStPartitionSectors: number;
    /**
     * The next epoch this miner is eligible for certain permissioned actor methods and winning block elections as a result of being reported for a consensus fault.
     */
    ConsensusFaultElapsed: ChainEpoch;
}

declare class MinerPower {
    MinerPower: Claim;
    TotalPower: Claim;
}

declare class MinerSectors {
    /**
     * Sectors actively contributing to power.
     */
    Active: number;
    /**
     * Sectors with failed proofs.
     */
    Faulty: number;
    /**
     * Live sectors that should be proven.
     */
    Live: number;
}

declare class MiningBaseInfo {
    MinerPower: string;
    NetworkPower: string;
    Sectors: [SectorInfo];
    WorkerKey: Address;
    SectorSize: number;
    PrevBeaconEntry: BeaconEntry;
    BeaconEntries: [BeaconEntry];
    HasMinPower: boolean;
}

export declare class MnemonicSigner implements Signer {
    private mnemonic;
    private password;
    private path;
    constructor(mnemonic: string | StringGetter, password: string | StringGetter, path?: string);
    sign(message: Message): Promise<SignedMessage>;
    getDefaultAccount(): Promise<string>;
    private getPassword;
    private getMenmonic;
    private messageToSigner;
}

export declare class MnemonicWalletProvider extends HttpJsonRpcWalletProvider {
    private signer;
    constructor(connector: Connector, mnemonic: string | StringGetter, password: string | StringGetter, path?: string);
    getAccounts(): Promise<string[]>;
    getDefaultAccount(): Promise<string>;
    sendMessage(msg: Message): Promise<SignedMessage>;
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string | ArrayBuffer): Promise<Signature>;
    getSigner(): MnemonicSigner;
    verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}

declare class ModVerifyParams {
    Actor: string;
    Method: number;
    Data: [];
}

declare class MpoolConfig {
    PriorityAddrs: [Address];
    SizeLimitHigh: number;
    SizeLimitLow: number;
    ReplaceByFeeRatio: number;
    PruneCooldown: number;
    GasLimitOverestimation: number;
}

declare class MpoolUpdate {
    Type: number;
    Message: SignedMessage;
}

declare class MsgLookup {
    /**
     * @remarks
     * Can be different than requested, in case it was replaced, but only gas values changed
     */
    Message: Cid;
    Receipt: MessageReceipt;
    ReturnDec: any;
    TipSet: TipSetKey;
    Height: ChainEpoch;
}

/**
 * multiaddr is the data type representing a Multiaddr
 */
declare type Multiaddr = string;

declare type Multiaddrs = any;

declare class NatInfo {
    Reachability: Reachability;
    PublicAddr: string;
}

declare type NetworkName = string;

declare class ObjStat {
    Size: number;
    Links: number;
}

declare type PaddedPieceSize = number;

declare class Partition {
    /**
     * Sector numbers in this partition, including faulty, unproven, and terminated sectors.
     */
    AllSectors: BitField;
    /**
     * Subset of sectors detected/declared faulty and not yet recovered (excl. from PoSt).
     */
    FaultySectors: BitField;
    /**
     * Subset of faulty sectors expected to recover on next PoSt
     */
    RecoveringSectors: BitField;
    ActiveSectors: BitField;
    LiveSectors: BitField;
}

declare class PaychStatus {
    ControlAddr: Address;
    Direction: number;
}

declare class PaymentInfo {
    Channel: string;
    WaitSentinel: Cid;
    Vouchers: [SignedVoucher];
}

declare type PeerID = string;

declare type Permission = string;

declare class PoStProof {
    PoStProof: number;
    ProofBytes: [];
}

declare class PowerPair {
    Raw: StoragePower;
    QA: StoragePower;
}

declare class PubsubScore {
    ID: ID;
    Score: Score;
}

declare class QueryOffer {
    Err: string;
    Root: Cid;
    Piece: Cid;
    Size: number;
    MinPrice: string;
    UnsealPrice: string;
    PaymentInterval: number;
    PaymentIntervalIncrease: number;
    Miner: Address;
    MinerPeer: RetrievalPeer;
}

/**
 * Reachability indicates how reachable a node is./**
 */
declare type Reachability = number;

declare type RegisteredProof = number;

declare type RegisteredSealProof = RegisteredProof;

declare interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[];
}

declare class RetrievalEvent {
    Event: ClientEvent;
    Status: DealStatus;
    BytesReceived: number;
    FundsSpent: TokenAmount;
    Err: string;
}

declare class RetrievalOrder {
    Root: Cid;
    Piece?: Cid;
    Size: number;
    Total: string;
    UnsealPrice: string;
    PaymentInterval: number;
    PaymentIntervalIncrease: number;
    Client: Address;
    Miner: Address;
    MinerPeer: RetrievalPeer;
}

/**
 * RetrievalPeer is a provider address/peer.ID pair (everything needed to make deals for with a miner)
 */
declare class RetrievalPeer {
    Address: Address;
    ID?: ID;
    PieceCID?: Cid;
}

declare class Score {
    Score: number;
    Topics: any;
    AppSpecificScore: number;
    IPColocationFactor: number;
    BehaviourPenalty: number;
}

declare class SectorExpiration {
    OnTime: ChainEpoch;
    /**
     * non-zero if sector is faulty, epoch at which it will be permanently removed if it doesn't recover
     */
    Early: ChainEpoch;
}

declare class SectorInfo {
    SealProof: number;
    SectorNumber: number;
    SealedCID: Cid;
}

declare class SectorLocation {
    Deadline: number;
    Partition: number;
}

declare type SectorNumber = number;

/**
 * Information stored on-chain for a proven sector.
 */
declare class SectorOnChainInfo {
    SectorNumber: SectorNumber;
    /**
     * The seal proof type implies the PoSt proof/s
     */
    SealProof: RegisteredSealProof;
    /**
     * CommR
     */
    SealedCID: Cid;
    DealIDs: DealID[];
    /**
     * Epoch during which the sector proof was accepted
     */
    Activation: ChainEpoch;
    /**
     * Epoch during which the sector expires
     */
    Expiration: ChainEpoch;
    /**
     * Integral of active deals over sector lifetime
     */
    DealWeight: DealWeight;
    /**
     * Integral of active verified deals over sector lifetime
     */
    VerifiedDealWeight: DealWeight;
    /**
     * Pledge collected to commit this sector
     */
    InitialPledge: TokenAmount;
    /**
     * Expected one day projection of reward for sector computed at activation time
     */
    ExpectedDayReward: TokenAmount;
    /**
     * Expected twenty day projection of reward for sector computed at activation time
     */
    ExpectedStoragePledge: TokenAmount;
    /**
     * Age of sector this sector replaced or zero
     */
    ReplacedSectorAge: ChainEpoch;
    /**
     * Day reward of sector this sector replace or zero
     */
    ReplacedDayReward: TokenAmount;
}

declare class SectorPreCommitInfo {
    SealProof: RegisteredSealProof;
    SectorNumber: SectorNumber;
    /**
     * CommR
     */
    SealedCID: Cid;
    SealRandEpoch: ChainEpoch;
    DealIDs: DealID | null;
    Expiration: ChainEpoch;
    /**
     * Whether to replace a "committed capacity" no-deal sector
     *
     * @remarks
     * It requires non-empty DealIDs
     */
    ReplaceCapacity: boolean;
    /**
     * The committed capacity sector to replace, and it's deadline/partition location
     */
    ReplaceSectorDeadline: number;
    ReplaceSectorPartition: number;
    ReplaceSectorNumber: SectorNumber;
}

/**
 * Information stored on-chain for a pre-committed sector.
 */
declare class SectorPreCommitOnChainInfo {
    Info: SectorPreCommitInfo;
    PreCommitDeposit: TokenAmount;
    PreCommitEpoch: ChainEpoch;
    /**
     * Integral of active deals over sector lifetime
     */
    DealWeight: DealWeight;
    /**
     * Integral of active verified deals over sector lifetime
     */
    VerifiedDealWeight: DealWeight;
}

/**
 * It indicates one of a set of possible sizes in the network.
 *
 * @remarks
 * 1KiB = 1024
 * 1MiB = 1048576
 * 1GiB = 1073741824
 * 1TiB = 1099511627776
 * 1PiB = 1125899906842624
 * 1EiB = 1152921504606846976
 * max  = 18446744073709551615
 */
declare type SectorSize = number;

declare interface Signature {
    Data: string;
    Type: number;
}

declare interface SignedMessage {
    Message: Message;
    Signature: Signature;
}

declare class SignedVoucher {
    ChannelAddr: string;
    TimeLockMin: ChainEpoch;
    TimeLockMax: ChainEpoch;
    SecretPreimage: [];
    Extra: ModVerifyParams;
    Lane: number;
    Nonce: number;
    Amount: string;
    MinSettleHeight?: ChainEpoch;
    Merges?: [Merge];
    Signature: Signature;
}

declare interface Signer {
    sign(message: Message, password?: string): Promise<SignedMessage>;
}

declare class StartDealParams {
    Data: DataRef;
    Wallet: Address;
    Miner: Address;
    EpochPrice: string;
    MinBlocksDuration: number;
    ProviderCollateral?: string;
    DealStartEpoch?: ChainEpoch;
    FastRetrieval?: boolean;
    VerifiedDeal?: boolean;
}

/**
 * StorageAsk defines the parameters by which a miner will choose to accept or reject a deal.
 *
 * @remarks making a storage deal proposal which matches the miner's ask is a precondition, but not sufficient to ensure the deal is accepted (the storage provider may run its own decision logic).
 */
declare class StorageAsk {
    /**
     * Price per GiB / Epoch
     */
    Price: TokenAmount;
    VerifiedPrice: TokenAmount;
    MinPieceSize: PaddedPieceSize;
    MaxPieceSize: PaddedPieceSize;
    Miner: Address;
    Timestamp: ChainEpoch;
    Expiry: ChainEpoch;
    SeqNo: number;
}

/**
 * StorageDealStatus is the local status of a StorageDeal.
 *
 * @remarks This status has meaning in the context of this module only - it is not recorded on chain
 */
declare type StorageDealStatus = number;

/**
 * The unit of storage power (measured in bytes)
 */
declare type StoragePower = string;

declare type StoreID = number;

declare type StringGetter = () => Promise<string>;

declare type SubscriptionId = string;

declare class SyncState {
    ActiveSyncs: ActiveSync[];
    VMApplied: number;
}

declare type SyncStateStage = number;

declare class Ticket {
    VRFProof: [];
}

declare class TipSet {
    Cids: Cid[];
    Blocks: BlockHeader[];
    Height: number;
}

declare type TipSetKey = Cid[];

declare type TokenAmount = string;

/**
 * TransferID is an identifier for a data transfer, shared between request/responder and unique to the requester.
 */
declare type TransferID = number;

declare type UnpaddedPieceSize = number;

declare class Version {
    Version: string;
    APIVersion: number;
    BlockDelay: number;
}

declare class VoucherCreateResult {
    Voucher: SignedVoucher;
    Shortfall: string;
}

declare class VoucherSpec {
    Amount: string;
    TimeLockMin: ChainEpoch;
    TimeLockMax: ChainEpoch;
    MinSettle: ChainEpoch;
    Extra: ModVerifyParams;
}

declare interface WalletProvider {
    getAccounts(): Promise<string[]>;
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string): Promise<Signature>;
    verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}

declare type WebSocketConnectionOptions = {
    url: string;
    token?: string;
};

declare class WorkerKeyChange {
    NewWorker: Address;
    EffectiveAt: ChainEpoch;
}

declare class WrappedMessage {
    Cid: Cid;
    Message: Message;
}

export declare class WsJsonRpcConnector extends EventEmitter implements Connector {
    url: string;
    token?: string;
    private websocket;
    private requests;
    private websocketReady;
    constructor(options: WebSocketConnectionOptions);
    connect(): Promise<any>;
    request(args: RequestArguments): Promise<any>;
    closeSubscription(subscriptionId: string): Promise<void>;
    disconnect(): Promise<any>;
    private fullUrl;
    on(event: 'connected' | 'disconnected' | 'error' | SubscriptionId, listener: (...args: any[]) => void): this;
    private onSocketClose;
    private onSocketError;
    private onSocketOpen;
    private onSocketMessage;
}

export { }
