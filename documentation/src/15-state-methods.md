---
id: state-methods
title: State methods
hide_title: true
---

# State methods

The State methods are used to query, inspect, and interact with chain state.
All methods take a TipSetKey as a parameter. The state looked up is the state at that tipset.
A nil TipSetKey can be provided as a param, this will cause the heaviest tipset in the chain to be used.

The state methods can be used after you instantiate a JsonRpcProvider.

The methods cand be found [here](https://github.com/Digital-MOB-Filecoin/filecoin.js/blob/d4d2ecddb24e1e08d3c8fab154c09e3d9860731d/src/providers/JsonRpcProvider.ts#L261).

## Setup example
Node JavaScript/TypeScript:
```javascript
import { HttpJsonRpcConnector, HttpJsonRpcWalletProvider } from 'filecoin.js';

(async () => {

  const connector = new HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
  const jsonRpcProvider = new JsonRpcProvider(connector);

  const networkName = await jsonRpcProvider.state.networkName();

})().then().catch();
```

Browser:
```html
<script type="text/javascript" src="https://unpkg.com/filecoin.js"></script>
<script type="text/javascript">

(async () => {

  const connector = new FilecoinJs.HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
  const jsonRpcProvider = new FilecoinJs.JsonRpcProvider(connector);

  const networkName = await jsonRpcProvider.state.networkName();

})().then().catch();
</script>
```
