import { Message, SignedMessage, Signature, KeyInfo, DEFAULT_HD_PATH, TEST_DEFAULT_HD_PATH, MethodMultisig, Cid, ChainEpoch, MethodInit } from "../Types";
import { BaseWalletProvider } from "./BaseWalletProvider";
import { MultisigProviderInterface, WalletProviderInterface } from "../ProviderInterfaces";
import { Keystore } from "../../utils/keystore";
import { LightWalletSigner } from "../../signers/LightWalletSigner";
import { LotusClient } from "../..";
import { addressAsBytes } from "@zondax/filecoin-signing-tools"
import cbor from "ipld-dag-cbor";
import cid from "cids";
import BigNumber from "bignumber.js";
import { createApproveMessage, createCancelMessage, createProposeMessage } from "../../utils/msig";

interface LighWalletOptions {
  encKeystore?: string;
  hdPathString?: string;
  seedPhrase?: string;
  password?: string;
}

export class LightWalletProvider extends BaseWalletProvider implements WalletProviderInterface, MultisigProviderInterface {

  public keystore!: Keystore;
  private hdPathString = DEFAULT_HD_PATH;
  private signer!: LightWalletSigner;
  private pwdCallback: Function;

  constructor(client: LotusClient, pwdCallback: Function, path: string = DEFAULT_HD_PATH,) {
    super(client);
    this.pwdCallback = pwdCallback;
    if (path === 'test' || !path) this.hdPathString = TEST_DEFAULT_HD_PATH;
  }

  public async newAddress(): Promise<string> {
    await this.keystore.newAddress(1, this.pwdCallback())
    const addresses = await this.getAddresses();
    return addresses[addresses.length -1];
  }

  public async deleteAddress(address: string): Promise<void> {
    await this.keystore.deleteAddress(address, this.pwdCallback());
  }

  public async hasAddress(address: string): Promise<boolean> {
    return this.keystore.hasAddress(address);
  }

  public async exportPrivateKey(address: string): Promise<KeyInfo> {
    const pk = await this.keystore.getPrivateKey(address, this.pwdCallback());
    return {
      Type: '1',
      PrivateKey: pk as any, //convert to uint8 array ?
    };
  }

  public async getAddresses(): Promise<string[]> {
    return await this.keystore.getAddresses();
  }

  public async getDefaultAddress(): Promise<string> {
    return await this.keystore.getDefaultAddress();
  }

  public async setDefaultAddress(address: string): Promise<void> {
    this.keystore.setDefaultAddress(address)
  }

  public async sendMessage(msg: Message): Promise<SignedMessage> {
    const signedMessage: SignedMessage | undefined = await this.signMessage(msg);
    if (signedMessage) {
      await this.sendSignedMessage(signedMessage);
      return signedMessage as SignedMessage;
    }
    return undefined as any;
  }

  public async signMessage(msg: Message): Promise<SignedMessage> {
    return await this.signer.sign(msg, this.pwdCallback());
  }

  //todo
  public async sign(data: string | ArrayBuffer): Promise<Signature> {
    return undefined as any;
  }

  //todo
  public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
    return undefined as any;
  }

  //MultisigProvider Implementation
  /**
   * creates a multisig wallet
   * @param requiredNumberOfSenders
   * @param approvingAddresses
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

  // Own functions
  public async createLightWallet(password: string) {
    this.keystore = new Keystore();
    const mnemonic = this.keystore.generateRandomSeed();
    await this.keystore.createVault({
      hdPathString: this.hdPathString,
      seedPhrase: mnemonic,
      password: password,
    });
    this.signer = new LightWalletSigner(this.keystore);
    return mnemonic;
  }

  public async recoverLightWallet(mnemonic: string, password: string) {
    this.keystore = new Keystore();
    await this.keystore.createVault({
      hdPathString: this.hdPathString,
      seedPhrase: mnemonic,
      password: password,
    });
    this.signer = new LightWalletSigner(this.keystore);
  }

  public loadLightWallet(encryptedWallet: string) {
    this.keystore = new Keystore();
    this.keystore.deserialize(encryptedWallet);
    this.signer = new LightWalletSigner(this.keystore);
  }

  public prepareToSave() {
    return this.keystore.serialize();
  }

  public getSigner(): LightWalletSigner {
    return this.signer;
  }
}
