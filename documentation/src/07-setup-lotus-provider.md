---
id: setup-lotus-provider
title: Setup lotus provider
hide_title: true
---

# Setup lotus provider

## Lotus tokens
Not all the Lotus API endpoints are public. Some endpoints need extra permissions (read,write,sign,admin). To use these endpoints you need to supply a token.

You can find more info regarding tokens [here](https://docs.filecoin.io/build/lotus/api-token-generation/#generating-new-tokens)

If you want to use these secured endpoints you need to supply a token to the HttpJsonRpcConnector or WsJsonRpcConnector, or use a proxy that takes care of this for you, by adding the Authorization token to all requests.

## CORS
If you want to connect to a lotus node from the browser you need to have a proxy in front of the Lotus node to handle CORS requests. The proxy needs to be able to handle OPTIONS requests and add the proper headers to the request. If you don't want to expose your token to the general public, you can add it in the proxy.

An minimal example, using node and the [http-proxy](https://www.npmjs.com/package/http-proxy) package:
```Javascript
var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = new httpProxy.createProxyServer({
  target: {
    host: __LOTUS_RPC_ENDPOINT__,
    port: __LOTUS_PORT__
  }
});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,POST,PUT,DELETE');

  if (proxyReq.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
});

var proxyServer = http.createServer(function (req, res) {
  proxy.web(req, res);
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
});

process.on('uncaughtException', function (error) {
  console.log(error);
});

process.on('unhandledRejection', function (reason, p) {
  console.log(reason);
});

proxyServer.listen(8000);
```

## Setup example

Node JavaScript/TypeScript:
```javascript
import { HttpJsonRpcConnector, HttpJsonRpcWalletProvider } from 'filecoin.js';

(async () => {

  const connector = new HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
  const walletProvider = new HttpJsonRpcWalletProvider(connector);

  const myAddress = await walletProvider.getDefaultAccount();

})().then().catch();
```

Browser:
```html
<script type="text/javascript" src="https://unpkg.com/filecoin.js"></script>
<script type="text/javascript">

(async () => {

  const connector = new FilecoinJs.HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
  const walletProvider = new FilecoinJs.HttpJsonRpcWalletProvider(connector);

  const myAddress = await walletProvider.getDefaultAccount();

})().then().catch();
</script>
```