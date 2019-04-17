#!/usr/bin/env node

const { lookup } = require('dns').promises;
const { writeFile, readFile } = require('fs');
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

async function readFileAsync(...args) {
  return new Promise((resolve, reject) => {
    readFile(...args, (err, data) => err ? reject(err) : resolve(data))
  });
}

async function main() {

  const previousConfigJson = await readFileAsync(configFile, 'utf8');

  try {
    let pools = {};
    for (const poolName of configuredPools) {
      const host = process.env[`MCROUTER_POOL_${poolName}`];
      const records = await lookup(host, { all: true });
      const port = process.env[`MCROUTER_PORT_${poolName}`] || '11211';
      console.log(`Found ${records.length} records for ${host}`)
      if (records.length) {
        pools[poolName] = { servers: records.map(r => `${r.address}:${port}`) };
      }
    }

    const configJson = JSON.stringify({ pools, route: process.env.MCROUTER_ROUTE });
    if (configJson !== previousConfigJson) {
      await writeFileAsync(configFile, configJson);
    }

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