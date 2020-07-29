require('dotenv').config({ path: './testnet/.env' })

const { LotusWsClient } = require('./LotusWsClient');

const client = LotusWsClient.sharedWithValues('ws://localhost:8000/rpc/v0',process.env.LOTUS_AUTH_TOKEN);
//const client = LotusWsClient.shared();

const get_version = async () => {
    return await client.version();
}

console.log(get_version());