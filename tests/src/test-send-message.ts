import assert from 'assert';
import { LOTUS_AUTH_TOKEN } from '../tools/testnet/credentials/credentials';
import { LotusClient } from '../../src/providers/LotusClient';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

import BigNumber from 'bignumber.js';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

const testMnemonic =
  'equip will roof matter pink blind book anxiety banner elbow sun young';

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Send message', function () {
  it('should send signed message, lotus default wallet [http]', async function () {
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

    const defaultAccount = await walletLotusHttp.getDefaultAddress();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const message = await walletLotusHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1000000000000),
    });

    const signedMessage = await walletLotusHttp.signMessage(message);
    const msgCid = await walletLotusHttp.sendSignedMessage(signedMessage);

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
  });

  it('should send signed message, lotus default wallet [ws]', async function () {
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const wsConnector = new WsJsonRpcConnector({
      url: 'ws://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const con = new LotusClient(httpConnector);
    const mnemonicWalletProvider = new MnemonicWalletProvider(
      con,
      testMnemonic,
      '',
    );
    const walletLotusWs = new LotusWalletProvider(con);

    const defaultAccount = await walletLotusWs.getDefaultAddress();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const message = await walletLotusWs.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1000000000000),
    });

    const signedMessage = await walletLotusWs.signMessage(message);
    const msgCid = await walletLotusWs.sendSignedMessage(signedMessage);

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
    await walletLotusWs.release();
  });

  it('should send signed message, mnemonic wallet [http]', async function () {
    this.timeout(10000);
    await sleep(8000);

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

    const accounts = await walletLotusHttp.getAddresses();
    const secpAddress = accounts[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const message = await mnemonicWalletProvider.createMessage({
      From: mnemonicAddress,
      To: secpAddress,
      Value: new BigNumber(100),
    });

    const signedMessage = await mnemonicWalletProvider.signMessage(message);
    const msgCid = await mnemonicWalletProvider.sendSignedMessage(
      signedMessage,
    );

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
  });

  it('should send signed message, mnemonic wallet [ws]', async function () {
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const con = new LotusClient(httpConnector);

    const wsConnectorMnemonic = new WsJsonRpcConnector({
      url: 'ws://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const wsLotusClientMnemonic = new LotusClient(wsConnectorMnemonic);
    const wsConnectorLotus = new WsJsonRpcConnector({
      url: 'ws://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const wsLotusClient = new LotusClient(wsConnectorLotus);

    const mnemonicWalletProvider = new MnemonicWalletProvider(
      wsLotusClientMnemonic,
      testMnemonic,
      '',
    );
    const walletLotusWs = new LotusWalletProvider(wsLotusClient);

    const accounts = await walletLotusWs.getAddresses();
    const secpAddress = accounts[0];

    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAddress();

    const message = await mnemonicWalletProvider.createMessage({
      From: mnemonicAddress,
      To: secpAddress,
      Value: new BigNumber(100),
    });

    const signedMessage = await mnemonicWalletProvider.signMessage(message);
    const msgCid = await mnemonicWalletProvider.sendSignedMessage(
      signedMessage,
    );

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');

    await mnemonicWalletProvider.release();
    await walletLotusWs.release();
  });
});
