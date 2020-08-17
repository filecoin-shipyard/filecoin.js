import assert, { deepEqual } from 'assert';
import { LOTUS_AUTH_TOKEN } from "../../testnet/credentials";
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';
import { MnemonicSigner } from '../../src/signers/MnemonicSigner';
import BigNumber from 'bignumber.js';

const walletLotus = new HttpJsonRpcWalletProvider({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const signer = new MnemonicSigner('equip will roof matter pink blind book anxiety banner elbow sun young', '', `m/44'/1'/0/0/1`)

describe("RPC Wallet", function () {
  it("Accounts", async function () {

    const mnemonicAddress = 't1o5kdqsmjb2zh4i7aeggespvz72nmveio2cwhlai';

    const accounts = await walletLotus.getAccounts();
    const secpAddress = accounts[0];

    console.error(accounts);
    assert(accounts.length > 0, 'no accounts open');
    const defaultAccount = await walletLotus.getDefaultAccount();

    console.error('Main Balance:', await walletLotus.getBalance(defaultAccount));
    console.error('Mnemonic Balance:', await walletLotus.getBalance(mnemonicAddress));
    console.error('SECP Balance:', await walletLotus.getBalance(secpAddress));

    console.error('>>>>>>', defaultAccount);
    const balance = await walletLotus.getBalance(defaultAccount);
    assert(balance > 0, 'account should have balance');

    await walletLotus.sendMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      GasLimit: 25000,
      GasPrice: new BigNumber(2500),
      Value: new BigNumber(1000000000000000000),
      Method: 0,
      Params: '',
      Version: 0,
      Nonce: 0,
    });

    const signedMessage = await signer.sign({
      To: secpAddress,
      From: mnemonicAddress,
      GasLimit: 25000,
      GasPrice: new BigNumber(2500),
      Value: new BigNumber(1000000000000000000),
      Method: 0,
      Params: '',
      Version: 0,
      Nonce: await walletLotus.getNonce(mnemonicAddress),
    });

    console.error('~~~~~~~~~~~~', signedMessage);
    await walletLotus.sendSignedMessage(JSON.parse(signedMessage as any));


    console.error('Main Balance:', await walletLotus.getBalance(defaultAccount));
    console.error('Mnemonic Balance:', await walletLotus.getBalance(mnemonicAddress));
    console.error('BLT Balance:', await walletLotus.getBalance(secpAddress));
  });
});
