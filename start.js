#!/usr/bin/env node

const dns = require('dns').promises;
const fs = require('fs');
const { spawn } = require('child_process');

const configured_pools = Object.keys(process.env).filter(p => p.startsWith('MCROUTER_POOL_'));
const config_file = process.env.MCROUTER_CONFIG_FILE;
const updateWaitTime = 60000;

let mcrouter;

async function getConfig() {

  const config = { pools: {} };

  if (!configured_pools.length) {
    console.error('EEROR: No pools configured in ENV');
    process.exit(1);
  }

  for (const p of configured_pools) {
    const pool_name = p.replace('MCROUTER_POOL_', '');
    const dnsrr_host = process.env[p];
    const records = await dns.lookup(dnsrr_host, { all: true });
    const servers = records.map(r => r.address);
    config.pools[pool_name] = { servers };
  }
  return config;
}

(async function main() {
  console.log('Polling DNS for changes');
  const config = await getConfig();
  const configJson = JSON.stringify(config, null, 2);
  await fs.writeFileSync(config_file, configJson);

  if (!mcrouter) {
    mcrouter = spawn( '/usr/local/bin/mcrouter', process.argv.slice(1,process.argv.length) );
    mcrouter.on('exit', code => {
      process.exit(code);
    });
  }

  setTimeout(main, updateWaitTime);
})();