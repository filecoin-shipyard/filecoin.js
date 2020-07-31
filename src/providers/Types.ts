import { BigNumber } from 'bignumber.js';

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

  BLSAggregate!: {
    Type: number;
    Data: string;
  };

  Timestamp!: number;

  BlockSig!: {
    Type: number;
    Data: string;
  };

  ForkSignaling!: number;
}

export class TipSet {
  Cids!: Cid[];
  Blocks!: BlockHeader[];
  Height!: number;
}

export class Version {
  Version!: string;
  APIVersion!: number;
  BlockDelay!: number;
};

export class Message {
  Version!: bigint;

  To!: string;

  From!: string;

  Nonce!: bigint;

  Value!: BigNumber;

  GasPrice!: BigNumber;

  Method!: bigint;

  Params!: ArrayBuffer;
};

export interface SignedMessage {
  Message: Message;
  Signature: string;
}

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

export interface Signer {

}
