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
  treeshake: {
    preset: 'safest',
    moduleSideEffects: false,
  },
  sourcemap: false,
  clean: true,
  // Treat all dependencies and peerDependencies as external
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
    mangle: true,
  },
  esbuildOptions(options) {
    options.drop = ['debugger'];
    options.pure = ['console.log', 'console.info', 'console.debug'];
    options.treeShaking = true;
  },
  tsconfig: 'tsconfig.build.json',
});
