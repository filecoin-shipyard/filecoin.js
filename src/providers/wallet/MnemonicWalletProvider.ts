import { Message, SignedMessage, Signature, KeyInfo, Cid, ChainEpoch } from "../Types";
import { BaseWalletProvider } from "./BaseWalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
import { StringGetter } from "../Types";
import { LotusClient } from "../..";
import { MultisigProviderInterface, WalletProviderInterface } from "../ProviderInterfaces";
import { addressAsBytes } from "@zondax/filecoin-signing-tools/js"
import cbor from "ipld-dag-cbor";
import cid from "cids";
import BigNumber from "bignumber.js";
import { serializeBigNum } from '../../utils/data';
const blake = require("blakejs");

export const MethodInit = {
  Constructor: 1,
  Exec: 2,
};


const MethodMultisig = {
  Constructor: 1,
  Propose: 2,
  Approve: 3,
  Cancel: 4,
  AddSigner: 5,
  RemoveSigner: 6,
  SwapSigner: 7,
  ChangeNumApprovalsThreshold: 8,
};
export class MnemonicWalletProvider extends BaseWalletProvider implements WalletProviderInterface, MultisigProviderInterface {

  private signer: MnemonicSigner;

  constructor(client: LotusClient,
    mnemonic: string | StringGetter,
    password: string | StringGetter,
    path: string = `m/44'/461'/0/0/1`,
  ) {
    super(client);
    this.signer = new MnemonicSigner(mnemonic, password, path);
  }

  public async newAddress(): Promise<string> {
    await this.signer.newAddress(1)
    const addresses = await this.getAddresses();
    return addresses[addresses.length - 1];
  }

  public async deleteAddress(address: string): Promise<any> {
    this.signer.deleteAddress(address);
  }

  public async hasAddress(address: string): Promise<boolean> {
    return this.signer.hasAddress(address);
  }

  public async exportPrivateKey(address: string): Promise<KeyInfo> {
    const pk = await this.signer.getPrivateKey(address);
    return {
      Type: '1',
      PrivateKey: pk as any, //convert to uint8 array ?
    };
  }

  public async getAddresses(): Promise<string[]> {
    return this.signer.getAddresses();
  }

  public async getDefaultAddress(): Promise<string> {
    return await this.signer.getDefaultAddress();
  }

