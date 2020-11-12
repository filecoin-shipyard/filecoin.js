---
id: multisig-wallet
title: Multisig Wallets
hide_title: true
---

# Multisig Wallets

Multi-signature, or multisig, is a wallet configuration that requires at least two keys to authorize a transaction. You can specify the list of signers and the number of required signatures to approve a proposal when you create a multisig wallet. You can alter the signers list after creating the wallet by adding or removing addresses or by swaping an old address with a new one.

The multisig wallets can be programmed to release funds linearly by specifying a StartEpoch from which the funds are available and the UnlockDuration which controls the duration of the vesting period.

The MnemonicWalletProvider and LightWalletProvider implement all the functions listed below. The LotusWalletProvider has a few differences because it calls directly the lotus api and at the time of this writing (12 nov 2020) some things are not yet fully implemented. In msigCreate the startEpoch is hardcoded to 0 in the api call, and msigApproveRemoveSigner and msigCancelRemoveSigner are not implemented yet.

The operations you can propose are: transfer, add signer, swap signer and remove signer. The signers in the list can approve the proposal, and when the treshold is met the action is executed. The signer that initiated the operation can cancel it.

You can find the multisig actor code [here](https://github.com/filecoin-project/specs-actors/blob/master/actors/builtin/multisig/multisig_actor.go).

General

``` javascript
    msigGetVestingSchedule(
        address: string,
        tipSetKey: TipSetKey,
    ): Promise < MsigVesting >

    msigGetAvailableBalance(
        address: string,
        tipSetKey: TipSetKey
    ): Promise < string >

    msigGetVested(
        address: string,
        startEpoch: TipSetKey,
        endEpoch: TipSetKey
    ): Promise < string >
```

Create multisig wallet

``` javascript
    msigCreate(
        requiredNumberOfSenders: number,
        approvingAddresses: string[],
        startEpoch: ChainEpoch,
        unlockDuration: ChainEpoch,
        initialBalance: string,
        senderAddressOfCreateMsg: string
    ): Promise < Cid >
```

Transfer funds

``` javascript
    msigProposeTransfer(
        address: string,
        recipientAddres: string,
        value: string,
        senderAddressOfProposeMsg: string
    ): Promise < Cid >

    msigApproveTransferTxHash(
        address: string,
        proposedMessageId: number,
        proposerAddress: string,
        recipientAddres: string,
        value: string,
        senderAddressOfApproveMsg: string
    ): Promise < Cid >

    msigCancelTransfer(
        address: string,
        senderAddressOfCancelMsg: string,
        proposedMessageId: number,
        recipientAddres: string,
        value: string,
        methodToCallInProposeMsg: number
    ): Promise < Cid >
```

Add signer

``` javascript
    msigProposeAddSigner(
        address: string,
        senderAddressOfProposeMsg: string,
        newSignerAddress: string,
        increaseNumberOfRequiredSigners: boolean
    ): Promise < Cid >

    msigApproveAddSigner(
        address: string,
        senderAddressOfApproveMsg: string,
        proposedMessageId: number,
        proposerAddress: string,
        newSignerAddress: string,
        increaseNumberOfRequiredSigners: boolean
    ): Promise < Cid >

    msigCancelAddSigner(
        address: string,
        senderAddressOfCancelMsg: string,
        proposedMessageId: number,
        newSignerAddress: string,
        increaseNumberOfRequiredSigners: boolean
    ): Promise < Cid >
```

Swap signer

``` javascript
    msigProposeSwapSigner(
        address: string,
        senderAddressOfProposeMsg: string,
        oldSignerAddress: string,
        newSignerAddress: string
    ): Promise < Cid >

    msigApproveSwapSigner(
        address: string,
        senderAddressOfApproveMsg: string,
        proposedMessageId: number,
        proposerAddress: string,
        oldSignerAddress: string,
        newSignerAddress: string
    ): Promise < Cid >

    msigCancelSwapSigner(
        address: string,
        senderAddressOfCancelMsg: string,
        proposedMessageId: number,
        oldSignerAddress: string,
        newSignerAddress: string
    ): Promise < Cid >
```

Remove signer

``` javascript
    msigProposeRemoveSigner(
        address: string,
        senderAddressOfProposeMsg: string,
        addressToRemove: string,
        decreaseNumberOfRequiredSigners: boolean
    ): Promise < Cid >

    msigApproveRemoveSigner(
        address: string,
        senderAddressOfApproveMsg: string,
        proposedMessageId: number,
        proposerAddress: string,
        addressToRemove: string,
        decreaseNumberOfRequiredSigners: boolean
    ): Promise < Cid >

    msigCancelRemoveSigner(
        address: string,
        senderAddressOfCancelMsg: string,
        proposedMessageId: number,
        addressToRemove: string,
        decreaseNumberOfRequiredSigners: boolean
    ): Promise < Cid >
```

Examples

``` javascript
// init wallet provider and create multisig wallet
const httpConnector = new HttpJsonRpcConnector({
    __LOTUS_RPC_ENDPOINT__,
    token: __LOTUS_AUTH_TOKEN__
});
const con = new LotusClient(httpConnector);
const mnemonicWalletProvider = new MnemonicWalletProvider(con, testMnemonic, '');

const noOfRequiredSigners = 2;
const signerAdresses = ...
const msigWalletCreator = ...

const multisigCid = await mnemonicWalletProvider.msigCreate(noOfRequiredSigners, signerAdresses, startEpoch, unlockDuration, initialBalance, msigWalletCreator);
const receipt = await con.state.waitMsg(multisigCid, 0);
// you can retrieve the address of the newly created multisig wallet from the receipt of the create wallet message
const multisigAddress = receipt.ReturnDec.RobustAddress;
const balance = await mnemonicWalletProvider.msigGetAvailableBalance(multisigAddress, []);


// propose transfer
const initTransferCid = await mnemonicWalletProvider.msigProposeTransfer(multisigAddress, receiverAddress, amountToTransfer, proposerAddress);
const receiptTransferPropose = await con.state.waitMsg(initTransferCid, 0);
// you can get the transaction id of a propose operation from the receipt of the propose message
const txnID = receiptTransferStart.ReturnDec.TxnID;

// approve transfer
const approveTransferCid = await mnemonicWalletProvider.msigApproveTransferTxHash(multisigAddress, txnID, proposerAddress, receiverAddress, amountToTransfer, approverAddress);
const receiptTransferApprove = await con.state.waitMsg(approveTransferCid, 0);

// cancel transfer - this message can only be sent by the sender of the initial proposal
const cancelTransferCid = await mnemonicWalletProvider.msigCancelTransfer(multisigAddress, proposerAddress, txnID, mnemonicAddress, amountToTransfer);
const receiptTransferCancel = await con.state.waitMsg(cancelTransferCid, 0);


// propose add signer
const initAddProposeCid = await mnemonicWalletProvider.msigProposeAddSigner(multisigAddress, proposerAddress, addressToAdd, increaseNumberOfRequiredSigners);
const receiptAddProposeCid = await con.state.waitMsg(initAddProposeCid, 0);
// you can get the transaction id of a propose operation from the receipt of the propose message
const txnID = receiptAddProposeCid.ReturnDec.TxnID;

// approve add signer
const approveAddCid = await mnemonicWalletProvider.msigApproveAddSigner(multisigAddress, approverAddress, txnID, proposerAddress, addressToAdd, increaseNumberOfRequiredSigners);
const receiptAddApprove = await con.state.waitMsg(approveAddCid, 0);

// cancel add signer - this message can only be sent by the sender of the initial proposal
const cancelAddCid = await mnemonicWalletProvider.msigCancelAddSigner(multisigAddress, proposerAddress, txnID, addressToAdd, increaseNumberOfRequiredSigners);
const receiptAddCancel = await con.state.waitMsg(cancelAddCid, 0);


// propose swap signer
const initSwapProposeCid = await mnemonicWalletProvider.msigProposeSwapSigner(multisigAddress, aproposerAddress, addressToSwapOut, addressToSwapIn);
const receiptSwapProposeCid = await con.state.waitMsg(initSwapProposeCid, 0);
// you can get the transaction id of a propose operation from the receipt of the propose message
const txnID = receiptSwapProposeCid.ReturnDec.TxnID;

// approve swap signer
const approveSwapCid = await mnemonicWalletProvider.msigApproveSwapSigner(multisigAddress, approverAddress, txnID, proposerAddress, addressToSwapOut, addressToSwapIn);
const receiptSwapApprove = await con.state.waitMsg(approveSwapCid, 0);

// cancel swap signer - this message can only be sent by the sender of the initial proposal
const cancelSwapCid = await mnemonicWalletProvider.msigCancelSwapSigner(multisigAddress, proposerAddress, txnID, addressToSwapOut, addressToSwapIn);
const receiptSwapCancel = await con.state.waitMsg(cancelSwapCid, 0);


// propose remove signer
const initRemoveProposeCid = await mnemonicWalletProvider.msigProposeRemoveSigner(multisigAddress, proposerAddress, addressToRemove, decreaseNumberOfSigners);
const receiptRemoveProposeCid = await con.state.waitMsg(initRemoveProposeCid, 0);
// you can get the transaction id of a propose operation from the receipt of the propose message
const txnID = receiptRemoveProposeCid.ReturnDec.TxnID;
assert.strictEqual(txnID, 0, 'error initiating add proposal');

// approve remove signer
const approveRemoveCid = await mnemonicWalletProvider.msigApproveRemoveSigner(multisigAddress, approverAddress, txnID, proposerAddress, addressToRemove, decreaseNumberOfSigners);
const receiptRemoveApprove = await con.state.waitMsg(approveRemoveCid, 0);

// cancel remove signer - this message can only be sent by the sender of the initial proposal
const cancelRemoveCid = await mnemonicWalletProvider.msigCancelRemoveSigner(multisigAddress, proposerAddress, txnID, addressToRemove, decreaseNumberOfSigners);
const receiptRemoveCancel = await con.state.waitMsg(cancelRemoveCid, 0);
```
