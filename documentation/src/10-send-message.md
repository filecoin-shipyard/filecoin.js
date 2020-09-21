---
id: send-message
title: Send message
hide_title: true
---

# Send message
After you set up a wallet provider you can send a message like this:
``` javascript
const message = await walletProvider.createMessage({
    To: __to__,
    From: __from__,
    Value: new BigNumber(__amount__),
});

const msg = await walletProvider.sendMessage(message)
```
