import { build as _build } from 'esbuild';

import { nodeExternalsPlugin } from 'esbuild-node-externals';
const isWatchBuild = process.argv.indexOf('--watch') >= 0;

const makeAllPackagesExternalPlugin = {
  name: 'make-all-packages-external',
  setup(build) {
    let filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/ // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, args => ({ path: args.path, external: true }))
  },
}

_build({
  logLevel: "info",
  entryPoints: ['./src/index.ts'],
  outfile: 'dist/index.mjs',
  bundle: true,
  format:'esm',
  //minify: !isWatchBuild,
  platform: 'node',
  sourcemap: true,
  target: 'node14',
  watch: isWatchBuild,
  plugins: [makeAllPackagesExternalPlugin,nodeExternalsPlugin()],

}).catch(() => process.exit(1))
