import { Message, SignedMessage, Signature, Cid, MessagePartial, KeyInfo } from '../Types';
import { WalletProvider } from './WalletProvider';
import { HttpJsonRpcConnector, JsonRpcConnectionOptions } from '../../connectors/HttpJsonRpcConnector';
import { toBase64 } from '../../utils/data';
import BigNumber from 'bignumber.js';
import { Connector } from '../../connectors/Connector';

export class HttpJsonRpcWalletProvider implements WalletProvider {

  private conn: Connector;

  constructor(connector: Connector) {
    this.conn = connector;
    this.conn.connect();
  }

  public async release() {
    return this.conn.disconnect();
  }

  /**
   * create new wallet
   * @param type
   */
  public async newAccount(type = 1): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletNew', params: [type] });
    return ret as string;
  }

  /**
   * get nonce for address
   * @param address
   */
  public async getNonce(address: string): Promise<number> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolGetNonce', params: [address] });
    return ret as number;
  }

  /**
   * get wallet list
   */
  public async getAccounts(): Promise<string[]> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletList' });
    return ret as string[];
  }

  /**
   * get balance for address
   * @param address
   */
  public async getBalance(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletBalance', params: [address] });
    return ret as string;
  }

  /**
   * delete address from lotus
   * @param address
   */
  public async deleteWallet(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletDelete', params: [address] });
    return ret as boolean;
  }

  /**
  * check if address is in keystore
  * @param address
  */
  public async hasWallet(address: string): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletHas', params: [address] });
    return ret as boolean;
  }

  /**
   * set default address
   * @param address
   */
  public async setDefaultAccount(address: string): Promise<undefined> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletSetDefault', params: [address] });
    return ret as undefined;
  }

  /**
   * walletExport returns the private key of an address in the wallet.
   * @param address
   */
  public async walletExport(address: string): Promise<KeyInfo> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletExport', params: [address] });
    return ret as KeyInfo;
  }

  /**
   * walletImport returns the private key of an address in the wallet.
   * @param keyInfo
   */
  public async walletImport(keyInfo: KeyInfo): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletImport', params: [keyInfo] });
    return ret as string;
  }

  /**
   * get default address
   */
  public async getDefaultAccount(): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.WalletDefaultAddress' });
    return ret as string;
  }

  /**
   * send message, signed with default lotus wallet
   * @param msg
   */
  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolPushMessage', params: [msg, { MaxFee: "30000000000000" }] });
    return ret as SignedMessage;
  }

  /**
   * send signed message
   * @param msg
   */
  public async sendSignedMessage(msg: SignedMessage): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.MpoolPush', params: [msg] });
    return ret as Cid;
  }

  /**
  * estimate gas fee cap
  * @param message
  * @param nblocksincl
  */
  public async estimateMessageGasFeeCap(message: Message, nblocksincl: number): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.GasEstimateFeeCap', params: [message, nblocksincl, []] });
    return ret as string;
  }

  /**
  * estimate gas limit, it fails if message fails to execute.
  * @param message
  */
  public async estimateMessageGasLimit(message: Message): Promise<number> {
    const ret = await this.conn.request({ method: 'Filecoin.GasEstimateGasLimit', params: [message, []] });
    return ret as number;
  }

  /**
  * estimate gas to succesufully send message, and have it likely be included in the next nblocksincl blocks
  * @param nblocksincl
  * @param sender
  * @param gasLimit
  */
  public async estimateMessageGasPremium(nblocksincl: number, sender: string, gasLimit: number): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.GasEstimateGasPremium', params: [nblocksincl, sender, gasLimit, []] });
    return ret as string;
  }

  /**
   * estimate gas to succesufully send message, and have it included in the next 10 blocks
   * @param message
   */
  public async estimateMessageGas(message: Message): Promise<Message> {
    const ret = await this.conn.request({ method: 'Filecoin.GasEstimateMessageGas', params: [message, { MaxFee: "30000000000000" }, []] });
    return ret as Message;
  }

  /**
   * prepare a message for signing, add defaults, and populate nonce and gas related parameters if not provided
   * @param message
   */
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

  //Signer methods
  /**
   * sign message
   * @param msg
   */
  public async signMessage(msg: Message): Promise<SignedMessage> {
    const address = await this.getDefaultAccount();
    const ret = await this.conn.request({ method: 'Filecoin.WalletSignMessage', params: [address, msg] });
    return ret as SignedMessage;
  }

  /**
   * sign raw message
   * @param data
   */
  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    const address = await this.getDefaultAccount();
    data = toBase64(data);
    const ret = await this.conn.request({ method: 'Filecoin.WalletSign', params: [address, data] });
    return ret as Signature;
  }

  /**
   * verify message signature
   * @param data
   * @param sign
   */
  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    data = toBase64(data);
    const ret = await this.conn.request({ method: 'Filecoin.WalletVerify', params: [address, data, sign] });
    return ret as boolean;
  }
}
