#!/usr/bin/bash

chmod +x "/testnet/start_testnet.sh"
chmod +x "/testnet/build_lotus.sh"
chmod +x "/testnet/init_testnet.sh"
chmod +x "/testnet/set_env.sh"

cpuName=$( lscpu | grep "Model name" | sed -r 's/Model name:\s{1,}(.*) @ .*z\s*/\1/g' )

echo $cpuName

IFS=$'\t'
array=("Intel(R) Xeon(R) CPU E5-2673 v3")
unset IFS

if [[ "\t${array[@]}\t" =~ "\t${cpuName}\t" ]]; then
    echo "rebuild ffi"
    /testnet/build_lotus_ffi.sh
    /testnet/init_testnet.sh
fi

/testnet/start_testnet.sh

source /filecoin_miner/scripts/env-client.bash
. /testnet/set_env.sh
cd /testnet/proxy
npm install
node index.js