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
  splitting: false,
  sourcemap: false,
  clean: true,
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  tsconfig: "tsconfig.build.json",
});