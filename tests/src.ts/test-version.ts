import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../../testnet/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WebSocketProvider } from '../../src/providers/WebSocketProvider';
const httpConnector = new HttpJsonRpcConnector({ url: 'http://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Connection test", function () {
  it("check version", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const version = await con.version();
    assert.equal(version.APIVersion, 2816, 'wrong api version');
  });

  it("should get version using ws", async function () {
    const provider = new WebSocketProvider('ws://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');
    const version = await provider.version();
    assert.strictEqual(version.APIVersion, 2816, 'wrong api version');
    await provider.release();
  });

  it("should be notified on chain head change", function(done) {
    const provider = new WebSocketProvider('ws://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');
    provider.chainNotify(headChange => {
      const type = headChange[0].Type;
      assert.strictEqual(type, "current", "wrong chain head type");
      provider.release().then(() => { done() });
    })
  });
});
