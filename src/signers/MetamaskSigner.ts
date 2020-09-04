import * as filecoin_signer from '@zondax/filecoin-signing-tools/js';
import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
import { JsonRpcConnectionOptions } from '../connectors/HttpJsonRpcConnector';
import { MetamaskFilecoinSnap } from '@nodefactory/filsnap-adapter/build/snap';
import { FilecoinSnapApi } from '@nodefactory/filsnap-types';
import { enableFilecoinSnap } from '@nodefactory/filsnap-adapter';

export class MetamaskSigner implements Signer {

  constructor(
    private connection: JsonRpcConnectionOptions,
  ) { }

  private async installFilecoinSnap() {
    if (!this.isInstalled) {
      try {
        console.log("installing snap");
        console.log(this.connection);
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
      } catch (e) {
        this.isInstalled = false;
        return e;
      }
    }

    if (this.isInstalled && this.snap) {
      this.filecoinApi = await this.snap.getFilecoinSnapApi();
    }
    return null;
  }

  private isInstalled: boolean = false;
  private snap: MetamaskFilecoinSnap | undefined;
  private filecoinApi: FilecoinSnapApi | undefined;

  public async sign(message: Message): Promise<SignedMessage> {
    const err = await this.installFilecoinSnap();
    if (err) {
      throw err;
    }
    if (this.filecoinApi) {
      return this.messageFromSigner(await this.filecoinApi.signMessage(this.messageToSigner(message)));
    }
    return {
      Message: message,
      Signature: {
        Type: -1,
        Data: ''
      }
    };
  }

  public async getDefaultAccount(): Promise<string> {
    const err = await this.installFilecoinSnap();
    if (err) {
      throw err;
    }
    if (this.filecoinApi) {
      return this.filecoinApi.getAddress();
    }
    return '';
  }

  private messageToSigner(message: Message): {
    to: string,
    from: string,
    nonce: number,
    value: string,
    gaslimit: number,
    gasfeecap: string,
    gaspremium: string,
    method: number,
    params: string
  } {
    return {
      to: message.To,
      from: message.From,
      nonce: message.Nonce,
      value: message.Value.toString(),
      gaslimit: Number(message.GasLimit.toString()),
      gasfeecap: message.GasFeeCap.toString(),
      gaspremium: message.GasPremium.toString(),
      method: message.Method,
      params: message.Params,
    }
  }

  private messageFromSigner(signedMessage: any): SignedMessage {
    return {
      Message: signedMessage.message,
      Signature: signedMessage.signature,
    }
  }

}
