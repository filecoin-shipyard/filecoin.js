import assert from 'assert';
import { LOTUS_AUTH_TOKEN } from '../tools/testnet/credentials/credentials';
import { LotusClient } from '../../src/providers/LotusClient';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';
import { addressAsBytes } from '@zondax/filecoin-signing-tools';
import cbor from 'ipld-dag-cbor';

import BigNumber from 'bignumber.js';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';
import { serializeBigNum } from '../../src/utils/data';

const testMnemonic =
  'equip will roof matter pink blind book anxiety banner elbow sun young';

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe.skip('Send message', function () {
  it('should set notary, lotus default wallet [http]', async function () {
    console.log(LOTUS_AUTH_TOKEN);
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const con = new LotusClient(httpConnector);
    const walletLotusHttp = new LotusWalletProvider(con);

    let defaultAccount = await walletLotusHttp.getDefaultAddress();

    const msgParams = [
      addressAsBytes('t1wuup6esryeeobxuyl6layogan5h5mseahgzwzai'),
      serializeBigNum('10000000000000000000'),
    ];
    const serializedMsgParams = cbor.util.serialize(msgParams);
    const buff = Buffer.from(serializedMsgParams);

    const message = await walletLotusHttp.createMessage({
      From: defaultAccount,
      To: 'f06',
      Value: new BigNumber(0),
      Method: 2,
      Params: buff.toString('base64'),
    });

    const signedMessage = await walletLotusHttp.signMessage(message);
    const msgCid = await walletLotusHttp.sendSignedMessage(signedMessage);

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
  });

  it('should set client, lotus default wallet [http]', async function () {
    console.log(LOTUS_AUTH_TOKEN);
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const con = new LotusClient(httpConnector);
    const walletLotusHttp = new LotusWalletProvider(con);

    let defaultAccount = await walletLotusHttp.getDefaultAddress();
    await walletLotusHttp.setDefaultAddress(
      't1wuup6esryeeobxuyl6layogan5h5mseahgzwzai',
    );
    defaultAccount = await walletLotusHttp.getDefaultAddress();

    const msgParams = [
      addressAsBytes('t1uwymawx5idcrn56xhtctpqmwgjds3s6kxixvfia'),
      serializeBigNum('100000000'),
    ];
    const serializedMsgParams = cbor.util.serialize(msgParams);
    const buff = Buffer.from(serializedMsgParams);

    const message = await walletLotusHttp.createMessage({
      From: defaultAccount,
      To: 'f06',
      Value: new BigNumber(0),
      Method: 4,
      Params: buff.toString('base64'),
    });

    const signedMessage = await walletLotusHttp.signMessage(message);
    const msgCid = await walletLotusHttp.sendSignedMessage(signedMessage);

    const isMined = await con.chain.hasObj(msgCid);
    assert.strictEqual(isMined, true, 'message not mined');
  });
});
