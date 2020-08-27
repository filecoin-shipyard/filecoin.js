import { BigNumber } from 'bignumber.js';

export type StringGetter = () => Promise<string>;

export enum SigType {
  SigTypeSecp256k1 = 1,
  SigTypeBLS = 2,
}

export class Cid {
  '/'!: string;
}

export class BlockHeader {
  Miner!: string;

  Ticket!: {
    VRFProof: string;
  };

  ElectionProof!: {
    WinCount: number;
    VRFProof: string;
  };

  BeaconEntries!: {
    Round: number;
    Data: string;
  }[];

  WinPoStProof!: {
    PoStProof: number;
    ProofBytes: string;
  }[];

  Parents!: Cid[];

  ParentWeight!: string; // bn

  Height!: number;

  ParentStateRoot!: Cid;

  ParentMessageReceipts!: Cid;

  Messages!: Cid;

  BLSAggregate!: Signature;

  Timestamp!: number;

  BlockSig!: Signature;

  ForkSignaling!: number;
};

export class TipSet {
  Cids!: Cid[];
  Blocks!: BlockHeader[];
  Height!: number;
};

export class Version {
  Version!: string;
  APIVersion!: number;
  BlockDelay!: number;
};

export class Message {
  Version?: number;

  To!: string;

  From!: string;

  Nonce!: number;

  Value!: BigNumber;

  GasLimit!: number;

  GasFeeCap!: BigNumber;

  GasPremium!: BigNumber;

  Method!: number;

  Params!: string;
};

export class MessagePartial {
  Version?: number;

  To!: string;

  From!: string;

  Nonce?: number;

  Value?: BigNumber;

  GasLimit?: number;

  GasFeeCap?: BigNumber;

  GasPremium?: BigNumber;

  Method?: number;

  Params?: string;
};

export class HeadChange {
  Type!: 'current' | string;
  Val!: TipSet;
}

export class BlockMessages {
  BlsMessages!: Message[];
  SecpkMessages!: SignedMessage[];
  Cids!: Cid[];
}

export type ExitCode = number;

export class MessageReceipt {
  ExitCode!: ExitCode;
  Return!: any;
  GasUsed!:  number;
}

export class MinerSectors {
  Sectors!: number;
  Active!: number;
}

export class ComputeStateOutput {
  Root!: Cid;
  Trace!: InvocResult[];
}

// TODO: Find more appropiate naming
export class WrappedMessage {
  Cid!: Cid;
  Message!: Message;
}

export type TipSetKey = Cid[];

export class InvocResult {
  Msg!: Message;
  MsgRct!: MessageReceipt;
  ExecutionTrace!: ExecutionTrace;
  Error!: string;
  Duration!: number;
}

export class Loc {
  File!: string;
  Line!: number;
  Function!: string;
}

export class GasTrace {
  Name!: string;
  Location!: Loc[];
  TotalGas!: number;
  ComputeGas!: number;
  StorageGas!: number;
  TotalVirtualGas!: number;
  VirtualComputeGas!: number;
  VirtualStorageGas!: number;
  TimeTaken!: number;
  Extra!: any;
  Callers!: number[];
}

export class ExecutionTrace {
  Msg!: Message;
  MsgRct!: MessageReceipt;
  Error!: string;
  Duration!: number;
  GasCharges!: GasTrace[];
  Subcalls!: ExecutionTrace[];
}

export class Actor {
  Code!:  Cid;
  Head!: Cid;
  Nonce!: number;
  Balance!: BigNumber;
}

export class ActorState {
  Balance!: string;
  State: any;
}

export type NetworkName = string;
export type SectorNumber = number;
export type RegisteredProof = number;
export type RegisteredSealProof = RegisteredProof;
export type DealID = number;
export type ChainEpoch = number;
export type DealWeight = number;
// TODO: This should be BigNumber
export type TokenAmount = string;
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
export type SectorSize = number;

// TODO: Storage power should be a number. Keep the response format for the moment
/**
 * The unit of storage power (measured in bytes)
 */
