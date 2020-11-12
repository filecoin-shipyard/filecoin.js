import { ChainEpoch, Cid, KeyInfo, Message, MethodMultisig, NewAddressType, Signature, SignedMessage } from '../Types';
import { BaseWalletProvider } from './BaseWalletProvider';
import { MultisigProviderInterface, WalletProviderInterface } from "../ProviderInterfaces";
import { LotusClient } from '../..';

export class LotusWalletProvider extends BaseWalletProvider implements WalletProviderInterface, MultisigProviderInterface {

  constructor(client: LotusClient) {
    super(client);
  }

  // WaletProvider implementation
  /**
   * create new wallet
   * @param type
   */
  public async newAddress(type: NewAddressType = NewAddressType.SECP256K1): Promise<string> {
    const ret = await this.client.wallet.new(type);
    return ret as string;
  }

  /**
   * delete address from lotus
   * @param address
   */
  public async deleteAddress(address: string): Promise<any> {
    const ret = await this.client.wallet.delete(address);
    return ret as boolean;
  }

  /**
   * get wallet list
   */
  public async getAddresses(): Promise<string[]> {
    const ret = await this.client.wallet.list();
    return ret as string[];
  }

  /**
   * check if address is in keystore
   * @param address
   */
  public async hasAddress(address: string): Promise<boolean> {
    const ret = await this.client.wallet.has(address);
    return ret as boolean;
  }

  /**
   * set default address
   * @param address
   */
  public async setDefaultAddress(address: string): Promise<undefined> {
    const ret = await this.client.wallet.setDefault(address);
    return ret as undefined;
  }

  /**
   * get default address
   */
  public async getDefaultAddress(): Promise<string> {
    const ret = await this.client.wallet.getDefaultAddress();
    return ret as string;
  }

  /**
   * walletExport returns the private key of an address in the wallet.
   * @param address
   */
  public async exportPrivateKey(address: string): Promise<KeyInfo> {
    const ret = await this.client.wallet.export(address);
    return ret as KeyInfo;
  }

