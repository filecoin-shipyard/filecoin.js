import * as filecoin_signer from '@zondax/filecoin-signing-tools';
import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
import { JsonRpcConnectionOptions } from '../connectors/HttpJsonRpcConnector';
import { MetamaskFilecoinSnap } from '@nodefactory/filsnap-adapter/build/snap';
import { FilecoinSnapApi } from '@nodefactory/filsnap-types';
import { enableFilecoinSnap } from '@nodefactory/filsnap-adapter';

export class MetamaskSigner implements Signer {

  constructor(
    private filecoinApi: FilecoinSnapApi,
  ) { }

  public async sign(message: Message): Promise<SignedMessage> {
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
