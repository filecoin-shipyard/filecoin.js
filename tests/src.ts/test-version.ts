import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../../testnet/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WebSocketProvider } from '../../src/providers/WebSocketProvider';
import { Cid, Message, SignedMessage } from '../../src/providers/Types';
const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Connection test", function () {
  it("check version [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const version = await con.version();
    assert.equal(version.APIVersion, 2816, 'wrong api version');
  });

  it("should get version [ws]", async function () {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const version = await provider.version();
    assert.strictEqual(version.APIVersion, 2816, 'wrong api version');
    await provider.release();
  });

  it("should be notified on chain head change [ws]", function(done) {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    provider.chainNotify(headChange => {
      const type = headChange[0].Type;
      assert.strictEqual(type, "current", "wrong chain head type");
      provider.release().then(() => { done() });
    })
  });

  it("should get messages in block [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.getBlockMessages({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});
    assert.strictEqual(JSON.stringify(Object.keys(messages)), JSON.stringify(['BlsMessages', 'SecpkMessages', 'Cids']), "wrong block messages");
  });

  it("should get messages in block [ws]", async function() {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
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
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const head = await provider.getHead();
    assert.strictEqual(JSON.stringify(Object.keys(head)), JSON.stringify(['Cids', 'Blocks', 'Height']), "wrong chain head");
    await provider.release();
  });

  it("should get block parent receipts [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const receipts = await con.getParentReceipts({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});
    assert.strictEqual(typeof receipts[0].GasUsed, "number", "invalid receipts");
  });

  it("should get block parent receipts [ws]", async function() {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const receipts = await provider.getParentReceipts({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});
    assert.strictEqual(typeof receipts[0].GasUsed, "number", "invalid receipts");
    await provider.release();
  });

  it("should get block parent messages [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.getParentMessages({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});
    assert.strictEqual(typeof messages[0].Message.Nonce, "number", "invalid message");
  });

  it("should get block parent messages [ws]", async function() {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const messages = await provider.getParentMessages({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});
    assert.strictEqual(typeof messages[0].Message.Nonce, "number", "invalid message");
    await provider.release();
  });

  it("should check obj exists in the chain [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const isInChain = await con.hasObj({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});
    assert.strictEqual(isInChain, true, "CID doesn't exists in the chain blockstore");
  });

  it("should check obj exists in the chain [ws]", async function() {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const isInChain = await provider.hasObj({'/': 'bafy2bzaceaiwhoa7h5dxkmd4z4vgubwtvazjmqfpftc2ao5r5vjfwdu7qnq7g'});
    assert.strictEqual(isInChain, true, "CID doesn't exists in the chain blockstore");
    await provider.release();
  });
});
