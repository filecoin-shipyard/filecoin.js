import assert from "assert";
import BigNumber from 'bignumber.js';

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractAddressesWithFunds(addresses: string[], wallet:HttpJsonRpcWalletProvider): Promise<{blsAddresses: string[], secpAddreses: string[]}> {
  let blsAddresses: string[] = [];
  let secpAddreses: string[] = [];

  for (let i=0; i<addresses.length; i++) {
    const address = addresses[i];
    const balance: BigNumber = new BigNumber(await wallet.getBalance(address));
    if (balance.gt(new BigNumber(0)) && address.startsWith('t3')) {
      blsAddresses.push(address);
    }
    if (balance.gt(new BigNumber(0)) && address.startsWith('t1')) {
      secpAddreses.push(address);
    }
  };

  return { blsAddresses, secpAddreses };
}

describe("Multisig Wallets", function () {
  it("should create multisig wallet and transfer funds [http]", async function () {
    this.timeout(40000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider(httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const addresses = await walletLotusHttp.getAccounts();
    const defaultAccount = await walletLotusHttp.getDefaultAccount();

    const { blsAddresses, secpAddreses } = await extractAddressesWithFunds (addresses, walletLotusHttp);
    const t3address = blsAddresses [0]
    const t11address = secpAddreses[1];
    const t12address = secpAddreses[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const multisigCid = await con.msig.create(2, addresses, 0, '1000', defaultAccount, '4000');

    const receipt = await con.state.waitMsg(multisigCid, 0);
    const multisigAddress = receipt.ReturnDec.RobustAddress;

    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initialDefaultWallet = await walletLotusHttp.getDefaultAccount();
    await walletLotusHttp.setDefaultAccount(t3address);

    const initTransferCid = await con.msig.propose(multisigAddress, mnemonicAddress, '1', t3address, 0, []);
    const receiptTransferStart = await con.state.waitMsg(initTransferCid, 0);
    const txnID = receiptTransferStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating transfer');

    await walletLotusHttp.setDefaultAccount(t11address);
    const approveTransferCid = await con.msig.approveTxnHash(multisigAddress, txnID, t3address, mnemonicAddress, '1', t11address, 0, []);
    const receiptTransferApprove = await con.state.waitMsg(approveTransferCid, 0);
    assert.strictEqual(receiptTransferApprove.ReturnDec.Applied, true, 'error approving transfer');

    const balanceAfterTransfer = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balanceAfterTransfer, '999', 'wrong balance after approve transfer');

    await walletLotusHttp.setDefaultAccount(initialDefaultWallet);
  });

  it("should create multisig wallet and add signer [http]", async function () {
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

    const multisigCid = await con.msig.create(2, [ t3address, t11address ], 0, '1000', defaultAccount, '4000');

    const receipt = await con.state.waitMsg(multisigCid, 0);
    const multisigAddress = receipt.ReturnDec.RobustAddress;

    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initialDefaultWallet = await walletLotusHttp.getDefaultAccount();

    await walletLotusHttp.setDefaultAccount(t3address);
    const initAddProposeCid = await con.msig.addPropose(multisigAddress,t3address,t12address,false);
    const receiptAddStart = await con.state.waitMsg(initAddProposeCid, 0);
    const txnID = receiptAddStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating add proposal');

    await walletLotusHttp.setDefaultAccount(t11address);
    const approveAddCid = await con.msig.addApprove(multisigAddress, t11address, txnID, t3address, t12address, false);
    const receiptAddApprove = await con.state.waitMsg(approveAddCid, 0);
    assert.strictEqual(receiptAddApprove.ReturnDec.Applied, true, 'error approving add proposal');

    await walletLotusHttp.setDefaultAccount(initialDefaultWallet);
  });

  it("should create multisig wallet and swap signer [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider(httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const addresses = await walletLotusHttp.getAccounts();
    const defaultAccount = await walletLotusHttp.getDefaultAccount();

    const { blsAddresses, secpAddreses } = await extractAddressesWithFunds (addresses, walletLotusHttp);
    const t3address = blsAddresses [0]
    const t11address = secpAddreses[1];
    const t12address = secpAddreses[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const multisigCid = await con.msig.create(2, [t3address, t11address], 0, '1000', defaultAccount, '4000');

    const receipt = await con.state.waitMsg(multisigCid, 0);
    const multisigAddress = receipt.ReturnDec.RobustAddress;

    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initialDefaultWallet = await walletLotusHttp.getDefaultAccount();
    await walletLotusHttp.setDefaultAccount(t3address);

    const iniSwapProposeCid = await con.msig.swapPropose(multisigAddress, t3address, t11address, t12address);
    const receiptProposeStart = await con.state.waitMsg(iniSwapProposeCid, 0);
    const txnID = receiptProposeStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating swap proposal');

    await walletLotusHttp.setDefaultAccount(t11address);
    const approveSwapCid = await con.msig.swapApprove(multisigAddress, t11address, txnID, t3address, t11address, t12address);
    const receiptSwapApprove = await con.state.waitMsg(approveSwapCid, 0);
    assert.strictEqual(receiptSwapApprove.ReturnDec.Applied, true, 'error approving add proposal');

    await walletLotusHttp.setDefaultAccount(t3address);

    const initTransferCid = await con.msig.propose(multisigAddress, mnemonicAddress, '1', t3address, 0, []);
    const receiptTransferStart = await con.state.waitMsg(initTransferCid, 0);
    const txnIDTransfer = receiptTransferStart.ReturnDec.TxnID;


    await walletLotusHttp.setDefaultAccount(t12address);
    const approveTransferCid = await con.msig.approveTxnHash(multisigAddress, txnIDTransfer, t3address, mnemonicAddress, '1', t12address, 0, []);
    const receiptTransferApprove = await con.state.waitMsg(approveTransferCid, 0);
    assert.strictEqual(receiptTransferApprove.ReturnDec.Applied, true, 'error approving transfer');

    const balanceAfterTransfer = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balanceAfterTransfer, '999', 'wrong balance after approve transfer');

    await walletLotusHttp.setDefaultAccount(initialDefaultWallet);
  });
});
