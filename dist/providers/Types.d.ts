import { BigNumber } from 'bignumber.js';
export interface Message {
    Version: bigint;
    To: string;
    From: string;
    Nonce: bigint;
    Value: BigNumber;
    GasPrice: BigNumber;
    Method: bigint;
    Params: ArrayBuffer;
}
export interface SignedMessage {
    Message: Message;
    Signature: string;
}
export interface Provider {
    sendMessage(message: Message): Promise<SignedMessage>;
    sendMessageSigned(message: SignedMessage): Promise<string>;
    getMessage(cid: string): Promise<Message>;
}
export interface Signer {
}
//# sourceMappingURL=Types.d.ts.map