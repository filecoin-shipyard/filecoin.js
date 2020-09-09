import { MetamaskFilecoinSnap } from "@nodefactory/filsnap-adapter/build/snap";
import { enableFilecoinSnap } from "@nodefactory/filsnap-adapter";
import { FilecoinSnapApi } from "@nodefactory/filsnap-types";
import { JsonRpcConnectionOptions } from "../connectors/HttpJsonRpcConnector";

export class MetamaskSnapHelper {
    private isInstalled: boolean = false;
    private snap: MetamaskFilecoinSnap | undefined;
    public filecoinApi: FilecoinSnapApi | undefined;
    public error: string| undefined;

    constructor(
        private connection: JsonRpcConnectionOptions,
    ) {}

    public async installFilecoinSnap() {
        if (!this.isInstalled) {
            try {
                console.log("installing snap");
                // enable filecoin snap with default testnet network
                const metamaskFilecoinSnap = await enableFilecoinSnap({
                    derivationPath: "m/44'/1'/0/0/1",
                    //@ts-ignore
                    network: 'local',
                    rpc: {
                        token: this.connection.token!,
                        url: this.connection.url!,
                    }
                });
                this.isInstalled = true;
                this.snap = metamaskFilecoinSnap;
            } catch (e) {
                this.isInstalled = false;
                return e;
            }
        }

        if (this.isInstalled && this.snap) {
            this.filecoinApi = await this.snap.getFilecoinSnapApi();
        }
        return null;
    }
}