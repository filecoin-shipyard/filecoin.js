##Local testing env

1. docker-compose up
2. docker exec -it filecoin_js_infra /bin/bash

Inside the container:
1. ./lotus/build_lotus.sh
2. ./lotus/start_testnet.sh
3. source /filecoin_miner/scripts/env-client.bash
4. . /lotus/set_env.sh

5. cd /src
6. npm install
7. npm run test

8. enjoy ?