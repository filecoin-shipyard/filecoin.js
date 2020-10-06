import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

import BigNumber from 'bignumber.js';
import { WsJsonRpcConnector } from "../../src/connectors/WsJsonRpcConnector";

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Send message", function () {
  it("should send signed message, lotus default wallet [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider( httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const defaultAccount = await walletLotusHttp.getDefaultAccount();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const message = await walletLotusHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1000000000000),
    });

    const signedMessage = await walletLotusHttp.signMessage(message);
    const msgCid = await walletLotusHttp.sendSignedMessage(signedMessage);

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
  });

  it("should send signed message, lotus default wallet [ws]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider( httpConnector, testMnemonic, '');
    const walletLotusWs = new HttpJsonRpcWalletProvider(wsConnector);
    const con = new JsonRpcProvider(httpConnector);

    const defaultAccount = await walletLotusWs.getDefaultAccount();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const message = await walletLotusWs.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1000000000000),
    });

    const signedMessage = await walletLotusWs.signMessage(message);
    const msgCid = await walletLotusWs.sendSignedMessage(signedMessage);

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
    await walletLotusWs.release();
  });

  it("should send signed message, mnemonic wallet [http]", async function () {
    this.timeout(10000);
    await sleep(8000);

    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider( httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const accounts = await walletLotusHttp.getAccounts();
    const secpAddress = accounts[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const message = await mnemonicWalletProvider.createMessage({
      From: mnemonicAddress,
      To: secpAddress,
      Value: new BigNumber(100),
    });

    const signedMessage = await mnemonicWalletProvider.signMessage(message);
    const msgCid = await mnemonicWalletProvider.sendSignedMessage(signedMessage);

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
  });

  it("should send signed message, mnemonic wallet [ws]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const wsConnectorMnemonic = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const wsConnectorLotus = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider( wsConnectorMnemonic, testMnemonic, '');
    const walletLotusWs = new HttpJsonRpcWalletProvider(wsConnectorLotus);
    const con = new JsonRpcProvider(httpConnector);

    const accounts = await walletLotusWs.getAccounts();
    const secpAddress = accounts[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const message = await mnemonicWalletProvider.createMessage({
      From: mnemonicAddress,
      To: secpAddress,
      Value: new BigNumber(100),
    });

    const signedMessage = await mnemonicWalletProvider.signMessage(message);
    const msgCid = await mnemonicWalletProvider.sendSignedMessage(signedMessage);

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');

    await mnemonicWalletProvider.release();
    await walletLotusWs.release();
  });
});
