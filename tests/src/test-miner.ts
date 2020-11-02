import assert from "assert";

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { LotusClient } from '../../src/providers/LotusClient';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Miner tests", function() {
  it("should get miner info [http]", async function() {
    const provider = new LotusClient(httpConnector);
    const headTipset = await provider.chain.getHead();
    const tipsetHeight = headTipset.Blocks[0].Height;
    const minerInfo = await provider.miner.getBaseInfo('t01000', tipsetHeight-2, [headTipset.Cids[0]]);
    assert.strictEqual(minerInfo.EligibleForMining, true, 'invalid response');
  });

  it("should get miner info [ws]", async function() {
    const provider = new LotusClient(wsConnector);
    const headTipset = await provider.chain.getHead();
    const tipsetHeight = headTipset.Blocks[0].Height;
    const minerInfo = await provider.miner.getBaseInfo('t01000', tipsetHeight, [headTipset.Cids[0]]);
    assert.strictEqual(minerInfo.EligibleForMining, true, 'invalid response');
    await provider.release();
  });
});
