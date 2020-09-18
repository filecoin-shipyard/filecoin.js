import { Message, SignedMessage, Signature } from "../Types";
import { HttpJsonRpcWalletProvider } from "./HttpJsonRpcWalletProvider";
import { MetamaskSigner } from "../../signers/MetamaskSigner";
import { Connector } from "../../connectors/Connector";
import { FilecoinSnapApi } from "@nodefactory/filsnap-types";

export class MetamaskWalletProvider extends HttpJsonRpcWalletProvider {

  private signer: MetamaskSigner;

  constructor(connector: Connector, filecoinApi: FilecoinSnapApi) {
    super(connector);
    this.signer = new MetamaskSigner(filecoinApi);
  }

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

  public getSigner(): MetamaskSigner {
    return this.signer;
  }

  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }
}