  public async setDefaultAddress(address: string): Promise<void> {
    this.signer.setDefaultAddress(address);
  }

  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const signedMessage: SignedMessage = await this.signMessage(msg);
    await this.sendSignedMessage(signedMessage);
    return signedMessage as SignedMessage;
  }

  public async signMessage(msg: Message): Promise<SignedMessage> {
    return await this.signer.sign(msg);
  }

  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    return undefined as any;
  }

  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }

  public getSigner(): MnemonicSigner {
    return this.signer;
  }

  //MultisigProvider Implementation
  /**
   * creates a multisig wallet
   * @param requiredNumberOfSenders
   * @param approvingAddresses
   * @param unlockDuration
   * @param initialBalance
   * @param senderAddressOfCreateMsg
   * @param gasPrice
   */
  public async msigCreate(
    requiredNumberOfSenders: number,
    approvingAddresses: string[],
    unlockDuration: ChainEpoch,
    initialBalance: string,
    senderAddressOfCreateMsg: string,
    gasPrice: string
  ): Promise<Cid> {
    const addresses: any[] = [];
    approvingAddresses.forEach(address => {
      addresses.push(addressAsBytes(address));
    });
    const constructorParams = [addresses, requiredNumberOfSenders, unlockDuration, 0];
    const serializedConstructorParams = cbor.util.serialize(constructorParams);

    const MultisigActorCodeID = new cid('bafkqadtgnfwc6mrpnv2wy5djonuwo');

    const execParams = [
      MultisigActorCodeID,
      serializedConstructorParams,
    ];
    const serializedParams = cbor.util.serialize(execParams);
    const buff = Buffer.from(serializedParams);

    let messageWithoutGasParams = {
      From: senderAddressOfCreateMsg,
      To: "t01",
      Value: new BigNumber(initialBalance),
      Method: MethodInit.Exec,
      Params: buff.toString('base64')
    };

    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
  }

  /**
   * proposes a multisig message
   * @param address
   * @param recipientAddres
   * @param value
   * @param senderAddressOfProposeMsg
   * @param methodToCallInProposeMsg
   * @param paramsToIncludeInProposeMsg
   */
  public async msigProposeTransfer(
    address: string,
    recipientAddres: string,
    value: string,
    senderAddressOfProposeMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []
  ): Promise<Cid> {

    const params = [addressAsBytes(recipientAddres), serializeBigNum(value), methodToCallInProposeMsg, Buffer.from(paramsToIncludeInProposeMsg)];
    const serializedParams = cbor.util.serialize(params);

    const buff = Buffer.from(serializedParams);

    let messageWithoutGasParams = {
      From: senderAddressOfProposeMsg,
      To: address,
      Value: new BigNumber(0),
      Method: MethodMultisig.Propose,
      Params: buff.toString('base64')
    };

    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
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
    return null as any;
  }

  /**
   * approves a previously-proposed multisig message
   * @param address
   * @param proposedMessageId
   * @param proposerAddress
   * @param recipientAddres
   * @param value
   * @param senderAddressOfApproveMsg
   * @param methodToCallInProposeMsg
   * @param paramsToIncludeInProposeMsg
   */
  public async msigApproveTransferTxHash(
    address: string,
    proposedMessageId: number,
    proposerAddress: string,
    recipientAddres: string,
    value: string,
    senderAddressOfApproveMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []
  ): Promise<Cid> {

    const proposerId = await this.client.state.lookupId(proposerAddress);
    const proposalHashData = [
      addressAsBytes(proposerId),
      addressAsBytes(recipientAddres),
      serializeBigNum(value),
      methodToCallInProposeMsg,
      Buffer.from(paramsToIncludeInProposeMsg)
    ];

    const serializedproposalHashData = cbor.util.serialize(proposalHashData);
    const blakeCtx = blake.blake2bInit(32);
    blake.blake2bUpdate(blakeCtx, serializedproposalHashData);
    const hash = Buffer.from(blake.blake2bFinal(blakeCtx));

    const params = [
      proposedMessageId,
      hash
    ];
    const serializedParams = cbor.util.serialize(params);

    const buff = Buffer.from(serializedParams);

    let messageWithoutGasParams = {
      From: senderAddressOfApproveMsg,
      To: address,
      Value: new BigNumber(0),
      Method: MethodMultisig.Approve,
      Params: buff.toString('base64')
    };

    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
  }

  /**
   * cancels a previously-proposed multisig message
   * @param address
   * @param proposedMessageId
   * @param proposerAddress
   * @param recipientAddres
   * @param value
   * @param senderAddressOfCancelMsg
   * @param methodToCallInProposeMsg
   * @param paramsToIncludeInProposeMsg
   */
  public async msigCancelTransfer(
    address: string,
    proposedMessageId: number,
    proposerAddress: string,
    recipientAddres: string,
    value: string,
    senderAddressOfCancelMsg: string,
    methodToCallInProposeMsg: number,
    paramsToIncludeInProposeMsg: []
  ): Promise<Cid> {
    return null as any;
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
    return null as any;
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
    return null as any;
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
    return null as any;
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
    return null as any;
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
    return null as any;
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
    return null as any;
  }

  public async msigProposeRemoveSigner(): Promise<Cid> {
    return null as any;
  };

  public async msigApproveRemoveSigner(): Promise<Cid> {
    return null as any;
  };

  public async msigCancelRemoveSigner(): Promise<Cid> {
    return null as any;
  };
}
