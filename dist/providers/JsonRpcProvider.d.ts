import { Version, Cid, TipSet } from './Types';
import { Connector } from '../connectors/Connector';
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
//# sourceMappingURL=JsonRpcProvider.d.ts.map