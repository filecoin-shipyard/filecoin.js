# filecoin.js

## Publishing this package

Before publishing you will probably need to perform an `npm run build` and `npm run bundle`, otherwise the package will get published without its built files.

## Status

This repository is in a **standby** state. It is not being actively maintained or kept in sync with the libraries it depends on. It may be archived in the near future. If you are interested in updating or maintaining this library, please open an issue or pull request for discussion.

The [js-lotus-client](https://github.com/filecoin-shipyard/js-lotus-client) suite of libraries may be used to implement some of the features that were intended to be developed here and is under more active maintenance.

---

A JavaScript (and TypeScript) library for interacting with the [Filecoin's](https://filecoin.io) [Lotus](https://github.com/filecoin-project/lotus) node, with support for external signers.

:warning: The library is currently in ALPHA: things will not work or work incorectly, will break and the API will change! :warning:

## Documentation

Visit the [Filecoin JS Docs](https://filecoin-shipyard.github.io/filecoin.js/).

## Installing

Node:

```bash
npm install --save filecoin.js
```

Browser:

```html
<script type="text/javascript" src="https://unpkg.com/filecoin.js"></script>
<!-- window.FilecoinJs object contains the library exports -->
```
## Using

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

## Examples

Sending some FIL to `someAddress`:

```javascript
    const message = await walletProvider.createMessage({
      From: myAddress,
      To: someAddress,
      Value: new BigNumber(42),
    });

    const msgCid = await walletProvider.sendSignedMessage(
      await walletProvider.signMessage(message)
    );
```

Check out the [tests](./tests/) or [examples](./documentation/examples) folders for more usage examples.

## Documentation

As with the rest of the library, the documentation is WIP. As it evolves the [documentation site](https://filecoin-shipyard.github.io/filecoin.js/) will be updated.

## Contributing

Feel free to join in. All welcome. [Open an issue!](https://github.com/Digital-MOB-Filecoin/filecoin.js/issues)

## License

Dual-licensed under [MIT](./LICENSE-MIT) + [Apache 2.0](./LICENSE-APACHE)