export type StoragePower = string;

/**
 * Information stored on-chain for a proven sector.
 */
export class SectorOnChainInfo {
  SectorNumber!: SectorNumber;

  /**
   * The seal proof type implies the PoSt proof/s
   */
  SealProof!: RegisteredSealProof;

  /**
   * CommR
   */
  SealedCID!: Cid;
  DealIDs!: DealID[];

  /**
   * Epoch during which the sector proof was accepted
   */
  Activation!: ChainEpoch;

  /**
   * Epoch during which the sector expires
   */
  Expiration!: ChainEpoch;

  /**
   * Integral of active deals over sector lifetime
   */
  DealWeight!: DealWeight;

  /**
   * Integral of active verified deals over sector lifetime
   */
  VerifiedDealWeight!: DealWeight;

  /**
   * Pledge collected to commit this sector
   */
  InitialPledge!: TokenAmount;

  /**
   * Expected one day projection of reward for sector computed at activation time
   */
  ExpectedDayReward!: TokenAmount;

  /**
   * Expected twenty day projection of reward for sector computed at activation time
   */
  ExpectedStoragePledge!: TokenAmount;

  /**
   * Age of sector this sector replaced or zero
   */
  ReplacedSectorAge!: ChainEpoch;

  /**
   * Day reward of sector this sector replace or zero
   */
  ReplacedDayReward!: TokenAmount;
}

export class ChainSectorInfo {
  Info!: SectorOnChainInfo;
  ID!: SectorNumber;
}

/**
 * Deadline calculations with respect to a current epoch.
 *
 * @remarks
 * "Deadline" refers to the window during which proofs may be submitted. Windows are non-overlapping ranges [Open, Close), but the challenge epoch for a window occurs before the window opens.
 * The current epoch may not necessarily lie within the deadline or proving period represented here.
 */
export class DeadlineInfo {
  /**
   * Epoch at which this info was calculated.
   */
  CurrentEpoch!: ChainEpoch;

  /**
   * First epoch of the proving period (<= CurrentEpoch).
   */
  PeriodStart!: ChainEpoch;

  /**
   * A deadline index, in [0..WPoStProvingPeriodDeadlines) unless period elapsed.
   */
  Index!: number;

  /**
   * First epoch from which a proof may be submitted (>= CurrentEpoch).
   */
  Open!: ChainEpoch; //

  /**
   * First epoch from which a proof may no longer be submitted (>= Open).
   */
  Close!: ChainEpoch;

  /**
   * Epoch at which to sample the chain for challenge (< Open).
   */
  Challenge!: ChainEpoch;

  /**
   * First epoch at which a fault declaration is rejected (< Open).
   */
  FaultCutoff!: ChainEpoch;
}

export class Claim {
  /**
   * Sum of raw byte power for a miner's sectors.
   */
  RawBytePower!: StoragePower;

  /**
   * Sum of quality adjusted power for a miner's sectors.
   */
  QualityAdjPower!: StoragePower;
}

export class MinerPower {
  MinerPower!: Claim;
  TotalPower!: Claim;
}

export type Address = string;

export class WorkerKeyChange {
  NewWorker!:   Address;
  EffectiveAt!: ChainEpoch;
}

export type PeerID = string;

// TODO: Find the proper type for Multiaddrs (possible string[])
export type Multiaddrs = any;

export class MinerInfo {
  /**
   * Account that owns the miner.
   *
   * @remarks
   * Income and returned collateral are paid to this address. This address is also allowed to change the worker address for the miner.
   */
  Owner!: Address;

  /**
   * Worker account for the miner.
   *
   * @remarks
   * The associated pubkey-type address is used to sign blocks and messages on behalf of this miner.
   */
  Worker!: Address;

  /**
   * Additional addresses that are permitted to submit messages controlling this actor
   */
  ControlAddresses?: Address[];

  PendingWorkerKey!: WorkerKeyChange;

