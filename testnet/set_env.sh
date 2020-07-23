#!/usr/bin/env bash
lotus_auth_string=$(lotus auth api-info --perm admin)

auth_token_parts=$(echo $lotus_auth_string | cut -d ":" -f 1)
port_parts=$(echo $lotus_auth_string | cut -d ":" -f 2)

auth_token=$(echo $auth_token_parts | cut -d "=" -f 2)
port=$(echo $port_parts | cut -d "/" -f 5)

echo $auth_token
echo $port

export LOTUS_AUTH_TOKEN=$auth_token
export LOTUS_URL=ws://localhost:$port/rpc/v0

export IPFS_ROOT=/filecoin_client
export ENCRYPTION_KEY=83f101bcfe79d34c1d327024fc5ccafe11d7b9ec4d29e13e08c5b291bf5a3b73
export COPY_NUMBER=2
export PRICE=5000000000