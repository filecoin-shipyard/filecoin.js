import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LightWalletProvider } from '../../src/providers/wallet/LightWalletProvider';
import BigNumber from "bignumber.js";
import { MnemonicWalletProvider } from "../../src/providers/wallet/MnemonicWalletProvider";
import { HttpJsonRpcWalletProvider } from "../../src/providers/wallet/HttpJsonRpcWalletProvider";
import { JsonRpcProvider } from "../../src/providers/JsonRpcProvider";

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';

let encryptedWallet = '';
let mnemonic = '';
function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Send message", function () {
  it("should send signed message, lotus default wallet [http]", async function () {
    this.timeout(15000);

    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const lightWalletHttp = new LightWalletProvider(httpConnector);
    mnemonic = await lightWalletHttp.createLightWallet('testPwd');
    encryptedWallet = lightWalletHttp.keystore.serialize();

    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const defaultAccount = await walletLotusHttp.getDefaultAccount();
    const mnemonicAddress = await lightWalletHttp.getDefaultAccount();

    const message = await walletLotusHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(10000000000000000),
    });

    const signedMessage = await walletLotusHttp.signMessage(message);
    const msgCid = await walletLotusHttp.sendSignedMessage(signedMessage);

    const receipt = await con.state.waitMsg(msgCid, 0);
    assert.strictEqual(receipt.Receipt.ExitCode, 0, 'message not mined');
  });

  it("should create vault and send message [http]", async function () {
    this.timeout(15000);

    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const mnemonicWalletProvider = new MnemonicWalletProvider( httpConnector, testMnemonic, '');
    const con = new JsonRpcProvider(httpConnector);

    const lightWalletHttp = new LightWalletProvider(httpConnector);
    await lightWalletHttp.recoverLightWallet(mnemonic, 'testPwd');

    const defaultAccount = await lightWalletHttp.getDefaultAccount();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const message = await lightWalletHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1),
    });

    const signedMessage = await lightWalletHttp.signMessage(message,'testPwd');
    const msgCid = await lightWalletHttp.sendSignedMessage(signedMessage);

    const receipt = await con.state.waitMsg(msgCid, 0);
    assert.strictEqual(receipt.Receipt.ExitCode, 0, 'message not mined');
  });

  it("should load vault and send message [http]", async function () {
    this.timeout(15000);

    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const mnemonicWalletProvider = new MnemonicWalletProvider( httpConnector, testMnemonic, '');
    const con = new JsonRpcProvider(httpConnector);

    const lightWalletHttp = new LightWalletProvider(httpConnector);
    lightWalletHttp.loadLightWallet(encryptedWallet);

    const defaultAccount = await lightWalletHttp.getDefaultAccount();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const message = await lightWalletHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1),
    });

    const signedMessage = await lightWalletHttp.signMessage(message,'testPwd');
    const msgCid = await lightWalletHttp.sendSignedMessage(signedMessage);

    const receipt = await con.state.waitMsg(msgCid, 0);
    assert.strictEqual(receipt.Receipt.ExitCode, 0, 'message not mined');
  });
});
