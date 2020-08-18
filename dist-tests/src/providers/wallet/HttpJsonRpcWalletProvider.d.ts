import { Message, SignedMessage, Signature, Cid } from '../Types';
import { WalletProvider } from './WalletProvider';
import { JsonRpcConnectionOptions } from '../../connectors/HttpJsonRpcConnector';
export declare class HttpJsonRpcWalletProvider implements WalletProvider {
    private conn;
    constructor(url: string | JsonRpcConnectionOptions);
    newAccount(type?: number): Promise<string[]>;
    getNonce(address: string): Promise<number>;
    getAccounts(): Promise<string[]>;
    getBalance(address: string): Promise<any>;
    setDefaultAccount(address: string): Promise<undefined>;
    getDefaultAccount(): Promise<string>;
    sendMessage(msg: Message): Promise<SignedMessage>;
    sendSignedMessage(msg: SignedMessage): Promise<Cid>;
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string | ArrayBuffer): Promise<Signature>;
    verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}
//# sourceMappingURL=HttpJsonRpcWalletProvider.d.ts.map