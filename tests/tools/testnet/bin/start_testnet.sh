#!/usr/bin/env bash
set -Exo pipefail

bootstrap_daemon_port=4500
bootstrap_miner_port=2345
client_daemon_port=4502

genesis_miner_addr="t01000"
build_dir="/localnet.test"
base_dir="/filecoin_miner"

build_log_path=$(mktemp)
deps=(printf paste jq python nc)
lotus_git_sha="492ffac913287c732cc5d54d0deddc44e41b642f"
copy_binaries_from_dir=""
other_args=()

# ensure that script dependencies are met
#
for dep in ${deps[@]}; do
    if ! which "${dep}"; then
        (>&2 echo "please install ${dep} before running this script")
        exit 1
    fi
done

cat > "${base_dir}/scripts/create_genesis_block.bash" <<EOF
#!/usr/bin/env bash
set -xe

HOME="${base_dir}" lotus-seed pre-seal --sector-size 2048 --num-sectors 2 --miner-addr "${genesis_miner_addr}"
lotus-seed genesis new "${base_dir}/localnet.json"
lotus-seed genesis add-miner "${base_dir}/localnet.json" "\$LOTUS_GENESIS_SECTORS/pre-seal-${genesis_miner_addr}.json"
jq '.Accounts[0].Balance = "50000000000000000000000"' "${base_dir}/localnet.json" > "${base_dir}/localnet.json.tmp" && mv "${base_dir}/localnet.json.tmp" "${base_dir}/localnet.json"
EOF

cat > "${base_dir}/scripts/create_miner.bash" <<EOF
#!/usr/bin/env bash
set -xe

lotus wallet import "\$LOTUS_GENESIS_SECTORS/pre-seal-${genesis_miner_addr}.key"
lotus-miner init --genesis-miner --actor="${genesis_miner_addr}" --sector-size=2048 --pre-sealed-sectors=\$LOTUS_GENESIS_SECTORS --pre-sealed-metadata="\$LOTUS_GENESIS_SECTORS/pre-seal-${genesis_miner_addr}.json" --nosync
EOF

cat > "${base_dir}/scripts/start_faucet.bash" <<EOF
#!/usr/bin/env bash
set -xe

wallet=\$(lotus wallet list | cut -d " " -f 1 | sed -e "s/^Address//" | tr -d '\n')
while [ "\$wallet" = "" ]; do
  sleep 5
  wallet=\$(lotus wallet list)
done

lotus-fountain run --from=\$wallet
EOF

cat > "${base_dir}/scripts/hit_faucet.bash" <<EOF
#!/usr/bin/env bash
set -xe

while ! nc -z 127.0.0.1 ${client_daemon_port} </dev/null; do sleep 10; done
while [ ! -f ${base_dir}/.bootstrap-daemon-multiaddr ]; do sleep 9; done
lotus net connect \$(cat ${base_dir}/.bootstrap-daemon-multiaddr)

lotus sync wait

while ! nc -z 127.0.0.1 ${bootstrap_miner_port} </dev/null; do sleep 5; done
while [ ! -f ${base_dir}/.bootstrap-miner-multiaddr ]; do sleep 5; done
lotus net connect \$(cat ${base_dir}/.bootstrap-miner-multiaddr)

while ! nc -z 127.0.0.1 7777 </dev/null; do sleep 5; done

faucet="http://127.0.0.1:7777"
owner=\$(lotus wallet new bls)
msg_cid=\$(curl -D - -XPOST -F "sectorSize=2048" -F "address=\$owner" \$faucet/send | tail -1)
lotus state wait-msg \$msg_cid

owner=\$(lotus wallet new secp256k1)
msg_cid=\$(curl -D - -XPOST -F "sectorSize=2048" -F "address=\$owner" \$faucet/send | tail -1)
lotus state wait-msg \$msg_cid

owner=\$(lotus wallet new secp256k1)
msg_cid=\$(curl -D - -XPOST -F "sectorSize=2048" -F "address=\$owner" \$faucet/send | tail -1)
lotus state wait-msg \$msg_cid
EOF

cat > "${base_dir}/scripts/propose_storage_deal.bash" <<EOF
#!/usr/bin/env bash
set -xe

cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 900 | head -n 1 > "${base_dir}/original-data.txt"
lotus client import "${base_dir}/original-data.txt" > "${base_dir}/original-data.cid"
lotus client deal \$(cat ${base_dir}/original-data.cid) t01000 0.000000000001 5
EOF

cat > "${base_dir}/scripts/retrieve_stored_file.bash" <<EOF
#!/usr/bin/env bash
set -xe

lotus client retrieve \$(cat "${base_dir}/original-data.cid") "${base_dir}/retrieved-data.txt"

set +xe

