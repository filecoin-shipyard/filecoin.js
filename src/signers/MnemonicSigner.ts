import * as filecoin_signer from '@zondax/filecoin-signing-tools/js';
import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';

export type StringGetter = () => Promise<string>;

export class MnemonicSigner implements Signer {

  constructor(
    private mnemonic: string | StringGetter,
    private password: string | StringGetter,
    private path: string = `m/44'/461'/0/0/1`,
  ) { }

  public async sign(message: Message): Promise<SignedMessage> {
    const key = filecoin_signer.keyDerive(await this.getMenmonic(), this.path, await this.getPassword());
    const signedTx = filecoin_signer.transactionSignLotus(this.messageToSigner(message), key.private_hexstring);
    return signedTx;
  }

  public async getDefaultAccount(): Promise<string> {
    const keypair = filecoin_signer.keyDerive(await this.getMenmonic(), this.path, await this.getPassword());
    return keypair.address;
  }

  private async getPassword(): Promise<string> {
    return (typeof this.password == 'string') ? this.password : await this.password();
  }

  private async getMenmonic(): Promise<string> {
    return (typeof this.mnemonic == 'string') ? this.mnemonic : await this.mnemonic();
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
