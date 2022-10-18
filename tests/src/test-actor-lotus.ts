import assert from 'assert';
import { LOTUS_AUTH_TOKEN } from '../tools/testnet/credentials/credentials';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { LotusClient } from '../../src/providers/LotusClient';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';
import cbor from 'ipld-dag-cbor';

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let addressList: string[];
let newAddress: string;

describe('Actor methods', function () {
  it('should invoke actor method [http]', async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);
    const walletLotusHttp = new LotusWalletProvider(lotusClient);

    const invokeMethodMessageCID = await walletLotusHttp.actorInvokeMethod(
      't01004',
      2,
    );

    const receipt = await lotusClient.state.waitMsg(invokeMethodMessageCID, 0);

    const decodedResponse = Buffer.from(receipt.Receipt.Return, 'base64');
    console.log(cbor.util.deserialize(decodedResponse));
  });

  it('should install actor [http]', async function () {
    this.timeout(60000);
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);
    const walletLotusHttp = new LotusWalletProvider(lotusClient);

    const invokeMethodMessageCID = await walletLotusHttp.actorInstallActorMethod();

    // const receipt = await lotusClient.state.waitMsg(invokeMethodMessageCID, 0);

    // const decodedResponse = Buffer.from(receipt.Receipt.Return, 'base64');
    // console.log(cbor.util.deserialize(decodedResponse));
  });

  it.only('should get address [http]', async function () {
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);
    const walletLotusHttp = new LotusWalletProvider(lotusClient);

    const defaultAccount = await walletLotusHttp.getDefaultAddress();
    const res = await walletLotusHttp.exportPrivateKey(defaultAccount);
    const pkBase64: any = res.PrivateKey;
    console.log(Buffer.from(pkBase64, 'base64').toString('hex'));
  });
});
