import { Message, SignedMessage, Signature } from "../Types";
import { HttpJsonRpcWalletProvider } from "./HttpJsonRpcWalletProvider";
import { MetamaskSigner } from "../../signers/MetamaskSigner";
import { Connector } from "../../connectors/Connector";

export class MetamaskWalletProvider extends HttpJsonRpcWalletProvider {

  private signer: MetamaskSigner;

  constructor(connector: Connector) {
    super(connector);
    this.signer = new MetamaskSigner({
      url: connector.url,
      token: connector.url
    });
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

  public getSigner(): MetamaskSigner {
    return this.signer;
  }

  public async verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }
}