paste <(printf "%-50s\n\n" "${base_dir}/original-data.txt") <(printf "%-50s\n\n" "${base_dir}/retrieved-data.txt")
paste <(printf %s "\$(cat "${base_dir}/original-data.txt" | fold -s -w 50)") <(printf %s "\$(cat "${base_dir}/retrieved-data.txt" | fold -s -w 50)")

diff "${base_dir}/original-data.txt" "${base_dir}/retrieved-data.txt" && echo "retrieved file matches stored file"
EOF

chmod +x "${base_dir}/scripts/create_genesis_block.bash"
chmod +x "${base_dir}/scripts/create_miner.bash"
chmod +x "${base_dir}/scripts/hit_faucet.bash"
chmod +x "${base_dir}/scripts/propose_storage_deal.bash"
chmod +x "${base_dir}/scripts/retrieve_stored_file.bash"
chmod +x "${base_dir}/scripts/start_faucet.bash"

cat > "${base_dir}/scripts/start_bootstrap_daemon.bash" <<EOF
#!/usr/bin/env bash
set -xe
source ${base_dir}/scripts/env-bootstrap.bash

${base_dir}/scripts/create_genesis_block.bash
lotus daemon --lotus-make-genesis=${base_dir}/dev.gen --genesis-template=${base_dir}/localnet.json --bootstrap=false --api=${bootstrap_daemon_port} 2>&1 | tee -a ${base_dir}/daemon.log
EOF

cat > "${base_dir}/scripts/start_networking_and_genesis_daemon.bash" <<EOF
#!/usr/bin/env bash
set -xe
source ${base_dir}/scripts/env-bootstrap.bash
while ! nc -z 127.0.0.1 ${bootstrap_daemon_port} </dev/null; do sleep 5; done
lotus net listen | grep 127 > ${base_dir}/.bootstrap-daemon-multiaddr
EOF

cat > "${base_dir}/scripts/start_bootstrap_miner_daemon.bash" <<EOF
#!/usr/bin/env bash
set -xe
source ${base_dir}/scripts/env-bootstrap.bash
while ! nc -z 127.0.0.1 ${bootstrap_daemon_port} </dev/null; do sleep 5; done
${base_dir}/scripts/create_miner.bash
lotus-miner run --nosync 2>&1 | tee -a ${base_dir}/miner.log
EOF

cat > "${base_dir}/scripts/dump_networking_and_genesis_daemon.bash" <<EOF
#!/usr/bin/env bash
set -xe
source ${base_dir}/scripts/env-bootstrap.bash
while ! nc -z 127.0.0.1 ${bootstrap_miner_port} </dev/null; do sleep 5; done
lotus-miner net listen | grep 127 > ${base_dir}/.bootstrap-miner-multiaddr
EOF

cat > "${base_dir}/scripts/start_bootstrap_faucet.bash" <<EOF
#!/usr/bin/env bash
set -xe
source ${base_dir}/scripts/env-bootstrap.bash
while ! nc -z 127.0.0.1 ${bootstrap_miner_port} </dev/null; do sleep 5; done
${base_dir}/scripts/start_faucet.bash
EOF

cat > "${base_dir}/scripts/start_client_daemon.bash" <<EOF
#!/usr/bin/env bash
set -xe
source ${base_dir}/scripts/env-client.bash
while [ ! -f ${base_dir}/dev.gen ]; do sleep 5; done
lotus daemon --genesis=${base_dir}/dev.gen --bootstrap=false --api=${client_daemon_port} 2>&1 | tee -a ${base_dir}/client.log
EOF

cat > "${base_dir}/scripts/hit_faucet_daemon.bash" <<EOF
#!/usr/bin/env bash
set -xe
source ${base_dir}/scripts/env-client.bash
${base_dir}/scripts/hit_faucet.bash
EOF

rm "${base_dir}/original-data.txt"
cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 900 | head -n 1 > "${base_dir}/original-data.txt"

chmod +x "${base_dir}/scripts/start_bootstrap_daemon.bash"
chmod +x "${base_dir}/scripts/start_networking_and_genesis_daemon.bash"
chmod +x "${base_dir}/scripts/start_bootstrap_miner_daemon.bash"
chmod +x "${base_dir}/scripts/dump_networking_and_genesis_daemon.bash"
chmod +x "${base_dir}/scripts/start_bootstrap_faucet.bash"
chmod +x "${base_dir}/scripts/start_client_daemon.bash"
chmod +x "${base_dir}/scripts/hit_faucet_daemon.bash"



nohup ${base_dir}/scripts/start_bootstrap_daemon.bash &
nohup ${base_dir}/scripts/start_networking_and_genesis_daemon.bash &
nohup ${base_dir}/scripts/start_bootstrap_miner_daemon.bash &
nohup ${base_dir}/scripts/dump_networking_and_genesis_daemon.bash &
nohup ${base_dir}/scripts/start_bootstrap_faucet.bash &
nohup ${base_dir}/scripts/start_client_daemon.bash &
${base_dir}/scripts/hit_faucet_daemon.bash