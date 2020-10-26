import { Connector } from '../connectors/Connector';
import { JsonRpcStateMethodGroup } from './method-groups/state';
import { JsonRpcChainMethodGroup } from './method-groups/chain';
import { JsonRpcAuthMethodGroup } from './method-groups/auth';
import { JsonRpcClientMethodGroup } from './method-groups/client';
import { JsonRpcCommonMethodGroup } from './method-groups/common';
import { JsonRpcMinerMethodGroup } from './method-groups/miner';
import { JsonRpcPaychMethodGroup } from './method-groups/paych';
import { JsonRpcMPoolMethodGroup } from './method-groups/mpool';
import { JsonRpcNetMethodGroup } from './method-groups/net';
import { JsonRpcMsigMethodGroup } from './method-groups/msig';
import { JsonRpcSyncMethodGroup } from './method-groups/sync';
import { JsonRpcGasMethodGroup } from './method-groups/gasEstimate';
import { JsonRpcWalletMethodGroup } from './method-groups/wallet';



export class LotusClient {
  public conn: Connector;
  public chain: JsonRpcChainMethodGroup;
  public state: JsonRpcStateMethodGroup;
  public auth: JsonRpcAuthMethodGroup;
  public client: JsonRpcClientMethodGroup;
  public common: JsonRpcCommonMethodGroup;
  public miner: JsonRpcMinerMethodGroup;
  public paych: JsonRpcPaychMethodGroup;
  public mpool: JsonRpcMPoolMethodGroup;
  public net: JsonRpcNetMethodGroup;
  public msig: JsonRpcMsigMethodGroup;
  public sync: JsonRpcSyncMethodGroup;
  public gasEstimate: JsonRpcGasMethodGroup;
  public wallet: JsonRpcWalletMethodGroup;



  constructor(connector: Connector) {
    this.conn = connector;
    this.conn.connect();

    this.state = new JsonRpcStateMethodGroup(this.conn);
    this.chain = new JsonRpcChainMethodGroup(this.conn);
    this.auth = new JsonRpcAuthMethodGroup(this.conn);
    this.client = new JsonRpcClientMethodGroup(this.conn);
    this.common = new JsonRpcCommonMethodGroup(this.conn);
    this.miner = new JsonRpcMinerMethodGroup(this.conn);
    this.paych = new JsonRpcPaychMethodGroup(this.conn);
    this.mpool = new JsonRpcMPoolMethodGroup(this.conn);
    this.net = new JsonRpcNetMethodGroup(this.conn);
    this.msig = new JsonRpcMsigMethodGroup(this.conn);
    this.sync = new JsonRpcSyncMethodGroup(this.conn);
    this.gasEstimate = new JsonRpcGasMethodGroup(this.conn);
    this.wallet = new JsonRpcWalletMethodGroup(this.conn);
  }

  public async release() {
    return this.conn.disconnect();
  }
}
