#!/usr/bin/env bash

# USAGE:
#
# Option 1: Build and run tests using specific lotus Git SHA:
#
# > ./test-storage-and-retrieval-local-dev-net.sh --lotus-git-sha=492ffac913287c732cc5d54d0deddc44e41b642f
#
# Option 2: Build and run using binaries you've built previously (much faster)
#
# > cd $LOTUS_CHECKOUT_DIR && make clean deps debug lotus-shed fountain
# > ./test-storage-and-retrieval-local-dev-net.sh --copy-binaries-from-dir=$LOTUS_CHECKOUT_DIR
#

set -Exo pipefail

base_dir="/localnet.test"
build_log_path=$(mktemp)
deps=(printf paste jq python nc)
#lotus_git_sha="492ffac913287c732cc5d54d0deddc44e41b642f" #initial commit
#lotus_git_sha="edcf899be1deb710811f8f9161fe82ef8cd4be91" #master branch top 19 jun
#lotus_git_sha="bead3bf412954c02ac82e5367e6e9c498a8a897b" #interop branch top19 jun
#lotus_git_sha="e5fdae45b78ac6dd6533b26a23ac263284831cbf" #master top 3 jul
#lotus_git_sha="3f017688c7ae180d12d4ee28f732298299ee351f" #master top 13 jul
#lotus_git_sha="b84030b3bdf19b953cbf330710453d20f3f3abfd" #calibration 20 jul
#lotus_git_sha="009e14b679edf5f5d66481b0802427063ea47ee2" #calibration 18 aug
#lotus_git_sha="4f45c623a5896637a9239d16b1836fdb635bb8f9" #master top 31 aug
#lotus_git_sha="636810daa5e63a6ec132d78993d028a41f179276" #v0.8.1
lotus_git_sha="a6b2180756db71574b385ef3c357f2b943252e78" #v0.10.0

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


# create some directories which we'll need later
#
rm -r "${base_dir}"

mkdir -p "${base_dir}"
mkdir -p "${base_dir}/scripts"
mkdir -p "${base_dir}/bin"
mkdir -p "${base_dir}/version"

cat > "${base_dir}/version/build_commit.txt" <<EOF
${lotus_git_sha}
EOF

cat > "${base_dir}/scripts/build.bash" <<EOF
#!/usr/bin/env bash
set -xe

if [[ ! -z "${copy_binaries_from_dir}" ]]; then
    pushd ${copy_binaries_from_dir}
    cp lotus lotus-miner lotus-shed lotus-seed lotus-fountain ${base_dir}/bin/
    popd
fi

if [[ ! -z "${lotus_git_sha}" ]]; then
    git clone https://github.com/filecoin-project/lotus.git "${base_dir}/build"
    pushd "${base_dir}/build" && git reset --hard "${lotus_git_sha}" && popd

    SCRIPTDIR="\$( cd "\$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
    pushd \$SCRIPTDIR/../build
    pwd
    make clean deps debug lotus-shed lotus-fountain
    cp lotus lotus-miner lotus-shed lotus-seed lotus-fountain ${base_dir}/bin/
    popd
fi
EOF

chmod +x "${base_dir}/scripts/build.bash"

# build various lotus binaries
#
bash "${base_dir}/scripts/build.bash" 2>&1 | tee -a "${build_log_path}"

if [ $? -eq 0 ]
then
  echo "built successfully"
else
  echo "failed to build: check ${build_log_path} for more details" >&2
  exit 1
fi

