import * as filecoin_signer from '@zondax/filecoin-signing-tools/js';
import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
import { import_wasm } from "../utils/import_wasm";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

export class LedgerSigner implements Signer {

  constructor(
    private path: string = `m/44'/1'/0/0/1`,
  ) { }

  public async sign(message: Message): Promise<SignedMessage> {
    let transport;
    try {
      transport = await TransportWebUSB.create(10000);
      // We need this scramble key
      // TODO: move this to the Rust implementation for the specific coin (not ledger-rs)
      transport.setScrambleKey("FIL");
    } catch (e) {
      console.log(e);
    }
    console.log("\n...Got transport...\n");
    const wasm = await import_wasm().catch(console.error);

    const serializedMessage = filecoin_signer.transactionSerialize(message);
    console.log(serializedMessage);

    const messageBuffer = Buffer.from(
      serializedMessage,
      "hex",
    );

    const responseRequest = await wasm.transactionSignRawWithDevice(messageBuffer, this.path, transport);
    console.log(responseRequest);

    const key = filecoin_signer.keyDerive('this.mnemonic', this.path,' this.password');
    const signedTx = filecoin_signer.transactionSignLotus(this.messageToSigner(message), key.private_hexstring);
    return signedTx;
  }

  public async getDefaultAccount(): Promise<string> {
    let transport;
    try {
      transport = await TransportWebUSB.create(10000);
      // We need this scramble key
      // TODO: move this to the Rust implementation for the specific coin (not ledger-rs)
      transport.setScrambleKey("FIL");
    } catch (e) {
      console.log(e);
    }
    console.log("\n...Got transport...\n");
    const wasm = await import_wasm().catch(console.error);
    //const resp = await wasm.keyRetrieveFromDevice(this.path, transport);

    const responsePk = await wasm.keyRetrieveFromDevice(this.path, transport);
    console.log(responsePk)

    const messageContent = {
      from: responsePk.addrString,
      to: "t1t5gdjfb6jojpivbl5uek6vf6svlct7dph5q2jwa",
      value: "1000",
      method: 0,
      gasprice: "1",
      gaslimit: 1000,
      nonce: 0,
      params: ""
    };

    const serializedMessage = filecoin_signer.transactionSerialize(messageContent);
    console.log(serializedMessage);

    const messageBuffer = Buffer.from(
      serializedMessage,
      "hex",
    );

    const responseRequest = await wasm.transactionSignRawWithDevice(messageBuffer, this.path, transport);
    console.log(responseRequest);

    return 'tests';
  }

  private messageToSigner(message: Message): {
    to: string,
    from: string,
    nonce: number,
    value: string,
    gasprice: string,
    gaslimit: number,
    method: number,
    params: string
  } {
    return {
      to: message.To,
      from: message.From,
      nonce: message.Nonce,
      value: message.Value.toString(),
      gasprice: message.GasPrice.toString(),
      gaslimit: message.GasLimit,
      method: message.Method,
      params: message.Params,
    }
  }

}
