import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../../testnet/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WebSocketProvider } from '../../src/providers/WebSocketProvider';
import { Cid, Message, SignedMessage } from '../../src/providers/Types';
const httpConnector = new HttpJsonRpcConnector({ url: 'http://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Connection test", function () {
  it("check version", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const version = await con.version();
    assert.equal(version.APIVersion, 2816, 'wrong api version');
  });

  it("should get version [ws]", async function () {
    const provider = new WebSocketProvider('ws://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');
    const version = await provider.version();
    assert.strictEqual(version.APIVersion, 2816, 'wrong api version');
    await provider.release();
  });

  it("should be notified on chain head change [ws]", function(done) {
    const provider = new WebSocketProvider('ws://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');
    provider.chainNotify(headChange => {
      const type = headChange[0].Type;
      assert.strictEqual(type, "current", "wrong chain head type");
      provider.release().then(() => { done() });
    })
  });

  it("should get messages in block [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.getBlockMessages({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});;
    assert.strictEqual(JSON.stringify(Object.keys(messages)), JSON.stringify(['BlsMessages', 'SecpkMessages', 'Cids']), "wrong block messages");
  });

  it("should get messages in block [ws]", async function() {
    const provider = new WebSocketProvider('ws://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');
    const messages = await provider.getBlockMessages({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});
    assert.strictEqual(JSON.stringify(Object.keys(messages)), JSON.stringify(['BlsMessages', 'SecpkMessages', 'Cids']), "wrong block messages");
    await provider.release();
  });

  it("should get head [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const head = await con.getHead();
    assert.strictEqual(JSON.stringify(Object.keys(head)), JSON.stringify(['Cids', 'Blocks', 'Height']), "wrong chain head");
  });

  it("should get chain head [ws]", async function() {
    const provider = new WebSocketProvider('ws://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');
    const head = await provider.getHead();
    assert.strictEqual(JSON.stringify(Object.keys(head)), JSON.stringify(['Cids', 'Blocks', 'Height']), "wrong chain head");
    await provider.release();
  });
});
