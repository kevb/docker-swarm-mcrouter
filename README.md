# Docker Swarm MCRouter

This is a (proof of concept) Docker image for https://github.com/facebook/mcrouter which tries to automatically discover memcached servers using DNS on Docker Swarm.

Scaling up or down memcached replicas will cause mcrouter to be re-configured automatically.

Things not done yet: proper configuration (routes etc) beyond the server pools.

## Docker image

https://hub.docker.com/r/kevbuk/mcrouter-swarm

## Envs for configuration 

`MCROUTER_POOL_[name]=tasks.memcached` - Create a pool called [name]. The value is a DNS address which resolves the memcached servers to use for that pool. On Docker Swarm this can be `tasks.[service-name]`.

`MCROUTER_PORT_[name]=11211` - The port to use for servers in pool [name]. They must all use the same port.

`MCROUTER_ROUTE=PoolRoute|[name]` - A route (string). In the future there should be a way to configure complex routes.

`MCROUTER_PORT` - The port to expose mcrouter server on

## Quickstart

`docker stack deploy -c docker-compose.yml demo`

Watch the logs for `reconfigured 1 proxies with 2 pools`

Try scaling:

`docker service scale demo_memcached=3`

You should see the logs say `reconfigured 1 proxies with 3 pools`

The init script has updated the mcrouter config file and mcrouter has updated without restarting!