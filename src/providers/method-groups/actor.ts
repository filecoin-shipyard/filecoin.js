import BigNumber from 'bignumber.js';
import { Connector } from '../../connectors/Connector';

/**
 * The Msig methods are used to interact with multisig wallets on the filecoin network
 */
export class JsonRpcActorMethodGroup {
  private conn: Connector;

  constructor(conn: Connector) {
    this.conn = conn;
  }

  /**
   * invoke actor method
   * @param fromAddress
   * @param actorAddress
   * @param methodNumber
   */
  public createInvokeMethodMessage(
    fromAddress: string,
    actorAddress: string,
    methodNumber: number,
  ): any {
    let messageWithoutGasParams = {
      From: fromAddress,
      To: actorAddress,
      Value: new BigNumber(0),
      Method: methodNumber,
      Params: null,
    };

    return messageWithoutGasParams;
  }
}
