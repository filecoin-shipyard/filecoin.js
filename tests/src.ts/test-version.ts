import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../../testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WebSocketProvider } from '../../src/providers/WebSocketProvider';
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';
import BigNumber from 'bignumber.js';
import { Cid } from "../../src/providers/Types";

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const walletLotus = new HttpJsonRpcWalletProvider({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

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

  const blocksWithMessages: any = [];

  it("get blocks with messages [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const res: any = await con.getTipSetByHeight(30);
    let parentCid = res.Blocks[0].Parents[0];
    let crtBlock = res.Cids[0];
    while (parentCid) {
      const block: any = await con.getBlock(parentCid);
      const messages = await con.getBlockMessages(parentCid);
      if (messages.BlsMessages.length > 0) blocksWithMessages.push (crtBlock);
      crtBlock = parentCid;
      parentCid = block.Parents? block.Parents[0] : null;
    }
  });

  /*
  it("should send signed message [http]", async function(done) {
    const accounts = await walletLotus.getAccounts();

    const secpAddress = accounts[0];
    const defaultAccount = await walletLotus.getDefaultAccount();

    const message = {
      From: defaultAccount,
      To: secpAddress,
      GasLimit: 584085,
      GasFeeCap: new BigNumber(5840850000000),
      GasPremium: new BigNumber(1000),
      Value: new BigNumber(1),
      Method: 0,
      Params: '',
      Version: 0,
      Nonce: await walletLotus.getNonce(defaultAccount)
    };

    //const signedMessage1 = await walletLotus.sendMessage(message);
    //console.log(signedMessage1);
    const signedMessage2 = await walletLotus.signMessage(message);
    console.log(signedMessage2);
    const msgCid = await walletLotus.sendSignedMessage(signedMessage2);
    console.log (msgCid);
  });
  */

  it("should be notified on chain head change [ws]", function(done) {
    this.timeout(4000);
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    provider.chainNotify(headChange => {
      const type = headChange[0].Type;
      assert.equal(typeof(type), "string", "wrong chain head type");
      provider.release().then(() => { done() });
    })
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

  it("should get messages in block [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.getBlockMessages(blocksWithMessages[0]);
    assert.strictEqual(JSON.stringify(Object.keys(messages)), JSON.stringify(['BlsMessages', 'SecpkMessages', 'Cids']), "wrong block messages");
  });

  it("should get messages in block [ws]", async function() {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const messages = await provider.getBlockMessages(blocksWithMessages[0]);
    assert.strictEqual(JSON.stringify(Object.keys(messages)), JSON.stringify(['BlsMessages', 'SecpkMessages', 'Cids']), "wrong block messages");
    await provider.release();
  });

  it("should get block parent receipts [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const receipts = await con.getParentReceipts(blocksWithMessages[0]);
    assert.strictEqual(typeof receipts[0].GasUsed, "number", "invalid receipts");
  });

  it("should get block parent receipts [ws]", async function() {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const receipts = await provider.getParentReceipts(blocksWithMessages[0]);
    assert.strictEqual(typeof receipts[0].GasUsed, "number", "invalid receipts");
    await provider.release();
  });

  it("should get block parent messages [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.getParentMessages(blocksWithMessages[0]);
    assert.strictEqual(typeof messages[0].Message.Nonce, "number", "invalid message");
  });

  it("should get block parent messages [ws]", async function() {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const messages = await provider.getParentMessages(blocksWithMessages[0]);
    assert.strictEqual(typeof messages[0].Message.Nonce, "number", "invalid message");
    await provider.release();
  });

  it("should check obj exists in the chain [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const isInChain = await con.hasObj(blocksWithMessages[0]);
    assert.strictEqual(isInChain, true, "CID doesn't exists in the chain blockstore");
  });

  it("should check obj exists in the chain [ws]", async function() {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const isInChain = await provider.hasObj(blocksWithMessages[0]);
    assert.strictEqual(isInChain, true, "CID doesn't exists in the chain blockstore");
    await provider.release();
  });

});
