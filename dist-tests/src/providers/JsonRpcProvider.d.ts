import { Version, Cid, TipSet } from './Types';
import { Connector } from '../connectors/Connector';
export declare class JsonRpcProvider {
    conn: Connector;
    constructor(connector: Connector);
    version(): Promise<Version>;
    readObj(cid: Cid): Promise<string>;
    getBlockMessages(blockCid: Cid): Promise<any>;
    getHead(): Promise<TipSet>;
    getBlock(blockCid: Cid): Promise<TipSet>;
    notify(): Promise<any>;
}
//# sourceMappingURL=JsonRpcProvider.d.ts.map