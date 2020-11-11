import * as filecoin_signer from '@zondax/filecoin-signing-tools';
import { DEFAULT_HD_PATH, Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
import { StringGetter } from '../providers/Types'

export class MnemonicSigner implements Signer {
  private privKeys: any = [];
  public addresses: string[] = [];
  private defaultAddressIndex: number = 0;
  private hdIndex = 0;
  private path: string;

  constructor(
    private mnemonic: string | StringGetter,
    private password: string | StringGetter,
    path: string = DEFAULT_HD_PATH,
  ) {
    const pathParts = path.split('/');
    if (pathParts.length === 6) {
      const hdPathIndex = pathParts.splice(pathParts.length - 1, 1);
      this.hdIndex = parseInt(hdPathIndex[0].replace("'",""));
    }
    this.path = pathParts.join('/');
  }

  public async initAddresses(): Promise<void> {
    const key = filecoin_signer.keyDerive(await this.getMnemonic(), this.path, await this.getPassword());
    this.addresses.push(key.address);
    this.privKeys[key.address] = key.private_hexstring;
  }

  public async getAddresses(): Promise<string[]> {
    if (this.addresses.length === 0) await this.initAddresses();
    return this.addresses.filter((a, i) => { return a != '' });
  }

  async newAddress(n: number) {
    if (this.addresses.length === 0) await this.initAddresses();
    for (let i = 0; i < n; i++) {
      const key = filecoin_signer.keyDerive(this.mnemonic, `${this.path}/${i + this.hdIndex}`, '');
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
        const addresses = await this.getAddresses();
        if (addresses.length > 0) {
          await this.setDefaultAddress(addresses[0]);
        }
      }
    }
  }

  async getPrivateKey(address: string) {
    return this.privKeys[address];
  };

  async getDefaultAddress(): Promise<string> {
    if (this.addresses.length === 0) await this.initAddresses();
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
    if (this.addresses.length === 0) await this.initAddresses();
    if (!this.privKeys[message.From]){
      throw new Error('From address not found');
    }
    const key = this.privKeys[message.From];
    const signedTx = filecoin_signer.transactionSignLotus(this.messageToSigner(message), key);
    return JSON.parse(signedTx);
  }

  private async getPassword(): Promise<string> {
    return (typeof this.password == 'string') ? this.password : await this.password();
  }

  private async getMnemonic(): Promise<string> {
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
