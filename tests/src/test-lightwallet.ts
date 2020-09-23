import assert from "assert";
import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { LightWalletProvider } from '../../src/providers/wallet/LightWalletProvider';

const testMnemonic = 'equip will roof matter pink blind book anxiety banner elbow sun young';

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe.only("Send message", function () {
  it("should create vault [http]", async function () {
    const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
    const lightWalletProvider = new LightWalletProvider(httpConnector, { });
    //might not work since internally we use a few callbacks
    console.log(lightWalletProvider.keystore.serialize());
  });
});