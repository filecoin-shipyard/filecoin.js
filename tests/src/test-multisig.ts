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
  it("should create multisig wallet and transfer funds [http]", async function () {
    this.timeout(40000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider(httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const addresses = await walletLotusHttp.getAccounts();
    const defaultAccount = await walletLotusHttp.getDefaultAccount();

    const t3address = addresses[2];
    const t11address = addresses[1];
    const t12address = addresses[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const multisigCid = await con.multiSigCreate(2, addresses, 0, '1000', defaultAccount, '4000');

    const receipt = await con.waitMsg(multisigCid, 0);
    const multisigAddress = receipt.ReturnDec.RobustAddress;

    const balance = await con.multiSigGetAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initialDefaultWallet = await walletLotusHttp.getDefaultAccount();
    await walletLotusHttp.setDefaultAccount(t3address);

    const initTransferCid = await con.multiSigPropose(multisigAddress, mnemonicAddress, '1', t3address, 0, []);
    const receiptTransferStart = await con.waitMsg(initTransferCid, 0);
    const txnID = receiptTransferStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating transfer');

    await walletLotusHttp.setDefaultAccount(t11address);
    const approveTransferCid = await con.multiSigApprove(multisigAddress, txnID, t3address, mnemonicAddress, '1', t11address, 0, []);
    const receiptTransferApprove = await con.waitMsg(approveTransferCid, 0);
    assert.strictEqual(receiptTransferApprove.ReturnDec.Applied, true, 'error approving transfer');

    const balanceAfterTransfer = await con.multiSigGetAvailableBalance(multisigAddress, []);
    assert.strictEqual(balanceAfterTransfer, '999', 'wrong balance after approve transfer');

    await walletLotusHttp.setDefaultAccount(initialDefaultWallet);
  });
});