  /**
   * Libp2p identity that should be used when connecting to this miner.
   */
  PeerId!: PeerID;

  /**
   * Libp2p multi-addresses used for establishing a connection with this miner.
   */
  Multiaddrs!: Multiaddrs[] | null;

  /**
   * The proof type used by this miner for sealing sectors.
   */
  SealProofType!: RegisteredSealProof;

  /**
   * Amount of space in each sector committed by this miner.
   *
   * @remarks
   * This is computed from the proof type and represented here redundantly.
   */
  SectorSize!: SectorSize;

  /**
   * The number of sectors in each Window PoSt partition (proof).
   *
   * @remarks
   * This is computed from the proof type and represented here redundantly.
   */
  WindowPoStPartitionSectors!: number;

  /**
   * The next epoch this miner is eligible for certain permissioned actor methods and winning block elections as a result of being reported for a consensus fault.
   */
  ConsensusFaultElapsed!: ChainEpoch;
}

export type BitField = number[];

export class PowerPair {
  Raw!: StoragePower;
  QA!: StoragePower;
}

export class Deadline {
  /**
   * Partitions in this deadline, in order.
   *
   * @remarks
   * The keys of this AMT are always sequential integers beginning with zero.
   */
  Partitions!: Cid;

  /**
   * Maps epochs to partitions that _may_ have sectors that expire in or before that epoch.
   *
   * @remarks
   * Partitions MUST NOT be removed from this queue (until the associated epoch has passed) even if they no longer have sectors expiring at that epoch.
   * Sectors expiring at this epoch may later be recovered, and this queue will not be updated at that time.
   */
  ExpirationsEpochs!: Cid;

  /**
   * Partitions numbers with PoSt submissions since the proving period started.
   */
  PostSubmissions!: BitField;

  /**
   * Partitions with sectors that terminated early.
   */
  EarlyTerminations!: BitField;

  /**
   * The number of non-terminated sectors in this deadline (incl faulty).
   */
  LiveSectors!: number;

  /**
   * The total number of sectors in this deadline (incl dead).
   */
  TotalSectors!: number;

  /**
   * Memoized sum of faulty power in partitions.
   */
  FaultyPower!: PowerPair;
}

export class Partition {
  /**
   * Sector numbers in this partition, including faulty, unproven, and terminated sectors.
   */
  Sectors!: BitField;

  /**
   * Unproven sectors in the partition.
   *
   * @remarks
   * This bitfield will be cleared on a successful window post (or at the end of the partition's next deadline).
   * At that time, any still unproven sectors will be added tothe faulty sector bitfield.
   */
  Unproven!: BitField;

  /**
   * Subset of sectors detected/declared faulty and not yet recovered (excl. from PoSt).
   */
  Faults!: BitField;

  /**
   * Subset of faulty sectors expected to recover on next PoSt
   */
  Recoveries!: BitField;

  /**
   * Subset of sectors terminated but not yet removed from partition (excl. from PoSt)
   */
  Terminated!: BitField;

  /**
   * Maps epochs sectors that expire in or before that epoch.
   *
   * @remarks
   * An expiration may be an "on-time" scheduled expiration, or early "faulty" expiration. Keys are quantized to last-in-deadline epochs.
   */
  ExpirationsEpochs!: Cid;

  /**
   * Subset of terminated that were before their committed expiration epoch, by termination epoch.
   *
   * @remarks
   * Termination fees have not yet been calculated or paid and associated deals have not yet been canceled but effective power has already been adjusted.
   */
  EarlyTerminated!: Cid;

  //
  /**
   * Power of not-yet-terminated sectors (incl faulty & unproven).
   */
  LivePower!: PowerPair;

  /**
   * Power of yet-to-be-proved sectors (never faulty).
   */
  UnprovenPower!: PowerPair;

  /**
   * Power of currently-faulty sectors. FaultyPower <= LivePower.
   */
  FaultyPower!: PowerPair;

