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
export type TokenAmount = number;
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
 * Deadline calculations with respect to a current epoch. "Deadline" refers to the window during which proofs may be submitted.
 * Windows are non-overlapping ranges [Open, Close), but the challenge epoch for a window occurs before the window opens.
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
