import { Message, SignedMessage, Signature } from "../Types";
import { WalletProvider } from "./WalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
import { SnapRpcMethodRequest, FilecoinSnapApi } from "@nodefactory/filsnap-types";
import { enableFilecoinSnap } from "@nodefactory/filsnap-adapter";
import { MetamaskFilecoinSnap } from "@nodefactory/filsnap-adapter";
import { JsonRpcConnectionOptions } from "../../connectors/HttpJsonRpcConnector";
import BigNumber from "bignumber.js";
import { connection } from "websocket";

export class MetamaskWalletProvider implements WalletProvider {

  constructor(
    connection: JsonRpcConnectionOptions,
  ) {
    this.connection = connection;
  }

  private connection: JsonRpcConnectionOptions;
  private isInstalled: boolean = false;
  private snap: MetamaskFilecoinSnap | undefined;
  private filecoinApi: FilecoinSnapApi | undefined;

  public async installFilecoinSnap() {
    try {
      console.log("installing snap");
      // enable filecoin snap with default testnet network
      const metamaskFilecoinSnap = await enableFilecoinSnap({
        derivationPath: "m/44'/1'/0/0/1",
        //@ts-ignore
        network: 'local',
        rpc: {
          token: this.connection.token!,
          url: this.connection.url!,
        }
      });
      this.isInstalled = true;
      this.snap = metamaskFilecoinSnap;
      return true;
    } catch (e) {
      console.log(e);
      this.isInstalled = false;
      return false;
    }
  }

  public async getAccounts(): Promise<string[]> {
    return [await this.getDefaultAccount()];
  }

  public async getDefaultAccount(): Promise<string> {
    if (this.isInstalled && this.snap) {
      this.filecoinApi = await this.snap.getFilecoinSnapApi();
    } else {
      await this.installFilecoinSnap();
      if (this.isInstalled && this.snap) {
        this.filecoinApi = await this.snap.getFilecoinSnapApi();
      }
    }
    if (!this.filecoinApi) return 'error';

    return this.filecoinApi.getAddress();
  }

  public async signMessage(msg: Message): Promise<SignedMessage> {
    const test: SignedMessage = {
      Message: msg,
      Signature: {
        Data: '',
        Type: 1
      }
    };
    return test;
  }

  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    return undefined as any;
  }

  public async verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }
}
