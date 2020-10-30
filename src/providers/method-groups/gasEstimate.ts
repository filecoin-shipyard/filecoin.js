import { Connector } from '../../connectors/Connector';
import { Message } from '../Types';

export class JsonRpcGasMethodGroup {
    private conn: Connector;

    constructor(conn: Connector) {
        this.conn = conn;
    }

    /**
   * estimate gas fee cap
   * @param message
   * @param nblocksincl
   */
    public async feeCap(message: Message, nblocksincl: number): Promise<string> {
        const ret = await this.conn.request({ method: 'Filecoin.GasEstimateFeeCap', params: [message, nblocksincl, []] });
        return ret as string;
    }

    /**
    * estimate gas limit, it fails if message fails to execute.
    * @param message
    */
    public async gasLimit(message: Message): Promise<number> {
        const ret = await this.conn.request({ method: 'Filecoin.GasEstimateGasLimit', params: [message, []] });
        return ret as number;
    }

    /**
    * estimate gas to succesufully send message, and have it likely be included in the next nblocksincl blocks
    * @param nblocksincl
    * @param sender
    * @param gasLimit
    */
    public async gasPremium(nblocksincl: number, sender: string, gasLimit: number): Promise<string> {
        const ret = await this.conn.request({ method: 'Filecoin.GasEstimateGasPremium', params: [nblocksincl, sender, gasLimit, []] });
        return ret as string;
    }

    /**
     * estimate gas to succesufully send message, and have it included in the next 10 blocks
     * @param message
     */
    public async messageGas(message: Message): Promise<Message> {
        const ret = await this.conn.request({ method: 'Filecoin.GasEstimateMessageGas', params: [message, { MaxFee: "30000000000000" }, []] });
        return ret as Message;
    }
}
