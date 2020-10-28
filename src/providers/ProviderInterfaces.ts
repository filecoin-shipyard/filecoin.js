import { Message, SignedMessage, Signature, KeyInfo, Cid, MessagePartial, VoucherSpec, ChainEpoch } from './Types';

export interface WalletProviderInterface {
    newAddress(): Promise<string>;
    deleteAddress(address: string): Promise<void>
    getAddresses(): Promise<string[]>
    hasAddress(address: string): Promise<any>
    setDefaultAddress(address: string): Promise<void>
    getDefaultAddress(): Promise<string>
    exportPrivateKey(address: string): Promise<KeyInfo>
    //getBalance(address: string): Promise<any>;
    sendMessage(msg: Message): Promise<SignedMessage>;
    signMessage(msg: Message): Promise<SignedMessage>;
    sign(data: string): Promise<Signature>;
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