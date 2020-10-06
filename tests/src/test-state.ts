import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Connection test", function () {
  const blocksWithMessages: any = [];

  it("get blocks with messages [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const res: any = await con.chain.getTipSetByHeight(30);

    let parentCid = res.Blocks[0].Parents[0];
    let crtBlock = res.Cids[0];
    while (parentCid) {
      let block: any = undefined;
      try {
        block = await con.chain.getBlock(parentCid);
      } catch(e) {};

      if (block){
        const messages = await con.chain.getBlockMessages(parentCid);
        if (messages.BlsMessages.length > 0) blocksWithMessages.push (crtBlock);
        crtBlock = parentCid;
        parentCid = block.Parents? block.Parents[0] : null;
      } else {
        parentCid = undefined;
      }
    }

  });

  it("should get block parent receipts [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const receipts = await con.chain.getParentReceipts(blocksWithMessages[0]);
    assert.strictEqual(typeof receipts[0].GasUsed, "number", "invalid receipts");
  });

  it("should get block parent receipts [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const receipts = await provider.chain.getParentReceipts(blocksWithMessages[0]);
    assert.strictEqual(typeof receipts[0].GasUsed, "number", "invalid receipts");
    await provider.release();
  });

  it("should get block parent messages [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.chain.getParentMessages(blocksWithMessages[0]);
    assert.strictEqual(typeof messages[0].Message.Nonce, "number", "invalid message");
  });

  it("should get block parent messages [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const messages = await provider.chain.getParentMessages(blocksWithMessages[0]);
    assert.strictEqual(typeof messages[0].Message.Nonce, "number", "invalid message");
    await provider.release();
  });

  it("should run the given message", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const messages = await provider.state.listMessages({
      To: 't01000'
    });
    const message = await provider.chain.getMessage(messages[0])
    const result = await provider.state.stateCall(message);
    const valid = !!result.ExecutionTrace && !!result.Msg && !!result.MsgRct;
    assert.strictEqual(valid, true, "failed to run message");
  });

  it("should get actor [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const actor = await con.state.getActor('t01000');
    assert.strictEqual( typeof actor.Balance === 'string', true, "invalid actor");
  });

  it("should get state [http]", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const state = await con.state.readState('t01000');
    assert.strictEqual(JSON.stringify(Object.keys(state)), JSON.stringify(['Balance', 'State']), 'invalid state');
  });

  it("should list messages [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.state.listMessages({
      To: 't01000'
    });
    assert.strictEqual(Array.isArray(messages) && messages.length > 0, true, 'invalid list of messages');
  });

  it("should get network name [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const network = await con.state.networkName();
    assert.strictEqual(typeof network === 'string', true, 'invalid network name');
  });

  it("should get miner sectors info [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const sectors = await con.state.minerSectors('t01000');
    const valid = sectors.reduce((acc, sector) => acc === false ? acc : typeof sector.SectorNumber === 'number', true);
    assert.strictEqual(valid, true, 'invalid sectors info');
  });

  it("should get miner active sectors info [http]", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const sectors = await con.state.minerActiveSectors('t01000');
    const valid = sectors.reduce((acc, sector) => acc === false ? acc : typeof sector.SectorNumber === 'number', true);
    assert.strictEqual(valid, true, 'invalid active sectors info');
  });

  it("should get miner proving deadline", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const provingDeadline = await con.state.minerProvingDeadline('t01000');
    assert.strictEqual(typeof provingDeadline.Index === 'number', true, 'invalid miner proving deadline');
  });

  it("should get miner power", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const power = await con.state.minerPower('t01000');
    assert.strictEqual(typeof power.MinerPower.RawBytePower === 'string', true, 'invalid miner power');
  });

  it("should get miner info", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const minerInfo = await con.state.minerInfo('t01000');
    assert.strictEqual(typeof minerInfo.Owner === 'string', true, 'invalid miner info');
  });

  it("should get miner deadlines", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const minerDeadlines = await con.state.minerDeadlines('t01000');
    const valid = minerDeadlines.reduce((acc, deadline) => acc === false ? false : Array.isArray(deadline.PostSubmissions), true);
    assert.strictEqual(valid, true, 'invalid miner deadlines');
  });

  it("should get miner partitions", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const minerPartitions = await con.state.minerPartitions('t01000', 0);
    const valid = minerPartitions.reduce((acc, partition) => acc === false ? false : Array.isArray(partition.AllSectors), true);
    assert.strictEqual(valid, true, 'invalid miner partitions');
  });

  it("should get the faulty sectors of a miner", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const minerFaults = await con.state.minerFaults('t01000');
    assert.strictEqual(minerFaults === null || Array.isArray(minerFaults), true, 'invalid miner faulty sectors');
  });

  // TODO: test on hold. The method has a bug
  // it("should get all faulty sectors", async function () {
  //   const con = new JsonRpcProvider(httpConnector);
  //   const minerFaults = await con.allMinerFaults(182);
  // });

  it("should get the recovering sectors of a miner", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const recoveries = await con.state.minerRecoveries('t01000');
    assert.strictEqual(recoveries === null || Array.isArray(recoveries), true, 'invalid miner recovering sectors');
  });

  it("should get the precommit deposit for the specified miner's sector", async function () {
    const con = new JsonRpcProvider(httpConnector);
    const deposit = await con.state.minerPreCommitDepositForPower('t01000',        {
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
    const collateral = await con.state.minerInitialPledgeCollateral('t01000',        {
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
    const balance = await con.state.minerAvailableBalance('t01000');
    assert.strictEqual(typeof balance === 'string', true, "invalid miner's balance that can be withdrawn or spent");
  });

  // TODO: It throws an error: precommit not found
  // it("should get the PreCommit info for the specified miner's sector", async function () {
  //   const con = new JsonRpcProvider(httpConnector);
  //   const preCommitInfo = await con.state.sectorPreCommitInfo('t01000', 0);
  // });

  it("should return info for the specified miner's sector", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const info = await con.state.sectorGetInfo('t01000', 0);
    assert.strictEqual(info.SectorNumber === 0, true, "invalid info for the specified miner's sector");
  });

  it("should get epoch at which given sector will expire", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const expiration = await con.state.sectorExpiration('t01000', 0);
    assert.strictEqual(typeof expiration.OnTime === 'number', true, "invalid epoch at which given sector will expire");
  });

  it("should get deadline/partition with the specified sector", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const partition = await con.state.sectorPartition('t01000', 0);
    assert.strictEqual(typeof partition.Partition === 'number', true, "invalid deadline/partition with the specified sector");
  });

  it("should search for message and return its receipt and the tipset where it was executed", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.state.listMessages({
      To: 't01000'
    });
    const receipt = await con.state.searchMsg(messages[0]);
    assert.strictEqual(typeof receipt.Height === 'number', true, "invalid height for searched messages");
  });

  it("should wait for message", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.state.listMessages({
      To: 't01000'
    });
    const lookup = await con.state.waitMsg(messages[0], 10);
    assert.strictEqual(typeof lookup.Height === 'number', true, "invalid lookup info for waited messages");
  });

  it("should list miners", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const miners = await con.state.listMiners();
    assert.strictEqual(Array.isArray(miners), true, "invalid list of miners");
  });

  it("should list actors", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const actors = await con.state.listActors();
    assert.strictEqual(Array.isArray(actors), true, "invalid list of actors");
  });

  it("should get market balance", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const marketBalance = await con.state.marketBalance('t01000');
    assert.strictEqual(typeof marketBalance.Escrow === 'string', true, "invalid market balance");
  });

  /*
  disabled temporarily: Error: locked funds not found
  it("should get market participants", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const marketBalance = await con.marketParticipants();
    assert.strictEqual(typeof marketBalance === 'object', true, "invalid market participants");
  });
  */

  it("should get market deals", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const marketDeals = await con.state.marketDeals();
    let valid = typeof marketDeals === 'object';
    const keys = Object.keys(marketDeals);

    if (valid && keys.length > 0) {
      valid = typeof marketDeals[keys[0]].Proposal.PieceSize === 'number';
    }

    assert.strictEqual(valid, true, "invalid market deals");
  });

  it("should get information about the storage deal", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const marketDeal = await con.state.marketStorageDeal(0);
    assert.strictEqual(!!marketDeal.Proposal.PieceCID, true, "invalid information about the storage deal");
  });

  it("should get the ID address of the given address", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const id = await con.state.lookupId('t01000');
    assert.strictEqual(typeof id === 'string', true, "invalid ID address");
  });

  it("should get the public key address of the given ID address", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const key = await con.state.accountKey('t01002');
    assert.strictEqual(typeof key === 'string', true, "public key address of the given ID address");
  });

  // TODO: Fix error: "failed to load hamt node: cbor input had wrong number of fields" and add assertion
  // it("should return all the actors whose states change", async function() {
  //   const con = new JsonRpcProvider(httpConnector);
  //   const tipSet = await con.getTipSetByHeight(1);
  //   const tipSet2 = await con.getTipSetByHeight(30);
  //   const actors = await con.changedActors(tipSet.Cids[0], tipSet2.Cids[0]);
  // });

  it("should return the message receipt for the given message", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.state.listMessages({
      To: 't01000'
    });
    const receipt = await con.state.getReceipt(messages[0]);
    assert.strictEqual(typeof receipt.ExitCode === 'number', true, "invalid message receipt");
  });

  it("should return the number of sectors in a miner's sector set", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const sectors = await con.state.minerSectorCount('t01000');
    assert.strictEqual(typeof sectors.Active === 'number', true, "invalid number of sectors");
  });

  it("should apply the messages", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const messages = await con.state.listMessages({
      To: 't01000'
    });
    const message = await con.chain.getMessage(messages[0]);
    const state = await con.state.compute(10, [message]);
    assert.strictEqual(!!state.Root['/'], true, "invalid state after compute");
  });

  it("should return the data cap for the given address", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const status = await con.state.verifiedClientStatus('t01000');
    assert.strictEqual(status === null || typeof status === 'string', true, "invalid data cap");
  });

  it("should return min and max collateral a storage provider can issue", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const collateralBounds = await con.state.dealProviderCollateralBounds(Math.pow(1024, 2), true);
    const valid = typeof collateralBounds.Min === 'string' && typeof collateralBounds.Max === 'string'
    assert.strictEqual(valid, true, "invalid collateral a storage provider can issue");
  });

  it("the circulating supply of Filecoin at the given tipset", async function() {
    const con = new JsonRpcProvider(httpConnector);
    const supply = await con.state.circulatingSupply();
    const valid = Object
      .keys(supply)
      .reduce((acc, key) => acc === false ? acc : typeof key === 'string', true);
    assert.strictEqual(valid, true, "invalid circulating supply of Filecoin");
  });
});
