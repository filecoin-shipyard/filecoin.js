import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { HttpJsonRpcWalletProvider } from '../../src/providers/wallet/HttpJsonRpcWalletProvider';

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Payment channel tests", async function () {
  it("Payment channel test [http]", async function () {
    this.timeout(120000);
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

    const walletLotusHttp = new HttpJsonRpcWalletProvider(httpConnector);
    const con = new JsonRpcProvider(httpConnector);

    const defaultAccount = await walletLotusHttp.getDefaultAccount();
    const accounts = await walletLotusHttp.getAccounts();
    const secpAddress = accounts[0];

    let pch = await con.getPaymentChannel(defaultAccount, secpAddress,"300");
    const waitSentinel = pch.WaitSentinel;
    console.log(pch);

    //don't know how this works
    const channelAddress = await con.getWaitReadyPaymentChannel(waitSentinel);
    console.log(channelAddress);

    const pchStatus = await con.getPaymentChannelStatus(channelAddress);
    console.log(pchStatus);

    const pchLane = await con.PaymentChannelAllocateLane(channelAddress);
    console.log(pchLane);

    const signedVoucher = await con.PaymentChannelVoucherCreate(channelAddress,'3',0);
    console.log(signedVoucher);

    const signedVouchersList = await con.PaymentChannelVoucherList(channelAddress);
    console.log(signedVouchersList);

    //i think this should be called by the recipient
    const status = await con.PaymentChannelVoucherAdd(channelAddress, signedVouchersList[0], null, '0');
    console.log(status);

    const signedVouchersList2 = await con.PaymentChannelVoucherList(channelAddress);
    console.log(signedVouchersList2);


    //await walletLotusHttp.setDefaultAccount(secpAddress);
    //console.log(await walletLotusHttp.getDefaultAccount());

    //this can be called by either sender or recipient and closes the payment channel
    const settleResult = await con.PaymentChannelSettle(channelAddress);
    console.log(settleResult);

    //const collectResult = await walletLotusHttp.PaymentChannelCollect(channelAddress);
    //console.log(collectResult);

    //await walletLotusHttp.setDefaultAccount(defaultAccount);
    //console.log(await walletLotusHttp.getDefaultAccount());

  });
});