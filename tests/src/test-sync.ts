import assert from "assert";

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe.only("Sync", function() {
  it("should get the current status of the Lotus sync [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const state = await provider.syncState();
    assert.strictEqual(Array.isArray(state.ActiveSyncs), true, 'invalid sync state');
  });

  it("should get the current status of the Lotus sync [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const state = await provider.syncState();
    assert.strictEqual(Array.isArray(state.ActiveSyncs), true, 'invalid sync state');
    await provider.release();
  });
});
