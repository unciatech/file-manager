#!/usr/bin/env node

// cli.ts
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";
var args = process.argv.slice(2);
var command = args[0];
var projectName = args[1];
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};
var TEMPLATE = `"use client";

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
  if (command !== "init") {
    console.log("Usage: npx @unciatech/file-manager init [project-name]");
    process.exit(0);
  }
  if (!projectName) {
    console.log("\u{1F680} Generating <FileManagerDemo /> component in the current project...");
    let targetDir2 = process.cwd();
    if (fs.existsSync(path.join(process.cwd(), "components"))) {
      targetDir2 = path.join(process.cwd(), "components");
    } else if (fs.existsSync(path.join(process.cwd(), "src", "components"))) {
      targetDir2 = path.join(process.cwd(), "src", "components");
    }
    const targetFile = path.join(targetDir2, "FileManagerDemo.tsx");
    if (fs.existsSync(targetFile)) {
      console.error(`\u274C Error: ${targetFile} already exists.`);
      process.exit(1);
    }
    fs.writeFileSync(targetFile, TEMPLATE, "utf-8");
    console.log(`\u2705 Success! Created ${targetFile}`);
    console.log("");
    console.log("You can now import and render <FileManagerDemo /> anywhere in your application.");
    console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!");
    process.exit(0);
  }
  console.log(`
\u{1F680} Initializing a new application: ${projectName}
`);
  console.log("Which framework would you like to use?");
  console.log("  1) Next.js (App Router, Tailwind v4)");
  console.log("  2) Vite (React, Tailwind v4)");
  console.log("  3) Cancel");
  const choice = await askQuestion("\nSelect an option (1-3): ");
  const targetDir = path.join(process.cwd(), projectName);
  if (fs.existsSync(targetDir)) {
    console.error(`
\u274C Error: Directory "${projectName}" already exists in ${process.cwd()}.`);
    console.error(`   Please choose a different project name or delete the existing directory first.`);
    rl.close();
    process.exit(1);
  }
  try {
    if (choice === "1") {
      await scaffoldNextjs(projectName, targetDir);
    } else if (choice === "2") {
      await scaffoldVite(projectName, targetDir);
    } else {
      console.log("Canceled.");
      process.exit(0);
    }
  } catch (error) {
    console.error("\n\u274C Scaffolding failed:", error);
    process.exit(1);
  }
  process.exit(0);
}
async function scaffoldNextjs(projectName2, targetDir) {
  console.log("\n\u{1F4E6} Creating Next.js application (this may take a minute)...");
  execSync(`npx create-next-app@latest ${projectName2} --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`, { stdio: "inherit" });
  console.log("\n\u{1F4E6} Installing dependencies (@unciatech/file-manager, tailwindcss-animate)...");
  execSync("npm install @unciatech/file-manager tailwindcss-animate", { cwd: targetDir, stdio: "inherit" });
  const componentsDir = path.join(targetDir, "src", "components");
  if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });
  fs.writeFileSync(path.join(componentsDir, "FileManagerDemo.tsx"), TEMPLATE, "utf-8");
  const pagePath = path.join(targetDir, "src", "app", "page.tsx");
  fs.writeFileSync(pagePath, `import FileManagerDemo from "@/components/FileManagerDemo";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);
  const mediaRouteDir = path.join(targetDir, "src", "app", "media", "[[...path]]");
  fs.mkdirSync(mediaRouteDir, { recursive: true });
  fs.writeFileSync(
    path.join(mediaRouteDir, "page.tsx"),
    `import FileManagerDemo from "@/components/FileManagerDemo";

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`
  );
  const layoutPath = path.join(targetDir, "src", "app", "layout.tsx");
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, "utf8");
    if (!layoutContent.includes("@unciatech/file-manager/styles")) {
      layoutContent = layoutContent.replace(
        /^(import type)/m,
        `import '@unciatech/file-manager/styles';
$1`
      );
      fs.writeFileSync(layoutPath, layoutContent);
    }
  }
  const cssPath = path.join(targetDir, "src", "app", "globals.css");
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
  printSuccess(projectName2);
}
async function scaffoldVite(projectName2, targetDir) {
  console.log("\n\u{1F4E6} Creating Vite React application...");
  execSync(`npm create vite@latest ${projectName2} -- --template react-ts`, { stdio: "inherit" });
  console.log("\n\u{1F4E6} Installing dependencies (Tailwind + File Manager)...");
  execSync("npm install", { cwd: targetDir, stdio: "inherit" });
  execSync("npm install tailwindcss @tailwindcss/vite @unciatech/file-manager", { cwd: targetDir, stdio: "inherit" });
  const viteConfigPath = path.join(targetDir, "vite.config.ts");
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
  const cssPath = path.join(targetDir, "src", "index.css");
  fs.writeFileSync(cssPath, `@import "tailwindcss";
@source "../../node_modules/@unciatech/file-manager/dist";
`);
  const componentsDir = path.join(targetDir, "src", "components");
  if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });
  fs.writeFileSync(path.join(componentsDir, "FileManagerDemo.tsx"), TEMPLATE, "utf-8");
  const appPath = path.join(targetDir, "src", "App.tsx");
  fs.writeFileSync(appPath, `import FileManagerDemo from "./components/FileManagerDemo";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </div>
  );
}

export default App;
`);
  printSuccess(projectName2, "npm run dev");
}
function printSuccess(projectName2, devCmd = "npm run dev") {
  console.log("\n=========================================");
  console.log("\u{1F389} Your Media Library application is ready!");
  console.log("=========================================");
  console.log("\nNext steps:");
  console.log(`  cd ${projectName2}`);
  console.log(`  ${devCmd}`);
  console.log("\nEnjoy building! \u{1F5C2}\uFE0F\n");
}
main();
