import { Message, SignedMessage, Signature } from '../Types';

export interface WalletProvider {
  getAccounts(): Promise<string[]>;
  //sendMessage(msg: Message): Promise<SignedMessage>;
  signMessage(msg: Message): Promise<SignedMessage>;
  sign(data: string): Promise<Signature>;
  verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}
