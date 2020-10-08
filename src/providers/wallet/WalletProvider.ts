import { Message, SignedMessage, Signature } from '../Types';

export interface WalletProvider {
  getAccounts(): Promise<string[]>;
  //sendMessage(msg: Message): Promise<SignedMessage>;
  signMessage(msg: Message, password?: string): Promise<SignedMessage>;
  sign(data: string, password?: string): Promise<Signature>;
  verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}
