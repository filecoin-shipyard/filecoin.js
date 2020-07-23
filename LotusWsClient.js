const { Client } = require('rpc-websockets');

class LotusWsClient {
  constructor(lotusUrl, authToken) {
    let fullUrl = `${lotusUrl}`;

    if (authToken) {
      fullUrl = fullUrl + `?token=${authToken}`;
    }

    this.ready = false;

    this.client = new Client(fullUrl);
    this.client.on('open', () => {
      this.ready = true;
      // console.log('Lotus connection established!\n');
    });
    this.client.on('error', () => console.log(`Couldn't connect to Lotus`));
    this.client.on('close', () => {
      this.ready = false;
      console.log('Lotus connection closed!\n');
    })
  }

  close() {
    return this.client.close();
  }

  static shared() {
    if (!this.instance) {
      this.instance = new LotusWsClient(
        process.env.LOTUS_URL,
        process.env.LOTUS_AUTH_TOKEN,
      );
    }

    return this.instance;
  }

  async whenReady() {
    if (this.ready) return;
    const waiter = (resolve) => {
      return () => {
        if (this.ready) resolve();
        const t = setTimeout(waiter(resolve), 500);
      }
    }
    await new Promise(resolve => waiter(resolve)());
  }

  async version() {
    await this.whenReady();
    return this.client.call('Filecoin.Version');
  }

  async mpoolPushMessge(msg) {
    await this.whenReady();
    return this.client.call('Filecoin.MpoolPushMessage', [msg]);
  }

  async mpoolPush(signedMsg) {
    await this.whenReady();
    return this.client.call('Filecoin.MpoolPush', [signedMsg]);
  }

  async chainGetMessage(cid) {
    await this.whenReady();
    return this.client.call('Filecoin.ChainGetMessage', [cid]);
  }

}

module.exports = {
  LotusWsClient,
}
