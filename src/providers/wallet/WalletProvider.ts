import { Message, SignedMessage, Signature, KeyInfo, Cid, MessagePartial, VoucherSpec, ChainEpoch } from '../Types';
import BigNumber from 'bignumber.js';
import { LotusClient } from '../..';

export class WalletProvider {

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

  // MessageProvider implementation

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

  // PaymentChannelsProvider implementation
  // MultisigProvider implementation
}

export interface WalletProviderInterface {
  newAddress(): Promise<string>;
  deleteAddress(address: string): Promise<any>
  getAddresses(): Promise<string[]>
  hasAddress(address: string): Promise<any>
  setDefaultAddress(address: string): Promise<undefined>
  getDefaultAddress(): Promise<string>
  exportPrivateKey(address: string): Promise<KeyInfo>
  //getBalance(address: string): Promise<any>;
  sendMessage(msg: Message): Promise<SignedMessage>;
  signMessage(msg: Message, pk?: string): Promise<SignedMessage>;
  sign(data: string, pk?: string): Promise<Signature>;
  verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean>;
}

export interface MessageProviderInterface {
  //getNonce(address: string): Promise<number>;
  //sendSignedMessage(msg: SignedMessage): Promise<Cid>;

  //estimateMessageGasFeeCap(message: Message, nblocksincl: number): Promise<string>
  //estimateMessageGasLimit(message: Message): Promise<number>;
  //estimateMessageGasPremium(nblocksincl: number, sender: string, gasLimit: number): Promise<string>;
  //estimateMessageGas(message: Message): Promise<Message>
  //createMessage(message: MessagePartial): Promise<Message>
}

export interface PaymentChannelsProviderInterface {
  createPaymentChannel(from: string, to: string, amount: string): Promise<Cid>;
  updatePaymentChannel(pchAddress: string, from: string, signedVoucher: VoucherSpec): Promise<Cid>;
  settlePaymentChannel(pchAddress: string): Promise<Cid>;
  collectPaymentChannel(pchAddress: string): Promise<Cid>;

  getPaymentChannelBalance(pchAddress: string): Promise<string>;
  getPaymentChannelLaneNonce(pchAddress: string, lane: number): Promise<number>;

  createVoucher(address: string, amount: string, lane: number): Promise<VoucherSpec>;
  validateVoucher(signerAddress: string, signedVoucher: VoucherSpec): Promise<boolean>;
}

export interface MultisigProviderInterface {
  createMultisig(requiredNumberOfSenders: number,
    approvingAddresses: string[],
    unlockDuration: ChainEpoch,
    initialBalance: string,
    senderAddressOfCreateMsg: string,
    gasPrice: string): Promise<Cid>;

  proposeTransfer(address: string,
    recipientAddres: string,
    value: string,
    senderAddressOfProposeMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []): Promise<Cid>;
  approveTransfer(address: string,
    proposedTransactionId: number,
    signerAddress: string): Promise<Cid>;
  approveTransferTxHash(address: string,
    proposedMessageId: number,
    proposerAddress: string,
    recipientAddres: string,
    value: string,
    senderAddressOfApproveMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []): Promise<Cid>;
  cancelTransfer(address: string,
    proposedMessageId: number,
    proposerAddress: string,
    recipientAddres: string,
    value: string,
    senderAddressOfCancelMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []): Promise<Cid>;

  proposeAddSigner(address: string,
    senderAddressOfProposeMsg: string,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean): Promise<Cid>;
  approveAddSigner(address: string,
    senderAddressOfApproveMsg: string,
    proposedMessageId: number,
    proposerAddress: string,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean): Promise<Cid>;
  cancelAddSigner(address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean): Promise<Cid>;

  proposeSwapSigner(address: string,
    senderAddressOfProposeMsg: string,
    oldSignerAddress: string,
    newSignerAddress: string): Promise<Cid>;
  approveSwapSigner(address: string,
    senderAddressOfApproveMsg: string,
    proposedMessageId: number,
    proposerAddress: string,
    oldSignerAddress: string,
    newSignerAddress: string): Promise<Cid>;
  cancelSwapSigner(address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    oldSignerAddress: string,
    newSignerAddress: string): Promise<Cid>;

  proposeRemoveSigner(): Promise<Cid>;
  approveRemoveSigner(): Promise<Cid>;
  cancelRemoveSigner(): Promise<Cid>;
}