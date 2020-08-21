FROM ubuntu:20.10

#RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt update
RUN apt-get install -y software-properties-common
RUN apt install -y --no-install-recommends build-essential git jq python netcat curl wget pkg-config libgl-dev libglu-dev libglib2.0-dev libsm-dev libxrender-dev libfontconfig1-dev libxext-dev nvidia-opencl-dev ocl-icd-opencl-dev tmux
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

#install node
ENV NVM_DIR="/usr/local"
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

RUN . "$NVM_DIR/nvm.sh" && nvm install v14.7.0
ENV PATH="/usr/local/versions/node/v14.7.0/bin:${PATH}"

#install go
RUN wget  https://dl.google.com/go/go1.14.3.linux-amd64.tar.gz
RUN tar -xvf go1.14.3.linux-amd64.tar.gz
RUN mv go /usr/local
ENV PATH="/usr/local/go/bin:${PATH}"

RUN mkdir /credentials

WORKDIR /testnet

COPY ./bin/start_testnet.sh ./
COPY ./bin/build_lotus.sh ./
COPY ./bin/init_testnet.sh ./
COPY ./bin/set_env.sh ./
COPY ./bin/entrypoint.sh ./

COPY ./proxy ./proxy
RUN chmod +x ./build_lotus.sh
RUN chmod +x ./init_testnet.sh

RUN ./build_lotus.sh
RUN ./init_testnet.sh