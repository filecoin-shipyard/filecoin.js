#!/usr/bin/env bash
set -Exo pipefail

build_dir="/localnet.test"
base_dir="/filecoin_miner"

deps=(printf paste jq python nc)

# ensure that script dependencies are met
#
for dep in ${deps[@]}; do
    if ! which "${dep}"; then
        (>&2 echo "please install ${dep} before running this script")
        exit 1
    fi
done

rm -r "${base_dir}"
cp -r "${build_dir}" "${base_dir}"

cat > "${base_dir}/scripts/env-bootstrap.bash" <<EOF
export RUST_LOG=info
export PATH=${base_dir}/bin:\$PATH
export LOTUS_PATH=${base_dir}/.bootstrap-lotus
export LOTUS_STORAGE_PATH=${base_dir}/.bootstrap-lotusstorage
export LOTUS_GENESIS_SECTORS=${base_dir}/.genesis-sectors
EOF

cat > "${base_dir}/scripts/env-client.bash" <<EOF
export RUST_LOG=info
export PATH=${base_dir}/bin:\$PATH
export LOTUS_PATH=${base_dir}/.client-lotus
export LOTUS_STORAGE_PATH=${base_dir}/.client-lotusstorage
EOF

source "${base_dir}/scripts/env-bootstrap.bash"
lotus fetch-params 2048