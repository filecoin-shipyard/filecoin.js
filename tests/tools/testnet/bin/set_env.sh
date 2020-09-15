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

cat > "../credentials/credentials_web.js" <<EOF
const LOTUS_AUTH_TOKEN='$auth_token'
EOF

cat > "../credentials/credentials.ts" <<EOF
export const LOTUS_AUTH_TOKEN:string = '$auth_token'
EOF
