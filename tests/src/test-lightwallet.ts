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

    const lightWalletHttp = new LightWalletProvider(con, () => { return 'testPwd' });
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

    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');

    const lightWalletHttp = new LightWalletProvider(con, () => { return 'testPwd' });
    await lightWalletHttp.recoverLightWallet(mnemonic, 'testPwd');

    const defaultAccount = await lightWalletHttp.getDefaultAddress();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const message = await lightWalletHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1),
    });

    const signedMessage = await lightWalletHttp.signMessage(message);
    const msgCid = await lightWalletHttp.sendSignedMessage(signedMessage);

    const receipt = await con.state.waitMsg(msgCid, 0);
    assert.strictEqual(receipt.Receipt.ExitCode, 0, 'message not mined');
  });

  it("should load vault and send message [http]", async function () {
    this.timeout(15000);

    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');

    const lightWalletHttp = new LightWalletProvider(con, () => { return 'testPwd' });
    lightWalletHttp.loadLightWallet(encryptedWallet);

    const defaultAccount = await lightWalletHttp.getDefaultAddress();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const message = await lightWalletHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1),
    });

    const signedMessage = await lightWalletHttp.signMessage(message);
    const msgCid = await lightWalletHttp.sendSignedMessage(signedMessage);

    const receipt = await con.state.waitMsg(msgCid, 0);
    assert.strictEqual(receipt.Receipt.ExitCode, 0, 'message not mined');
  });
});


describe("LightWallet Wallet methods", function () {
  it("should retrieve address list [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const lotusClient = new LotusClient(httpConnector);
    const lightWalletHttp = new LightWalletProvider(lotusClient, () => { return 'testPwd' });
    mnemonic = await lightWalletHttp.createLightWallet('testPwd');

    const accountsList = await lightWalletHttp.getAddresses();
    assert.strictEqual(typeof accountsList, "object", 'couldn not retrieve address list');
  });

  it("should create new address [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const lotusClient = new LotusClient(httpConnector);
    const lightWalletHttp = new LightWalletProvider(lotusClient, () => { return 'testPwd' });
    mnemonic = await lightWalletHttp.createLightWallet('testPwd');

    const account = await lightWalletHttp.newAddress();

    const hasWallet = await lightWalletHttp.hasAddress(account);
    assert.strictEqual(hasWallet, true, 'newly created wallet not found in key store');
  });

  it("should persist new address [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const lotusClient = new LotusClient(httpConnector);
    const lightWalletHttp = new LightWalletProvider(lotusClient, () => { return 'testPwd' });
    mnemonic = await lightWalletHttp.createLightWallet('testPwd');

    const account = await lightWalletHttp.newAddress();

    const hasWallet = await lightWalletHttp.hasAddress(account);
    assert.strictEqual(hasWallet, true, 'newly created wallet not found in key store');

    const encWallet = lightWalletHttp.prepareToSave();
    const lightWalletRestoredHttp = new LightWalletProvider(lotusClient, () => { return 'testPwd' });
    lightWalletRestoredHttp.loadLightWallet(encWallet);

    const hasWalletRestored = await lightWalletHttp.hasAddress(account);
    assert.strictEqual(hasWalletRestored, true, 'newly created wallet not found in key store');
  });

  it("should change default address [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const lotusClient = new LotusClient(httpConnector);
    const lightWalletHttp = new LightWalletProvider(lotusClient, () => { return 'testPwd' });
    mnemonic = await lightWalletHttp.createLightWallet('testPwd');

    await lightWalletHttp.newAddress();

    const addressList = await lightWalletHttp.getAddresses();
    const defaultAccount = await lightWalletHttp.getDefaultAddress();

    await lightWalletHttp.setDefaultAddress(addressList[1]);

    let newDefault = await lightWalletHttp.getDefaultAddress();

    assert.strictEqual(newDefault, addressList[1], 'incorrect default address');

    await lightWalletHttp.setDefaultAddress(defaultAccount);

    newDefault = await lightWalletHttp.getDefaultAddress();

    assert.strictEqual(newDefault, defaultAccount, 'incorrect default address');
  });

  it("should delete address[http]", async function () {
    this.timeout(6000);

    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const lotusClient = new LotusClient(httpConnector);
    const lightWalletHttp = new LightWalletProvider(lotusClient, () => { return 'testPwd' });
    mnemonic = await lightWalletHttp.createLightWallet('testPwd');

    const defaultAddress = await lightWalletHttp.getDefaultAddress();
    const privateKey = await lightWalletHttp.exportPrivateKey(defaultAddress);
    assert.strictEqual(typeof privateKey.PrivateKey, "string", 'could not private key');

    await lightWalletHttp.newAddress();

    const addresseseBeforeDelete = await lightWalletHttp.getAddresses();

    await lightWalletHttp.deleteAddress(defaultAddress);

    const addressesAfterDelete = await lightWalletHttp.getAddresses();
    assert.strictEqual(addresseseBeforeDelete.length - 1, addressesAfterDelete.length, 'wallet not deleted');
  });
});
