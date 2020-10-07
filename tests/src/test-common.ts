import assert from "assert";

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Common tests", function() {
  it("should generate auth token with given permissions [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const peerId = await provider.common.id();
    assert.strictEqual(typeof peerId === 'string', true, 'invalid peer id');
  });

  it("should generate auth token with given permissions [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const peerId = await provider.common.id();
    assert.strictEqual(typeof peerId === 'string', true, 'invalid peer id');
    await provider.release();
  });

  it("check version [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const version = await con.common.version();
    assert.strictEqual(typeof version.APIVersion === 'number', true, 'wrong api version');
  });

  it("should get version [ws]", async function () {
    const provider = new JsonRpcProvider(wsConnector);
    const version = await provider.common.version();
    assert.strictEqual(typeof version.APIVersion === 'number', true, 'wrong api version');
    await provider.release();
  });

  it("should get log list [http]", async function () {
    const provider = new JsonRpcProvider(httpConnector);
    const list = await provider.common.logList();
    assert.strictEqual(Array.isArray(list), true, 'invalid log list');
  });

  it("should get log list [ws]", async function () {
    const provider = new JsonRpcProvider(wsConnector);
    const list = await provider.common.logList();
    assert.strictEqual(Array.isArray(list), true, 'invalid log list');
    await provider.release();
  });
});
