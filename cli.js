#!/usr/bin/env node

const { Command } = require('commander');
const packageJson = require('./package.json');

const program = new Command();

program
  .name('seekreap-tier0')
  .description('SeekReap Tier 0 - Immutable declarative foundation for deterministic verification systems')
  .version(`seekreap/${packageJson.version} (Tier 0 (OSS Pilot))\nStatus: FROZEN\nBuild: source\nDeterministic: declared`, '-V, --version', 'Output version information')
  .helpOption('-h, --help', 'Display help information');

// Handle no arguments
if (process.argv.length === 2) {
  console.log(`seekreap/${packageJson.version} (Tier 0 (OSS Pilot))`);
  console.log(`Status: FROZEN`);
  console.log(`Build: source`);
  console.log(`Deterministic: declared`);
  process.exit(0);
}

program.parse(process.argv);
