# Taken from https://github.com/Dev25/mcrouter-docker
FROM    ubuntu:18.04

ENV     MCROUTER_SWARM_DIR            /usr/local/mcrouter_swarm
ENV     MCROUTER_CONFIG_FILE    /etc/mcrouter/mcrouter.conf

ADD     package.json $MCROUTER_SWARM_DIR/package.json

RUN     apt-get update && apt-get install -y wget curl && \
        cd /tmp && \
        wget https://github.com/facebook/mcrouter/raw/gh-pages/debrepo/bionic/pool/contrib/m/mcrouter/mcrouter_0.40.0-1_amd64.deb && \
        apt install -y ./mcrouter_0.40.0-1_amd64.deb && \
        curl https://deb.nodesource.com/setup_11.x | bash -C && \
        apt-get update && apt-get install -y --no-install-recommends nodejs ca-certificates && \
        mkdir -p $(dirname "${MCROUTER_CONFIG_FILE}") && \
        touch $MCROUTER_CONFIG_FILE && \
        cd $MCROUTER_SWARM_DIR && npm install --production && \
        apt-get remove -y wget curl && \
        apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD     start.js $MCROUTER_SWARM_DIR/start.js

CMD     $MCROUTER_SWARM_DIR/start.js