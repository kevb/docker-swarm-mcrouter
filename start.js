#!/usr/bin/env node

const { lookup } = require('dns').promises;
const { writeFile } = require('fs');
const { spawn } = require('child_process');

const configuredPools = Object.keys(process.env)
  .filter(p => p.startsWith('MCROUTER_POOL_'))
  .map(p => p.replace('MCROUTER_POOL_', ''));

if (!configuredPools.length) {
  console.error('ERROR: No pools configured in ENV');
  process.exit(1);
}

const configFile = process.env.MCROUTER_CONFIG_FILE;
const updateWaitTime = 30 * 1000;

let mcrouter;

async function writeFileAsync(...args) {
  return new Promise((resolve, reject) => {
    writeFile(...args, err => err ? reject(err) : resolve())
  });
}

async function main() {

  try {
    let pools = {};
    for (const poolName of configuredPools) {
      const records = await lookup(process.env[`MCROUTER_POOL_${poolName}`], { all: true });
      const port = process.env[`MCROUTER_PORT_${poolName}`] || '11211';
      if (records.length) {
        pools[poolName] = { servers: records.map(r => `${r.address}:${port}`) };
      }
    }

    const configJson = JSON.stringify({ pools, route: process.env.MCROUTER_ROUTE });
    await writeFileAsync(configFile, configJson);

  } catch (err) {
    console.error(err);
  }

  if (!mcrouter) {

    mcrouter = spawn('/usr/bin/mcrouter -p $MCROUTER_PORT --config-file $MCROUTER_CONFIG_FILE', {
      stdio: 'inherit',
      shell: true
    });

    mcrouter.on('exit', code => process.exit(code));
    
  }

  setTimeout(main, updateWaitTime);
}

main();