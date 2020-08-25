import {
  Version,
  Cid,
  TipSet,
  BlockMessages,
  Message,
  MessageReceipt,
  WrappedMessage,
  InvocResult,
  TipSetKey,
  Actor,
  ActorState,
  NetworkName,
  ChainSectorInfo,
  DeadlineInfo,
  MinerPower,
  MinerInfo,
  Deadline,
  Partition,
  BitField,
} from './Types';
import { Connector } from '../connectors/Connector';

export class JsonRpcProvider {
  public conn: Connector;

  constructor(connector: Connector) {
    this.conn = connector;
  }

  public async version(): Promise<Version> {
    const ret = await this.conn.request({ method: 'Filecoin.Version' });
    return ret as Version;
  }

  /**
   * reads ipld nodes referenced by the specified CID from chain blockstore and returns raw bytes.
   * @param cid
   */
  public async readObj(cid: Cid): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainReadObj', params: [cid] });
    return ret as string;
  }

  /**
   * returns messages stored in the specified block.
   * @param blockCid
   */
  public async getBlockMessages(blockCid: Cid): Promise<BlockMessages> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlockMessages', params: [blockCid] });
    return ret as BlockMessages;
  }

  /**
   * returns the current head of the chain
   */
  public async getHead(): Promise<TipSet> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainHead' });
    return ret as TipSet;
  }

  /**
   * returns the block specified by the given CID
   * @param blockCid
   */
  public async getBlock(blockCid: Cid): Promise<TipSet> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetBlock', params: [blockCid] });
    return ret as TipSet;
  }

  /**
   * reads a message referenced by the specified CID from the chain blockstore
   * @param messageCid
   */
  public async getMessage(messageCid: Cid): Promise<Message> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetMessage', params: [messageCid] });
    return ret as Message;
  }

  /**
   * returns receipts for messages in parent tipset of the specified block
   * @param blockCid
   */
  public async getParentReceipts(blockCid: Cid): Promise<MessageReceipt[]> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetParentReceipts', params: [blockCid] });
    return ret as MessageReceipt[];
  }

  /**
   * returns messages stored in parent tipset of the specified block.
   * @param blockCid
   */
  public async getParentMessages(blockCid: Cid): Promise<WrappedMessage[]> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetParentMessages', params: [blockCid] });
    return ret as WrappedMessage[];
  }

  /**
   * checks if a given CID exists in the chain blockstore
   * @param cid
   */
  public async hasObj(cid: Cid): Promise<boolean> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainHasObj', params: [cid] });
    return ret as boolean;
  }

   /**
   * looks back for a tipset at the specified epoch.
   * @param epochNumber
   */
  public async getTipSetByHeight(epochNumber: number): Promise<boolean> {
    const ret = await this.conn.request({ method: 'Filecoin.ChainGetTipSetByHeight', params: [epochNumber, []] });
    return ret as boolean;
  }

  /**
   * State
   * The State methods are used to query, inspect, and interact with chain state.
   * All methods take a TipSetKey as a parameter. The state looked up is the state at that tipset.
   * If TipSetKey is not provided as a param, the heaviest tipset in the chain to be used.
   */

  /**
   * runs the given message and returns its result without any persisted changes.
   */
  public async stateCall(message: Message, tipSetKey?: TipSet): Promise<InvocResult> {
    const data = await this.conn.request({ method: 'Filecoin.StateCall', params: [message, tipSetKey] });
    return data as InvocResult;
  }

  /**
   * returns the result of executing the indicated message, assuming it was executed in the indicated tipset
   */
  public async stateReplay(tipSetKey: TipSetKey, cid: Cid): Promise<InvocResult> {
    const data = await this.conn.request({ method: 'Filecoin.StateReplay', params: [] });
    return data as InvocResult;
  }

  /**
   * returns the indicated actor's nonce and balance
   * @param address
   * @param tipSetKey
   */
  public async getActor(address: string, tipSetKey?: TipSetKey): Promise<Actor> {
    const data = await this.conn.request({ method: 'Filecoin.StateGetActor', params: [address, tipSetKey] });
    return data as Actor;
  }

  /**
   * returns the indicated actor's state
   * @param address
   * @param tipSetKey
   */
  public async readState(address: string, tipSetKey?: TipSetKey): Promise<ActorState> {
    const data = await this.conn.request({ method: 'Filecoin.StateReadState', params: [address, tipSetKey] });
    return data as ActorState;
  }

  /**
   * looks back and returns all messages with a matching to or from address, stopping at the given height.
   * @param filter
   * @param tipSetKey
   * @param toHeight
   */
  public async listMessages(filter: { To?: string, From?: string }, tipSetKey?: TipSetKey, toHeight?: number):Promise<Cid[]> {
    const messages: Cid[] = await this.conn.request({ method: 'Filecoin.StateListMessages', params: [filter, tipSetKey, toHeight] });

    return messages ? messages : [];
  }

  /**
   * returns the name of the network the node is synced to
   */
  public async networkName(): Promise<NetworkName> {
    const network: string = await this.conn.request({ method: 'Filecoin.StateNetworkName', params: [] });
    return network;
  }

  /**
   * returns info about the given miner's sectors
   * @param address
   * @param tipSetKey
   */
  public async minerSectors(address: string, tipSetKey?: TipSetKey): Promise<ChainSectorInfo[]> {
    const sectorsInfo: ChainSectorInfo[] = await this.conn.request({ method: 'Filecoin.StateMinerSectors', params: [address, undefined, true, tipSetKey] })
    return sectorsInfo;
  }

  /**
   * returns info about sectors that a given miner is actively proving.
   * @param address
   * @param tipSetKey
   */
  public async minerActiveSectors(address: string, tipSetKey?: TipSetKey): Promise<ChainSectorInfo[]> {
    const activeSectors: ChainSectorInfo[] = await this.conn.request({ method: 'Filecoin.StateMinerActiveSectors', params: [address, tipSetKey] });
    return activeSectors;
  }

  /**
   * calculates the deadline at some epoch for a proving period and returns the deadline-related calculations.
   * @param address
   * @param tipSetKey
   */
  public async minerProvingDeadline(address: string, tipSetKey?: TipSetKey): Promise<DeadlineInfo> {
    const provingDeadline: DeadlineInfo = await this.conn.request({ method: 'Filecoin.StateMinerProvingDeadline', params: [address, tipSetKey] });
    return provingDeadline;
  }

  /**
   * returns the power of the indicated miner
   * @param address
   * @param tipSetKey
   */
  public async minerPower(address: string, tipSetKey?: TipSetKey): Promise<MinerPower> {
    const power: MinerPower = await this.conn.request({ method: 'Filecoin.StateMinerPower', params: [address, tipSetKey] });
    return power;
  }

  /**
   * returns info about the indicated miner
   * @param address
   * @param tipSetKey
   */
  public async minerInfo(address: string, tipSetKey?: TipSetKey): Promise<MinerInfo> {
    const minerInfo: MinerInfo = await this.conn.request({ method: 'Filecoin.StateMinerInfo', params: [address, tipSetKey] });
    return minerInfo;
  }

  /**
   * returns all the proving deadlines for the given miner
   * @param address
   * @param tipSetKey
   */
  public async minerDeadlines(address: string, tipSetKey?: TipSetKey): Promise<Deadline[]> {
    const minerDeadlines: Deadline[] = await this.conn.request({ method: 'Filecoin.StateMinerDeadlines', params: [address, tipSetKey] });
    return minerDeadlines;
  }

  /**
   * Loads miner partitions for the specified miner and deadline
   * @param address
   * @param idx
   * @param tipSetKey
   */
  public async minerPartitions(address: string, idx?: number, tipSetKey?: TipSetKey): Promise<Partition[]> {
    const minerPartitions: Partition[] = await this.conn.request({ method: 'Filecoin.StateMinerPartitions', params: [address, idx, tipSetKey] });
    return minerPartitions;
  }

  /**
   * Returns a bitfield indicating the faulty sectors of the given miner
   * @param address
   * @param tipSetKey
   */
  public async minerFaults(address: string, tipSetKey?: TipSetKey): Promise<BitField> {
    const minerFaults: BitField = await this.conn.request({ method: 'Filecoin.StateMinerFaults', params: [address, tipSetKey] });
    return minerFaults;
  }
}
