import { Message, SignedMessage, Signature, KeyInfo } from "../Types";
import { WalletProvider } from "./WalletProvider";
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

export class LightWalletProvider extends WalletProvider implements WalletProviderInterface{

  public keystore!: Keystore;
  private hdPathString = "m/44'/1'/0/0/1";
  private signer!: LightWalletSigner;

  constructor(client: LotusClient
  ) {
    super(client);
  }

  public async  newAddress(): Promise<string>{
    return undefined as any;
  }

  public async deleteAddress(address: string): Promise<any>{
    return undefined as any;
  }

  public async hasAddress(address: string): Promise<any>{
    return undefined as any;
  }

  public async exportPrivateKey(address: string): Promise<KeyInfo>{
    return undefined as any;
  }

  public async getAddresses(): Promise<string[]> {
    return [await this.getDefaultAddress()];
  }

  public async getDefaultAddress(): Promise<string> {
    return await this.signer.getDefaultAccount();
  }

  public async setDefaultAddress(address: string): Promise<undefined> {
    return undefined;
  }

  public async sendMessage(msg: Message, password?: string): Promise<SignedMessage> {
    const signedMessage: SignedMessage | undefined = await this.signMessage(msg, password);
    if (signedMessage) {
      await this.sendSignedMessage(signedMessage);
      return signedMessage as SignedMessage;
    }
    return undefined as any;
  }

  public async signMessage(msg: Message, password?: string): Promise<SignedMessage> {
    return await this.signer.sign(msg, password);
  }

  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    return undefined as any;
  }

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
