#!/usr/bin/env node

const dns = require('dns').promises;
const fs = require('fs');
const { exec } = require('child_process');

const configured_pools = Object.keys(process.env).filter(p => p.startsWith('MCROUTER_POOL_'));
const config_file = process.env.MCROUTER_CONFIG_FILE;
const updateWaitTime = 60000;

let mcrouter;

async function getPools() {

  const pools = {};

  if (!configured_pools.length) {
    console.error('EEROR: No pools configured in ENV');
    process.exit(1);
  }

  for (const p of configured_pools) {
    const pool_name = p.replace('MCROUTER_POOL_', '');
    const dnsrr_host = process.env[p];
    const records = await dns.lookup(dnsrr_host, { all: true });
    const port = process.env[`MCROUTER_PORT_${pool_name}`] || '11211';
    const servers = records.map(r => `${r.address}:${port}`);
    pools[pool_name] = { servers };
  }
  return pools;
}

async function main() {
  try {
    const pools = await getPools();
    const config = {
      pools,
      route: process.env.MCROUTER_ROUTE
    }
    const configJson = JSON.stringify(config, null, 2);
    await fs.writeFileSync(config_file, configJson);

  } catch (err) {
    console.log(err);
  }

  if (!mcrouter) {
    console.log('Spawning mcrouter service');
    //mcrouter = spawn( '/usr/bin/mcrouter', process.argv.slice(1,process.argv.length) );

    mcrouter = exec('/usr/bin/mcrouter -p 11211 --config-file $MCROUTER_CONFIG_FILE');

    mcrouter.stderr.on('data', data => console.log(data));
    
    mcrouter.on('exit', code => {
      console.log("MCRouter exited - script will terminate");
      process.exit(code);
    });

    
  }

  setTimeout(main, updateWaitTime);
}

main();