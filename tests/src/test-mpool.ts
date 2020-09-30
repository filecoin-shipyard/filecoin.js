import assert from "assert";

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';
import { MnemonicWalletProvider } from "../../src/providers/wallet/MnemonicWalletProvider";
import { HttpJsonRpcWalletProvider } from "../../src/providers/wallet/HttpJsonRpcWalletProvider";
import BigNumber from "bignumber.js";
import { MpoolUpdate, SignedMessage } from "../../src/providers/Types";

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';
let signedMessageForSub: SignedMessage;

describe("Mpool tests", function () {
  it("should get and delete messages from mpool [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider(httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    //clear mpool
    await con.mpoolClear();

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
      Value: new BigNumber(1)
    });
    signedMessageForSub = await walletLotusHttp.signMessage(messageForSub);

    let mempoolContents = await con.getMpoolPending([]);
    assert.strictEqual(mempoolContents.length, 1, 'wrong message count in mpool');

    mempoolContents = await con.mpoolSelect([], 1);
    assert.strictEqual(mempoolContents.length, 1, 'wrong message count in mpool');

    await con.mpoolClear();

    mempoolContents = await con.getMpoolPending([]);
    assert.strictEqual(mempoolContents.length, 0, 'mpool not empty');
  });

  it("should get and set mpool config [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const con = new JsonRpcProvider(httpConnector);

    //clear mpool
    const initialConfig = await con.getMpoolConfig();

    const newConfig = { ...initialConfig };
    newConfig.GasLimitOverestimation = 1.5;

    await con.setMpoolConfig(newConfig);
    const newlySetConfig = await con.getMpoolConfig();
    assert.strictEqual(newlySetConfig.GasLimitOverestimation, 1.5, 'mpool not empty');


    await con.setMpoolConfig(initialConfig);
    const revertedInitialConfig = await con.getMpoolConfig();

    assert.strictEqual(initialConfig.GasLimitOverestimation, revertedInitialConfig.GasLimitOverestimation, 'mpool not empty');
  });

  it("should subscribe to mpool changes and get notified [http]", function (done) {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(wsConnector);

    con.mpoolSub((data: MpoolUpdate) => {
      con.release().then(() => { done() });
      assert.strictEqual(data.Type, 0, 'wrong type received on subscription');
    })
    walletLotusHttp.sendSignedMessage(signedMessageForSub);
  });
});
