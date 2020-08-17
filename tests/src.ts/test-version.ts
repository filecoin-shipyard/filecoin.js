import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../../testnet/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Connection test", function() {
  it("check version", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const version = await con.version();
    assert.deepEqual(version, {Version: '0.4.1+debug+git.3f017688', APIVersion: 1536, BlockDelay: 2 }, "wrong version");
  });

  it("check version ws", async function() {
    await wsConnector.connect();
    const con = new JsonRpcProvider(wsConnector);
    const version = await con.version();
    assert.deepEqual(version, {Version: '0.4.1+debug+git.3f017688', APIVersion: 1536, BlockDelay: 2 }, "wrong version");
  });
});
