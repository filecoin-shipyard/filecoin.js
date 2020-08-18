import { Message, SignedMessage, Signature } from "../Types";
import { WalletProvider } from "./WalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
export declare class MnemonicWalletProvider implements WalletProvider {
    protected readonly signer: MnemonicSigner;
    constructor(signer: MnemonicSigner);
    getAccounts(): Promise<string[]>;
    getDefaultAccount(): Promise<string>;
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string | ArrayBuffer): Promise<Signature>;
    verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}
//# sourceMappingURL=MnemonicWalletProvider.d.ts.map