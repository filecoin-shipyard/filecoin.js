import { Message, SignedMessage, Signature, KeyInfo, Cid, ChainEpoch, DEFAULT_HD_PATH, TEST_DEFAULT_HD_PATH, MethodInit, MethodMultisig } from "../Types";
import { BaseWalletProvider } from "./BaseWalletProvider";
import { MnemonicSigner } from "../../signers/MnemonicSigner";
import { StringGetter } from "../Types";
import { LotusClient } from "../..";
import { MultisigProviderInterface, WalletProviderInterface } from "../ProviderInterfaces";
import { addressAsBytes } from "@zondax/filecoin-signing-tools"
import cbor from "ipld-dag-cbor";
import cid from "cids";
import BigNumber from "bignumber.js";
import { createApproveMessage, createCancelMessage, createProposeMessage } from "../../utils/msig";


export class MnemonicWalletProvider extends BaseWalletProvider implements WalletProviderInterface, MultisigProviderInterface {

  private signer: MnemonicSigner;

  constructor(client: LotusClient,
    mnemonic: string | StringGetter,
    path: string = DEFAULT_HD_PATH,
  ) {
    super(client);
    if (path === 'test' || path === '') path = TEST_DEFAULT_HD_PATH;
    this.signer = new MnemonicSigner(mnemonic, '', path);
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
    const addresses: any[] = [];
    approvingAddresses.forEach(address => {
      addresses.push(addressAsBytes(address));
    });
    const constructorParams = [addresses, requiredNumberOfSenders, unlockDuration, startEpoch];
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
   */
  public async msigProposeTransfer(
    address: string,
    recipientAddres: string,
    value: string,
    senderAddressOfProposeMsg: string,
  ): Promise<Cid> {
    const params: any[] = [];
    const messageWithoutGasParams = await createProposeMessage(address, senderAddressOfProposeMsg, recipientAddres, value, 0, params)
    const message = await this.createMessage(messageWithoutGasParams);
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
   */
  public async msigApproveTransferTxHash(
    address: string,
    proposedMessageId: number,
    proposerAddress: string,
    recipientAddres: string,
    value: string,
    senderAddressOfApproveMsg: string,
  ): Promise<Cid> {
    const proposerId = await this.client.state.lookupId(proposerAddress);

    const messageWithoutGasParams = await createApproveMessage(
      address,
      senderAddressOfApproveMsg,
      proposedMessageId,
      proposerId,
      recipientAddres,
      0,
      value,
      []
    );

    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
  }

  /**
   * cancels a previously-proposed multisig message
   * @param address
   * @param senderAddressOfCancelMsg
   * @param proposedMessageId
   * @param recipientAddres
   * @param value
   */
  public async msigCancelTransfer(
    address: string,
    senderAddressOfCancelMsg: string,
    proposedMessageId: number,
    recipientAddres: string,
    value: string,
  ): Promise<Cid> {
    const proposerId = await this.client.state.lookupId(senderAddressOfCancelMsg);

    const messageWithoutGasParams = await createCancelMessage(
      address,
      senderAddressOfCancelMsg,
      proposedMessageId,
      proposerId,
      recipientAddres,
      0,
      value,
      []
    );

    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
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
    const params: any[] = [addressAsBytes(newSignerAddress), increaseNumberOfRequiredSigners];
    const messageWithoutGasParams = await createProposeMessage(address, senderAddressOfProposeMsg, address, '0', MethodMultisig.AddSigner, params)
    const message = await this.createMessage(messageWithoutGasParams);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);
    return msgCid;
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
    const values = [addressAsBytes(newSignerAddress), increaseNumberOfRequiredSigners];
    const proposerId = await this.client.state.lookupId(proposerAddress);

    const messageWithoutGasParams = await createApproveMessage(
      address,
      senderAddressOfApproveMsg,
      proposedMessageId,
      proposerId,
      address,
      MethodMultisig.AddSigner,
      '0',
      values
    )
    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
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
    const values = [addressAsBytes(newSignerAddress), increaseNumberOfRequiredSigners];
    const proposerId = await this.client.state.lookupId(senderAddressOfCancelMsg);

    const messageWithoutGasParams = await createCancelMessage(
      address,
      senderAddressOfCancelMsg,
      proposedMessageId,
      proposerId,
      address,
      MethodMultisig.AddSigner,
      '0',
      values
    )
    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
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

    const params: any[] = [addressAsBytes(oldSignerAddress), addressAsBytes(newSignerAddress)];
    const messageWithoutGasParams = await createProposeMessage(address, senderAddressOfProposeMsg, address, '0', MethodMultisig.SwapSigner, params)
    const message = await this.createMessage(messageWithoutGasParams);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
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
    const values = [addressAsBytes(oldSignerAddress), addressAsBytes(newSignerAddress)];
    const proposerId = await this.client.state.lookupId(proposerAddress);

    const messageWithoutGasParams = await createApproveMessage(
      address,
      senderAddressOfApproveMsg,
      proposedMessageId,
      proposerId,
      address,
      MethodMultisig.SwapSigner,
      '0',
      values
    );

    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
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
    const values = [addressAsBytes(oldSignerAddress), addressAsBytes(newSignerAddress)];
    const proposerId = await this.client.state.lookupId(senderAddressOfCancelMsg);

    const messageWithoutGasParams = await createCancelMessage(
      address,
      senderAddressOfCancelMsg,
      proposedMessageId,
      proposerId,
      address,
      MethodMultisig.SwapSigner,
      '0',
      values
    );

    const message = await this.createMessage(messageWithoutGasParams as any);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);

    return msgCid;
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
    const params: any[] = [addressAsBytes(addressToRemove), decreaseNumberOfRequiredSigners];
    const messageWithoutGasParams = await createProposeMessage(address, senderAddressOfProposeMsg, address, '0', MethodMultisig.RemoveSigner, params)
    const message = await this.createMessage(messageWithoutGasParams);
    const signedMessage = await this.signMessage(message);
    const msgCid = await this.sendSignedMessage(signedMessage);
    return msgCid;
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
      const values = [addressAsBytes(addressToRemove), decreaseNumberOfRequiredSigners];
      const proposerId = await this.client.state.lookupId(proposerAddress);

      const messageWithoutGasParams = await createApproveMessage(
        address,
        senderAddressOfApproveMsg,
        proposedMessageId,
        proposerId,
        address,
        MethodMultisig.RemoveSigner,
        '0',
        values
      )
      const message = await this.createMessage(messageWithoutGasParams as any);
      const signedMessage = await this.signMessage(message);
      const msgCid = await this.sendSignedMessage(signedMessage);

      return msgCid;
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
      const values = [addressAsBytes(addressToRemove), decreaseNumberOfRequiredSigners];
      const proposerId = await this.client.state.lookupId(senderAddressOfCancelMsg);

      const messageWithoutGasParams = await createCancelMessage(
        address,
        senderAddressOfCancelMsg,
        proposedMessageId,
        proposerId,
        address,
        MethodMultisig.RemoveSigner,
        '0',
        values
      )
      const message = await this.createMessage(messageWithoutGasParams as any);
      const signedMessage = await this.signMessage(message);
      const msgCid = await this.sendSignedMessage(signedMessage);

      return msgCid;
  };
}
