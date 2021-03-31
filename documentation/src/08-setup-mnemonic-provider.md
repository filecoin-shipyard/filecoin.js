---
id: setup-mnemonic-provider
title: Setup mnemonic provider
hide_title: true
---

# Setup mnemonic provider
Node JavaScript/TypeScript:

```javascript
import { HttpJsonRpcConnector, MnemonicWalletProvider } from 'filecoin.js';

(async () => {

  const connector = new HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
  const lotusClient =  new LotusClient(connector);
  const hdWalletMnemonic = 'equip ... young';
  const hdDerivationPath = `m/44'/461'/0'/0/0`;

  const walletProvider = new MnemonicWalletProvider(
    lotusClient,
    hdWalletMnemonic,
    hdDerivationPath
  );

  const myAddress = await walletProvider.getDefaultAddress();
  console.log(myAddress);
  // f1zx43cf6qb6rd...

})().then().catch();
```

Browser:

```html
<script type="text/javascript" src="https://unpkg.com/filecoin.js"></script>
<script type="text/javascript">
(async () => {

  const connector = new FilecoinJs.HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });

  const hdWalletMnemonic = 'equip ... young';
  const hdDerivationPath = `m/44'/461'/0'/0/0`;
  const lotusClient =  new FilecoinJs.LotusClient(connector);
  const walletProvider = new FilecoinJs.MnemonicWalletProvider(
    lotusClient,
    hdWalletMnemonic,
    hdDerivationPath
  );

  const myAddress = await walletProvider.getDefaultAddress();
  console.log(myAddress);
  // f1zx43cf6qb6rd...

})().then().catch();
</script>
```
