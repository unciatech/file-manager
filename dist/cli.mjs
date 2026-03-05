#!/usr/bin/env node
import e from"fs";import r from"path";import{execSync as s}from"child_process";import v from"readline";var m=process.argv.slice(2),y=m[0],t=m[1],g=v.createInterface({input:process.stdin,output:process.stdout}),w=n=>new Promise(o=>g.question(n,o)),p=`"use client";

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
`;async function h(){if(y!=="init"&&(console.log("Usage: npx @unciatech/file-manager init [project-name]"),process.exit(0)),!t){console.log("\u{1F680} Generating <FileManagerDemo /> component in the current project...");let i=process.cwd();e.existsSync(r.join(process.cwd(),"components"))?i=r.join(process.cwd(),"components"):e.existsSync(r.join(process.cwd(),"src","components"))&&(i=r.join(process.cwd(),"src","components"));let c=r.join(i,"FileManagerDemo.tsx");e.existsSync(c)&&(console.error(`\u274C Error: ${c} already exists.`),process.exit(1)),e.writeFileSync(c,p,"utf-8"),console.log(`\u2705 Success! Created ${c}`),console.log(""),console.log("You can now import and render <FileManagerDemo /> anywhere in your application."),console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!"),process.exit(0)}console.log(`
\u{1F680} Initializing a new application: ${t}
`),console.log("Which framework would you like to use?"),console.log("  1) Next.js (App Router, Tailwind v4)"),console.log("  2) Vite (React, Tailwind v4)"),console.log("  3) Cancel");let n=await w(`
Select an option (1-3): `),o=r.join(process.cwd(),t);e.existsSync(o)&&(console.error(`
\u274C Error: Directory "${t}" already exists in ${process.cwd()}.`),console.error("   Please choose a different project name or delete the existing directory first."),g.close(),process.exit(1));try{n==="1"?await x(t,o):n==="2"?await b(t,o):(console.log("Canceled."),process.exit(0))}catch(i){console.error(`
\u274C Scaffolding failed:`,i),process.exit(1)}process.exit(0)}async function x(n,o){console.log(`
\u{1F4E6} Creating Next.js application (this may take a minute)...`),s(`npx create-next-app@latest ${n} --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (@unciatech/file-manager, tailwindcss-animate)...`),s("npm install @unciatech/file-manager tailwindcss-animate",{cwd:o,stdio:"inherit"});let i=r.join(o,"src","components");e.existsSync(i)||e.mkdirSync(i,{recursive:!0}),e.writeFileSync(r.join(i,"FileManagerDemo.tsx"),p,"utf-8");let c=r.join(o,"src","app","page.tsx");e.writeFileSync(c,`import FileManagerDemo from "@/components/FileManagerDemo";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let l=r.join(o,"src","app","media","[[...path]]");e.mkdirSync(l,{recursive:!0}),e.writeFileSync(r.join(l,"page.tsx"),`import FileManagerDemo from "@/components/FileManagerDemo";

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let a=r.join(o,"src","app","layout.tsx");if(e.existsSync(a)){let d=e.readFileSync(a,"utf8");d.includes("@unciatech/file-manager/styles")||(d=d.replace(/^(import type)/m,`import '@unciatech/file-manager/styles';
$1`),e.writeFileSync(a,d))}let u=r.join(o,"src","app","globals.css");e.writeFileSync(u,`@import 'tailwindcss';
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
`),f(n)}async function b(n,o){console.log(`
\u{1F4E6} Creating Vite React application...`),s(`npm create vite@latest ${n} -- --template react-ts`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (Tailwind + File Manager)...`),s("npm install",{cwd:o,stdio:"inherit"}),s("npm install tailwindcss @tailwindcss/vite @unciatech/file-manager",{cwd:o,stdio:"inherit"});let i=r.join(o,"vite.config.ts");e.writeFileSync(i,`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`);let l=r.join(o,"src","index.css");e.writeFileSync(l,`@import "tailwindcss";
@source "../../node_modules/@unciatech/file-manager/dist";
`);let a=r.join(o,"src","components");e.existsSync(a)||e.mkdirSync(a,{recursive:!0}),e.writeFileSync(r.join(a,"FileManagerDemo.tsx"),p,"utf-8");let u=r.join(o,"src","App.tsx");e.writeFileSync(u,`import FileManagerDemo from "./components/FileManagerDemo";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </div>
  );
}

export default App;
`),f(n,"npm run dev")}function f(n,o="npm run dev"){console.log(`
=========================================`),console.log("\u{1F389} Your Media Library application is ready!"),console.log("========================================="),console.log(`
Next steps:`),console.log(`  cd ${n}`),console.log(`  ${o}`),console.log(`
Enjoy building! \u{1F5C2}\uFE0F
`)}h();
