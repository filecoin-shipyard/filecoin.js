import assert from "assert";
import BigNumber from 'bignumber.js';

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { LotusClient } from '../../src/providers/LotusClient';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractAddressesWithFunds(addresses: string[], wallet: LotusWalletProvider): Promise<{ blsAddresses: string[], secpAddreses: string[] }> {
  let blsAddresses: string[] = [];
  let secpAddreses: string[] = [];

  for (let i = 0; i < addresses.length; i++) {
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

describe.only("Multisig Wallets", function () {
  it("should create multisig wallet and transfer funds [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');

    const walletLotusHttp = new LotusWalletProvider(con);
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();
    const mnemonicAddress = await mnemonicWalletProvider.newAddress();

    //await fundTestAddresses(await walletLotusHttp.getDefaultAddress(), addresses, walletLotusHttp, con);

    await mnemonicWalletProvider.setDefaultAddress(addresses[0]);
    const multisigCid = await mnemonicWalletProvider.msigCreate(2, addresses, 0, '1000', addresses[0], '4000');
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    await mnemonicWalletProvider.setDefaultAddress(addresses[0]);
    const initTransferCid = await mnemonicWalletProvider.msigProposeTransfer(multisigAddress, mnemonicAddress, '1', addresses[0], 0, []);
    const receiptTransferStart = await con.state.waitMsg(initTransferCid, 0);
    console.log('receipt init transfer:', receiptTransferStart);

    const txnID = receiptTransferStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating transfer');

    await mnemonicWalletProvider.setDefaultAddress(addresses[1]);
    const approveTransferCid = await mnemonicWalletProvider.msigApproveTransferTxHash(multisigAddress, txnID, addresses[0], mnemonicAddress, '1', addresses[1], 0, []);
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
    const walletLotusHttp = new LotusWalletProvider(con);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    //await fundTestAddresses(await walletLotusHttp.getDefaultAddress(), addresses, walletLotusHttp, con);

    await mnemonicWalletProvider.setDefaultAddress(addresses[0]);
    const multisigCid = await mnemonicWalletProvider.msigCreate(2, [addresses[0], addresses[1]], 0, '1000', addresses[0], '4000');
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    await mnemonicWalletProvider.setDefaultAddress(addresses[0]);
    const initAddProposeCid = await mnemonicWalletProvider.msigProposeAddSigner(multisigAddress, addresses[0], addresses[2], true);
    const receiptAddProposeCid = await con.state.waitMsg(initAddProposeCid, 0);
    console.log('receipt init add signer:', receiptAddProposeCid);

    const txnID = receiptAddProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating add proposal');

    await mnemonicWalletProvider.setDefaultAddress(addresses[1]);
    const approveAddCid = await mnemonicWalletProvider.msigApproveAddSigner(multisigAddress, addresses[1], txnID, addresses[0], addresses[2], true);
    const receiptAddApprove = await con.state.waitMsg(approveAddCid, 0);
    console.log('receipt approve add signer:', receiptAddApprove);

    assert.strictEqual(receiptAddApprove.ReturnDec.Applied, true, 'error approving add proposal');
  });

  it("should create multisig wallet and swap signer [http]", async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const con = new LotusClient(httpConnector);
    const walletLotusHttp = new LotusWalletProvider(con);
    const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');
    await mnemonicWalletProvider.newAddress();
    await mnemonicWalletProvider.newAddress();
    const addresses = await mnemonicWalletProvider.getAddresses();

    //await fundTestAddresses(await walletLotusHttp.getDefaultAddress(), addresses, walletLotusHttp, con);

    await mnemonicWalletProvider.setDefaultAddress(addresses[0]);
    const multisigCid = await mnemonicWalletProvider.msigCreate(2, [addresses[0], addresses[1]], 0, '1000', addresses[0], '4000');
    const receipt = await con.state.waitMsg(multisigCid, 0);
    console.log('receipt create:', receipt);

    const multisigAddress = receipt.ReturnDec.RobustAddress;
    const balance = await con.msig.getAvailableBalance(multisigAddress, []);
    assert.strictEqual(balance, '1000', 'wrong balance');

    await mnemonicWalletProvider.setDefaultAddress(addresses[0]);
    const initSwapProposeCid = await mnemonicWalletProvider.msigProposeSwapSigner(multisigAddress, addresses[0], addresses[1], addresses[2]);
    const receiptSwapProposeCid = await con.state.waitMsg(initSwapProposeCid, 0);
    console.log('receipt init swap signer:', receiptSwapProposeCid);

    const txnID = receiptSwapProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating swap proposal');

    await mnemonicWalletProvider.setDefaultAddress(addresses[1]);
    const approveSwapCid = await mnemonicWalletProvider.msigApproveSwapSigner(multisigAddress, addresses[1], txnID, addresses[0], addresses[1], addresses[2] );
    const receiptSwapApprove = await con.state.waitMsg(approveSwapCid, 0);
    console.log('receipt approve swap signer:', receiptSwapApprove);

    assert.strictEqual(receiptSwapApprove.ReturnDec.Applied, true, 'error approving swap proposal');
  });
});
