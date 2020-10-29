import { Message, SignedMessage, Cid, MessagePartial } from '../Types';
import BigNumber from 'bignumber.js';
import { LotusClient } from '../..';

export class BaseWalletProvider {

  public client: LotusClient;

  constructor(client: LotusClient) {
    this.client = client;
  }

  public async release() {
    return this.client.release();
  }

  /**
   * get balance for address
   * @param address
   */
  public async getBalance(address: string): Promise<any> {
    const ret = await this.client.wallet.balance(address);
    return ret as string;
  }

  /**
   * get nonce for address.  Note that this method may not be atomic. Use MpoolPushMessage instead.
   * @param address
   */
  public async getNonce(address: string): Promise<number> {
    const ret = await this.client.mpool.getNonce(address);
    return ret as number;
  }

  /**
   * send signed message
   * @param msg
   */
  public async sendSignedMessage(msg: SignedMessage): Promise<Cid> {
    const ret = await this.client.mpool.push(msg)
    return ret as Cid;
  }

  /**
    * estimate gas fee cap
    * @param message
    * @param nblocksincl
    */
  public async estimateMessageGasFeeCap(message: Message, nblocksincl: number): Promise<string> {
    const ret = await this.client.gasEstimate.feeCap(message, nblocksincl);
    return ret as string;
  }

  /**
  * estimate gas limit, it fails if message fails to execute.
  * @param message
  */
  public async estimateMessageGasLimit(message: Message): Promise<number> {
    const ret = await this.client.gasEstimate.gasLimit(message);
    return ret as number;
  }

  /**
  * estimate gas to succesufully send message, and have it likely be included in the next nblocksincl blocks
  * @param nblocksincl
  * @param sender
  * @param gasLimit
  */
  public async estimateMessageGasPremium(nblocksincl: number, sender: string, gasLimit: number): Promise<string> {
    const ret = await this.client.gasEstimate.gasPremium(nblocksincl, sender, gasLimit);
    return ret as string;
  }

  /**
   * estimate gas to succesufully send message, and have it included in the next 10 blocks
   * @param message
   */
  public async estimateMessageGas(message: Message): Promise<Message> {
    const ret = await this.client.gasEstimate.messageGas(message);
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
}

