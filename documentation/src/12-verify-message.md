---
id: verify-message
title: Verify message
hide_title: true
---

# Verify message
After you set up a wallet provider you can check the message signer like this:
``` javascript
const result = await walletProvider.verify( __address__, __data__, __signature__ );
```