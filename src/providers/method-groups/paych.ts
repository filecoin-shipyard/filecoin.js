import { Connector } from '../../connectors/Connector';
import {
  Address,
  ChannelAvailableFunds,
  ChannelInfo,
  Cid,
  PaychStatus,
  PaymentInfo,
  SignedVoucher,
  VoucherCreateResult,
  VoucherSpec,
} from '../Types';

/**
 * The Paych methods are for interacting with and managing payment channels
 */
export class JsonRpcPaychMethodGroup {
  private conn: Connector;

  constructor(conn: Connector) {
    this.conn = conn;
  }

  /**
   * PaychGet
   * @param from
   * @param to
   * @param amount
   */
  public async getPaymentChannel(from: string, to: string, amount: string): Promise<ChannelInfo> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychGet', params: [from, to, amount] });
    return ret;
  }

  /**
   * PaychGetWaitReady
   * @param cid
   */
  public async getWaitReadyPaymentChannel(cid: Cid): Promise<Address> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychGetWaitReady', params: [cid] });
    return ret;
  }

  /**
   * PaychList
   */
  public async getList(): Promise<[Address]> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychList', params: [] });
    return ret;
  }

  /**
   * PaychStatus
   * @param address
   */
  public async status(address: string): Promise<PaychStatus> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychStatus', params: [address] });
    return ret;
  }

  /**
   * PaychAllocateLane
   * @param address
   */
  public async allocateLane(address: string): Promise<number> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychAllocateLane', params: [address] });
    return ret;
  }

  /**
   * PaychSettle
   * @param address
   */
  public async settle(address: string): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychSettle', params: [address] });
    return ret;
  }

  /**
   * PaychCollect
   * @param address
   */
  public async collect(address: string): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychCollect', params: [address] });
    return ret;
  }

  /**
   * PaychAvailableFunds
   * @param address
   */
  public async getAvailableFunds(address: string): Promise<ChannelAvailableFunds> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychAvailableFunds', params: [address] });
    return ret;
  }

  /**
   * PaychAvailableFundsByFromTo
   * @param from
   * @param to
   */
  public async getAvailableFundsByFromTo(from: string, to: string): Promise<ChannelAvailableFunds> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychAvailableFundsByFromTo', params: [from, to] });
    return ret;
  }

  /**
   * PaychNewPayment
   * @param from
   * @param to
   * @param vouchers
   */
  public async newPayment(from: string, to: string, vouchers: [VoucherSpec]): Promise<PaymentInfo> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychNewPayment', params: [from, to, vouchers] });
    return ret;
  }

  /**
   * PaychVoucherCreate
   * @param address
   * @param amount
   * @param lane
   */
  public async voucherCreate(address: string, amount: string, lane: number): Promise<VoucherCreateResult> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCreate', params: [address, amount, lane] });
    return ret;
  }

  /**
   * PaychVoucherList
   * @param address
   */
  public async voucherList(address: string): Promise<[SignedVoucher]> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherList', params: [address] });
    return ret;
  }

  /**
   * PaychVoucherCheckValid
   * @param address
   * @param signedVoucher
   */
  public async voucherCheckValid(address: string, signedVoucher: SignedVoucher): Promise<any> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCheckValid', params: [address, signedVoucher] });
    return ret;
  }

  /**
   * PaychVoucherAdd
   * @param address
   * @param signedVoucher
   * @param proof
   * @param minDelta
   */
  public async voucherAdd(address: string, signedVoucher: SignedVoucher, proof: any, minDelta: string): Promise<string> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherAdd', params: [address, signedVoucher, proof, minDelta] });
    return ret;
  }

  /**
   * PaychVoucherCheckSpendable
   * @param address
   * @param signedVoucher
   * @param secret
   * @param proof
   */
  public async voucherCheckSpendable(address: string, signedVoucher: SignedVoucher, secret: any, proof: any): Promise<boolean> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherCheckSpendable', params: [address, signedVoucher, secret, proof] });
    return ret;
  }

  /**
   * PaychVoucherSubmit
   * @param address
   * @param signedVoucher
   * @param secret
   * @param proof
   */
  public async voucherSubmit(address: string, signedVoucher: SignedVoucher, secret: any, proof: any): Promise<Cid> {
    const ret = await this.conn.request({ method: 'Filecoin.PaychVoucherSubmit', params: [address, signedVoucher, secret, proof] });
    return ret;
  }
}
