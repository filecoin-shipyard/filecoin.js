---
id: sign-message
title: Sign message
hide_title: true
---

# Sign message
After you set up a wallet provider you can sign and send a message like this:
``` javascript
const message = await walletProvider.createMessage({
    To: __to__,
    From: __from__,
    Value: new BigNumber(__amount__),
});

const signedMessage = await walletProvider.signMessage(message);

const msgCid = await walletProvider.sendSignedMessage(signedMessage);
```