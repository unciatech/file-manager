#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const args = process.argv.slice(2);
const command = args[0];
const projectName = args[1];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

const TEMPLATE = `"use client";

import React, { Suspense } from "react";
import { FileManager, MockProvider } from "@unciatech/file-manager";

export default function FileManagerDemo() {
  const mockProvider = new MockProvider();

  return (
    <div className="h-screen w-full">
      <Suspense fallback={<div className="p-4">Loading Media Library...</div>}>
        <FileManager
          allowedFileTypes={["audios", "videos", "images", "files"]}
          viewMode="grid"
          provider={mockProvider}
        />
      </Suspense>
    </div>
  );
}
`;

async function main() {
  if (command !== 'init') {
    console.log('Usage: npx @unciatech/file-manager init [project-name]');
    process.exit(0);
  }

  // 1. COMPONENT-ONLY MODE
  if (!projectName) {
    console.log('🚀 Generating <FileManagerDemo /> component in the current project...');
    
    let targetDir = process.cwd();
    if (fs.existsSync(path.join(process.cwd(), 'components'))) {
      targetDir = path.join(process.cwd(), 'components');
    } else if (fs.existsSync(path.join(process.cwd(), 'src', 'components'))) {
      targetDir = path.join(process.cwd(), 'src', 'components');
    }

    const targetFile = path.join(targetDir, 'FileManagerDemo.tsx');

    if (fs.existsSync(targetFile)) {
      console.error(`❌ Error: ${targetFile} already exists.`);
      process.exit(1);
    }

    fs.writeFileSync(targetFile, TEMPLATE, 'utf-8');
    console.log(`✅ Success! Created ${targetFile}`);
    console.log('');
    console.log("You can now import and render <FileManagerDemo /> anywhere in your application.");
    console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!");
    process.exit(0);
  }

  // 2. FULL APP SCAFFOLDING MODE
  console.log(`\n🚀 Initializing a new application: ${projectName}\n`);
  console.log('Which framework would you like to use?');
  console.log('  1) Next.js (App Router, Tailwind v4)');
  console.log('  2) Vite (React, Tailwind v4)');
  console.log('  3) Cancel');
  
  const choice = await askQuestion('\nSelect an option (1-3): ');
  
  const targetDir = path.join(process.cwd(), projectName);

  // Pre-flight: abort early if the target directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(`\n❌ Error: Directory "${projectName}" already exists in ${process.cwd()}.`);
    console.error(`   Please choose a different project name or delete the existing directory first.`);
    rl.close();
    process.exit(1);
  }

  try {
    if (choice === '1') {
      await scaffoldNextjs(projectName, targetDir);
    } else if (choice === '2') {
      await scaffoldVite(projectName, targetDir);
    } else {
      console.log('Canceled.');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Scaffolding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// ==========================================
// NEXT.JS SCAFFOLDING
// ==========================================
async function scaffoldNextjs(projectName: string, targetDir: string) {
  console.log('\n📦 Creating Next.js application (this may take a minute)...');
  execSync(`npx create-next-app@latest ${projectName} --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`, { stdio: 'inherit' });

  console.log('\n📦 Installing dependencies (@unciatech/file-manager, tailwindcss-animate)...');
  execSync('npm install @unciatech/file-manager tailwindcss-animate', { cwd: targetDir, stdio: 'inherit' });

  // Add the demo component
  const componentsDir = path.join(targetDir, 'src', 'components');
  if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });
  fs.writeFileSync(path.join(componentsDir, 'FileManagerDemo.tsx'), TEMPLATE, 'utf-8');

  // Replace default Home page
  const pagePath = path.join(targetDir, 'src', 'app', 'page.tsx');
  fs.writeFileSync(pagePath, `import FileManagerDemo from "@/components/FileManagerDemo";\n\nexport default function Home() {\n  return (\n    <main className="min-h-screen bg-neutral-50">\n      <FileManagerDemo />\n    </main>\n  );\n}\n`);

  // Create catch-all route for folder navigation (/media, /media/[folderId])
  const mediaRouteDir = path.join(targetDir, 'src', 'app', 'media', '[[...path]]');
  fs.mkdirSync(mediaRouteDir, { recursive: true });
  fs.writeFileSync(
    path.join(mediaRouteDir, 'page.tsx'),
    `import FileManagerDemo from "@/components/FileManagerDemo";\n\nexport default function MediaPage() {\n  return (\n    <main className="min-h-screen bg-neutral-50">\n      <FileManagerDemo />\n    </main>\n  );\n}\n`
  );

  // Inject package styles import into layout.tsx
  const layoutPath = path.join(targetDir, 'src', 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    if (!layoutContent.includes('@unciatech/file-manager/styles')) {
      layoutContent = layoutContent.replace(
        /^(import type)/m,
        `import '@unciatech/file-manager/styles';\n$1`
      );
      fs.writeFileSync(layoutPath, layoutContent);
    }
  }

  // Replace consumer globals.css with the package's full Tailwind v4 setup
  const cssPath = path.join(targetDir, 'src', 'app', 'globals.css');
  fs.writeFileSync(cssPath, `@import 'tailwindcss';
@import 'tw-animate-css';
@source "../../node_modules/@unciatech/file-manager/dist";

/** Dark Mode Variant **/
@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: 'Geist', 'Geist Fallback', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

/** Colors **/
:root {
  --background: var(--color-white);
  --foreground: var(--color-zinc-950);
  --card: var(--color-white);
  --card-foreground: var(--color-zinc-950);
  --popover: var(--color-white);
  --popover-foreground: var(--color-zinc-950);
  --primary: var(--color-blue-500);
  --primary-foreground: var(--color-white);
  --secondary: var(--color-zinc-100);
  --secondary-foreground: var(--color-zinc-900);
  --muted: var(--color-zinc-100);
  --muted-foreground: var(--color-zinc-500);
  --accent: var(--color-zinc-100);
  --accent-foreground: var(--color-zinc-900);
  --destructive: var(--color-red-600);
  --destructive-foreground: var(--color-white);
  --border: oklch(94% 0.004 286.32);
  --input: var(--color-zinc-200);
  --ring: var(--color-zinc-400);
  --radius: 0.5rem;
}

.dark {
  --background: var(--color-zinc-950);
  --foreground: var(--color-zinc-50);
  --card: var(--color-zinc-950);
  --card-foreground: var(--color-zinc-50);
  --popover: var(--color-zinc-950);
  --popover-foreground: var(--color-zinc-50);
  --primary: var(--color-blue-600);
  --primary-foreground: var(--color-white);
  --secondary: var(--color-zinc-800);
  --secondary-foreground: var(--color-zinc-50);
  --muted: var(--color-zinc-900);
  --muted-foreground: var(--color-zinc-500);
  --accent: var(--color-zinc-900);
  --accent-foreground: var(--color-zinc-50);
  --destructive: var(--color-red-600);
  --destructive-foreground: var(--color-white);
  --border: var(--color-zinc-800);
  --input: var(--color-zinc-800);
  --ring: var(--color-zinc-600);
}

/** Theme Setup **/
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

/** Global Styles **/
@layer base {
  * {
    @apply border-border;
  }
  *:focus-visible {
    @apply outline-ring rounded-xs shadow-none outline-2 outline-offset-3 transition-none!;
  }
}

/** Custom Scrollbar **/
@layer base {
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--input); border-radius: 5px; }
  * { scrollbar-width: thin; scrollbar-color: var(--input) transparent; }
}

/** Smooth scroll **/
html {
  scroll-behavior: smooth;
}
`);


  printSuccess(projectName);
}

