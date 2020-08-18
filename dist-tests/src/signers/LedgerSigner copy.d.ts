import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
export declare class LedgerSigner implements Signer {
    private path;
    constructor(path?: string);
    sign(message: Message): Promise<SignedMessage>;
    getDefaultAccount(): Promise<string>;
    private messageToSigner;
}
//# sourceMappingURL=LedgerSigner copy.d.ts.map