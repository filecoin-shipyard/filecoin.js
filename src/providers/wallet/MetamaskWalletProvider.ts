import { Message, SignedMessage, Signature, KeyInfo } from "../Types";
import { MetamaskSigner } from "../../signers/MetamaskSigner";
import { BaseWalletProvider } from "./BaseWalletProvider";
import { FilecoinSnapApi } from "@nodefactory/filsnap-types";
import { LotusClient } from "../..";
import { WalletProviderInterface } from "../ProviderInterfaces";

export class MetamaskWalletProvider extends BaseWalletProvider implements WalletProviderInterface{

  private signer: MetamaskSigner;

  constructor(client: LotusClient, filecoinApi: FilecoinSnapApi) {
    super(client);
    this.signer = new MetamaskSigner(filecoinApi);
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

  //Own functions
  public getSigner(): MetamaskSigner {
    return this.signer;
  }

}
