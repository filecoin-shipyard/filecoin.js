import { Message, SignedMessage, Signature, Cid, MessagePartial, KeyInfo } from '../Types';
import { WalletProvider } from './WalletProvider';
import { HttpJsonRpcConnector, JsonRpcConnectionOptions } from '../../connectors/HttpJsonRpcConnector';
import { toBase64 } from '../../utils/data';
import BigNumber from 'bignumber.js';
import { Connector } from '../../connectors/Connector';
import { LotusClient } from '../..';

export class HttpJsonRpcWalletProvider implements WalletProvider {

  private lotusClient: LotusClient;

  constructor(connector: Connector) {
    this.lotusClient = new LotusClient(connector);
  }

  public async release() {
    return this.lotusClient.release();
  }

  /**
   * create new wallet
   * @param type
   */
  public async newAccount(type = 1): Promise<string> {
    const ret = await this.lotusClient.wallet.new(type);
    return ret as string;
  }

  /**
   * get nonce for address.  Note that this method may not be atomic. Use MpoolPushMessage instead.
   * @param address
   */
  public async getNonce(address: string): Promise<number> {
    const ret = await this.lotusClient.mpool.getNonce(address);
    return ret as number;
  }

  /**
   * get wallet list
   */
  public async getAccounts(): Promise<string[]> {
    const ret = await this.lotusClient.wallet.list();
    return ret as string[];
  }

  /**
   * get balance for address
   * @param address
   */
  public async getBalance(address: string): Promise<any> {
    const ret = await this.lotusClient.wallet.balance(address);
    return ret as string;
  }

  /**
   * delete address from lotus
   * @param address
   */
  public async deleteWallet(address: string): Promise<any> {
    const ret = await this.lotusClient.wallet.delete(address);
    return ret as boolean;
  }

  /**
  * check if address is in keystore
  * @param address
  */
  public async hasWallet(address: string): Promise<boolean> {
    const ret = await this.lotusClient.wallet.has(address);
    return ret as boolean;
  }

  /**
   * set default address
   * @param address
   */
  public async setDefaultAccount(address: string): Promise<undefined> {
    const ret = await this.lotusClient.wallet.setDefault(address);
    return ret as undefined;
  }

  /**
   * walletExport returns the private key of an address in the wallet.
   * @param address
   */
  public async walletExport(address: string): Promise<KeyInfo> {
    const ret = await this.lotusClient.wallet.export(address);
    return ret as KeyInfo;
  }

  /**
   * walletImport returns the private key of an address in the wallet.
   * @param keyInfo
   */
  public async walletImport(keyInfo: KeyInfo): Promise<string> {
    const ret = await this.lotusClient.wallet.import(keyInfo);
    return ret as string;
  }

  /**
   * get default address
   */
  public async getDefaultAccount(): Promise<string> {
    const ret = await this.lotusClient.wallet.getDefaultAddress();
    return ret as string;
  }

  /**
   * send message, signed with default lotus wallet
   * @param msg
   */
  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const ret = await this.lotusClient.mpool.pushMessage(msg)
    return ret as SignedMessage;
  }

  /**
   * send signed message
   * @param msg
   */
  public async sendSignedMessage(msg: SignedMessage): Promise<Cid> {
    const ret = await this.lotusClient.mpool.push(msg)
    return ret as Cid;
  }

  /**
  * estimate gas fee cap
  * @param message
  * @param nblocksincl
  */
  public async estimateMessageGasFeeCap(message: Message, nblocksincl: number): Promise<string> {
    const ret = await this.lotusClient.gasEstimate.feeCap(message, nblocksincl);
    return ret as string;
  }

  /**
  * estimate gas limit, it fails if message fails to execute.
  * @param message
  */
  public async estimateMessageGasLimit(message: Message): Promise<number> {
    const ret = await this.lotusClient.gasEstimate.gasLimit(message);
    return ret as number;
  }

  /**
  * estimate gas to succesufully send message, and have it likely be included in the next nblocksincl blocks
  * @param nblocksincl
  * @param sender
  * @param gasLimit
  */
  public async estimateMessageGasPremium(nblocksincl: number, sender: string, gasLimit: number): Promise<string> {
    const ret = await this.lotusClient.gasEstimate.gasPremium(nblocksincl, sender, gasLimit);
    return ret as string;
  }

  /**
   * estimate gas to succesufully send message, and have it included in the next 10 blocks
   * @param message
   */
  public async estimateMessageGas(message: Message): Promise<Message> {
    const ret = await this.lotusClient.gasEstimate.messageGas(message);
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
    const ret = await this.lotusClient.wallet.signMessage(msg);
    return ret as SignedMessage;
  }

  /**
   * sign raw message
   * @param data
   */
  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    const ret = await this.lotusClient.wallet.sign(data);
    return ret as Signature;
  }

  /**
   * verify message signature
   * @param data
   * @param sign
   */
  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    const ret = await this.lotusClient.wallet.verify(address, data, sign);
    return ret as boolean;
  }
}
