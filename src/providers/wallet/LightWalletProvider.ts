import { Message, SignedMessage, Signature } from "../Types";
import { HttpJsonRpcWalletProvider } from "./HttpJsonRpcWalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
import { StringGetter } from "../Types";
import { Connector } from "../../connectors/Connector";
import { Keystore } from "../../utils/keystore";
import { LightWalletSigner } from "../../signers/LightWalletSigner";

interface LighWalletOptions {
  encKeystore?: string;
  hdPathString?: string;
  seedPhrase?: string;
  password?: string;
}

export class LightWalletProvider extends HttpJsonRpcWalletProvider {

  public keystore!: Keystore;
  private hdPathString = "m/44'/1'/0/0/1";
  private signer!: LightWalletSigner;

  constructor(connector: Connector
  ) {
    super(connector);
  }

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

  public async getAccounts(): Promise<string[]> {
    return [await this.getDefaultAccount()];
  }

  public async getDefaultAccount(): Promise<string> {
    return await this.signer.getDefaultAccount();
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

  public getSigner(): LightWalletSigner {
    return this.signer;
  }

  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }
}
