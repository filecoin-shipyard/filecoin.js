/// <reference types="node" />
import { BigNumber } from 'bignumber.js';
import { EventEmitter } from 'events';
import { FilecoinSnapApi } from '@nodefactory/filsnap-types';

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

declare type ChainEpoch = number;

declare class ChainSectorInfo {
    Info: SectorOnChainInfo;
    ID: SectorNumber;
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

declare class ComputeStateOutput {
    Root: Cid;
    Trace: InvocResult[];
}

declare interface Connector {
    url: string;
    token?: string | undefined;
    connect(): Promise<any>;
    disconnect(): Promise<any>;
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

declare type DealWeight = number;

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
    newAccount(type?: number): Promise<string[]>;
    /**
     * get nonce for address
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
    setDefaultAccount(address: string): Promise<undefined>;
    /**
     * get default address
     */
    getDefaultAccount(): Promise<string>;
    /**
     * send message, signed with default lotus wallet
     * @param msg
     */
    sendMessage(msg: Message): Promise<SignedMessage>;
    /**
     * send signed message
     * @param msg
     */
    sendSignedMessage(msg: SignedMessage): Promise<Cid>;
    /**
     * estimate gas to succesufully send message, and have it included in the next 10 blocks
     * @param msg
     */
    estimateMessageGas(message: Message): Promise<Message>;
    /**
     * prepare a message for signing, add defaults, and populate nonce and gas related parameters if not provided
     * @param msg
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
    verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
    getPaymentChannel(from: string, to: string, amount: string): Promise<any>;
    getWaitReadyPaymentChannel(cid: Cid): Promise<any>;
    getPaymentChannelList(): Promise<any>;
    getPaymentChannelStatus(address: string): Promise<any>;
    PaymentChannelAllocateLane(address: string): Promise<any>;
    PaymentChannelSettle(address: string): Promise<any>;
    PaymentChannelCollect(address: string): Promise<any>;
    PaymentChannelVoucherCreate(address: string, amount: string, lane: number): Promise<any>;
    PaymentChannelVoucherList(address: string): Promise<any>;
    PaymentChannelVoucherCheckValid(address: string, signedVoucher: any): Promise<any>;
    PaymentChannelVoucherAdd(address: string, signedVoucher: any, proof: any, minDelta: string): Promise<any>;
    PaymentChannelVoucherCheckSpendable(address: string, signedVoucher: any, secret: any, proof: any): Promise<any>;
    PaymentChannelVoucherVoucherSubmit(address: string, signedVoucher: any, secret: any, proof: any): Promise<any>;
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
    version(): Promise<Version>;
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
    stopChainNotify(intervalId?: Timeout): void;
    /**
     * returns the block specified by the given CID
     * @param blockCid
     */
    getBlock(blockCid: Cid): Promise<TipSet>;
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
     * looks back for a tipset at the specified epoch.
     * @param epochNumber
     */
    getTipSetByHeight(epochNumber: number): Promise<TipSet>;
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
    minerSectors(address: string, tipSetKey?: TipSetKey): Promise<ChainSectorInfo[]>;
    /**
     * returns info about sectors that a given miner is actively proving.
     * @param address
     * @param tipSetKey
     */
    minerActiveSectors(address: string, tipSetKey?: TipSetKey): Promise<ChainSectorInfo[]>;
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
}

export declare class LedgerSigner implements Signer {
    private path;
    private transport;
    private wasm;
    constructor(path?: string);
    connect(): Promise<void>;
    sign(message: Message): Promise<SignedMessage>;
    getDefaultAccount(): Promise<string>;
    private messageToSigner;
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
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string | ArrayBuffer): Promise<Signature>;
    getSigner(): MetamaskSigner;
    verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
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
    Sectors: number;
    Active: number;
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
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string | ArrayBuffer): Promise<Signature>;
    getSigner(): MnemonicSigner;
    verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
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

declare type Multiaddrs = any;

declare type NetworkName = string;

