#!/usr/bin/env bash
docker-compose -f ./testnet/docker-compose-tests.yml up -d --force-recreate
echo 'waiting for testnetwork'
i="0"
testCurlStatus=0
while [[ $testCurlStatus != 200 ]]
do
sleep 15
i=$[$i + 15]
testCurlStatus=$(curl -s -o /dev/null -w ''%{http_code}'' 'http://localhost:8000/rpc/v0' -H 'Content-Type: application/json' --data-binary '{"jsonrpc":"2.0","method":"Filecoin.Version","params":null,"id":0}')
testCurlResponse=$(curl -s 'http://localhost:8000/rpc/v0' -H 'Content-Type: application/json' --data-binary '{"jsonrpc":"2.0","method":"Filecoin.Version","params":null,"id":0}')
echo "curl response status"
echo $testCurlStatus
echo $testCurlResponse
echo "waiting for $i seconds"
done

echo 'testnetwork up and running'
echo 'ready to test'