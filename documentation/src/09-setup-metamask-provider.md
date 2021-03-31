---
id: setup-metamask-provider
title: Setup metamask provider
hide_title: true
---

# Setup Metamask provider
In order to use Metamask to sign messages you need to use the [Filecoin Metamask Snap](https://github.com/NodeFactoryIo/filsnap).

To use this first you need to install the [Metamask snaps beta release](https://github.com/NodeFactoryIo/metamask-snaps-beta/releases).
To simplify the actual snap install we built a helper which does the work for you:
```javascript
    const metamaskHelper = new FilecoinJs.MetamaskSnapHelper({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
    const err = await metamaskHelper.installFilecoinSnap();
```

## Setup and usage
```html
<script type="text/javascript" src="https://unpkg.com/filecoin.js"></script>
<script type="text/javascript">
(async () => {
    let metamaskAddress;
    const connector = new FilecoinJs.HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
    const lotusClient = new FilecoinJs.LotusClient(httpConnector);
    const metamaskHelper = new FilecoinJs.MetamaskSnapHelper({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
    const err = await metamaskHelper.installFilecoinSnap();

    const metamaskWalletProvider = new FilecoinJs.MetamaskWalletProvider(lotusClient, metamaskHelper.filecoinApi)

    let metamaskAddress
    try {
        metamaskAddress = await metamaskWalletProvider.getDefaultAddress();
    } catch (e) {
        console.log('metamask error',e);
    }

    console.log(metamaskAddress);

})().then().catch();
</script>
```