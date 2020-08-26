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
    assert.equal(version.APIVersion, 3328, 'wrong api version');
  });

  it("should get version [ws]", async function () {
    const provider = new WebSocketProvider('ws://localhost:8000/rpc/v0');
    const version = await provider.version();
    assert.strictEqual(version.APIVersion, 3328, 'wrong api version');
    await provider.release();
  });

  const blocksWithMessages: any = [];

  it("get blocks with messages [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const res: any = await con.getTipSetByHeight(30);

    let parentCid = res.Blocks[0].Parents[0];
    let crtBlock = res.Cids[0];
    while (parentCid) {
      let block: any = undefined;
      try {
        block = await con.getBlock(parentCid);
      } catch(e) {};

      if (block){
        const messages = await con.getBlockMessages(parentCid);
        if (messages.BlsMessages.length > 0) blocksWithMessages.push (crtBlock);
        crtBlock = parentCid;
        parentCid = block.Parents? block.Parents[0] : null;
      } else {
        parentCid = undefined;
      }
    }

  });

  it("should send signed message [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const accounts = await walletLotus.getAccounts();

    const secpAddress = accounts[0];
    const defaultAccount = await walletLotus.getDefaultAccount();

    const message = await walletLotus.createMessage({
      From: defaultAccount,
      To: secpAddress,
      Value: new BigNumber(1),
    });

    const signedMessage = await walletLotus.signMessage(message);
    const msgCid = await walletLotus.sendSignedMessage(signedMessage);

    const isMined = await con.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
  });

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

  // it("should run the given message", async function() {
  //   const provider = new JsonRpcProvider(httpConnector);
  //   const data = await provider.stateCall();
  // });

  it("should get actor [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const actor = await con.getActor('t01000');
    assert.strictEqual( typeof actor.Balance === 'string', true, "invalid actor");
  });

  it("should get state [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const state = await con.readState('t01000');
    assert.strictEqual(JSON.stringify(Object.keys(state)), JSON.stringify(['Balance', 'State']), 'invalid state');
  });

  it("should list messages [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.listMessages({
      To: 't01000'
    });
    assert.strictEqual(Array.isArray(messages) && messages.length > 0, true, 'invalid list of messages');
  });

  it("should get network name [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const network = await con.networkName();
    assert.strictEqual(typeof network === 'string', true, 'invalid network name');
  });

  it("should get miner sectors info [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const sectors = await con.minerSectors('t01000');
    const valid = sectors.reduce((acc, sector) => acc === false ? acc : typeof sector.Info.SectorNumber === 'number', true);
    assert.strictEqual(valid, true, 'invalid sectors info');
  });

  it("should get miner active sectors info [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const sectors = await con.minerActiveSectors('t01000');
    const valid = sectors.reduce((acc, sector) => acc === false ? acc : typeof sector.Info.SectorNumber === 'number', true);
    assert.strictEqual(valid, true, 'invalid active sectors info');
  });

  it("should get miner proving deadline", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const provingDeadline = await con.minerProvingDeadline('t01000');
    assert.strictEqual(typeof provingDeadline.Index === 'number', true, 'invalid miner proving deadline');
  });

  it("should get miner power", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const power = await con.minerPower('t01000');
    assert.strictEqual(typeof power.MinerPower.RawBytePower === 'string', true, 'invalid miner power');
  });

  it("should get miner info", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const minerInfo = await con.minerInfo('t01000');
    assert.strictEqual(typeof minerInfo.Owner === 'string', true, 'invalid miner info');
  });

  it("should get miner deadlines", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const minerDeadlines = await con.minerDeadlines('t01000');
    const valid = minerDeadlines.reduce((acc, deadline) => acc === false ? false : !!deadline.Partitions, true);
    assert.strictEqual(valid, true, 'invalid miner deadlines');
  });

  it("should get miner partitions", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const minerPartitions = await con.minerPartitions('t01000', 0);
    const valid = minerPartitions.reduce((acc, partition) => acc === false ? false : !!partition.Sectors, true);
    assert.strictEqual(valid, true, 'invalid miner partitions');
  });

  it("should get the faulty sectors of a miner", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const minerFaults = await con.minerFaults('t01000');
    assert.strictEqual(minerFaults === null || Array.isArray(minerFaults), true, 'invalid miner faulty sectors');
  });

  // TODO: Fix test
  // it("should get all faulty sectors", async function () {
  //   const con = new JsonRpcProvider(httpConnector);
  //   const minerFaults = await con.allMinerFaults(182);
  // });

  it("should get the recovering sectors of a miner", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const recoveries = await con.minerRecoveries('t01000');
    assert.strictEqual(recoveries === null || Array.isArray(recoveries), true, 'invalid miner recovering sectors');
  });

  it("should get the precommit deposit for the specified miner's sector", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const deposit = await con.minerPreCommitDepositForPower('t01000',        {
      SealProof: 1,
      SectorNumber: 1,
      SealedCID: {
        "/": "bafy2bzacea3wsdh6y3a36tb3skempjoxqpuyompjbmfeyf34fi3uy6uue42v4"
      },
      SealRandEpoch: 10101,
      DealIDs: null,
      Expiration: 10101,
      ReplaceCapacity: true,
      ReplaceSectorDeadline: 42,
      ReplaceSectorPartition: 42,
      ReplaceSectorNumber: 9
    });
    assert.strictEqual(typeof deposit === 'string', true, "invalid precommit deposit for the specified miner's sector");
  });

  it("should get the initial pledge collateral for the specified miner's sector", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const collateral = await con.minerInitialPledgeCollateral('t01000',        {
      SealProof: 1,
      SectorNumber: 1,
      SealedCID: {
        "/": "bafy2bzacea3wsdh6y3a36tb3skempjoxqpuyompjbmfeyf34fi3uy6uue42v4"
      },
      SealRandEpoch: 10101,
      DealIDs: null,
      Expiration: 10101,
      ReplaceCapacity: true,
      ReplaceSectorDeadline: 42,
      ReplaceSectorPartition: 42,
      ReplaceSectorNumber: 9
    });
    assert.strictEqual(typeof collateral === 'string', true, "invalid pledge collateral for the specified miner's sector");
  });

  it("should get the miner's balance that can be withdrawn or spent", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const balance = await con.minerAvailableBalance('t01000');
    assert.strictEqual(typeof balance === 'string', true, "invalid miner's balance that can be withdrawn or spent");
  });

  // TODO: It throws an error. Check later
  // it("should get the PreCommit info for the specified miner's sector", async function () {
  //   const con = new JsonRpcProvider(httpConnector);
  //   const preCommitInfo = await con.sectorPreCommitInfo('t01000', 2);
  //   console.log('preCommitInfo', preCommitInfo);
  //   // assert.strictEqual(typeof balance === 'string', true, "invalid miner's balance that can be withdrawn or spent");
  // });

  it("should return info for the specified miner's sector", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const info = await con.sectorGetInfo('t01000', 0);
    assert.strictEqual(info.SectorNumber === 0, true, "invalid info for the specified miner's sector");
  });

  it("should get epoch at which given sector will expire", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const expiration = await con.sectorExpiration('t01000', 0);
    assert.strictEqual(typeof expiration.OnTime === 'number', true, "invalid epoch at which given sector will expire");
  });

  it("should get deadline/partition with the specified sector", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const partition = await con.sectorPartition('t01000', 0);
    assert.strictEqual(typeof partition.Partition === 'number', true, "invalid deadline/partition with the specified sector");
  });

  it("should search for message and return its receipt and the tipset where it was executed", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.listMessages({
      To: 't01000'
    });
    const receipt = await con.searchMsg(messages[0]);
    assert.strictEqual(typeof receipt.Height === 'number', true, "invalid height for searched messages");
  });

  it("should wait for message", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.listMessages({
      To: 't01000'
    });
    const lookup = await con.waitMsg(messages[0], 10);
    assert.strictEqual(typeof lookup.Height === 'number', true, "invalid lookup info for waited messages");
  });

  it("should list miners", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const miners = await con.listMiners();
    assert.strictEqual(Array.isArray(miners), true, "invalid list of miners");
  });

  it("should list actors", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const actors = await con.listActors();
    assert.strictEqual(Array.isArray(actors), true, "invalid list of actors");
  });

  it("should get market balance", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const marketBalance = await con.marketBalance('t01000');
    assert.strictEqual(typeof marketBalance.Escrow === 'string', true, "invalid market balance");
  });

  it("should get market participants", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const marketBalance = await con.marketParticipants();
    assert.strictEqual(typeof marketBalance === 'object', true, "invalid market participants");
  });

  it("should get market deals", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const marketDeals = await con.marketDeals();
    let valid = typeof marketDeals === 'object';
    const keys = Object.keys(marketDeals);

    if (valid && keys.length > 0) {
      valid = typeof marketDeals[keys[0]].Proposal.PieceSize === 'number';
    }

    assert.strictEqual(valid, true, "invalid market deals");
  });
});
