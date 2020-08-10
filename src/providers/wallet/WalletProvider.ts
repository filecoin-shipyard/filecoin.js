import { Message, SignedMessage, Signature } from '../Types';

export interface WalletProvider {
  getAccounts(): Promise<string[]>;
  chainId(): Promise<any>; // number??
  getId(): Promise<any>; // number?
  sendMessage(msg: Message): Promise<any>;
  signMessage(msg: Message): Promise<SignedMessage>;
  sign(data: string): Promise<Signature>;
}
