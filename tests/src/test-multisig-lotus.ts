import assert from 'assert';
import BigNumber from 'bignumber.js';

import { LOTUS_AUTH_TOKEN } from '../tools/testnet/credentials/credentials';
import { LotusClient } from '../../src/providers/LotusClient';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

const testMnemonic =
  'equip will roof matter pink blind book anxiety banner elbow sun young';

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractAddressesWithFunds(
  addresses: string[],
  wallet: LotusWalletProvider,
): Promise<{ blsAddresses: string[]; secpAddreses: string[] }> {
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
  }

  return { blsAddresses, secpAddreses };
}

describe('Multisig Wallets Lotus implementation', function () {
  it('should create multisig wallet and transfer funds [http]', async function () {
    this.timeout(40000);
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      con,
      testMnemonic,
      '',
    );
    const walletLotusHttp = new LotusWalletProvider(con);

    const addresses = await walletLotusHttp.getAddresses();
    const defaultAccount = await walletLotusHttp.getDefaultAddress();

    const { blsAddresses, secpAddreses } = await extractAddressesWithFunds(
      addresses,
      walletLotusHttp,
    );
    const t3address = blsAddresses[0];
    const t11address = secpAddreses[1];
    const t12address = secpAddreses[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const multisigCid = await walletLotusHttp.msigCreate(
      2,
      addresses,
      0,
      0,
      '1000',
      defaultAccount,
    );

    const receipt = await con.state.waitMsg(multisigCid, 0);
    const multisigAddress = receipt.ReturnDec.RobustAddress;

    const balance = await walletLotusHttp.msigGetAvailableBalance(
      multisigAddress,
      [],
    );
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initialDefaultWallet = await walletLotusHttp.getDefaultAddress();
    await walletLotusHttp.setDefaultAddress(t3address);

    const initTransferCid = await walletLotusHttp.msigProposeTransfer(
      multisigAddress,
      mnemonicAddress,
      '1',
      t3address,
    );
    const receiptTransferStart = await con.state.waitMsg(initTransferCid, 0);
    const txnID = receiptTransferStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating transfer');

    await walletLotusHttp.setDefaultAddress(t11address);
    const approveTransferCid = await walletLotusHttp.msigApproveTransferTxHash(
      multisigAddress,
      txnID,
      t3address,
      mnemonicAddress,
      '1',
      t11address,
    );
    const receiptTransferApprove = await con.state.waitMsg(
      approveTransferCid,
      0,
    );
    assert.strictEqual(
      receiptTransferApprove.ReturnDec.Applied,
      true,
      'error approving transfer',
    );

    const balanceAfterTransfer = await walletLotusHttp.msigGetAvailableBalance(
      multisigAddress,
      [],
    );
    assert.strictEqual(
      balanceAfterTransfer,
      '999',
      'wrong balance after approve transfer',
    );

    await walletLotusHttp.setDefaultAddress(initialDefaultWallet);
  });

  it('should create multisig wallet and add signer [http]', async function () {
    this.timeout(40000);
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      con,
      testMnemonic,
      '',
    );
    const walletLotusHttp = new LotusWalletProvider(con);

    const addresses = await walletLotusHttp.getAddresses();
    const { blsAddresses, secpAddreses } = await extractAddressesWithFunds(
      addresses,
      walletLotusHttp,
    );

    const defaultAccount = await walletLotusHttp.getDefaultAddress();

    const t3address = blsAddresses[0];
    const t11address = secpAddreses[1];
    const t12address = secpAddreses[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const multisigCid = await walletLotusHttp.msigCreate(
      2,
      [t3address, t11address],
      0,
      0,
      '1000',
      defaultAccount,
    );

    const receipt = await con.state.waitMsg(multisigCid, 0);
    const multisigAddress = receipt.ReturnDec.RobustAddress;

    const balance = await walletLotusHttp.msigGetAvailableBalance(
      multisigAddress,
      [],
    );
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initialDefaultWallet = await walletLotusHttp.getDefaultAddress();

    await walletLotusHttp.setDefaultAddress(t3address);
    const initAddProposeCid = await walletLotusHttp.msigProposeAddSigner(
      multisigAddress,
      t3address,
      t12address,
      false,
    );
    const receiptAddStart = await con.state.waitMsg(initAddProposeCid, 0);
    const txnID = receiptAddStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating add proposal');

    await walletLotusHttp.setDefaultAddress(t11address);
    const approveAddCid = await walletLotusHttp.msigApproveAddSigner(
      multisigAddress,
      t11address,
      txnID,
      t3address,
      t12address,
      false,
    );
    const receiptAddApprove = await con.state.waitMsg(approveAddCid, 0);
    assert.strictEqual(
      receiptAddApprove.ReturnDec.Applied,
      true,
      'error approving add proposal',
    );

    await walletLotusHttp.setDefaultAddress(initialDefaultWallet);
  });

  it('should create multisig wallet and swap signer [http]', async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      con,
      testMnemonic,
      '',
    );
    const walletLotusHttp = new LotusWalletProvider(con);

    const addresses = await walletLotusHttp.getAddresses();
    const defaultAccount = await walletLotusHttp.getDefaultAddress();

    const { blsAddresses, secpAddreses } = await extractAddressesWithFunds(
      addresses,
      walletLotusHttp,
    );
    const t3address = blsAddresses[0];
    const t11address = secpAddreses[1];
    const t12address = secpAddreses[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const multisigCid = await walletLotusHttp.msigCreate(
      2,
      [t3address, t11address],
      0,
      0,
      '1000',
      defaultAccount,
    );

    const receipt = await con.state.waitMsg(multisigCid, 0);
    const multisigAddress = receipt.ReturnDec.RobustAddress;

    const balance = await walletLotusHttp.msigGetAvailableBalance(
      multisigAddress,
      [],
    );
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initialDefaultWallet = await walletLotusHttp.getDefaultAddress();
    await walletLotusHttp.setDefaultAddress(t3address);

    const iniSwapProposeCid = await walletLotusHttp.msigProposeSwapSigner(
      multisigAddress,
      t3address,
      t11address,
      t12address,
    );
    const receiptProposeStart = await con.state.waitMsg(iniSwapProposeCid, 0);
    const txnID = receiptProposeStart.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating swap proposal');

    await walletLotusHttp.setDefaultAddress(t11address);
    const approveSwapCid = await walletLotusHttp.msigApproveSwapSigner(
      multisigAddress,
      t11address,
      txnID,
      t3address,
      t11address,
      t12address,
    );
    const receiptSwapApprove = await con.state.waitMsg(approveSwapCid, 0);
    assert.strictEqual(
      receiptSwapApprove.ReturnDec.Applied,
      true,
      'error approving add proposal',
    );

    await walletLotusHttp.setDefaultAddress(t3address);

    const initTransferCid = await walletLotusHttp.msigProposeTransfer(
      multisigAddress,
      mnemonicAddress,
      '1',
      t3address,
    );
    const receiptTransferStart = await con.state.waitMsg(initTransferCid, 0);
    const txnIDTransfer = receiptTransferStart.ReturnDec.TxnID;

    await walletLotusHttp.setDefaultAddress(t12address);
    const approveTransferCid = await walletLotusHttp.msigApproveTransferTxHash(
      multisigAddress,
      txnIDTransfer,
      t3address,
      mnemonicAddress,
      '1',
      t12address,
    );
    const receiptTransferApprove = await con.state.waitMsg(
      approveTransferCid,
      0,
    );
    assert.strictEqual(
      receiptTransferApprove.ReturnDec.Applied,
      true,
      'error approving transfer',
    );

    const balanceAfterTransfer = await walletLotusHttp.msigGetAvailableBalance(
      multisigAddress,
      [],
    );
    assert.strictEqual(
      balanceAfterTransfer,
      '999',
      'wrong balance after approve transfer',
    );

    await walletLotusHttp.setDefaultAddress(initialDefaultWallet);
  });

  it('should create multisig wallet and remove signer [http]', async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      con,
      testMnemonic,
      '',
    );
    const walletLotusHttp = new LotusWalletProvider(con);

    const addresses = await walletLotusHttp.getAddresses();

    const { blsAddresses, secpAddreses } = await extractAddressesWithFunds(
      addresses,
      walletLotusHttp,
    );
    const t3address = blsAddresses[0];
    const t11address = secpAddreses[1];
    const t12address = secpAddreses[0];

    const multisigCid = await walletLotusHttp.msigCreate(
      2,
      [t3address, t11address, t12address],
      0,
      0,
      '1000',
      t11address,
    );

    const receipt = await con.state.waitMsg(multisigCid, 0);
    const multisigAddress = receipt.ReturnDec.RobustAddress;

    const balance = await walletLotusHttp.msigGetAvailableBalance(
      multisigAddress,
      [],
    );
    assert.strictEqual(balance, '1000', 'wrong balance');

    const initRemoveProposeCid = await walletLotusHttp.msigProposeRemoveSigner(
      multisigAddress,
      t11address,
      t3address,
      true,
    );
    const receiptRemoveProposeCid = await con.state.waitMsg(
      initRemoveProposeCid,
      0,
    );

    const txnID = receiptRemoveProposeCid.ReturnDec.TxnID;
    assert.strictEqual(txnID, 0, 'error initiating remove proposal');
  });
});
