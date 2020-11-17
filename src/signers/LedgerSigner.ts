import * as filecoin_signer from '@zondax/filecoin-signing-tools';
import { Message, SignedMessage } from '../providers/Types';
import { Signer } from './Signer';
//import { import_wasm } from "../utils/import_wasm";
import { toBase64 } from "../utils/data";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

const import_wasm = () => { return { 'catch': (e: any) => {} } } //dummy to avoid including the zondax wasm package
export class LedgerSigner implements Signer {

  private transport: any;
  private wasm: any;

  constructor(
    private path: string = `m/44'/1'/0/0/1`,
  ) { }

  public async connect() {
    try {
      this.transport = await TransportWebUSB.create(10000);
      this.transport.setScrambleKey("FIL");
    } catch (e) {
      console.log(e);
    }
    console.log("\n...Got transport...\n");
    this.wasm = await import_wasm().catch(console.error);
  }

  public async sign(message: Message): Promise<SignedMessage> {
    const responsePk = await this.wasm.keyRetrieveFromDevice(this.path, this.transport);
    console.log(responsePk)

    const serializedMessage = filecoin_signer.transactionSerialize(this.messageToSigner(message));
    console.log(serializedMessage);

    const messageBuffer = Buffer.from(
      serializedMessage,
      "hex",
    );

    const responseRequest = await this.wasm.transactionSignRawWithDevice(messageBuffer, this.path, this.transport);

    const v = Buffer.from([1]);
    const RSVsig = Buffer.concat([responseRequest.signature_compact, v]);

    return {
      Message: message,
      Signature: {
        Data: toBase64(RSVsig),
        Type: 1
      }
    }
  }

  public async getDefaultAccount(): Promise<string> {
    const responsePk = await this.wasm.keyRetrieveFromDevice(this.path, this.transport);
    return responsePk.addrString;
  }

  private messageToSigner(message: Message): {
    to: string,
    from: string,
    nonce: number,
    value: string,
    gaslimit: string,
    gasfeecap: string,
    gaspremium: string,
    method: number,
    params: string
  } {
    return {
      to: message.To,
      from: message.From,
      nonce: message.Nonce,
      value: message.Value.toString(),
      gaslimit: message.GasLimit.toString(),
      gasfeecap: message.GasFeeCap.toString(),
      gaspremium: message.GasPremium.toString(),
      method: message.Method,
      params: message.Params,
    }
  }

}
