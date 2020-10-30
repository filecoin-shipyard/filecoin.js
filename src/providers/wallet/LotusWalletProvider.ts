import { KeyInfo, Message, NewAddressType, Signature, SignedMessage } from '../Types';
import { BaseWalletProvider } from './BaseWalletProvider';
import { WalletProviderInterface } from "../ProviderInterfaces";
import { LotusClient } from '../..';

export class LotusWalletProvider extends BaseWalletProvider implements WalletProviderInterface {

  constructor(client: LotusClient) {
    super(client);
  }

  // WaletProvider implementation
  /**
   * create new wallet
   * @param type
   */
  public async newAddress(type: NewAddressType  = NewAddressType.SECP256K1): Promise<string> {
    const ret = await this.client.wallet.new(type);
    return ret as string;
  }

  /**
   * delete address from lotus
   * @param address
   */
  public async deleteAddress(address: string): Promise<any> {
    const ret = await this.client.wallet.delete(address);
    return ret as boolean;
  }

  /**
   * get wallet list
   */
  public async getAddresses(): Promise<string[]> {
    const ret = await this.client.wallet.list();
    return ret as string[];
  }

  /**
   * check if address is in keystore
   * @param address
   */
  public async hasAddress(address: string): Promise<boolean> {
    const ret = await this.client.wallet.has(address);
    return ret as boolean;
  }

  /**
   * set default address
   * @param address
   */
  public async setDefaultAddress(address: string): Promise<undefined> {
    const ret = await this.client.wallet.setDefault(address);
    return ret as undefined;
  }

  /**
   * get default address
   */
  public async getDefaultAddress(): Promise<string> {
    const ret = await this.client.wallet.getDefaultAddress();
    return ret as string;
  }

  /**
   * walletExport returns the private key of an address in the wallet.
   * @param address
   */
  public async exportPrivateKey(address: string): Promise<KeyInfo> {
    const ret = await this.client.wallet.export(address);
    return ret as KeyInfo;
  }

   /**
   * send message, signed with default lotus wallet
   * @param msg
   */
  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const ret = await this.client.mpool.pushMessage(msg)
    return ret as SignedMessage;
  }

  /**
   * sign message
   * @param msg
   */
  public async signMessage(msg: Message): Promise<SignedMessage> {
    const ret = await this.client.wallet.signMessage(msg);
    return ret as SignedMessage;
  }

  /**
   * sign raw message
   * @param data
   */
  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    const ret = await this.client.wallet.sign(data);
    return ret as Signature;
  }

  /**
   * verify message signature
   * @param data
   * @param sign
   */
  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    const ret = await this.client.wallet.verify(address, data, sign);
    return ret as boolean;
  }

  // Own functions
  /**
   * walletImport returns the private key of an address in the wallet.
   * @param keyInfo
   */
  public async walletImport(keyInfo: KeyInfo): Promise<string> {
    const ret = await this.client.wallet.import(keyInfo);
    return ret as string;
  }
}
