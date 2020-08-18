import { SignedMessage, Message } from '../providers/Types';
export interface Signer {
    sign(message: Message): Promise<SignedMessage>;
}
//# sourceMappingURL=Signer.d.ts.map