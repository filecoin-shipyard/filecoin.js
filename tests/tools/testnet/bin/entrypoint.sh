#!/usr/bin/bash

chmod +x "/testnet/start_testnet.sh"
chmod +x "/testnet/set_env.sh"

/testnet/start_testnet.sh

source /filecoin_miner/scripts/env-client.bash
. /testnet/set_env.sh
cd /testnet/proxy
npm install
node index.js