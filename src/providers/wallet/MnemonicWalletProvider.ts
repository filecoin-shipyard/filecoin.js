import { Message, SignedMessage, Signature, KeyInfo } from "../Types";
import { BaseWalletProvider } from "./BaseWalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
import { StringGetter } from "../Types";
import { LotusClient } from "../..";
import { WalletProviderInterface } from "../ProviderInterfaces";

export class MnemonicWalletProvider extends BaseWalletProvider implements WalletProviderInterface {

  private signer: MnemonicSigner;

  constructor(client: LotusClient,
    mnemonic: string | StringGetter,
    password: string | StringGetter,
    path: string = `m/44'/461'/0/0/1`,
  ) {
    super(client);
    this.signer = new MnemonicSigner(mnemonic, password, path);
  }

  public async newAddress(): Promise<string> {
    await this.signer.newAddress(1)
    const addresses = await this.getAddresses();
    return addresses[addresses.length - 1];
  }

  public async deleteAddress(address: string): Promise<any> {
    this.signer.deleteAddress(address);
  }

  public async hasAddress(address: string): Promise<boolean> {
    return this.signer.hasAddress(address);
  }

  public async exportPrivateKey(address: string): Promise<KeyInfo> {
    const pk = await this.signer.getPrivateKey(address);
    return {
      Type: '1',
      PrivateKey: pk as any, //convert to uint8 array ?
    };
  }

  public async getAddresses(): Promise<string[]> {
    return this.signer.getAddresses();
  }

  public async getDefaultAddress(): Promise<string> {
    return await this.signer.getDefaultAddress();
  }

  public async setDefaultAddress(address: string): Promise<void> {
    this.signer.setDefaultAddress(address);
  }

  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const signedMessage: SignedMessage = await this.signMessage(msg);
    await this.sendSignedMessage(signedMessage);
    return signedMessage as SignedMessage;
  }

  public async signMessage(msg: Message): Promise<SignedMessage> {
    return await this.signer.sign(msg);
  }

  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    return undefined as any;
  }

  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }

  public getSigner(): MnemonicSigner {
    return this.signer;
  }
}
