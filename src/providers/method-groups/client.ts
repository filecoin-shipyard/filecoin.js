import { Connector } from '../../connectors/Connector';
import {
  Address,
  Cid, CommPRet, DataCIDSize, DataSize, DataTransferChannel,
  DealInfo,
  FileRef, Import,
  ImportRes, PeerID,
  QueryOffer, RetrievalEvent,
  RetrievalOrder,
  StartDealParams, StorageAsk,
  StoreID, TransferID,
} from '../Types';
import { WsJsonRpcConnector } from '../../connectors/WsJsonRpcConnector';

/**
 * The Client methods all have to do with interacting with the storage and retrieval markets as a client.
 */
export class JsonRpcClientMethodGroup {
  private conn: Connector;

  constructor(conn: Connector) {
    this.conn = conn;
  }

  /**
   * Imports file under the specified path into filestore.
   * @param fileRef
   */
  public async import(fileRef: FileRef): Promise<ImportRes> {
    const result: ImportRes = await this.conn.request({
      method: 'Filecoin.ClientImport',
      params: [fileRef],
    });
    return result;
  }

  /**
   * Removes file import
   * @param importId
   */
  public async removeImport(importId: StoreID) {
    const result: ImportRes = await this.conn.request({
      method: 'Filecoin.ClientRemoveImport',
      params: [importId],
    });
    return result;
  }

  /**
   * Proposes a deal with a miner.
   * @param dealParams
   */
  public async startDeal(dealParams: StartDealParams): Promise<Cid> {
    const cid: Cid = await this.conn.request({
      method: 'Filecoin.ClientStartDeal',
      params: [dealParams],
    });
    return cid;
  }

  /**
   * Returns the latest information about a given deal.
   * @param dealCid
   */
  public async getDealInfo(dealCid: Cid): Promise<DealInfo> {
    const dealInfo: DealInfo = await this.conn.request({
      method: 'Filecoin.ClientGetDealInfo',
      params: [dealCid],
    });
    return dealInfo;
  }

  /**
   * Returns information about the deals made by the local client.
   */
  public async listDeals(): Promise<DealInfo[]> {
    const deals: DealInfo[] = await this.conn.request({
      method: 'Filecoin.ClientListDeals',
      params: [],
    });
    return deals;
  }

  public async hasLocal(cid: Cid): Promise<boolean> {
    const hasLocal: boolean = await this.conn.request({
      method: 'Filecoin.ClientHasLocal',
      params: [cid],
    });
    return hasLocal;
  }

  /**
   * Identifies peers that have a certain file, and returns QueryOffers (one per peer).
   * @param cid
   * @param pieceCid
   */
  public async findData(cid: Cid, pieceCid?: Cid): Promise<QueryOffer[]> {
    const data: QueryOffer[] = await this.conn.request({
      method: 'Filecoin.ClientFindData',
      params: [cid, pieceCid],
    });
    return data;
  }

  /**
   * returns a QueryOffer for the specific miner and file.
   * @param miner
   * @param root
   * @param pieceCid
   */
  public async minerQueryOffer(miner: Address, root: Cid, pieceCid?: Cid): Promise<QueryOffer> {
    const queryOffer: QueryOffer = await this.conn.request({
      method: 'Filecoin.ClientMinerQueryOffer',
      params: [miner, root, pieceCid],
    });
    return queryOffer;
  }

  /**
   * initiates the retrieval of a file, as specified in the order.
   * @param order
   * @param ref
   */
  public async retrieve(order: RetrievalOrder, ref: FileRef) {
    await this.conn.request({
      method: 'Filecoin.ClientRetrieve',
      params: [order, ref],
    });
  }

  /**
   * returns a signed StorageAsk from the specified miner.
   * @param peerId
   * @param miner
   */
  public async queryAsk(peerId: PeerID, miner: Address): Promise<StorageAsk> {
    const queryAsk: StorageAsk = await this.conn.request({
      method: 'Filecoin.ClientQueryAsk',
      params: [peerId, miner],
    });

    return queryAsk;
  }

