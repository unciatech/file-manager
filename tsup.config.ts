import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'cli.ts'],
  format: ['cjs', 'esm'], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: false, // Disabled to significantly reduce package size
  clean: true,
  external: ['react', 'react-dom', 'next', 'lucide-react'], // Don't bundle these
  minify: true,
  tsconfig: 'tsconfig.build.json',
});
