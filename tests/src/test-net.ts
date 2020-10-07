import assert from "assert";

import { LOTUS_AUTH_TOKEN } from "../tools/testnet/credentials/credentials";
import { JsonRpcProvider } from '../../src/providers/JsonRpcProvider';
import { HttpJsonRpcConnector } from '../../src/connectors/HttpJsonRpcConnector';
import { WsJsonRpcConnector } from '../../src/connectors/WsJsonRpcConnector';

const httpConnector = new HttpJsonRpcConnector({ url: 'http://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });
const wsConnector = new WsJsonRpcConnector({ url: 'ws://localhost:8000/rpc/v0', token: LOTUS_AUTH_TOKEN });

describe("Net tests", function() {
  it("should check connectedness of peer ID [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const peerId = await provider.common.id();
    const connectedness = await provider.net.connectedness(peerId);
    assert.strictEqual(typeof connectedness === 'number', true, 'invalid connectedness of peer ID');
  });

  it("should check connectedness of peer ID [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const peerId = await provider.common.id();
    const connectedness = await provider.net.connectedness(peerId);
    assert.strictEqual(typeof connectedness === 'number', true, 'invalid connectedness of peer ID');
    await provider.release();
  });

  it("should get net peers [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const peers = await provider.net.peers();
    assert.strictEqual(Array.isArray(peers), true, 'invalid net peers');
  });

  it("should get net peers [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const peers = await provider.net.peers();
    assert.strictEqual(Array.isArray(peers), true, 'invalid net peers');
    await provider.release();
  });

  // it.only("should connect to addr [http]", async function() {
  //   const provider = new JsonRpcProvider(httpConnector);
  //   const peers = await provider.netPeers();
  //   const result = await provider.netConnect(peers[0]);
  // });
  //
  // it.only("should connect to addr [ws]", async function() {
  //   const provider = new JsonRpcProvider(wsConnector);
  //   const peers = await provider.netPeers();
  //   const result = await provider.netConnect(peers[0]);
  //   await provider.release();
  // });

  it("should get listen addr info [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const addr = await provider.net.addrsListen();
    const valid = typeof addr.ID === 'string' && Array.isArray(addr.Addrs);
    assert.strictEqual(valid, true, 'invalid listen addr info');
  });

  it("should get listen address [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const addr = await provider.net.addrsListen();
    const valid = typeof addr.ID === 'string' && Array.isArray(addr.Addrs);
    assert.strictEqual(valid, true, 'invalid listen addr info');
    await provider.release();
  });

  it("should find peer [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const peers = await provider.net.peers();
    const addrInfo = await provider.net.findPeer(peers[0].ID);
    const valid = typeof addrInfo.ID === 'string' && Array.isArray(addrInfo.Addrs);
    assert.strictEqual(valid, true, 'invalid listen addr info');
  });

  it("should find peer [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const peers = await provider.net.peers();
    const addrInfo = await provider.net.findPeer(peers[0].ID);
    const valid = typeof addrInfo.ID === 'string' && Array.isArray(addrInfo.Addrs);
    assert.strictEqual(valid, true, 'invalid listen addr info');
    await provider.release();
  });

  it("should get pubsub scores [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const scores = await provider.net.pubsubScores();
    assert.strictEqual(Array.isArray(scores), true, 'invalid pubsub scores');
  });

  it("should get pubsub score [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const scores = await provider.net.pubsubScores();
    assert.strictEqual(Array.isArray(scores), true, 'invalid pubsub scores');
    await provider.release();
  });

  it("should get nat status [http]", async function() {
    const provider = new JsonRpcProvider(httpConnector);
    const status = await provider.net.autoNatStatus();
    const valid = typeof status.Reachability === 'number' && typeof status.PublicAddr === 'string';
    assert.strictEqual(valid, true, 'invalid nat status');
  });

  it("should get nat status [ws]", async function() {
    const provider = new JsonRpcProvider(wsConnector);
    const status = await provider.net.autoNatStatus();
    const valid = typeof status.Reachability === 'number' && typeof status.PublicAddr === 'string';
    assert.strictEqual(valid, true, 'invalid nat status');
    await provider.release();
  });
});
