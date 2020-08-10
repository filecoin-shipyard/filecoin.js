import { Message, SignedMessage, Signature } from "../Types";

export class MnemonicWalletProvider {

  constructor() {

  }


  public async getAccounts() {

  }

  public async chainId() {
    // chain id ???
  }

  public async getId() {
    // network id ???
  }

  public async sendMessage(msg: Message): Promise<any> {

  }

  public async signMessage(msg: Message): Promise<SignedMessage> {

  }

  public async sign(msg: string): Promise<Signature> {

  }
}
