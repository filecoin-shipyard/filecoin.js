import { MessagePartial, MethodMultisig } from "../providers/Types";
import { addressAsBytes } from "@zondax/filecoin-signing-tools"
import cbor from "ipld-dag-cbor";
import BigNumber from "bignumber.js";
import { serializeBigNum } from './data';
const blake = require("blakejs");

export const createProposeMessage = async (multisigAddress: string, senderAddressOfProposeMsg: string, recipientAddress: string, value: string, method: number, params: any[]): Promise<MessagePartial> => {
    const serializedParams = params.length ? cbor.util.serialize(params) : Buffer.from([]);

    const msgParams = [
        addressAsBytes(recipientAddress),
        serializeBigNum(value),
        method,
        serializedParams
    ]
    const serializedMsgParams = cbor.util.serialize(msgParams)
    const buff = Buffer.from(serializedMsgParams);

    let messageWithoutGasParams = {
        From: senderAddressOfProposeMsg,
        To: multisigAddress,
        Value: new BigNumber(0),
        Method: MethodMultisig.Propose,
        Params: buff.toString('base64')
    };

    return messageWithoutGasParams;
};

export const createApproveMessage = async (multisigAddress: string, senderAddressOfApproveMsg: string, proposedMessageId: number, proposerId: string, recipientAddress: string, method: number, value: string, values: any[]): Promise<MessagePartial> => {
    return await createApproveOrCancelMessage(
        MethodMultisig.Approve,
        multisigAddress,
        senderAddressOfApproveMsg,
        proposedMessageId,
        proposerId,
        recipientAddress,
        method,
        value,
        values
    )
}

export const createCancelMessage = async (multisigAddress: string, senderAddressOfApproveMsg: string, proposedMessageId: number, proposerId: string, recipientAddress: string, method: number, value: string, values: any[]): Promise<MessagePartial> => {
    return await createApproveOrCancelMessage(
        MethodMultisig.Cancel,
        multisigAddress,
        senderAddressOfApproveMsg,
        proposedMessageId,
        proposerId,
        recipientAddress,
        method,
        value,
        values
    )
}

export const createApproveOrCancelMessage = async (type: number, multisigAddress: string, senderAddressOfApproveMsg: string, proposedMessageId: number, proposerId: string, recipientAddress: string, method: number, value: string, values: any[]): Promise<MessagePartial> => {
    const serializedValues = values.length ? cbor.util.serialize(values) : Buffer.from([]);

    const proposalHashData = [
        addressAsBytes(proposerId),
        addressAsBytes(recipientAddress),
        serializeBigNum(value),
        method,
        serializedValues
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
        To: multisigAddress,
        Value: new BigNumber(0),
        Method: type,
        Params: buff.toString('base64')
    };

    return messageWithoutGasParams;
}