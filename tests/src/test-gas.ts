import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

import BigNumber from 'bignumber.js';
import { Message } from "../../src/providers/Types";

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';

describe("Gas estimates", function () {
  it("Gas estimates computations [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const mnemonicWalletProvider = new MnemonicWalletProvider( httpConnector, testMnemonic, '');
    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const defaultAccount = await walletLotusHttp.getDefaultAccount();
    const mnemonicAddress = await mnemonicWalletProvider.getDefaultAccount();

    const message = await walletLotusHttp.createMessage({
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1000000000000),
    });

    const msgPartial: Message = {
      Version: 0,
      From: defaultAccount,
      To: mnemonicAddress,
      Value: new BigNumber(1000000000000),
      GasLimit: 0,
      GasFeeCap: new BigNumber(0),
      GasPremium: new BigNumber(0),
      Method: 0,
      Nonce: 0,
      Params: ''
    }

    const mpoolConfig = await con.mpool.getMpoolConfig();
    const gasLimit: number = await walletLotusHttp.estimateMessageGasLimit(msgPartial);
    const gasFeeCap = await walletLotusHttp.estimateMessageGasFeeCap(msgPartial, 10);
    const gasPremium = await walletLotusHttp.estimateMessageGasPremium(2, defaultAccount, gasLimit*mpoolConfig.GasLimitOverestimation);

    const computedGasFeeCap = new BigNumber(message.GasFeeCap);
    assert.strictEqual(gasLimit*mpoolConfig.GasLimitOverestimation, message.GasLimit, 'gas limit does not match');
    //assert.strictEqual(gasFeeCap, computedGasFeeCap.minus(message.GasPremium).toString(), 'gas fee cap does not match');
    //need to test gasPremium as well.
    //gasPremium, err := a.GasEstimateGasPremium(ctx, 2, msg.From, msg.GasLimit, types.TipSetKey{}) <-lotus
    //this call ^ gives a slightly larger value, which i think is due to the tipset key used, needs more investigating
  });
});
