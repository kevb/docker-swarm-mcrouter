# Taken from https://github.com/Dev25/mcrouter-docker
FROM    ubuntu:16.04

ENV     MCROUTER_DIR            /usr/local/mcrouter
ENV     MCROUTER_REPO           https://github.com/facebook/mcrouter.git
ENV     MCROUTER_TAG            release-37-0
ENV     DEBIAN_FRONTEND         noninteractive
ENV     MAKE_ARGS               -j8
ENV     MCROUTER_CONFIG_FILE    /usr/local/etc/mcrouter/mcrouter.conf

ADD     clean_ubuntu_16.04.sh /tmp
ADD     package.json $MCROUTER_DIR/swarm/package.json

RUN     apt-get update && apt-get install -y --no-install-recommends ca-certificates git curl sudo && \
        mkdir -p $MCROUTER_DIR/repo && \
        cd $MCROUTER_DIR/swarm && \
        curl https://deb.nodesource.com/setup_11.x | bash -C && \
        apt-get install -y nodejs && \
        mkdir -p $(dirname "${MCROUTER_CONFIG_FILE}") && \
        touch $MCROUTER_CONFIG_FILE && \
        npm install --production && \
        mkdir /var/spool/mcrouter && \
        cd $MCROUTER_DIR/repo && git clone $MCROUTER_REPO && \
        cd $MCROUTER_DIR/repo/mcrouter  && git checkout $MCROUTER_TAG && \
        cd $MCROUTER_DIR/repo/mcrouter/mcrouter/scripts && \
        ./install_ubuntu_16.04.sh $MCROUTER_DIR $MAKE_ARGS && \
        /tmp/clean_ubuntu_16.04.sh $MCROUTER_DIR && rm -rf $MCROUTER_DIR/repo && \
        apt-get clean &&  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
        apt-get remove curl && \
        ln -s $MCROUTER_DIR/install/bin/mcrouter /usr/local/bin/mcrouter

ADD     start.js $MCROUTER_DIR/swarm/start.js

ENV     DEBIAN_FRONTEND newt

CMD     ["$MCROUTER_DIR/swarm/start.js", "--config-file", "$MCROUTER_CONFIG_FILE"]