declare type PaddedPieceSize = number;

declare class Partition {
    /**
     * Sector numbers in this partition, including faulty, unproven, and terminated sectors.
     */
    Sectors: BitField;
    /**
     * Unproven sectors in the partition.
     *
     * @remarks
     * This bitfield will be cleared on a successful window post (or at the end of the partition's next deadline).
     * At that time, any still unproven sectors will be added tothe faulty sector bitfield.
     */
    Unproven: BitField;
    /**
     * Subset of sectors detected/declared faulty and not yet recovered (excl. from PoSt).
     */
    Faults: BitField;
    /**
     * Subset of faulty sectors expected to recover on next PoSt
     */
    Recoveries: BitField;
    /**
     * Subset of sectors terminated but not yet removed from partition (excl. from PoSt)
     */
    Terminated: BitField;
    /**
     * Maps epochs sectors that expire in or before that epoch.
     *
     * @remarks
     * An expiration may be an "on-time" scheduled expiration, or early "faulty" expiration. Keys are quantized to last-in-deadline epochs.
     */
    ExpirationsEpochs: Cid;
    /**
     * Subset of terminated that were before their committed expiration epoch, by termination epoch.
     *
     * @remarks
     * Termination fees have not yet been calculated or paid and associated deals have not yet been canceled but effective power has already been adjusted.
     */
    EarlyTerminated: Cid;
    /**
     * Power of not-yet-terminated sectors (incl faulty & unproven).
     */
    LivePower: PowerPair;
    /**
     * Power of yet-to-be-proved sectors (never faulty).
     */
    UnprovenPower: PowerPair;
    /**
     * Power of currently-faulty sectors. FaultyPower <= LivePower.
     */
    FaultyPower: PowerPair;
    /**
     * Power of expected-to-recover sectors. RecoveringPower <= FaultyPower.
     */
    RecoveringPower: PowerPair;
}

declare type PeerID = string;

declare class PowerPair {
    Raw: StoragePower;
    QA: StoragePower;
}

declare type RegisteredProof = number;

declare type RegisteredSealProof = RegisteredProof;

declare interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[];
}

declare class SectorExpiration {
    OnTime: ChainEpoch;
    /**
     * non-zero if sector is faulty, epoch at which it will be permanently removed if it doesn't recover
     */
    Early: ChainEpoch;
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

declare interface Signer {
    sign(message: Message): Promise<SignedMessage>;
}

/**
 * The unit of storage power (measured in bytes)
 */
declare type StoragePower = string;

declare type StringGetter = () => Promise<string>;

declare class TipSet {
    Cids: Cid[];
    Blocks: BlockHeader[];
    Height: number;
}

declare type TipSetKey = Cid[];

declare type TokenAmount = string;

declare class Version {
    Version: string;
    APIVersion: number;
    BlockDelay: number;
}

declare interface WalletProvider {
    getAccounts(): Promise<string[]>;
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string): Promise<Signature>;
    verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}

declare class WorkerKeyChange {
    NewWorker: Address;
    EffectiveAt: ChainEpoch;
}

declare class WrappedMessage {
    Cid: Cid;
    Message: Message;
}

declare type WsJsonRpcConnectionOptions = string | {
    url: string;
    token?: string;
};

export declare class WsJsonRpcConnector extends EventEmitter implements Connector {
    protected options: WsJsonRpcConnectionOptions;
    url: string;
    token?: string | undefined;
    private connected;
    private client?;
    private requests;
    constructor(options: WsJsonRpcConnectionOptions);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    private handleWaitingRequests;
    request(req: RequestArguments): Promise<unknown>;
    requestWithChannel(req: RequestArguments, channelKey: string, channelCb: (data: any) => void): Promise<unknown>;
    removeChannelListener(channelKey: string): void;
    on(event: 'connected' | 'disconnected' | 'error', listener: (...args: any[]) => void): this;
    private performRequest;
    private fullUrl;
}

export { }
