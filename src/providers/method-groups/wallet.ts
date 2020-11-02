import { Connector } from '../../connectors/Connector';
import { toBase64 } from '../../utils/data';
import { Address, KeyInfo, Message, NewAddressType, Signature, SignedMessage } from '../Types';

export class JsonRpcWalletMethodGroup {
    private conn: Connector;

    constructor(conn: Connector) {
        this.conn = conn;
    }
    /**
     * creates a new address in the wallet with the given sigType.
     * @param type
     */
    public async new(type: NewAddressType  = NewAddressType.SECP256K1): Promise<string> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletNew', params: [type] });
        return ret as string;
    }

    /**
     * get wallet list
     */
    public async list(): Promise<string[]> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletList' });
        return ret as string[];
    }

    /**
     * get balance for address
     * @param address
     */
    public async balance(address: string): Promise<any> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletBalance', params: [address] });
        return ret as string;
    }

    /**
     * delete address from lotus
     * @param address
     */
    public async delete(address: string): Promise<any> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletDelete', params: [address] });
        return ret as boolean;
    }

    /**
    * check if address is in keystore
    * @param address
    */
    public async has(address: string): Promise<any> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletHas', params: [address] });
        return ret as boolean;
    }

    /**
     * set default address
     * @param address
     */
    public async setDefault(address: string): Promise<undefined> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletSetDefault', params: [address] });
        return ret as undefined;
    }

    /**
     * walletExport returns the private key of an address in the wallet.
     * @param address
     */
    public async export(address: string): Promise<KeyInfo> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletExport', params: [address] });
        return ret as KeyInfo;
    }

    /**
     * walletImport returns the private key of an address in the wallet.
     * @param keyInfo
     */
    public async import(keyInfo: KeyInfo): Promise<string> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletImport', params: [keyInfo] });
        return ret as string;
    }

    /**
     * get default address
     */
    public async getDefaultAddress(): Promise<string> {
        const ret = await this.conn.request({ method: 'Filecoin.WalletDefaultAddress' });
        return ret as string;
    }

    //Signer methods
    /**
     * sign message
     * @param msg
     */
    public async signMessage(msg: Message): Promise<SignedMessage> {
        const address = await this.getDefaultAddress();
        const ret = await this.conn.request({ method: 'Filecoin.WalletSignMessage', params: [address, msg] });
        return ret as SignedMessage;
    }

    /**
     * sign raw message
     * @param data
     */
    public async sign(data: string | ArrayBuffer): Promise<Signature> {
        const address = await this.getDefaultAddress();
        data = toBase64(data);
        const ret = await this.conn.request({ method: 'Filecoin.WalletSign', params: [address, data] });
        return ret as Signature;
    }

    /**
     * verify message signature
     * @param data
     * @param sign
     */
    public async verify(address: string, data: string | ArrayBuffer, sign: Signature): Promise<boolean> {
        data = toBase64(data);
        const ret = await this.conn.request({ method: 'Filecoin.WalletVerify', params: [address, data, sign] });
        return ret as boolean;
    }


  /**
   * validates whether a given string can be decoded as a well-formed address
   * @param address
   */
  public async validateAddress(address: string): Promise<Address> {
    const addressResponse: Address = await this.conn.request({ method: 'Filecoin.WalletValidateAddress', params: [address] });
    return addressResponse;
  }
}
