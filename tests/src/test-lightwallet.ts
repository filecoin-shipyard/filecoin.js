import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LightWalletProvider } from '../../src/providers/wallet/LightWalletProvider';
import BigNumber from "bignumber.js";
import { MnemonicWalletProvider } from "../../src/providers/wallet/MnemonicWalletProvider";
import { LotusWalletProvider } from "../../src/providers/wallet/LotusWalletProvider";
import { LotusClient } from "../../src/providers/LotusClient";

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
    const con = new LotusClient(httpConnector);

    const lightWalletHttp = new LightWalletProvider(con);
    mnemonic = await lightWalletHttp.createLightWallet('testPwd');
    encryptedWallet = lightWalletHttp.keystore.serialize();

    const walletLotusHttp = new LotusWalletProvider(con);

    const defaultAccount = await walletLotusHttp.getDefaultAddress();
    const mnemonicAddress = await lightWalletHttp.getDefaultAddress();

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
    const con = new LotusClient(httpConnector);

    const mnemonicWalletProvider = new MnemonicWalletProvider( con, testMnemonic, '');

    const lightWalletHttp = new LightWalletProvider(con);
    await lightWalletHttp.recoverLightWallet(mnemonic, 'testPwd');

    const defaultAccount = await lightWalletHttp.getDefaultAddress();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

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
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider( con, testMnemonic, '');

    const lightWalletHttp = new LightWalletProvider(con);
    lightWalletHttp.loadLightWallet(encryptedWallet);

    const defaultAccount = await lightWalletHttp.getDefaultAddress();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

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
