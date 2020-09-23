import { Message, SignedMessage, Signature } from "../Types";
import { HttpJsonRpcWalletProvider } from "./HttpJsonRpcWalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
import { StringGetter } from "../Types";
import { Connector } from "../../connectors/Connector";
import { Keystore } from "../../utils/keystore";

interface LighWalletOptions {
    encKeystore?: string;
    hdPathString?: string;
    seedPhrase?: string;
    password?: string;
}

export class LightWalletProvider {// extends HttpJsonRpcWalletProvider {

  //private signer:MnemonicSigner;
  public keystore: Keystore;

  constructor(connector: Connector,
    opts: LighWalletOptions
  ) {
    //super(connector);
    this.keystore = new Keystore();
    this.keystore.createVault({
      hdPathString: "m/44'/461'/0/0/1",
      seedPhrase: 'equip will roof matter pink blind book anxiety banner elbow sun young',
      password: 'test',
    });
    /*
    if (opts.encKeystore) {
        //decode keystore
        this.signer = new MnemonicSigner('', '', '');
    } else {
        //create keystore
        this.signer = new MnemonicSigner('', '', '');
    }
    */
  }










/*



  public async getAccounts(): Promise<string[]> {
    return [await this.getDefaultAccount()];
  }

  public async getDefaultAccount(): Promise<string> {
    return await this.signer.getDefaultAccount();
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

  public getSigner(): MnemonicSigner {
    return this.signer;
  }

  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }
  */
}
