import assert from "assert";

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Auth tests", function() {
  it("should verify auth token [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const permissions = await provider.auth.verify(LOTUS_AUTH_TOKEN);
    assert.strictEqual(Array.isArray(permissions), true, 'invalid permissions array');
  });

  it("should verify auth token [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const permissions = await provider.auth.verify(LOTUS_AUTH_TOKEN);
    assert.strictEqual(Array.isArray(permissions), true, 'invalid permissions array');
    await provider.release();
  });

  it("should generate auth token with given permissions [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const token = await provider.auth.new(['write']);
    assert.strictEqual(typeof token === 'string', true, 'invalid new auth token');
  });

  it("should generate auth token with given permissions [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const token = await provider.auth.new(['write']);
    assert.strictEqual(typeof token === 'string', true, 'invalid new auth token');
    await provider.release();
  });
});