  /**
   * calculates the CommP for a specified file
   * @param path
   */
  public async calcCommP(path: string): Promise<CommPRet> {
    const commP: CommPRet = await this.conn.request({
      method: 'Filecoin.ClientCalcCommP',
      params: [path],
    });

    return commP;
  }

  /**
   * generates a CAR file for the specified file.
   * @param ref
   * @param outpath
   */
  public async genCar(ref: FileRef, outpath: string) {
    const car = await this.conn.request({
      method: 'Filecoin.ClientGenCar',
      params: [ref, outpath],
    });

    return car;
  }

  /**
   * calculates real deal data size
   * @param root
   */
  public async dealSize(root: Cid): Promise<DataSize> {
    const dataSize: DataSize = await this.conn.request({
      method: 'Filecoin.ClientDealSize',
      params: [root],
    });

    return dataSize;
  }

  /**
   * returns the status of all ongoing transfers of data
   */
  public async listDataTransfers(): Promise<DataTransferChannel[]> {
    const transfers: DataTransferChannel[] = await this.conn.request({
      method: 'Filecoin.ClientListDataTransfers',
      params: [],
    });

    return transfers;
  }

  /**
   * attempts to restart stalled retrievals on a given payment channel which are stuck due to insufficient funds.
   * @param paymentChannel
   */
  public async retrieveTryRestartInsufficientFunds(paymentChannel: Address) {
    await this.conn.request({
      method: 'Filecoin.ClientRetrieveTryRestartInsufficientFunds',
      params: [paymentChannel],
    });
  }

  /**
   * lists imported files and their root CIDs
   */
  public async listImports(): Promise<Import[]> {
    const imports: Import[] = await this.conn.request({
      method: 'Filecoin.ClientListImports',
      params: [],
    });

    return imports;
  }

  /**
   * returns the status of updated deals
   */
  public async getDealUpdates(cb: (data: DealInfo) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      const subscriptionId = await this.conn.request({
        method: 'Filecoin.ClientGetDealUpdates',
      });
      this.conn.on(subscriptionId, cb);
    }
  }

  /**
   * initiates the retrieval of a file, as specified in the order, and provides a channel of status updates.
   * @param order
   * @param ref
   * @param cb
   */
  public async retrieveWithEvents(order: RetrievalOrder, ref: FileRef, cb: (data: RetrievalEvent) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      const subscriptionId = await this.conn.request({
        method: 'Filecoin.ClientRetrieveWithEvents',
      });
      this.conn.on(subscriptionId, cb);
    }
  }

  public async dataTransferUpdates(cb: (data: DataTransferChannel) => void) {
    if (this.conn instanceof WsJsonRpcConnector) {
      const subscriptionId = await this.conn.request({
        method: 'Filecoin.ClientDataTransferUpdates',
      });
      this.conn.on(subscriptionId, cb);
    }
  }

  /**
   * returns deal status given a code
   * @param code
   */
  public async getDealStatus(code: number): Promise<string> {
    const status: string = await this.conn.request({
      method: 'Filecoin.ClientGetDealStatus',
      params: [code],
    });

    return status;
  }

  /**
   * attempts to restart a data transfer with the given transfer ID and other peer
   * @param transferId
   * @param otherPeer
   * @param isInitiator
   */
  public async restartDataTransfer(transferId: TransferID, otherPeer: PeerID, isInitiator: boolean) {
    await this.conn.request({
      method: 'Filecoin.ClientRestartDataTransfer',
      params: [transferId, otherPeer, isInitiator],
    });
  }

  /**
   * cancels a data transfer with the given transfer ID and other peer
   * @param transferId
   * @param otherPeer
   * @param isInitiator
   */
  public async cancelDataTransfer(transferId: TransferID, otherPeer: PeerID, isInitiator: boolean) {
    await this.conn.request({
      method: 'Filecoin.ClientCancelDataTransfer',
      params: [transferId, otherPeer, isInitiator],
    });
  }

  public async dealPieceCID(rootCid: Cid): Promise<DataCIDSize> {
    const dataCIDSize: DataCIDSize = await this.conn.request({
      method: 'Filecoin.ClientDealPieceCID',
      params: [rootCid],
    });

    return dataCIDSize;
  }
}
