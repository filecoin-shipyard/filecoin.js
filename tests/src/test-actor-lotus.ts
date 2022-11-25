import assert from 'assert';
import { LOTUS_AUTH_TOKEN } from '../tools/testnet/credentials/credentials';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LotusWalletProvider } from '../../src/providers/wallet/LotusWalletProvider';
import { LotusClient } from '../../src/providers/LotusClient';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';
import cbor from 'ipld-dag-cbor';
import { abi } from './abi/littlecoin';
import { BigNumber, ethers } from 'ethers';

import RpcEngine from '@glif/filecoin-rpc-client';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';

import {
  blake2b256,
  blake2b456,
  blake2b56,
} from '@multiformats/blake2/blake2b';
import { CID, MultihashDigest } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import { digest } from 'multiformats/index';
import { from } from 'multiformats/hashes/hasher';
import { hexConcat } from 'ethers/lib/utils';
const blake = require('blakejs');

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let addressList: string[];
let newAddress: string;

describe('Actor methods', function () {
  it.skip('should invoke actor method [http]', async function () {
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

  it.skip('should install actor [http]', async function () {
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

  it.skip('should get default address pk [http]', async function () {
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

  it.skip('should get default address balance [http]', async function () {
    this.timeout(60000);

    const iface = new ethers.utils.Interface(abi);

    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);
    const walletLotusHttp = new LotusWalletProvider(lotusClient);

    // const invokeMethodMessageCID = await walletLotusHttp.actorInvokeMethod(
    //   't01002',
    //   2,
    //   [
    //     iface.getSighash('getBalance'),
    //     '000000000000000000000000ff000000000000000000000000000000000003ea',
    //   ],
    // );
    // const receipt = await lotusClient.state.waitMsg(invokeMethodMessageCID, 0);
    // const decodedResponse = Buffer.from(receipt.Receipt.Return, 'base64');
    // const res = cbor.util.deserialize(decodedResponse);
    // console.log(decodedResponse.toString());

    //--------------------------------------------------------------------------------------------

    //0xff000000000000000000000000000000000003ea

    let provider = ethers.getDefaultProvider('http://localhost:8000/rpc/v0');

    let contractAddress = '0xff000000000000000000000000000000000003EC';

    let contract = new ethers.Contract(contractAddress, abi, provider);

    console.log(iface.getSighash('name'));
    console.log(await contract.name());
    console.log(
      (
        await contract.getBalance('0xff000000000000000000000000000000000003ea')
      ).toString(),
    );

    //--------------------------------------------------------------------------------------------

    // bafy2bzaceatoachquzc2j4a3l6pigof3lalrrdyq2zhcqmlw32nsm6w3gldu2
    // bafy2bzaceajsaxlaxlb2dgeeuj3uyh7dvp7aj62pcmras256kcpmchjyeqhg4
    const receipt1 = await lotusClient.state.waitMsg(
      { '/': 'bafy2bzaceatoachquzc2j4a3l6pigof3lalrrdyq2zhcqmlw32nsm6w3gldu2' },
      0,
    );
    const receipt2 = await lotusClient.state.waitMsg(
      { '/': 'bafy2bzaceajsaxlaxlb2dgeeuj3uyh7dvp7aj62pcmras256kcpmchjyeqhg4' },
      0,
    );
    console.log(receipt1);
    console.log(receipt2);
  });

  it.skip('test function call 1', async function () {
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);

    let provider = ethers.getDefaultProvider('http://localhost:8000/rpc/v0');

    const signer = new ethers.Wallet(
      '0x2e449673a4b0b7e561c4c105c64d725556335cce15d2b345cce13057ef9aa8aa',
      provider,
    );
    const chainId = 31415926;

    // 0xff000000000000000000000000000000000003eb

    let contractAddress = '0xff000000000000000000000000000000000003EC';

    let contract = new ethers.Contract(contractAddress, abi, signer);

    // contract.name().then((r) => console.log(r));

    await contract.sendCoin('0xff000000000000000000000000000000000003eb', 100);

    //   .then((r) => console.log(r.toString()));
    // const priorityFee = await lotusClient.conn.request({
    //   method: 'eth_maxPriorityFeePerGas',
    //   params: [],
    // });

    // console.log('priority fee', priorityFee.toString());
    // const approveTxUnsigned = await contract.populateTransaction.sendCoin(
    //   '0xff000000000000000000000000000000000003eb',
    //   100,
    // );
    // approveTxUnsigned.chainId = chainId; // chainId 1 for Ethereum mainnet
    // approveTxUnsigned.gasLimit = BigNumber.from(1000000000);
    // approveTxUnsigned.nonce = 2;
    // approveTxUnsigned.type = 2;
    // approveTxUnsigned.maxFeePerGas = BigNumber.from('0x2E90EDD000');
    // approveTxUnsigned.maxPriorityFeePerGas = BigNumber.from(priorityFee);

    // const approveTxSigned = await signer.signTransaction(approveTxUnsigned);
    // const submittedTx = await provider.sendTransaction(approveTxSigned);
  });

  it.skip('test function call 2', async function () {
    const httpConnector = new HttpJsonRpcConnector({
      url: 'http://localhost:8000/rpc/v0',
      token: LOTUS_AUTH_TOKEN,
    });
    const lotusClient = new LotusClient(httpConnector);

    const contractAddress = '0x44c2b41Ae7ed3b9089F52Ebf20b6258A8E8aA72B';
    let provider = ethers.getDefaultProvider('http://localhost:8000/rpc/v0');

    const signer = new ethers.Wallet(
      '0x2e449673a4b0b7e561c4c105c64d725556335cce15d2b345cce13057ef9aa8aa',
      provider,
    );
    const chainId = 31415926;
    let contract = new ethers.Contract(contractAddress, abi, signer);

    const secpActor = '0xff000000000000000000000000000000000003ea';

    const ethRpc = new RpcEngine({
      apiAddress: 'http://localhost:8000/rpc/v0',
      namespace: 'eth',
      delimeter: '_',
    });

    const data = contract.interface.encodeFunctionData('sendCoin', [
      '0xff000000000000000000000000000000000003eb',
      100,
    ]);
    const filRpc = new RpcEngine({
      apiAddress: 'localhost:8000/rpc/v0',
    });

    console.log('before calls');
    const priorityFee = await lotusClient.conn.request({
      method: 'eth_maxPriorityFeePerGas',
      params: [],
    });
    console.log(priorityFee);
    const nonce = 1; //await filRpc.request('MpoolGetNonce', secpActor);

    const txObject = {
      nonce,
      gasLimit: 1000000000, // BlockGasLimit / 10
      to: contractAddress,
      value: ethers.BigNumber.from(0).toHexString(),
      maxPriorityFeePerGas: priorityFee,
      maxFeePerGas: '0x2E90EDD000',
      chainId: ethers.BigNumber.from(chainId).toHexString(),
      data,
      type: 2,
    };

    console.log(txObject);
    const tx = FeeMarketEIP1559Transaction.fromTxData(txObject);
    const pk =
      '2e449673a4b0b7e561c4c105c64d725556335cce15d2b345cce13057ef9aa8aa';
    const sig = tx.sign(Buffer.from(pk, 'hex'));

    const serializedTx = sig.serialize();
    const rawTxHex = '0x' + serializedTx.toString('hex');

    const res = await ethRpc.request('sendRawTransaction', rawTxHex);
    console.log(res);
  });

  it('build msg cid from tx hash', async function () {
    //mh, _ := multihash.EncodeName(h[:], "blake2b-256")
    // return cid.NewCidV1(cid.DagCBOR, mh)

    const aux = new Uint8Array();
    const hexifiedStr = Uint8Array.from(
      Buffer.from(
        'babe0c9aa93ab52696d5a3881ae2b64a3ccab9ede8f0c452c52a133a8865ef3b',
        'hex',
      ),
    );

    var prefix = new Uint8Array([160, 228, 2, 32]);

    var mergedArray = new Uint8Array(prefix.length + hexifiedStr.length);
    mergedArray.set(prefix);
    mergedArray.set(hexifiedStr, prefix.length);

    const a: MultihashDigest = {
      code: 113,
      bytes: mergedArray,
      digest: aux,
      size: 13,
    };

    console.log(
      'bafy2bzaceakw6vvxudgtws6mevvaxft6vum3pqpktpoqp6ovwvykfyg2wzzhi',
    );
    const cid = CID.createV1(113, a);
    console.log(cid);
  });
});
