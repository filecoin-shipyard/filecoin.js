import * as filecoin_signer from '@zondax/filecoin-signing-tools/js';
import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
import { StringGetter } from '../providers/Types'

export class MnemonicSigner implements Signer {
  private privKeys!: any;
  public addresses!: string[];
  private defaultAddressIndex: number = 0;
  private hdIndex = 0;

  constructor(
    private mnemonic: string | StringGetter,
    private password: string | StringGetter,
    private path: string = `m/44'/461'/0/0/1`,
  ) { }

  public async initAddresses(): Promise<void> {
    const key = filecoin_signer.keyDerive(await this.getMenmonic(), this.path, await this.getPassword());
    this.addresses.push(key.address);
    this.privKeys[key.address] = key.private_hexstring;
  }

  async newAddress(n: number) {
    for (let i = 0; i < n; i++) {
      const key = filecoin_signer.keyDerive(this.mnemonic, `this.hdPathString/${i + this.hdIndex}`, '');
      this.addresses.push(key.address);
      this.privKeys[key.address] = key.private_hexstring;
    }

    this.hdIndex += n;
  };

  async deleteAddress(address: string) {
    const addressIndex = this.addresses.indexOf(address);
    if (addressIndex >= 0) {
      this.addresses[addressIndex] = '';
      this.privKeys[address] = '';
      if (this.defaultAddressIndex === addressIndex) {
        this.defaultAddressIndex = 0;
      }
    }
  }

  async getPrivateKey(address: string) {
    return this.privKeys[address];
  };

  async getDefaultAddress(): Promise<string> {
    return this.addresses[this.defaultAddressIndex];
  }

  async setDefaultAddress(address: string): Promise<void> {
    const addressIndex = this.addresses.indexOf(address);
    if (addressIndex >= 0) {
      this.defaultAddressIndex = addressIndex;
    }
  }

  async hasAddress(address: string): Promise<boolean> {
    return this.addresses.indexOf(address) >= 0;
  }

  public async sign(message: Message): Promise<SignedMessage> {
    let key;
    if (this.defaultAddressIndex === 0) {
      key = filecoin_signer.keyDerive(await this.getMenmonic(), this.path, await this.getPassword());
    } else {
      key = this.privKeys[this.addresses[this.defaultAddressIndex]];
    }

    const signedTx = filecoin_signer.transactionSignLotus(this.messageToSigner(message), key.private_hexstring);
    return JSON.parse(signedTx);
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
