import { Message, SignedMessage, Signature } from '../Types';
export interface WalletProvider {
    getAccounts(): Promise<string[]>;
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string): Promise<Signature>;
    verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}
//# sourceMappingURL=WalletProvider.d.ts.map