  /**
  * send message, signed with default lotus wallet
  * @param msg
  */
  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const ret = await this.client.mpool.pushMessage(msg)
    return ret as SignedMessage;
  }

  /**
   * sign message
   * @param msg
   */
  public async signMessage(msg: Message): Promise<SignedMessage> {
    const ret = await this.client.wallet.signMessage(msg);
    return ret as SignedMessage;
  }

  /**
   * sign raw message
   * @param data
   */
  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    const ret = await this.client.wallet.sign(data);
    return ret as Signature;
  }

  /**
   * verify message signature
   * @param data
   * @param sign
   */
  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    const ret = await this.client.wallet.verify(address, data, sign);
    return ret as boolean;
  }

  //MultisigProvider Implementation
  /**
   * creates a multisig wallet
   * @param requiredNumberOfSenders
   * @param approvingAddresses
   * @param startEpoch
   * @param unlockDuration
   * @param initialBalance
   * @param senderAddressOfCreateMsg
   */
  public async msigCreate(
    requiredNumberOfSenders: number,
    approvingAddresses: string[],
    startEpoch: ChainEpoch,
    unlockDuration: ChainEpoch,
    initialBalance: string,
    senderAddressOfCreateMsg: string,
  ): Promise<Cid> {
    const ret = await this.client.msig.create(requiredNumberOfSenders, approvingAddresses, unlockDuration, initialBalance, senderAddressOfCreateMsg, '0');
    return ret;
  }

  /**
   * proposes a multisig message
   * @param address
   * @param recipientAddres
   * @param value
   * @param senderAddressOfProposeMsg
   */
  public async msigProposeTransfer(
    address: string,
    recipientAddres: string,
    value: string,
    senderAddressOfProposeMsg: string
  ): Promise<Cid> {
    const ret = await this.client.msig.propose(address, recipientAddres, value, senderAddressOfProposeMsg, 0, []);
    return ret;
  }

  /**
   * approves a previously-proposed multisig message by transaction ID
   * @param address
   * @param proposedTransactionId
   * @param signerAddress
   */
  public async msigApproveTransfer(
    address: string,
    proposedTransactionId: number,
    signerAddress: string,
  ): Promise<Cid> {
    const ret = await this.client.msig.approve(address, proposedTransactionId, signerAddress);
    return ret;
  }

  /**
   * approves a previously-proposed multisig message
   * @param address
   * @param proposedMessageId
   * @param proposerAddress
   * @param recipientAddres
   * @param value
   * @param senderAddressOfApproveMsg
   */
  public async msigApproveTransferTxHash(
    address: string,
    proposedMessageId: number,
    proposerAddress: string,
    recipientAddres: string,
    value: string,
    senderAddressOfApproveMsg: string
  ): Promise<Cid> {
    const ret = await this.client.msig.approveTxnHash(address, proposedMessageId, proposerAddress, recipientAddres, value, senderAddressOfApproveMsg, 0, []);
    return ret;
  }

  /**
   * cancels a previously-proposed multisig message
   * @param address
   * @param proposedMessageId
   * @param proposerAddress
   * @param recipientAddres
   * @param value
   * @param senderAddressOfCancelMsg
   */
  public async msigCancelTransfer(
    address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    recipientAddres: string,
    value: string,
  ): Promise<Cid> {
    const ret = await this.client.msig.cancel(address, proposedMessageId, senderAddressOfCancelMsg, recipientAddres, value, senderAddressOfCancelMsg, 0, []);
    return ret;
  }

  /**
   * proposes adding a signer in the multisig
   * @param address
   * @param senderAddressOfProposeMsg
   * @param newSignerAddress
   * @param increaseNumberOfRequiredSigners
   */
  public async msigProposeAddSigner(
    address: string,
    senderAddressOfProposeMsg: string,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean,
  ): Promise<Cid> {
    const ret = await this.client.msig.addPropose(address, senderAddressOfProposeMsg, newSignerAddress, increaseNumberOfRequiredSigners);
    return ret;
  }

  /**
   * approves a previously proposed AddSigner message
   * @param address
   * @param senderAddressOfApproveMsg
   * @param proposedMessageId
   * @param proposerAddress
   * @param newSignerAddress
   * @param increaseNumberOfRequiredSigners
   */
  public async msigApproveAddSigner(
    address: string,
    senderAddressOfApproveMsg: string,
    proposedMessageId: number,
    proposerAddress: string,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean
  ): Promise<Cid> {
    const ret = await this.client.msig.addApprove(address, senderAddressOfApproveMsg, proposedMessageId, proposerAddress, newSignerAddress, increaseNumberOfRequiredSigners);
    return ret;
  }

  /**
   * cancels a previously proposed AddSigner message
   * @param address
   * @param senderAddressOfCancelMsg
   * @param proposedMessageId
   * @param newSignerAddress
   * @param increaseNumberOfRequiredSigners
   */
  public async msigCancelAddSigner(
    address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    newSignerAddress: string,
    increaseNumberOfRequiredSigners: boolean
  ): Promise<Cid> {
    const ret = await this.client.msig.addCancel(address, senderAddressOfCancelMsg, proposedMessageId, newSignerAddress, increaseNumberOfRequiredSigners);
    return ret;
  }

  /**
   * proposes swapping 2 signers in the multisig
   * @param address
   * @param senderAddressOfProposeMsg
   * @param oldSignerAddress
   * @param newSignerAddress
   */
  public async msigProposeSwapSigner(
    address: string,
    senderAddressOfProposeMsg: string,
    oldSignerAddress: string,
    newSignerAddress: string,
  ): Promise<Cid> {
    const ret = await this.client.msig.swapPropose(address, senderAddressOfProposeMsg, oldSignerAddress, newSignerAddress);
    return ret;
  }

  /**
   * approves a previously proposed SwapSigner
   * @param address
   * @param senderAddressOfApproveMsg
   * @param proposedMessageId
   * @param proposerAddress
   * @param oldSignerAddress
   * @param newSignerAddress
   */
  public async msigApproveSwapSigner(
    address: string,
    senderAddressOfApproveMsg: string,
    proposedMessageId: number,
    proposerAddress: string,
    oldSignerAddress: string,
    newSignerAddress: string,
  ): Promise<Cid> {
    const ret = await this.client.msig.swapApprove(address, senderAddressOfApproveMsg, proposedMessageId, proposerAddress, oldSignerAddress, newSignerAddress);
    return ret;
  }

  /**
   * cancels a previously proposed SwapSigner message
   * @param address
   * @param senderAddressOfCancelMsg
   * @param proposedMessageId
   * @param oldSignerAddress
   * @param newSignerAddress
   */
  public async msigCancelSwapSigner(
    address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    oldSignerAddress: string,
    newSignerAddress: string,
  ): Promise<Cid> {
    const ret = await this.client.msig.swapCancel(address, senderAddressOfCancelMsg, proposedMessageId, oldSignerAddress, newSignerAddress);
    return ret;
  }

  /**
    * proposes removing a signer from the multisig
    * @param address
    * @param senderAddressOfProposeMsg
    * @param addressToRemove
    * @param decreaseNumberOfRequiredSigners
    */
  public async msigProposeRemoveSigner(
    address: string,
    senderAddressOfProposeMsg: string,
    addressToRemove: string,
    decreaseNumberOfRequiredSigners: boolean,
  ): Promise<Cid> {
    const ret = await this.client.msig.removeSigner(address, senderAddressOfProposeMsg, addressToRemove, decreaseNumberOfRequiredSigners);
    return ret;
  };

  /**
   * approves a previously proposed RemoveSigner message
   * @param address
   * @param senderAddressOfApproveMsg
   * @param proposedMessageId
   * @param proposerAddress
   * @param addressToRemove
   * @param decreaseNumberOfRequiredSigners
   */
  public async msigApproveRemoveSigner(address: string,
    senderAddressOfApproveMsg: string,
    proposedMessageId: number,
    proposerAddress: string,
    addressToRemove: string,
    decreaseNumberOfRequiredSigners: boolean): Promise<Cid> {

    return undefined as any;
  };

  /**
   * cancels a previously proposed RemoveSigner message
   * @param address
   * @param senderAddressOfApproveMsg
   * @param proposedMessageId
   * @param addressToRemove
   * @param decreaseNumberOfRequiredSigners
   */
  public async msigCancelRemoveSigner(address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    addressToRemove: string,
    decreaseNumberOfRequiredSigners: boolean): Promise<Cid> {

    return undefined as any;
  };
  // Own functions
  /**
   * walletImport returns the private key of an address in the wallet.
   * @param keyInfo
   */
  public async walletImport(keyInfo: KeyInfo): Promise<string> {
    const ret = await this.client.wallet.import(keyInfo);
    return ret as string;
  }
}
