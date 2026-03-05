import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig({
  entry: {
    index: 'index.ts',
    cli: 'cli.ts',
    mock: 'providers/mock-provider.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  treeshake: true,
  sourcemap: false,
  clean: true,
  // Treat all dependencies and peerDependencies as external
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  minify: true,
  tsconfig: 'tsconfig.build.json',
});
