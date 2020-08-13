import { HttpJsonRpcConnector } from './connectors/HttpJsonRpcConnector';
import { JsonRpcProvider } from './providers/JsonRpcProvider';
import { MnemonicSigner } from './signers/MnemonicSigner';
import BigNumber from 'bignumber.js';
import { HttpJsonRpcWalletProvider } from './providers/wallet/HttpJsonRpcWalletProvider';

(async () => {
  try {
    const lotusUrl = 'http://localhost:8000/rpc/v0';
    //const con = new JsonRpcProvider('http://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');
    const con = new JsonRpcProvider(new HttpJsonRpcConnector(lotusUrl));


    console.error(`======================= start ==========================`);

    console.error(await con.version());
    console.error(await con.readObj({ '/': 'bafy2bzacecqlzny34omms3qvyrqerdqy6jbxg77bje2h3upd4kxjnxkn2zf6y' }));
    console.error(await con.getBlockMessages({ '/': 'bafy2bzacecpkzzq7fbulsp2k6ej5bcxpjrtpbmneyha7yb746qwbp4qejsdf6' }));
    const head = await con.getHead();
    console.error(head);
    console.error('111111111111', head.Blocks[0]);
    console.error('222222222222', await con.getBlock(head.Cids[0]));
    console.error(await con.readObj(head.Blocks[0].Parents[0]));


    const signer = new MnemonicSigner('equip will roof matter pink blind book anxiety banner elbow sun young', 'password');
    console.error(await signer.sign({
      From: 't1d2xrzcslx7xlbbylc5c3d5lvandqw4iwl6epxba',
      To: 't17uoq6tp427uzv7fztkbsnn64iwotfrristwpryy',
      Nonce: 1,
      GasLimit: 1,
      GasPrice: new BigNumber(1),
      Method: 0,
      Params: "",
      Value: new BigNumber(1),
      Version: 1,
    }));

    console.error(`======================= HttpJsonRpcWalletProvider ==========================`);

    const wallet = new HttpJsonRpcWalletProvider({url: lotusUrl, token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.uA6qcpZGI4FJXQtSnwh5b12t_n0yTJt5hTahFej_G5Q' })

    const accounts = await wallet.getAccounts();
    console.error(`wallet.getAccounts()`, accounts);
    console.error(`wallet.setDefaultAccount`, await wallet.setDefaultAccount(accounts[0]));

    const signedBuffer = await wallet.sign(new Uint8Array([1,2,3,4]));
    console.error(`wallet.sign signedBuffer`, signedBuffer);

    const signedString = await wallet.sign(`abc`)
    console.error(`wallet.sign`, signedString);

    const verifyBuffer = await wallet.verify(new Uint8Array([1,2,3,4]), signedBuffer);
    console.error(`wallet.verify`, verifyBuffer);

    const verifyString = await wallet.verify(`abca`, signedString);
    console.error(`wallet.verify`, verifyString);

  } catch (e) {
    console.error(e);
  }
})();
