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

const getTemplate = (basePath = "/media") => `"use client";

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
          basePath="${basePath}"
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

    fs.writeFileSync(targetFile, getTemplate("/"), 'utf-8');
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

  // --- Home page: redirect to /media ---
  const pagePath = path.join(targetDir, 'src', 'app', 'page.tsx');
  fs.writeFileSync(pagePath, `"use client";

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/media");
}
`);

  // --- Full-page FileManager at /media/[[...path]] ---
  const mediaRouteDir = path.join(targetDir, 'src', 'app', 'media', '[[...path]]');
  fs.mkdirSync(mediaRouteDir, { recursive: true });
  fs.writeFileSync(
    path.join(mediaRouteDir, 'page.tsx'),
    `"use client";

import { Suspense, useState } from "react";
import { FileManager, MockProvider } from "@unciatech/file-manager";
import Link from "next/link";

function MediaPageContent() {
  const [provider] = useState(() => new MockProvider());

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex gap-4 p-4 border-b border-border items-center justify-between">
        <h1 className="text-xl font-bold">Full Page View</h1>
        <Link
          href="/modal-demo"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm font-medium"
        >
          Go to Modal Demo
        </Link>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <FileManager
          allowedFileTypes={["audios", "videos", "images", "files"]}
          viewMode="grid"
          provider={provider}
          basePath="/media"
        />
      </div>
    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading Media Library...</div>}>
      <MediaPageContent />
    </Suspense>
  );
}
`
  );

  // --- Modal demo page at /modal-demo ---
  const modalDemoDir = path.join(targetDir, 'src', 'app', 'modal-demo');
  fs.mkdirSync(modalDemoDir, { recursive: true });
  fs.writeFileSync(
    path.join(modalDemoDir, 'page.tsx'),
    `"use client";

import { Suspense, useState } from "react";
import { FileManagerModal, MockProvider } from "@unciatech/file-manager";
import type { FileMetaData } from "@unciatech/file-manager";
import Link from "next/link";

function ModalDemoContent() {
  const [provider] = useState(() => new MockProvider());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileMetaData[]>([]);

  return (
    <div className="p-10 flex flex-col items-start gap-6 min-h-screen w-full">
      <div>
        <h1 className="text-3xl font-bold mb-2">File Manager Demo</h1>
        <p className="text-gray-500">Select files using the modal or browse the full page view.</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm font-medium shadow-sm transition-colors"
        >
          Open File Picker Modal
        </button>
        <Link
          href="/media"
          className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer text-sm font-medium transition-colors"
        >
          Go to Full Page View
        </Link>
      </div>

      {selectedFiles.length > 0 && (
        <div className="w-full mt-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Selected Files ({selectedFiles.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="border rounded-lg p-3 flex flex-col items-center gap-3 shadow-sm">
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex items-center justify-center relative">
                  {file.url && file.mime?.startsWith("image/") ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 font-mono text-xs p-2 overflow-hidden text-ellipsis">
                      {file.ext?.toUpperCase() || "FILE"}
                    </span>
                  )}
                </div>
                <div className="w-full text-center">
                  <p className="text-sm font-medium truncate w-full" title={file.name}>{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FileManagerModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        provider={provider}
        allowedFileTypes={["images", "videos", "audios", "files"]}
        onFilesSelected={(files: FileMetaData[]) => {
          setSelectedFiles(files);
          setIsOpen(false);
        }}
        basePath="/media"
      />
    </div>
  );
}

export default function ModalDemoPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <ModalDemoContent />
    </Suspense>
  );
}
`
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
  fs.writeFileSync(cssPath, `@import "tailwindcss";
@import "@unciatech/file-manager/styles";
@import "tw-animate-css";

@source "../../node_modules/@unciatech/file-manager";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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

  console.log('\n📦 Installing dependencies (Tailwind + File Manager + React Router)...');
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  execSync('npm install tailwindcss @tailwindcss/vite @unciatech/file-manager react-router-dom', { cwd: targetDir, stdio: 'inherit' });

  // Setup vite.config.ts for tailwind
  const viteConfigPath = path.join(targetDir, 'vite.config.ts');
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`;
  fs.writeFileSync(viteConfigPath, viteConfig);

  // Setup index.css
  const cssPath = path.join(targetDir, 'src', 'index.css');
  fs.writeFileSync(cssPath, `@import "tailwindcss";
@import "@unciatech/file-manager/styles";
@source "../node_modules/@unciatech/file-manager";
`);

  // Overwrite main.tsx with BrowserRouter
  const mainPath = path.join(targetDir, 'src', 'main.tsx');
  fs.writeFileSync(mainPath, `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
`);

  // Overwrite App.tsx with page + modal routes
  const appPath = path.join(targetDir, 'src', 'App.tsx');
  fs.writeFileSync(appPath, `import { useState } from 'react'
import { useNavigate, Routes, Route, Link } from 'react-router-dom'
import { FileManager, FileManagerModal, MockProvider } from '@unciatech/file-manager'
import type { FileMetaData } from '@unciatech/file-manager'

const provider = new MockProvider()

function FullPage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex gap-4 p-4 border-b border-border items-center justify-between">
        <h1 className="text-xl font-bold">Full Page View</h1>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm font-medium"
        >
          Back to Modal Demo
        </Link>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <FileManager
          provider={provider}
          basePath="full"
          allowedFileTypes={["images", "videos", "audios", "files"]}
          viewMode="grid"
          onNavigate={(url, opts) => navigate(url, { replace: opts?.replace })}
        />
      </div>
    </div>
  )
}

function ModalDemo() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileMetaData[]>([])

  return (
    <div className="p-10 flex flex-col items-start gap-6 min-h-screen w-full bg-background text-foreground">
      <div>
        <h1 className="text-3xl font-bold mb-2">File Manager Demo</h1>
        <p className="text-muted-foreground">Select files using the modal or browse the full page view.</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm font-medium shadow-sm transition-colors"
        >
          Open File Picker Modal
        </button>
        <Link
          to="/full"
          className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer text-sm font-medium transition-colors"
        >
          Go to Full Page View
        </Link>
      </div>

      {selectedFiles.length > 0 && (
        <div className="w-full mt-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Selected Files ({selectedFiles.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="border border-border rounded-lg p-3 flex flex-col items-center gap-3 bg-card shadow-sm">
                <div className="w-full aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                  {file.url && file.mime?.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground font-mono text-xs p-2 overflow-hidden text-ellipsis">{file.ext?.toUpperCase() || 'FILE'}</span>
                  )}
                </div>
                <div className="w-full text-center">
                  <p className="text-sm font-medium truncate w-full" title={file.name}>{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FileManagerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={provider}
        basePath="/"
        allowedFileTypes={["images", "videos", "audios", "files"]}
        onFilesSelected={(files: FileMetaData[]) => {
          setSelectedFiles(files)
        }}
        onNavigate={(url, opts) => navigate(url, { replace: opts?.replace })}
      />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ModalDemo />} />
      <Route path="/full/*" element={<FullPage />} />
    </Routes>
  )
}

export default App
`);

  // Clean up default files that are no longer needed
  const appCssPath = path.join(targetDir, 'src', 'App.css');
  if (fs.existsSync(appCssPath)) fs.unlinkSync(appCssPath);

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
