import { Message, SignedMessage, Signature, KeyInfo, DEFAULT_HD_PATH } from "../Types";
import { BaseWalletProvider } from "./BaseWalletProvider";
import { WalletProviderInterface } from "../ProviderInterfaces";
import { Keystore } from "../../utils/keystore";
import { LightWalletSigner } from "../../signers/LightWalletSigner";
import { LotusClient } from "../..";

interface LighWalletOptions {
  encKeystore?: string;
  hdPathString?: string;
  seedPhrase?: string;
  password?: string;
}

export class LightWalletProvider extends BaseWalletProvider implements WalletProviderInterface {

  public keystore!: Keystore;
  private hdPathString = DEFAULT_HD_PATH;
  private signer!: LightWalletSigner;
  private pwdCallback: Function;

  constructor(client: LotusClient, pwdCallback: Function) {
    super(client);
    this.pwdCallback = pwdCallback;
  }

  public async newAddress(): Promise<string> {
    await this.keystore.newAddress(1, this.pwdCallback())
    const addresses = await this.getAddresses();
    return addresses[addresses.length -1];
  }

  public async deleteAddress(address: string): Promise<void> {
    await this.keystore.deleteAddress(address, this.pwdCallback());
  }

  public async hasAddress(address: string): Promise<boolean> {
    return this.keystore.hasAddress(address);
  }

  public async exportPrivateKey(address: string): Promise<KeyInfo> {
    const pk = await this.keystore.getPrivateKey(address, this.pwdCallback());
    return {
      Type: '1',
      PrivateKey: pk as any, //convert to uint8 array ?
    };
  }

  public async getAddresses(): Promise<string[]> {
    return await this.keystore.getAddresses();
  }

  public async getDefaultAddress(): Promise<string> {
    return await this.keystore.getDefaultAddress();
  }

  public async setDefaultAddress(address: string): Promise<void> {
    this.keystore.setDefaultAddress(address)
  }

  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const signedMessage: SignedMessage | undefined = await this.signMessage(msg);
    if (signedMessage) {
      await this.sendSignedMessage(signedMessage);
      return signedMessage as SignedMessage;
    }
    return undefined as any;
  }

  public async signMessage(msg: Message): Promise<SignedMessage> {
    return await this.signer.sign(msg, this.pwdCallback());
  }

  //todo
  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    return undefined as any;
  }

  //todo
  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }

  // Own functions
  public async createLightWallet(password: string) {
    this.keystore = new Keystore();
    const mnemonic = this.keystore.generateRandomSeed();
    await this.keystore.createVault({
      hdPathString: this.hdPathString,
      seedPhrase: mnemonic,
      password: password,
    });
    this.signer = new LightWalletSigner(this.keystore);
    return mnemonic;
  }

  public async recoverLightWallet(mnemonic: string, password: string) {
    this.keystore = new Keystore();
    await this.keystore.createVault({
      hdPathString: this.hdPathString,
      seedPhrase: mnemonic,
      password: password,
    });
    this.signer = new LightWalletSigner(this.keystore);
  }

  public loadLightWallet(encryptedWallet: string) {
    this.keystore = new Keystore();
    this.keystore.deserialize(encryptedWallet);
    this.signer = new LightWalletSigner(this.keystore);
  }

  public prepareToSave() {
    return this.keystore.serialize();
  }

  public getSigner(): LightWalletSigner {
    return this.signer;
  }
}
