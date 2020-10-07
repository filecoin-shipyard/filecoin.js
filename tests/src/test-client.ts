import { HttpJsonRpcWalletProvider, JsonRpcProvider } from '../../src';
import assert from "assert";
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const walletLotus = new HttpJsonRpcWalletProvider(httpConnector);

describe("Client tests", function() {
  it("should import file", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const result = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    const valid = typeof result.Root["/"] === 'string' && typeof result.ImportID === 'number';
    assert.strictEqual(valid, true, 'import file failed');
  });

  it("should delete imported file", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const importResult = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    await provider.client.removeImport(importResult.ImportID);
  });

  it("should start deal", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const importResult = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    const dealCid = await provider.client.startDeal({
      Data: {
        TransferType: 'graphsync',
        Root: importResult.Root,
      },
      Miner: 't01000',
      Wallet: await walletLotus.getDefaultAccount(),
      EpochPrice: '1001',
      MinBlocksDuration: 800,
    });
    assert.strictEqual(typeof dealCid["/"] === 'string', true, 'deal start failed');
  });

  it("should get deal info", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const importResult = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    const dealCid = await provider.client.startDeal({
      Data: {
        TransferType: 'graphsync',
        Root: importResult.Root,
      },
      Miner: 't01000',
      Wallet: await walletLotus.getDefaultAccount(),
      EpochPrice: '1002',
      MinBlocksDuration: 800,
    });
    const dealInfo = await provider.client.getDealInfo(dealCid);
    const valid = !!dealInfo.Provider && !!dealInfo.State;
    assert.strictEqual(valid, true, 'invalid deal info');
  });

  it("should list all deals", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const deals = await provider.client.listDeals();
    assert.strictEqual(Array.isArray(deals), true, 'invalid deals list');
  });

  it("should verify if has local", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const importResult = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    const hasLocal = await provider.client.hasLocal(importResult.Root);
    assert.strictEqual(hasLocal, true, 'invalid has local');
  });

  it("should find data", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const importResult = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    await provider.client.startDeal({
      Data: {
        TransferType: 'graphsync',
        Root: importResult.Root,
      },
      Miner: 't01000',
      Wallet: await walletLotus.getDefaultAccount(),
      EpochPrice: '1003',
      MinBlocksDuration: 800,
    });
    const queryOffers = await provider.client.findData(importResult.Root);
    const isValid = queryOffers.reduce((acc, offer, idx) => acc === false ? acc : offer.Root["/"] === importResult.Root["/"], true);
    assert.strictEqual(isValid, true, 'invalid found data');
  });

  it("should get miner query offer", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const importResult = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    const queryOffer = await provider.client.minerQueryOffer('t01000', importResult.Root);
    const isValid = importResult.Root["/"] === queryOffer.Root["/"];
    assert.strictEqual(isValid, true, 'invalid miner query offer');
  });

  // Sealing takes too much
  // it.only("should retrieve file", async function() {
  //   const provider = new JsonRpcProvider(httpConnector);
  //   const importResult = await provider.import({
  //     Path: "/filecoin_miner/original-data.txt",
  //     IsCAR: false,
  //   });
  //   const dealCid = await provider.startDeal({
  //     Data: {
  //       TransferType: 'graphsync',
  //       Root: importResult.Root,
  //     },
  //     Miner: 't01000',
  //     Wallet: await walletLotus.getDefaultAccount(),
  //     EpochPrice: '1000',
  //     MinBlocksDuration: 700000,
  //   });
  //   const queryOffer = await provider.minerQueryOffer('t01000', importResult.Root);
  //   await provider.retrieve({
  //     Root: queryOffer.Root,
  //     Size: queryOffer.Size,
  //     Total: queryOffer.MinPrice,
  //     UnsealPrice: "0",
  //     PaymentInterval: queryOffer.PaymentInterval,
  //     PaymentIntervalIncrease: queryOffer.PaymentIntervalIncrease,
  //     Client: queryOffer.Miner,
  //     Miner: queryOffer.Miner,
  //     MinerPeer: {
  //       Address: queryOffer.MinerPeer.Address,
  //       ID: queryOffer.MinerPeer.ID
  //     },
  //   }, {
  //     Path: "/filecoin_miner/original-data-retrieved.txt",
  //     IsCAR: false,
  //   });
  // });

  it("should perform query ask ", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const minerInfo = await provider.state.minerInfo('t01000');
    const queryAsk = await provider.client.queryAsk(minerInfo.PeerId, 't01000');
    const valid = typeof queryAsk.Price === 'string' && typeof queryAsk.Miner === 'string';
    assert.strictEqual(valid, true, 'failed query ask');
  });

  it("should compute commP", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const { Root, Size } = await provider.client.calcCommP("/filecoin_miner/original-data.txt");
    assert.strictEqual(!!Root && !!Size, true, 'failed to compute commP');
  });

  it("should generate CAR file", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const car = await provider.client.genCar({
      IsCAR: false,
      Path: "/filecoin_miner/original-data.txt",
    }, "/filecoin_miner/car.txt");
  });

  it("should calculate deal size", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const importResult = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    const { PayloadSize, PieceSize } = await provider.client.dealSize(importResult.Root);
    const isValid = typeof PayloadSize === 'number' && typeof PieceSize === 'number';
    assert.strictEqual(isValid, true, 'invalid deal size');
  });

  it("should get transfers status", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const transfers = await provider.client.listDataTransfers();
    assert.strictEqual(Array.isArray(transfers), true, 'invalid transfers status');
  });

  it("should list imports", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const importResult = await provider.client.import({
      Path: "/filecoin_miner/original-data.txt",
      IsCAR: false,
    });
    const imports = await provider.client.listImports();
    const isValid = imports.filter(importItem => (
      importItem.Root && importItem.Root['/'] === importResult.Root['/'] && importItem.Key === importResult.ImportID
    )).length > 0;
    assert.strictEqual(isValid, true, 'invalid imports list');
  });

  it("should get updated deals", function(done) {
    this.timeout(10000);
    const con = new JsonRpcProvider(wsConnector);
    walletLotus.getDefaultAccount().then((account: string) => {
      con.client.import({
        Path: "/filecoin_miner/original-data.txt",
        IsCAR: false,
      }).then((importResult) => {
        con.client.startDeal({
          Data: {
            TransferType: 'graphsync',
            Root: importResult.Root,
          },
          Miner: 't01000',
          Wallet: account,
          EpochPrice: '1004',
          MinBlocksDuration: 800,
        });
      });
    });
    con.client.getDealUpdates((dealInfo) => {
      assert.strictEqual(typeof dealInfo.State === 'number', true, 'invalid updated deal info');
      con.release().then(() => { done() });
    });
  });
});
