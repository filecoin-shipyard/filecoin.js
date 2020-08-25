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
