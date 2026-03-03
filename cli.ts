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

  // Append Tailwind source rule to globals.css (Tailwind v4 Next.js default)
  const cssPath = path.join(targetDir, 'src', 'app', 'globals.css');
  if (fs.existsSync(cssPath)) {
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    if (!cssContent.includes('@source')) {
      cssContent = `@import "tailwindcss";\n@plugin "tailwindcss-animate";\n@source "../../node_modules/@unciatech/file-manager/dist";\n\n` + cssContent.replace('@import "tailwindcss";', '');
      fs.writeFileSync(cssPath, cssContent);
    }
  }

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
  console.log('\\n=========================================');
  console.log('🎉 Your Media Library application is ready!');
  console.log('=========================================');
  console.log('\\nNext steps:');
  console.log(`  cd ${projectName}`);
  console.log(`  ${devCmd}`);
  console.log('\\nEnjoy building! 🗂️\\n');
}

main();
