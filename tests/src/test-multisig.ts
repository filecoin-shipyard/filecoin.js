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

describe.only("Send message", function () {
  it("should create multisig wallet [http]", async function () {
    this.timeout(10000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider(httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const addresses = await walletLotusHttp.getAccounts()
    const defaultAccount = await walletLotusHttp.getDefaultAccount();

    console.log(addresses);
    console.log(defaultAccount);

    const multisig = await con.multiSigCreate(2, addresses, 0, '1000', defaultAccount, '4000');

    console.log(multisig);

    await sleep(5000);

    const msg = await con.getMessage(multisig);
    console.log(msg);
    //const balance = await con.multiSigGetAvailableBalance(multisig, []);
  });
});