import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';

function sleep(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let addressList: string[];
let newAddress: string;

describe("Wallet methods", function () {
    it("should retrieve wallet list [http]", async function () {
        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);

        const accountsList = await walletLotusHttp.getAccounts();
        addressList = accountsList;
        assert.strictEqual(typeof accountsList, "object", 'couldn not retrieve address list');
    });

    it("should create new wallet [http]", async function () {
        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);

        const account = await walletLotusHttp.newAccount();

        newAddress = account;
        const hasWallet = await walletLotusHttp.hasWallet(account);
        assert.strictEqual(hasWallet, true, 'newly created wallet not found in key store');
    });

    it("should change default address [http]", async function () {
        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);

        const defaultAccount = await walletLotusHttp.getDefaultAccount();

        await walletLotusHttp.setDefaultAccount(addressList[1]);

        let newDefault = await walletLotusHttp.getDefaultAccount();

        assert.strictEqual(newDefault, addressList[1], 'incorrect default address');

        await walletLotusHttp.setDefaultAccount(defaultAccount);

        newDefault = await walletLotusHttp.getDefaultAccount();

        assert.strictEqual(newDefault, defaultAccount, 'incorrect default address');
    });

    it("should verifiy signature [http]", async function () {
        this.timeout(6000);

        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);

        const defaultAddress = newAddress;

        const privateKey = await walletLotusHttp.walletExport(defaultAddress);

        const addresseseBeforeDelete = await walletLotusHttp.getAccounts();

        await walletLotusHttp.deleteWallet(defaultAddress);

        const addressesAfterDelete = await walletLotusHttp.getAccounts();

        assert.strictEqual(addresseseBeforeDelete.length - 1, addressesAfterDelete.length, 'wallet not deleted');

        await sleep(5000);

        const address = await walletLotusHttp.walletImport(privateKey);

        assert.strictEqual(address, defaultAddress, 'imported wallet is not the same as old default');

        const addresseseAfterImport = await walletLotusHttp.getAccounts();

        assert.strictEqual(addresseseBeforeDelete.length, addresseseAfterImport.length, 'wallet not imported');
    });
});