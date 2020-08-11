import { Message, SignedMessage, Signature } from "../Types";
import { WalletProvider } from "./WalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
import { toBase64 } from "../../utils/data";

export class MnemonicWalletProvider implements WalletProvider {

  constructor(
    protected readonly signer: MnemonicSigner,
  ) { }

  public async getAccounts(): Promise<string[]> {
    return [await this.getDefaultAccount()];
  }

  public async getDefaultAccount(): Promise<string> {
    return await this.signer.getDefaultAccount();
  }

  public async signMessage(msg: Message): Promise<SignedMessage> {
    return this.signer.sign(msg);
  }

  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    return undefined as any;
  }

  public async verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }
}
