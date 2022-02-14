#!/usr/bin/env node
import { Command } from 'commander';
import { promises as fsPromises } from 'fs';
import yaml from "js-yaml";

const pkg = JSON.parse((await fsPromises.readFile(new URL('../package.json', import.meta.url))).toString());
const program = new Command();

program
  .version(pkg.version)
  .usage('[options]')
  .option('-d, --dryrun', 'Enable dryrun (simulate pushes and pulls). Flag.')
  .option('-h, --host <s>', 'Docker host. Default: $DOCKER_HOST or unix:///var/run/docker.sock')
  .option('-b --bail', 'Exit process on first error. Flag.')
  .option('-i --private', 'Only sync images with internal registries. Flag.')
  .option('-p --public', 'Only sync images with the public registry. Flag.')
  .option('-f --filter <s>', '')
  .option('--config <s>', '');

program.parse(process.argv);

try {
  let RegistrySync = await import('../dist/index.mjs');
  RegistrySync = RegistrySync.RegistrySync;
  const doc = yaml.load(await fsPromises.readFile(program.config), 'utf8');
  const registrySync = new RegistrySync(Object.assign(program, doc));
  await registrySync.start();
  console.log('finished');
} catch (err) {
  console.error(err)
}