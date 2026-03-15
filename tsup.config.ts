import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  entry: {
    index: "index.ts",
    cli: "cli.ts",
    mock: "providers/mock-provider.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  minify: true,
  treeshake: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  tsconfig: "tsconfig.build.json",
});