  /**
   * Power of expected-to-recover sectors. RecoveringPower <= FaultyPower.
   */
  RecoveringPower!: PowerPair;
}

export class Fault {
  Miner!: Address;
  Epoch!: ChainEpoch;
}

export class SectorPreCommitInfo {
  SealProof!: RegisteredSealProof;
  SectorNumber!: SectorNumber;
  /**
   * CommR
   */
  SealedCID!: Cid;
  SealRandEpoch!: ChainEpoch;
  DealIDs!: DealID | null;
  Expiration!: ChainEpoch;
  /**
   * Whether to replace a "committed capacity" no-deal sector
   *
   * @remarks
   * It requires non-empty DealIDs
   */
  ReplaceCapacity!: boolean;
  /**
   * The committed capacity sector to replace, and it's deadline/partition location
   */
  ReplaceSectorDeadline!: number;
  ReplaceSectorPartition!: number;
  ReplaceSectorNumber!: SectorNumber;
}

/**
 * Information stored on-chain for a pre-committed sector.
 */
export class SectorPreCommitOnChainInfo {
  Info!: SectorPreCommitInfo;
  PreCommitDeposit!: TokenAmount
  PreCommitEpoch!: ChainEpoch;
  /**
   * Integral of active deals over sector lifetime
   */
  DealWeight!: DealWeight;
  /**
   * Integral of active verified deals over sector lifetime
   */
  VerifiedDealWeight!: DealWeight;
}

export class SectorExpiration {
  OnTime!: ChainEpoch;
  /**
   * non-zero if sector is faulty, epoch at which it will be permanently removed if it doesn't recover
   */
  Early!: ChainEpoch;
}

export class SectorLocation {
  Deadline!: number;
  Partition!: number;
}

export class MsgLookup {
  /**
   * @remarks
   * Can be different than requested, in case it was replaced, but only gas values changed
   */
  Message!: Cid;
  Receipt!: MessageReceipt;
  ReturnDec!: any;
  TipSet!: TipSetKey;
  Height!: ChainEpoch;
}

// TODO: Change from string to BigNumber
export class MarketBalance {
  Escrow!: string;
  Locked!: string;
}

export type PaddedPieceSize = number;

export class DealProposal {
  PieceCID!: Cid;
  PieceSize!: PaddedPieceSize;
  VerifiedDeal!: boolean;
  Client!: Address;
  Provider!: Address;
  /**
   * An arbitrary client chosen label to apply to the deal
   */
  Label!: string;

  /**
   * Nominal start epoch.
   * @remarks
   * Deal payment is linear between StartEpoch and EndEpoch, with total amount StoragePricePerEpoch * (EndEpoch - StartEpoch).
   * Storage deal must appear in a sealed (proven) sector no later than StartEpoch, otherwise it is invalid.
   */
  StartEpoch!: ChainEpoch;
  EndEpoch!: ChainEpoch;
  StoragePricePerEpoch!: TokenAmount;
  ProviderCollateral!: TokenAmount;
  ClientCollateral!: TokenAmount;
}

export class DealState {
  /**
   * @remarks
   * -1 if not yet included in proven sector
   */
  SectorStartEpoch!: ChainEpoch;
  /**
   * @remarks
   * -1 if deal state never updated
   */
  LastUpdatedEpoch!: ChainEpoch;
  /**
   * @remarks
   * -1 if deal never slashed
   */
  SlashEpoch!: ChainEpoch;
}

export class MarketDeal {
  Proposal!: DealProposal;
  State!: DealState;
}

export interface Signature {
  Data: string;
  Type: number;
};

export interface SignedMessage {
  Message: Message;
  Signature: Signature;
};

/**
 * Interface to be implemented by all providers.
 *
 * @public
 */
export interface Provider {

  /**
   *
   * @param message - The message to send
   * @returns The signed message sent
   */
  sendMessage(message: Message): Promise<SignedMessage>;
  sendMessageSigned(message: SignedMessage): Promise<string>;
  getMessage(cid: string): Promise<Message>;

}
