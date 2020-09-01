import { Message, SignedMessage, Signature, Cid, MessagePartial } from '../Types';
import { WalletProvider } from './WalletProvider';
import { HttpJsonRpcConnector, JsonRpcConnectionOptions } from '../../connectors/HttpJsonRpcConnector';
import { toBase64 } from '../../utils/data';
import BigNumber from 'bignumber.js';

export class HttpJsonRpcWalletProvider implements WalletProvider {

  private conn: HttpJsonRpcConnector;

  constructor(url: string | JsonRpcConnectionOptions) {
    this.conn = new HttpJsonRpcConnector(url);
  }

  public async newAccount(type = 1): Promise<string[]> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletNew', params: [type] });
    return ret as string[];
  }

  public async getNonce(address: string): Promise<number> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolGetNonce', params: [address] });
    return ret as number;
  }

  public async getAccounts(): Promise<string[]> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletList' });
    return ret as string[];
  }

  public async getBalance(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletBalance', params: [address] });
    return ret as string;
  }

  public async setDefaultAccount(address: string): Promise<undefined> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletSetDefault', params: [address] });
    return ret as undefined;
  }

  public async getDefaultAccount(): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletDefaultAddress' });
    return ret as string;
  }

  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolPushMessage', params: [msg, { MaxFee: "30000000000000" }] });
    return ret as SignedMessage;
  }

  public async sendSignedMessage(msg: SignedMessage): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolPush', params: [msg] });
    return ret as Cid;
  }

  public async estimateMessageGas(message: Message): Promise<Message> {
    const ret = await this.conn.request({ method: 'Filecoin.GasEstimateMessageGas', params: [message, { MaxFee: "30000000000000" }, []] });
    return ret as Message;
  }

  public async createMessage(message: MessagePartial): Promise<Message> {
    let msg: Message = {
      To: message.To,
      From: message.From,
      Value: message.Value ? message.Value : new BigNumber(0),
      GasLimit: message.GasLimit ? message.GasLimit : 0,
      GasFeeCap: message.GasFeeCap ? message.GasFeeCap : new BigNumber(0),
      GasPremium: message.GasPremium ? message.GasPremium : new BigNumber(0),
      Method: message.Method ? message.Method : 0,
      Params: message.Params ? message.Params : '',
      Version: message.Version ? message.Version : 0,
      Nonce: message.Nonce ? message.Nonce : await this.getNonce(message.From),
    }

    if (msg.GasLimit === 0) msg = await this.estimateMessageGas(msg);

    return msg;
  }


  public async signMessage(msg: Message): Promise<SignedMessage> {
    const address = await this.getDefaultAccount();
    const ret = await this.conn.request({ method: 'Filecoin.WalletSignMessage', params: [address, msg] });
    return ret as SignedMessage;
  }

  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    const address = await this.getDefaultAccount();
    data = toBase64(data);
    const ret = await this.conn.request({ method: 'Filecoin.WalletSign', params: [address, data] });
    return ret as Signature;
  }

  public async verify(data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    const address = await this.getDefaultAccount();
    data = toBase64(data);
    const ret = await this.conn.request({ method: 'Filecoin.WalletVerify', params: [address, data, sign] });
    return ret as boolean;
  }
}
