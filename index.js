const { LotusWsClient } = require('./LotusWsClient');

const client = LotusWsClient.shared();

const get_version = async () => {
    return await client.version();
}

console.log(get_version());