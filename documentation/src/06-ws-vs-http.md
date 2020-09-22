---
id: ws-vs-http
title: WS vs HTTP
hide_title: true
---

# WS vs HTTP

You can call the lotus rpc api endpoints either by using HTTP calls or by using a websocket connection. Most of the endpoints work the same regardless of the connection method.

For some enpoints that notify the caller that a certain event happened (a new block was mined for example) a websocket connection works better since it provides out of the box a channel for these notifications. For this kind of endpoints we try to simulate the same behaviour for the HTTP connection by using a polling mechanism, which adds a delay between the time when the event happens and the user gets notified.

It's up to the user to use the appropiate connection method depending on their needs. In order to use a HTTP or WS connection you just need to provide the correct connector type when you create the rpc or wallet provider.

## HTTP setup example

```javascript
import { HttpJsonRpcConnector, HttpJsonRpcWalletProvider } from 'filecoin.js';
const connector = new HttpJsonRpcConnector({ url: __HTTP_LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
const jsonRpcProvider = new JsonRpcProvider(connector);

```

## WS setup example

```javascript
import { WsJsonRpcConnector, HttpJsonRpcWalletProvider } from 'filecoin.js';
const connector = new WsJsonRpcConnector({ url: __WS_LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
const jsonRpcProvider = new JsonRpcProvider(connector);

```

