const { LotusWsClient } = require('./LotusWsClient');

const client = LotusWsClient.shared();

it('get version', async () => {
    expect.assertions(1);
    const data = await client.version();
    expect(data).toEqual({"APIVersion": 1536, "BlockDelay": 2, "Version": "0.4.1+debug+git.3f017688"});
  });

it('push message', async () => {
    expect.assertions(1);
    const signedMsg = await client.mpoolPushMessge({
        From:     't3xgaa6yckgihr4tedbwqqj2e3vat667im3kcztc5s6eaft77zu3moztpqwx3nxk7xcakfrn4ajlsjxkikrkkq',
        To:       't3xgaa6yckgihr4tedbwqqj2e3vat667im3kcztc5s6eaft77zu3moztpqwx3nxk7xcakfrn4ajlsjxkikrkkq',
        Value:    "1",
        GasLimit: 100000,
        GasPrice: "0",
      });

    const messageCid = await client.mpoolPush(signedMsg);

    const message = await client.chainGetMessage(messageCid);

    console.log(message);

    expect(signedMsg.Message.From).toEqual("t3xgaa6yckgihr4tedbwqqj2e3vat667im3kcztc5s6eaft77zu3moztpqwx3nxk7xcakfrn4ajlsjxkikrkkq");
});