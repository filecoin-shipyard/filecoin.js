import { Message, SignedMessage, Signature } from "../Types";
import { HttpJsonRpcWalletProvider } from "./HttpJsonRpcWalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
import { JsonRpcConnectionOptions } from "../../connectors/HttpJsonRpcConnector";
import { StringGetter } from "../Types";

export class MnemonicWalletProvider extends HttpJsonRpcWalletProvider {

  private signer:MnemonicSigner;

  constructor(url: JsonRpcConnectionOptions,
    mnemonic: string | StringGetter,
    password: string | StringGetter,
    path: string = `m/44'/461'/0/0/1`,
  ) {
    super(url);
    this.signer = new MnemonicSigner(mnemonic, password, path);
  }

  public async getAccounts(): Promise<string[]> {
    return [await this.getDefaultAccount()];
  }

  public async getDefaultAccount(): Promise<string> {
    return await this.signer.getDefaultAccount();
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

  public async verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }
}
