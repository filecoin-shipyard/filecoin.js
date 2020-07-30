
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

declare class Cid {
    '/': string;
}

declare interface Connector {
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    exec(method: string, params?: any[]): Promise<any>;
    on(event: 'connected' | 'disconnected', listener: (...args: any[]) => void): this;
}

export declare class JsonRpcProvider {
    url: string;
    conn: Connector;
    constructor(url: string);
    version(): Promise<Version>;
    readObj(cid: Cid): Promise<string>;
    getBlockMessages(blockCid: Cid): Promise<any>;
    getHead(): Promise<TipSet>;
    getBlock(blockCid: Cid): Promise<TipSet>;
}

declare class TipSet {
    Cids: Cid[];
    Blocks: BlockHeader[];
    Height: number;
}

declare class Version {
    Version: string;
    APIVersion: number;
    BlockDelay: number;
}

export { }
