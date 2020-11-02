import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { LotusClient } from "../../src/providers/LotusClient";
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let addressList: string[];
let newAddress: string;

describe("Wallet methods", function () {
    it("should retrieve wallet list [http]", async function () {
        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const lotusClient = new LotusClient(httpConnector);
        const walletLotusHttp = new LotusWalletProvider(lotusClient);

        const accountsList = await walletLotusHttp.getAddresses();
        addressList = accountsList;
        assert.strictEqual(typeof accountsList, "object", 'couldn not retrieve address list');
    });

    it("should create new wallet [http]", async function () {
        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const lotusClient = new LotusClient(httpConnector);
        const walletLotusHttp = new LotusWalletProvider(lotusClient);

        const account = await walletLotusHttp.newAddress();

        newAddress = account;
        const hasWallet = await walletLotusHttp.hasAddress(account);
        assert.strictEqual(hasWallet, true, 'newly created wallet not found in key store');
    });

    it("should change default address [http]", async function () {
        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const lotusClient = new LotusClient(httpConnector);
        const walletLotusHttp = new LotusWalletProvider(lotusClient);

        const defaultAccount = await walletLotusHttp.getDefaultAddress();

        await walletLotusHttp.setDefaultAddress(addressList[1]);

        let newDefault = await walletLotusHttp.getDefaultAddress();

        assert.strictEqual(newDefault, addressList[1], 'incorrect default address');

        await walletLotusHttp.setDefaultAddress(defaultAccount);

        newDefault = await walletLotusHttp.getDefaultAddress();

        assert.strictEqual(newDefault, defaultAccount, 'incorrect default address');
    });

    it("should verifiy signature [http]", async function () {
        this.timeout(6000);

        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const lotusClient = new LotusClient(httpConnector);
        const walletLotusHttp = new LotusWalletProvider(lotusClient);

        const defaultAddress = newAddress;

        const privateKey = await walletLotusHttp.exportPrivateKey(defaultAddress);

        const addresseseBeforeDelete = await walletLotusHttp.getAddresses();

        await walletLotusHttp.deleteAddress(defaultAddress);

        const addressesAfterDelete = await walletLotusHttp.getAddresses();

        assert.strictEqual(addresseseBeforeDelete.length - 1, addressesAfterDelete.length, 'wallet not deleted');

        await sleep(5000);

        const address = await walletLotusHttp.walletImport(privateKey);

        assert.strictEqual(address, defaultAddress, 'imported wallet is not the same as old default');

        const addresseseAfterImport = await walletLotusHttp.getAddresses();

    assert.strictEqual(addresseseBeforeDelete.length, addresseseAfterImport.length, 'wallet not imported');
  });

  it("should check if a given string can be decoded as an address [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const lotusClient = new LotusClient(httpConnector);
    const walletLotus = new LotusWalletProvider(lotusClient);
    const address = await walletLotus.getDefaultAddress();
    const check = await lotusClient.wallet.validateAddress(address);

    assert.strictEqual(check === address, true, 'failed to decode address ');
  });

  it("should check if a given string can be decoded as an address [ws]", async function () {
    const wsConnector = new WsJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const lotusClient = new LotusClient(wsConnector);
    const walletLotus = new LotusWalletProvider(lotusClient);
    const address = await walletLotus.getDefaultAddress();
    const check = await lotusClient.wallet.validateAddress(address);

    assert.strictEqual(check === address, true, 'failed to decode address ');
  });
});
