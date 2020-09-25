#!/usr/bin/env bash
cat /proc/cpuinfo

docker-compose -f ./tests/tools/testnet/docker-compose-tests.yml up -d --force-recreate
echo 'waiting for testnetwork'
i=0
pollPeriod=15
testCurlStatus=0
timeoutPeriod=320
succesTestStatus=200

while [[ $testCurlStatus != $succesTestStatus && $i -lt $timeoutPeriod ]]
do
sleep $pollPeriod
i=$[$i + $pollPeriod]
testCurlStatus=$(curl -s -o /dev/null -w ''%{http_code}'' 'http://localhost:8000/rpc/v0' -H 'Content-Type: application/json' --data-binary '{"jsonrpc":"2.0","method":"Filecoin.Version","params":null,"id":0}')
testCurlResponse=$(curl -s 'http://localhost:8000/rpc/v0' -H 'Content-Type: application/json' --data-binary '{"jsonrpc":"2.0","method":"Filecoin.Version","params":null,"id":0}')
echo "curl response status"
echo $testCurlStatus
echo $testCurlResponse
echo "waiting for $i seconds, timeout $timeoutPeriod"
done

if [[ $i -ge $timeoutPeriod ]]
then
    echo 'could not initialize testnetwork'
    docker-compose -f ./tests/tools/testnet/docker-compose-tests.yml logs filecoin_js_infra
else
    echo 'testnetwork up and running'
    echo 'ready to test'
fi