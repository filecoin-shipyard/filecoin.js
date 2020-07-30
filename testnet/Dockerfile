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

RUN mkdir lotus

WORKDIR /lotus
#RUN git clone https://gist.github.com/fd93f162b78e551e22aec3178bbf33b6.git

#RUN mv fd93f162b78e551e22aec3178bbf33b6/test-storage-and-retrieval-local-dev-net.sh ./test-storage-and-retrieval-local-dev-net.sh && rm -r fd93f162b78e551e22aec3178bbf33b6
#RUN chmod 700 ./test-storage-and-retrieval-local-dev-net.sh
#RUN ./test-storage-and-retrieval-local-dev-net.sh --lotus-git-sha=492ffac913287c732cc5d54d0deddc44e41b642f

#COPY ./start_testnet.sh ./
#COPY ./test-storage-and-retrieval-local-dev-net-infra.sh ./
#RUN chmod 700 ./test-storage-and-retrieval-local-dev-net-infra.sh
#RUN chmod 700 ./start_testnet.sh
#RUN ./test-storage-and-retrieval-local-dev-net-infra.sh
