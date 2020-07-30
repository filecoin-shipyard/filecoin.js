##Local testing env

1. docker-compose up

Wait a while, and everything should be up and running.

After everything is set up you should have in the testnet folder a .env file that contains **LOTUS_AUTH_TOKEN** and **LOTUS_URL**.

**LOTUS_URL** url is relevant if you want to connect to the lotus api from inside the container that runs the network. If you want to connect to the lotus api from outside the container you should use `localhost:8000/rpc/v0`
