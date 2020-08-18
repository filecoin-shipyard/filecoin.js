import { Version, Cid, TipSet, HeadChange } from './Types';
import { WsJsonRpcConnector } from '../connectors/WsJsonRpcConnector';
export declare class WebSocketProvider {
    connector: WsJsonRpcConnector;
    constructor(url: string, token?: string);
    version(): Promise<Version>;
    readObj(cid: Cid): Promise<string>;
    getBlockMessages(blockCid: Cid): Promise<any>;
    getHead(): Promise<TipSet>;
    getBlock(blockCid: Cid): Promise<TipSet>;
    chainNotify(cb: (data: HeadChange[]) => void): void;
}
//# sourceMappingURL=WebSocketProvider.d.ts.map