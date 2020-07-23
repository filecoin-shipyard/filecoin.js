const { LotusWsClient } = require('./LotusWsClient');

const client = LotusWsClient.shared();

it('get version', async () => {
    expect.assertions(1);
    const data = await client.version();
    expect(data).toEqual({"APIVersion": 1536, "BlockDelay": 2, "Version": "0.4.1+debug+git.3f017688"});
  });

it('push message', async () => {
    expect.assertions(1);

    const walletList = await client.walletList();

    const address = walletList[0];
    const signedMsg = await client.mpoolPushMessge({
        From:     address,
        To:       address,
        Value:    "1",
        GasLimit: 100000,
        GasPrice: "0",
      });

    const messageCid = await client.mpoolPush(signedMsg);

    const message = await client.chainGetMessage(messageCid);

    console.log(message);

    expect(signedMsg.Message.From).toEqual(address);
});