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

  const hdWalletMnemonic = 'equip ... young';
  const hdWalletPassword = '...';
  const hdDerivationPath = `m/44'/461'/0'/0/0`;

  const walletProvider = new MnemonicWalletProvider(
    connector,
    hdWalletMnemonic,
    hdWalletPassword,
    hdDerivationPath
  );

  const myAddress = await walletProvider.getDefaultAccount();
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
  const hdWalletPassword = async () => await window.prompt(),;
  const hdDerivationPath = `m/44'/461'/0'/0/0`;

  const walletProvider = new FilecoinJs.MnemonicWalletProvider(
    connector,
    hdWalletMnemonic,
    hdWalletPassword,
    hdDerivationPath
  );

  const myAddress = await walletProvider.getDefaultAccount();
  console.log(myAddress);
  // f1zx43cf6qb6rd...

})().then().catch();
</script>
```
