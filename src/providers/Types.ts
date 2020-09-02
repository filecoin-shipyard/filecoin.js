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
