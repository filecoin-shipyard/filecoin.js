import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../../testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';
import { MnemonicWalletProvider } from '../../src/providers/wallet/MnemonicWalletProvider';

import BigNumber from 'bignumber.js';

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Send message", async function () {
  it("should send signed message, lotus default wallet [http]", async function () {
    this.timeout(120000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const defaultAccount = await walletLotusHttp.getDefaultAccount();
    const accounts = await walletLotusHttp.getAccounts();
    const secpAddress = accounts[0];

    let pch = await walletLotusHttp.getPaymentChannel(defaultAccount, secpAddress,"300");
    pch = await walletLotusHttp.getPaymentChannel(defaultAccount, secpAddress,"300");
    const waitSentinel = pch.WaitSentinel;
    console.log(pch);

    //don't know how this works
    const channelAddress = await walletLotusHttp.getWaitReadyPaymentChannel(waitSentinel);
    console.log(channelAddress);

    const pchStatus = await walletLotusHttp.getPaymentChannelStatus(channelAddress);
    console.log(pchStatus);

    const pchLane = await walletLotusHttp.PaymentChannelAllocateLane(channelAddress);
    console.log(pchLane);

    const signedVoucher = await walletLotusHttp.PaymentChannelVoucherCreate(channelAddress,'3',0);
    console.log(signedVoucher);

    const signedVouchersList = await walletLotusHttp.PaymentChannelVoucherList(channelAddress);
    console.log(signedVouchersList);

    //i think this should be called by the recipient
    const status = await walletLotusHttp.PaymentChannelVoucherAdd(channelAddress, signedVouchersList[0], null, '0');
    console.log(status);

    const signedVouchersList2 = await walletLotusHttp.PaymentChannelVoucherList(channelAddress);
    console.log(signedVouchersList2);


    //await walletLotusHttp.setDefaultAccount(secpAddress);
    //console.log(await walletLotusHttp.getDefaultAccount());

    //this can be called by either sender or recipient and closes the payment channel
    const settleResult = await walletLotusHttp.PaymentChannelSettle(channelAddress);
    console.log(settleResult);

    //const collectResult = await walletLotusHttp.PaymentChannelCollect(channelAddress);
    //console.log(collectResult);

    //await walletLotusHttp.setDefaultAccount(defaultAccount);
    //console.log(await walletLotusHttp.getDefaultAccount());

  });
});