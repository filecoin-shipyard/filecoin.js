import { BigNumber } from 'bignumber.js';
export declare enum SigType {
    SigTypeSecp256k1 = 1,
    SigTypeBLS = 2
}
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
    BLSAggregate: Signature;
    Timestamp: number;
    BlockSig: Signature;
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
    Version?: number;
    To: string;
    From: string;
    Nonce: number;
    Value: BigNumber;
    GasPrice: BigNumber;
    GasLimit: number;
    Method: number;
    Params: string;
}
export declare class HeadChange {
    Type: 'current' | string;
    Val: TipSet;
}
export interface Signature {
    Data: string;
    Type: number;
}
export interface SignedMessage {
    Message: Message;
    Signature: Signature;
}
export interface Provider {
    sendMessage(message: Message): Promise<SignedMessage>;
    sendMessageSigned(message: SignedMessage): Promise<string>;
    getMessage(cid: string): Promise<Message>;
}
//# sourceMappingURL=Types.d.ts.map