#!/usr/bin/env bash
set -ex

BOOST_VERSION=1.58.0

sudo apt-get install -y \
    libdouble-conversion1v5 \
    libgflags2v5 \
    libboost-program-options$BOOST_VERSION \
    libboost-filesystem$BOOST_VERSION \
    libboost-system$BOOST_VERSION \
    libboost-regex$BOOST_VERSION \
    libboost-thread$BOOST_VERSION \
    libboost-context$BOOST_VERSION \
    libgoogle-glog0v5 \
    libevent-2.0-5 \
    libjemalloc1

sudo apt-get purge -y gcc g++ ragel autoconf \
    git libtool python-dev libssl-dev libevent-dev \
    binutils-dev make libdouble-conversion-dev libgflags-dev \
    libgoogle-glog-dev libjemalloc-dev

sudo apt-get purge -y 'libboost.*-dev'
sudo apt-get autoremove --purge -y
sudo apt-get autoclean -y
sudo apt-get clean -y


if [[ "x$1" != "x" ]]; then
    PKG_DIR=$1/pkgs
    INSTALL_DIR=$1/install
    strip "$INSTALL_DIR"/bin/mcrouter
    strip "$INSTALL_DIR"/bin/mcpiper
    strip --strip-unneeded "$INSTALL_DIR"/lib/libfolly*.so
    rm -rf "$PKG_DIR"
    rm -rf "$INSTALL_DIR"/lib/*.a
    rm -rf "$INSTALL_DIR"/include
fi