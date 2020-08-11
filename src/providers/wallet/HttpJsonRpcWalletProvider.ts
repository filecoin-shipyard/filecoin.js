import { Message, SignedMessage, Signature, Cid } from '../Types';
import { WalletProvider } from './WalletProvider';
import { HttpJsonRpcConnector, JsonRpcConnectionOptions } from '../../connectors/HttpJsonRpc';
import { toBase64 } from '../../utils/data';

export class HttpJsonRpcWalletProvider implements WalletProvider {

  private conn: HttpJsonRpcConnector;

  constructor(url: string | JsonRpcConnectionOptions) {
    this.conn = new HttpJsonRpcConnector(url);
  }

  public async newAccount(type = 1): Promise<string[]> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletNew', params: [type] });
    return ret.result;
  }

  public async getNonce(address: string): Promise<number> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolGetNonce', params: [address] });
    return ret.result;
  }

  public async getAccounts(): Promise<string[]> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletList' });
    return ret.result;
  }

  public async getBalance(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletBalance', params: [address] });
    return ret.result;
  }

  public async setDefaultAccount(address: string): Promise<undefined> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletSetDefault', params: [address] });
    return ret.result;
  }

  public async getDefaultAccount(): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletDefaultAddress' });
    return ret.result;
  }

  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolPushMessage', params: [msg] });
    return ret.result;
  }

  public async sendSignedMessage(msg: SignedMessage): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolPush', params: [msg] });
    return ret.result;
  }

  public async signMessage(msg: Message): Promise<SignedMessage> {
    const address = await this.getDefaultAccount();
    const ret = await this.conn.request({ method: 'Filecoin.WalletSignMessage', params: [address, msg] });
    return ret.result;
  }

  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    const address = await this.getDefaultAccount();
    data = toBase64(data);
    const ret = await this.conn.request({ method: 'Filecoin.WalletSign', params: [address, data] });
    return ret.result;
  }

  public async verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    const address = await this.getDefaultAccount();
    data = toBase64(data);
    const ret = await this.conn.request({ method: 'Filecoin.WalletVerify', params: [address, data, sign] });
    return ret.result;
  }
}
