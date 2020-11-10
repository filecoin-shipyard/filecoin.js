import assert from "assert";
import BigNumber from 'bignumber.js';

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { LotusClient } from '../../src/providers/LotusClient';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';

async function fundTestAddresses(source: string, destinations: string[], walletLotusHttp: LotusWalletProvider, con: LotusClient) {
  for (let i = 0; i < destinations.length; i++) {
    const destination = destinations[i];
    let message = await walletLotusHttp.createMessage({
      From: source,
      To: destination,
      Value: new BigNumber(100000000000000),
    });

    console.log(`${source} -> ${destination}`)
    const signedMessage = await walletLotusHttp.signMessage(message);
    const msgCid = await walletLotusHttp.sendSignedMessage(signedMessage);
    const receiptInitialTransfer = await con.state.waitMsg(msgCid, 0);
    console.log(receiptInitialTransfer);
  }
}

describe("Multisig Wallets Mnemonic implementation", function () {
  it("should provide accounts with initial funds", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');

    const walletLotusHttp = new LotusWalletProvider(con);
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    await fundTestAddresses(await walletLotusHttp.getDefaultAddress(), addresses, walletLotusHttp, con);
  });

  it("should create multisig wallet and transfer funds [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');

    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();
    const mnemonicAddress = await mnemonicWalletProvider.newAddress();

    const multisigCid = await mnemonicWalletProvider.msigCreate(2, addresses, 0, '1000', addresses[0]);
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initTransferCid = await mnemonicWalletProvider.msigProposeTransfer(multisigAddress, mnemonicAddress, '1', addresses[0]);
    const receiptTransferStart = await con.state.waitMsg(initTransferCid, 0);
    console.log('receipt init transfer:', receiptTransferStart);

    const txnID = receiptTransferStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating transfer');

    const approveTransferCid = await mnemonicWalletProvider.msigApproveTransferTxHash(multisigAddress, txnID, addresses[0], mnemonicAddress, '1', addresses[1]);
    const receiptTransferApprove = await con.state.waitMsg(approveTransferCid, 0);
    console.log('receipt approve transfer:', receiptTransferApprove);

    assert.strictEqual(receiptTransferApprove.ReturnDec.Applied, true, 'error approving transfer');

    const balanceAfterTransfer = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balanceAfterTransfer, '999', 'wrong balance after approve transfer');
  });

  it("should create multisig wallet and add signer [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, 'test');
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    const multisigCid = await mnemonicWalletProvider.msigCreate(2, [addresses[0], addresses[1]], 0, '1000', addresses[0]);
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initAddProposeCid = await mnemonicWalletProvider.msigProposeAddSigner(multisigAddress, addresses[0], addresses[2], true);
    const receiptAddProposeCid = await con.state.waitMsg(initAddProposeCid, 0);
    console.log('receipt init add signer:', receiptAddProposeCid);

    const txnID = receiptAddProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating add proposal');

    const approveAddCid = await mnemonicWalletProvider.msigApproveAddSigner(multisigAddress, addresses[1], txnID, addresses[0], addresses[2], true);
    const receiptAddApprove = await con.state.waitMsg(approveAddCid, 0);
    console.log('receipt approve add signer:', receiptAddApprove);

    assert.strictEqual(receiptAddApprove.ReturnDec.Applied, true, 'error approving add proposal');
  });

  it("should create multisig wallet and swap signer [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, 'test');
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    const multisigCid = await mnemonicWalletProvider.msigCreate(2, [addresses[0], addresses[1]], 0, '1000', addresses[0]);
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initSwapProposeCid = await mnemonicWalletProvider.msigProposeSwapSigner(multisigAddress, addresses[0], addresses[1], addresses[2]);
    const receiptSwapProposeCid = await con.state.waitMsg(initSwapProposeCid, 0);
    console.log('receipt init swap signer:', receiptSwapProposeCid);

    const txnID = receiptSwapProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating swap proposal');

    const approveSwapCid = await mnemonicWalletProvider.msigApproveSwapSigner(multisigAddress, addresses[1], txnID, addresses[0], addresses[1], addresses[2] );
    const receiptSwapApprove = await con.state.waitMsg(approveSwapCid, 0);
    console.log('receipt approve swap signer:', receiptSwapApprove);

    assert.strictEqual(receiptSwapApprove.ReturnDec.Applied, true, 'error approving swap proposal');
  });

  it("should create multisig wallet and cancel transfer funds [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');

    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();
    const mnemonicAddress = await mnemonicWalletProvider.newAddress();

    const multisigCid = await mnemonicWalletProvider.msigCreate(2, addresses, 0, '1000', addresses[0]);
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initTransferCid = await mnemonicWalletProvider.msigProposeTransfer(multisigAddress, mnemonicAddress, '1', addresses[0]);
    const receiptTransferStart = await con.state.waitMsg(initTransferCid, 0);
    console.log('receipt init transfer:', receiptTransferStart);

    const txnID = receiptTransferStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating transfer');

    const cancelTransferCid = await mnemonicWalletProvider.msigCancelTransfer(multisigAddress, addresses[0], txnID,  mnemonicAddress, '1');
    const receiptTransferCancel = await con.state.waitMsg(cancelTransferCid, 0);
    console.log('receipt cancel transfer:', receiptTransferCancel);

    assert.strictEqual(receiptTransferCancel.Receipt.ExitCode, 0, 'error canceling transfer');
  });

  it("should create multisig wallet cancel add signer [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, 'test');
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    const multisigCid = await mnemonicWalletProvider.msigCreate(2, [addresses[0], addresses[1]], 0, '1000', addresses[0]);
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initAddProposeCid = await mnemonicWalletProvider.msigProposeAddSigner(multisigAddress, addresses[0], addresses[2], true);
    const receiptAddProposeCid = await con.state.waitMsg(initAddProposeCid, 0);
    console.log('receipt init add signer:', receiptAddProposeCid);

    const txnID = receiptAddProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating add proposal');

    const cancelAddCid = await mnemonicWalletProvider.msigCancelAddSigner(multisigAddress, addresses[0], txnID, addresses[2], true);
    const receiptAddCancel = await con.state.waitMsg(cancelAddCid, 0);
    console.log('receipt cancel add signer:', receiptAddCancel);

    assert.strictEqual(receiptAddCancel.Receipt.ExitCode, 0, 'error canceling add signer');
  });

  it("should create multisig wallet and cancel swap signer [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, 'test');
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    const multisigCid = await mnemonicWalletProvider.msigCreate(2, [addresses[0], addresses[1]], 0, '1000', addresses[0]);
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initSwapProposeCid = await mnemonicWalletProvider.msigProposeSwapSigner(multisigAddress, addresses[0], addresses[1], addresses[2]);
    const receiptSwapProposeCid = await con.state.waitMsg(initSwapProposeCid, 0);
    console.log('receipt init swap signer:', receiptSwapProposeCid);

    const txnID = receiptSwapProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating swap proposal');

    const cancelSwapCid = await mnemonicWalletProvider.msigCancelSwapSigner(multisigAddress, addresses[0], txnID, addresses[1], addresses[2] );
    const receiptSwapCancel = await con.state.waitMsg(cancelSwapCid, 0);
    console.log('receipt cancel swap signer:', receiptSwapCancel);

    assert.strictEqual(receiptSwapCancel.Receipt.ExitCode, 0, 'error canceling swap proposal');
  });

  it("should create multisig wallet and remove signer [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, 'test');
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    const multisigCid = await mnemonicWalletProvider.msigCreate(2, [addresses[0], addresses[1], addresses[2]], 0, '1000', addresses[0]);
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initRemoveProposeCid = await mnemonicWalletProvider.msigProposeRemoveSigner(multisigAddress, addresses[0], addresses[2], true);
    const receiptRemoveProposeCid = await con.state.waitMsg(initRemoveProposeCid, 0);
    console.log('receipt init remove signer:', receiptRemoveProposeCid);

    const txnID = receiptRemoveProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating add proposal');

    const approveRemoveCid = await mnemonicWalletProvider.msigApproveRemoveSigner(multisigAddress, addresses[1], txnID, addresses[0], addresses[2], true);
    const receiptRemoveApprove = await con.state.waitMsg(approveRemoveCid, 0);
    console.log('receipt approve remove signer:', receiptRemoveApprove);

    assert.strictEqual(receiptRemoveApprove.ReturnDec.Applied, true, 'error approving add proposal');
  });

  it("should create multisig wallet and cancel remove signer [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, 'test');
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    const multisigCid = await mnemonicWalletProvider.msigCreate(2, [addresses[0], addresses[1], addresses[2]], 0, '1000', addresses[0]);
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initRemoveProposeCid = await mnemonicWalletProvider.msigProposeRemoveSigner(multisigAddress, addresses[0], addresses[2], true);
    const receiptRemoveProposeCid = await con.state.waitMsg(initRemoveProposeCid, 0);
    console.log('receipt init remove signer:', receiptRemoveProposeCid);

    const txnID = receiptRemoveProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating add proposal');

    const cancelRemoveCid = await mnemonicWalletProvider.msigCancelRemoveSigner(multisigAddress, addresses[0], txnID, addresses[2], true);
    const receiptRemoveCancel = await con.state.waitMsg(cancelRemoveCid, 0);
    console.log('receipt cancel remove signer:', receiptRemoveCancel);

    assert.strictEqual(receiptRemoveCancel.Receipt.ExitCode, 0, 'error canceling remove proposal');
  });
});
