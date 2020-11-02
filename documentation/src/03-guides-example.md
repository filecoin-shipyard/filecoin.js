---
id: guides-example
title: Guides example
hide_title: true
---

# Guides example

Node JavaScript/TypeScript:

```javascript
import { HttpJsonRpcConnector, LotusClient } from 'filecoin.js';

(async () => {

  const connector = new HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });

  const jsonRpcProvider = new LotusClient(httpConnector);
  const version = await jsonRpcProvider.common.version();
  console.log(version);

})().then().catch();
```

Browser:

```html
<script type="text/javascript" src="https://unpkg.com/filecoin.js"></script>
<script type="text/javascript">
(async () => {

  const connector = new FilecoinJs.HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });

  const jsonRpcProvider = new FilecoinJs.LotusClient(httpConnector);
  const version = await jsonRpcProvider.common.version();
  console.log(version);

})().then().catch();
</script>
```