// ==========================================
// VITE (REACT) SCAFFOLDING
// ==========================================
async function scaffoldVite(projectName: string, targetDir: string) {
  console.log('\n📦 Creating Vite React application...');
  execSync(`npm create vite@latest ${projectName} -- --template react-ts`, { stdio: 'inherit' });

  console.log('\n📦 Installing dependencies (Tailwind + File Manager)...');
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  execSync('npm install tailwindcss @tailwindcss/vite @unciatech/file-manager', { cwd: targetDir, stdio: 'inherit' });

  // Setup vite.config.ts for tailwind
  const viteConfigPath = path.join(targetDir, 'vite.config.ts');
  const viteConfig = `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'\n\nexport default defineConfig({\n  plugins: [\n    react(),\n    tailwindcss(),\n  ],\n})\n`;
  fs.writeFileSync(viteConfigPath, viteConfig);

  // Setup index.css
  const cssPath = path.join(targetDir, 'src', 'index.css');
  fs.writeFileSync(cssPath, `@import "tailwindcss";\n@source "../../node_modules/@unciatech/file-manager/dist";\n`);

  // Add demo component
  const componentsDir = path.join(targetDir, 'src', 'components');
  if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });
  fs.writeFileSync(path.join(componentsDir, 'FileManagerDemo.tsx'), TEMPLATE, 'utf-8');

  // Overwrite App.tsx
  const appPath = path.join(targetDir, 'src', 'App.tsx');
  fs.writeFileSync(appPath, `import FileManagerDemo from "./components/FileManagerDemo";\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-neutral-50">\n      <FileManagerDemo />\n    </div>\n  );\n}\n\nexport default App;\n`);

  printSuccess(projectName, 'npm run dev');
}

function printSuccess(projectName: string, devCmd = 'npm run dev') {
  console.log('\n=========================================');
  console.log('🎉 Your Media Library application is ready!');
  console.log('=========================================');
  console.log('\nNext steps:');
  console.log(`  cd ${projectName}`);
  console.log(`  ${devCmd}`);
  console.log('\nEnjoy building! 🗂️\n');
}

main();
