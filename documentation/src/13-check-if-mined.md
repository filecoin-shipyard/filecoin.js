---
id: check-if-mined
title: Check if message is mined
hide_title: true
---

# Check if message is mined
In order to check if a particular message cid is mined you can check if it's in the blockchain store:
```javascript
 const httpConnector = new HttpJsonRpcConnector({ url: __LOTUS_RPC_ENDPOINT__, token: __LOTUS_AUTH_TOKEN__ });
 const con = new JsonRpcProvider(httpConnector);
 const isMined = await con.chain.hasObj(__MSG_CID__);
```
