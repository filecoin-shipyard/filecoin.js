import * as filecoin_signer from '@zondax/filecoin-signing-tools/js';
import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';

export class MnemonicSigner implements Signer {

  constructor(
    private mnemonic: string,
    private password: string,
    private path: string = `m/44'/461'/0/0/0`,
  ) { }

  public async sign(message: Message): Promise<SignedMessage> {
    const key = filecoin_signer.keyDerive(this.mnemonic, this.path, this.password);
    const signedTx = filecoin_signer.transactionSignLotus(this.messageToSigner(message), key.private_hexstring);
    return signedTx;
  }

  private messageToSigner(message: Message): {
    to: string,
    from: string,
    nonce: number,
    value: string,
    gasprice: string,
    gaslimit: number,
    method: number,
    params: string
  } {
    return {
      to: message.To,
      from: message.From,
      nonce: message.Nonce,
      value: message.Value.toString(),
      gasprice: message.GasPrice.toString(),
      gaslimit: message.GasLimit,
      method: message.Method,
      params: message.Params,
    }
  }

}
