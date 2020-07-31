import { HttpConnector } from './connectors/HttpJsonRpc';
import { JsonRpcProvider } from './providers/JsonRpcProvider';

(async () => {
  try {
    const con = new JsonRpcProvider('http://lotus-2a.testnet.s.interplanetary.one:1234/rpc/v0');

    console.error(await con.version());
    console.error(await con.readObj({ '/': 'bafy2bzacecqlzny34omms3qvyrqerdqy6jbxg77bje2h3upd4kxjnxkn2zf6y' }));
    console.error(await con.getBlockMessages({ '/': 'bafy2bzacecpkzzq7fbulsp2k6ej5bcxpjrtpbmneyha7yb746qwbp4qejsdf6' }));
    const head = await con.getHead();
    console.error(head);
    console.error('111111111111', head.Blocks[0]);
    console.error('222222222222', await con.getBlock(head.Cids[0]));
    console.error(await con.readObj(head.Blocks[0].Parents[0]));

  } catch (e) {
    console.error(e);
  }
})();

export { JsonRpcProvider } from './providers/JsonRpcProvider';
// export * from './providers/Types';
