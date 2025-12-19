import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
  onSuccess: async () => {
    // Copy CSS file to dist
    copyFileSync('src/styles.css', 'dist/styles.css');
    console.log('✓ Copied styles.css to dist/');
  },
});
