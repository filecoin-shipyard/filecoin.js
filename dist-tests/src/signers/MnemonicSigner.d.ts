import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
export declare type StringGetter = () => Promise<string>;
export declare class MnemonicSigner implements Signer {
    private mnemonic;
    private password;
    private path;
    constructor(mnemonic: string | StringGetter, password: string | StringGetter, path?: string);
    sign(message: Message): Promise<SignedMessage>;
    getDefaultAccount(): Promise<string>;
    private getPassword;
    private getMenmonic;
    private messageToSigner;
}
//# sourceMappingURL=MnemonicSigner.d.ts.map