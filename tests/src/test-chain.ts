import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';
import Timer = NodeJS.Timer;
import { ObjStat } from '../../src/providers/Types';

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0' });

describe("Chain methods", function() {
  it("statistics about the graph", async () => {
    const provider = new JsonRpcProvider(httpConnector);
    const tipset1 = await provider.chain.getTipSetByHeight(1);
    const tipset2 = await provider.chain.getTipSetByHeight(10);
    const stat = await provider.chain.statObj(tipset2.Cids[0]);
    const diffStat = await provider.chain.statObj(tipset2.Cids[0], tipset1.Cids[0]);
    const isStatValid = (stat: ObjStat) => typeof stat.Size === 'number' && typeof stat.Links === 'number';
    assert.strictEqual(isStatValid(stat) && isStatValid(diffStat), true, 'invalid obj statistics');
  });

  it("get genesis", async () => {
    const provider = new JsonRpcProvider(httpConnector);
    const genesisTipSet = await provider.chain.getGenesis();
    const valid =
      Array.isArray(genesisTipSet.Cids) &&
      Array.isArray(genesisTipSet.Blocks) &&
      typeof genesisTipSet.Height === 'number';
    assert.strictEqual(valid, true, 'invalid genesis tipSet');
  });

  it("get tipSet weight", async () => {
    const provider = new JsonRpcProvider(httpConnector);
    const tipSetWeight = await provider.chain.getTipSetWeight();
    assert.strictEqual(typeof tipSetWeight === 'string', true, 'invalid tipSet weight');
  });

  it("get path", async () => {
    const provider = new JsonRpcProvider(httpConnector);
    const tipSet = await provider.chain.getTipSetByHeight(1);
    const tipSet2 = await provider.chain.getTipSetByHeight(10);
    const path = await provider.chain.getPath([tipSet.Cids[0]], [tipSet2.Cids[0]]);
    const typeValid = path.reduce((acc, pathItem) => acc === false ? acc : typeof pathItem.Type === 'string', true);
    assert.strictEqual(typeValid, true, 'invalid path');
  });

  it("should read obj", async () => {
    const provider = new JsonRpcProvider(httpConnector);
    const tipSet = await provider.chain.getTipSetByHeight(1);
    const obj = await provider.chain.readObj(tipSet.Cids[0]);
    assert.strictEqual(typeof obj === 'string', true, 'invalid obj');
  });

  it("should get messages in block [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const tipSet = await provider.chain.getTipSetByHeight(1);
    const messages = await provider.chain.getBlockMessages(tipSet.Cids[0]);
    assert.strictEqual(JSON.stringify(Object.keys(messages)), JSON.stringify(['BlsMessages', 'SecpkMessages', 'Cids']), "wrong block messages");
    await provider.release();
  });

  it("should get messages in block [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const tipSet = await provider.chain.getTipSetByHeight(1);
    const messages = await provider.chain.getBlockMessages(tipSet.Cids[0]);
    assert.strictEqual(JSON.stringify(Object.keys(messages)), JSON.stringify(['BlsMessages', 'SecpkMessages', 'Cids']), "wrong block messages");
  });

  it("should be notified on chain head change [ws]", function(done) {
    this.timeout(4000);
    const provider = new JsonRpcProvider(wsConnector);
    provider.chain.chainNotify(headChange => {
      const type = headChange[0].Type;
      assert.equal(typeof(type), "string", "wrong chain head type");
      provider.release().then(() => { done() });
    })
  });

  it("should be notified on chain head change [http]", function(done) {
    this.timeout(4000);
    let intervalId: Timer | undefined;
    const provider = new JsonRpcProvider(httpConnector);
    provider.chain.chainNotify(headChange => {
      const type = headChange[0].Type;
      assert.strictEqual(typeof(type), "string", "wrong chain head type");
      if (intervalId) {
        provider.chain.stopChainNotify(intervalId);
      }
      done();
    }).then(intervalIdResponse => {
      intervalId = intervalIdResponse;
    })
  });

  it("should get head [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const head = await con.chain.getHead();
    assert.strictEqual(JSON.stringify(Object.keys(head)), JSON.stringify(['Cids', 'Blocks', 'Height']), "wrong chain head");
  });

  it("should get chain head [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const head = await provider.chain.getHead();
    assert.strictEqual(JSON.stringify(Object.keys(head)), JSON.stringify(['Cids', 'Blocks', 'Height']), "wrong chain head");
    await provider.release();
  });

  it("should get block", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const tipSet = await provider.chain.getTipSetByHeight(1);
    const block = await provider.chain.getBlock(tipSet.Cids[0]);
    assert.strictEqual(typeof block.Miner === 'string', true, "invalid block");
  });

  it("should get message", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.state.listMessages({
      To: 't01000'
    });
    const message = await con.chain.getMessage(messages[0]);
    assert.strictEqual(message.To === 't01000', true, "invalid message");
  });

  it("should check obj exists in the chain [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const tipSet = await con.chain.getTipSetByHeight(1);
    const isInChain = await con.chain.hasObj(tipSet.Cids[0]);
    assert.strictEqual(isInChain, true, "CID doesn't exists in the chain blockstore");
  });

  it("should check obj exists in the chain [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const tipSet = await provider.chain.getTipSetByHeight(1);
    const isInChain = await provider.chain.hasObj(tipSet.Cids[0]);
    assert.strictEqual(isInChain, true, "CID doesn't exists in the chain blockstore");
    await provider.release();
  });

  // TODO: Fix error
  // it("export chain", async () => {
  //   const provider = new JsonRpcProvider(httpConnector);
  //   const tipSet = await provider.getTipSetByHeight(1);
  //   const tipSet2 = await provider.getTipSetByHeight(10);
  //   const path = await provider.export(100, [tipSet2.Cids[0]]);
  //   console.log('path', path);
  //   // assert.strictEqual(typeValid, true, 'invalid path');
  // });
});
