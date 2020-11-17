import * as filecoin_signer from '@zondax/filecoin-signing-tools';
import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
import { Keystore } from '../utils/keystore';
import { privateEncrypt } from 'crypto';

export class LightWalletSigner implements Signer {

  constructor(
    private keystore: Keystore,
  ) { }

  public async sign(message: Message, password?: string): Promise<SignedMessage> {
    if (password) {
      const privateKey = await this.keystore.getPrivateKey(message.From, password)
      if (!privateKey){
        throw new Error('From address not found');
      }
      const signedTx = filecoin_signer.transactionSignLotus(this.messageToSigner(message), privateKey);
      return JSON.parse(signedTx);
    }
    return undefined as any;
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

}
