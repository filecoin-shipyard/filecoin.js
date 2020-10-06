import assert from "assert";
import BigNumber from "bignumber.js";

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';
import { MnemonicWalletProvider } from "../../src/providers/wallet/MnemonicWalletProvider";
import { HttpJsonRpcWalletProvider } from "../../src/providers/wallet/HttpJsonRpcWalletProvider";
import { MpoolUpdate, SignedMessage } from "../../src/providers/Types";

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';
let signedMessageForSub: SignedMessage;

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Mpool tests", function () {
  it("should get and delete messages from mpool [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider(httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    //clear mpool
    await con.mpool.clear();

    const defaultAccount = await walletLotusHttp.getDefaultAccount();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const nonce = await walletLotusHttp.getNonce(defaultAccount);
    const message = await walletLotusHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1),
      Nonce: nonce //increase the nonce so that the message gets stuck in mpool
    });

    const signedMessage = await walletLotusHttp.signMessage(message);
    await walletLotusHttp.sendSignedMessage(signedMessage);

    const messageForSub = await walletLotusHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1),
      Nonce: nonce
    });
    signedMessageForSub = await walletLotusHttp.signMessage(messageForSub);

    let mempoolContents = await con.mpool.getMpoolPending([]);
    assert.strictEqual(mempoolContents.length, 1, 'wrong message count in mpool');

    mempoolContents = await con.mpool.select([], 1);
    assert.strictEqual(mempoolContents.length, 1, 'wrong message count in mpool');

    await con.mpool.clear();

    mempoolContents = await con.mpool.getMpoolPending([]);
    assert.strictEqual(mempoolContents.length, 0, 'mpool not empty');
  });

  it("should get and set mpool config [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const con = new JsonRpcProvider(httpConnector);

    //clear mpool
    const initialConfig = await con.mpool.getMpoolConfig();

    const newConfig = { ...initialConfig };
    newConfig.GasLimitOverestimation = 1.5;

    await con.mpool.setMpoolConfig(newConfig);
    const newlySetConfig = await con.mpool.getMpoolConfig();
    assert.strictEqual(newlySetConfig.GasLimitOverestimation, 1.5, 'mpool not empty');


    await con.mpool.setMpoolConfig(initialConfig);
    const revertedInitialConfig = await con.mpool.getMpoolConfig();

    assert.strictEqual(initialConfig.GasLimitOverestimation, revertedInitialConfig.GasLimitOverestimation, 'mpool not empty');
  });

  it("should subscribe to mpool changes and get notified [http]", function (done) {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(wsConnector);

    con.mpool.sub((data: MpoolUpdate) => {
      con.release().then(() => { done() });
      assert.strictEqual(data.Type, 0, 'wrong type received on subscription');
    })
    walletLotusHttp.sendSignedMessage(signedMessageForSub);
  });

  it("just wait for the previous message to be mined", function (done) {
    this.timeout(12000);
    sleep(10000).then(() => { done() });;
  });
});
