import { BigNumber } from 'bignumber.js';
export declare class Cid {
    '/': string;
}
export declare class BlockHeader {
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
    BLSAggregate: {
        Type: number;
        Data: string;
    };
    Timestamp: number;
    BlockSig: {
        Type: number;
        Data: string;
    };
    ForkSignaling: number;
}
export declare class TipSet {
    Cids: Cid[];
    Blocks: BlockHeader[];
    Height: number;
}
export declare class Version {
    Version: string;
    APIVersion: number;
    BlockDelay: number;
}
export declare class Message {
    Version: bigint;
    To: string;
    From: string;
    Nonce: bigint;
    Value: BigNumber;
    GasPrice: BigNumber;
    Method: bigint;
    Params: ArrayBuffer;
}
export interface SignedMessage {
    Message: Message;
    Signature: string;
}
export interface Provider {
    sendMessage(message: Message): Promise<SignedMessage>;
    sendMessageSigned(message: SignedMessage): Promise<string>;
    getMessage(cid: string): Promise<Message>;
}
export interface Signer {
}
//# sourceMappingURL=Types.d.ts.map