import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

import BigNumber from 'bignumber.js';
import { WsJsonRpcConnector } from "../../src/connectors/WsJsonRpcConnector";
import { privateEncrypt } from "crypto";

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';

function sleep(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*

    // WalletExport returns the private key of an address in the wallet.
    WalletExport(context.Context, address.Address) (*types.KeyInfo, error)
    // WalletImport receives a KeyInfo, which includes a private key, and imports it into the wallet.
    WalletImport(context.Context, *types.KeyInfo) (address.Address, error)
    // WalletDelete deletes an address from the wallet.
    WalletDelete(context.Context, address.Address) error
*/

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

        await walletLotusHttp.getDefaultAccount();

        await walletLotusHttp.setDefaultAccount(addressList[1]);

        let newDefault = await walletLotusHttp.getDefaultAccount();

        assert.strictEqual(newDefault, addressList[1], 'incorrect default address');

        await walletLotusHttp.setDefaultAccount(addressList[0]);

        newDefault = await walletLotusHttp.getDefaultAccount();

        assert.strictEqual(newDefault, addressList[0], 'incorrect default address');
    });

    it("should verifiy signature [http]", async function () {
        this.timeout(6000);

        const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
        const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);

        const defaultAddress = newAddress;

        const privateKey = await walletLotusHttp.walletExport(defaultAddress);

        const addresseseBeforeDelete = await walletLotusHttp.getAccounts();

        await walletLotusHttp.deleteWallet(defaultAddress);

        const addresseseAfterDelete = await walletLotusHttp.getAccounts();

        assert.strictEqual(addresseseBeforeDelete.length - 1, addresseseAfterDelete.length, 'wallet not deleted');

        await sleep(5000);

        const address = await walletLotusHttp.walletImport(privateKey);

        assert.strictEqual(address, defaultAddress, 'imported wallet is not the same as old default');

        const addresseseAfterImport = await walletLotusHttp.getAccounts();

        assert.strictEqual(addresseseBeforeDelete.length, addresseseAfterImport.length, 'wallet not imported');

        await walletLotusHttp.setDefaultAccount(defaultAddress);
    });
});