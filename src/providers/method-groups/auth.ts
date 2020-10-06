import { Connector } from '../../connectors/Connector';
import { Permission } from '../Types';

/**
 * The Auth method group is used to manage the authorization tokens.
 */
export class JsonRpcAuthMethodGroup {
  private conn: Connector;

  constructor(conn: Connector) {
    this.conn = conn;
  }

  /**
   * list the permissions for a given authorization token
   * @param token
   */
  public async verify(token: string): Promise<Permission[]> {
    const permissions: Permission[] = await this.conn.request({ method: 'Filecoin.AuthVerify', params: [token] });
    return permissions;
  }

  /**
   * generate a new authorization token for a given permissions list
   * @param permissions
   */
  public async new(permissions: Permission[]): Promise<string> {
    const token: string = await this.conn.request({ method: 'Filecoin.AuthNew', params: [permissions] });
    const tokenAscii = Buffer.from(token, 'base64').toString('ascii');
    return tokenAscii;
  }
}
