---
id: guides-example
title: Guides example
hide_title: true
---

## Guides example

Before getting into coding, you are going to have to start a [Lotus](https://lotus.filecoin.io/lotus/install/prerequisites/) node. To get started quickly, you can use a [hosted node by Glif](https://api.node.glif.io/). In this example, we can use a RPC endpoint for calibration net:

```shell
https://api.calibration.node.glif.io/rpc/v0
```

### Node.js and front-end frameworks

You can use ES6 style and/or use it in your Typescript.

```javascript
import { HttpJsonRpcConnector, LotusClient } from 'filecoin.js';

(async() => {
  const httpConnector = new HttpJsonRpcConnector('https://api.calibration.node.glif.io/rpc/v0');
  const lotusClient = new LotusClient(httpConnector);
  const version = await lotusClient.common.version();
  console.log(`Hello, Filecoin.js v${version}`);
})();
```

#### Node.js polyfill

> ⚠️ Because many Node.js dependencies are not
> compatible on the front end, if you faced an issue like
> [this](https://github.com/filecoin-shipyard/filecoin.js/issues/57),
> chances are you will have to add a [polyfills](https://www.npmjs.com/package/vite-plugin-node-polyfills) as a dependency.

### Browser

Just drop Filecoin.js into the `<script>` tag and you're ready to go.

```html
<script type="text/javascript" src="https://unpkg.com/filecoin.js" />
<script type="text/javascript">
  (async () => {
    const httpConnector = new FilecoinJs.HttpJsonRpcConnector('https://api.calibration.node.glif.io/rpc/v0');

    const lotusClient = new FilecoinJs.LotusClient(httpConnector);
    const version = await lotusClient.common.version();
    console.log(version);
  })();
</script>
```

If you run your own node, you will have to provide an argument of type [`JsonRpcConnectionOptions`](https://filecoin-shipyard.github.io/filecoin.js/docs/api/filecoin.js.httpjsonrpcconnector._constructor_) to [`HttpJsonRpcConnector`](https://filecoin-shipyard.github.io/filecoin.js/docs/api/filecoin.js.httpjsonrpcconnector) constructor.

```js
const httpConnector = new HttpJsonRpcConnector({
  url: __LOTUS_HTTP_RPC_ENDPOINT__,
  token: __LOTUS_AUTH_TOKEN__,
});
```
