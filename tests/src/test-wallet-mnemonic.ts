import assert from 'assert';
import { LOTUS_AUTH_TOKEN } from '../tools/testnet/credentials/credentials';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { LotusClient, MnemonicWalletProvider } from '../../src';

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const testMnemonic =
  'equip will roof matter pink blind book anxiety banner elbow sun young';

describe('Mnemonic Wallet methods', function () {
  it('should retrieve wallet list [http]', async function () {
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      lotusClient,
      testMnemonic,
      '',
    );

    const accountsList = await mnemonicWalletProvider.getAddresses();
    assert.strictEqual(
      typeof accountsList,
      'object',
      'couldn not retrieve address list',
    );
  });

  it('should create new wallet [http]', async function () {
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      lotusClient,
      testMnemonic,
      '',
    );

    const account = await mnemonicWalletProvider.newAddress();

    const hasWallet = await mnemonicWalletProvider.hasAddress(account);
    assert.strictEqual(
      hasWallet,
      true,
      'newly created wallet not found in key store',
    );
  });

  it('should change default address [http]', async function () {
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      lotusClient,
      testMnemonic,
      '',
    );
    await mnemonicWalletProvider.newAddress();

    const addressList = await mnemonicWalletProvider.getAddresses();
    const defaultAccount = await mnemonicWalletProvider.getDefaultAddress();

    await mnemonicWalletProvider.setDefaultAddress(addressList[1]);

    let newDefault = await mnemonicWalletProvider.getDefaultAddress();

    assert.strictEqual(newDefault, addressList[1], 'incorrect default address');

    await mnemonicWalletProvider.setDefaultAddress(defaultAccount);

    newDefault = await mnemonicWalletProvider.getDefaultAddress();

    assert.strictEqual(newDefault, defaultAccount, 'incorrect default address');
  });

  it('should delete address [http]', async function () {
    this.timeout(6000);

    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      lotusClient,
      testMnemonic,
      '',
    );

    const defaultAddress = await mnemonicWalletProvider.getDefaultAddress();
    const privateKey = await mnemonicWalletProvider.exportPrivateKey(
      defaultAddress,
    );
    assert.strictEqual(
      typeof privateKey.PrivateKey,
      'string',
      'could not private key',
    );

    await mnemonicWalletProvider.newAddress();

    const addresseseBeforeDelete = await mnemonicWalletProvider.getAddresses();

    await mnemonicWalletProvider.deleteAddress(defaultAddress);

    const addressesAfterDelete = await mnemonicWalletProvider.getAddresses();
    assert.strictEqual(
      addresseseBeforeDelete.length - 1,
      addressesAfterDelete.length,
      'wallet not deleted',
    );
  });
});
