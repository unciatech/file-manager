#!/usr/bin/env node
import n from'fs';import i from'path';import {execSync}from'child_process';import y from'readline';var g=process.argv.slice(2),w=g[0],a=g[1],u=y.createInterface({input:process.stdin,output:process.stdout}),h=o=>new Promise(e=>u.question(o,e)),d=(o="/media")=>`"use client";

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
          basePath="${o}"
        />
      </Suspense>
    </div>
  );
}
`;async function x(){if(w!=="init"&&(console.log("Usage: npx @unciatech/file-manager init [project-name]"),process.exit(0)),!a){console.log("\u{1F680} Generating <FileManagerDemo /> component in the current project...");let s=process.cwd();n.existsSync(i.join(process.cwd(),"components"))?s=i.join(process.cwd(),"components"):n.existsSync(i.join(process.cwd(),"src","components"))&&(s=i.join(process.cwd(),"src","components"));let t=i.join(s,"FileManagerDemo.tsx");n.existsSync(t)&&(console.error(`\u274C Error: ${t} already exists.`),process.exit(1)),n.writeFileSync(t,d("/"),"utf-8"),console.log(`\u2705 Success! Created ${t}`),console.log(""),console.log("You can now import and render <FileManagerDemo /> anywhere in your application."),console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!"),process.exit(0);}console.log(`
\u{1F680} Initializing a new application: ${a}
`),console.log("Which framework would you like to use?"),console.log("  1) Next.js (App Router, Tailwind v4)"),console.log("  2) Vite (React, Tailwind v4)"),console.log("  3) Cancel");let o=await h(`
Select an option (1-3): `),e=i.join(process.cwd(),a);n.existsSync(e)&&(console.error(`
\u274C Error: Directory "${a}" already exists in ${process.cwd()}.`),console.error("   Please choose a different project name or delete the existing directory first."),u.close(),process.exit(1));try{o==="1"?await F(a,e):o==="2"?await S(a,e):(console.log("Canceled."),process.exit(0));}catch(s){console.error(`
\u274C Scaffolding failed:`,s),process.exit(1);}process.exit(0);}async function F(o,e){console.log(`
\u{1F4E6} Creating Next.js application (this may take a minute)...`),execSync(`npx create-next-app@latest ${o} --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (@unciatech/file-manager, tailwindcss-animate)...`),execSync("npm install @unciatech/file-manager tailwindcss-animate",{cwd:e,stdio:"inherit"});let s=i.join(e,"src","components");n.existsSync(s)||n.mkdirSync(s,{recursive:true}),n.writeFileSync(i.join(s,"FileManagerDemo.tsx"),d("/media"),"utf-8");let t=i.join(e,"src","app","page.tsx");n.writeFileSync(t,`import FileManagerDemo from "@/components/FileManagerDemo";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let l=i.join(e,"src","app","media","[[...path]]");n.mkdirSync(l,{recursive:true}),n.writeFileSync(i.join(l,"page.tsx"),`import FileManagerDemo from "@/components/FileManagerDemo";

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let c=i.join(e,"src","app","layout.tsx");if(n.existsSync(c)){let p=n.readFileSync(c,"utf8");p.includes("@unciatech/file-manager/styles")||(p=p.replace(/^(import type)/m,`import '@unciatech/file-manager/styles';
$1`),n.writeFileSync(c,p));}let m=i.join(e,"src","app","globals.css");n.writeFileSync(m,`@import "tailwindcss";
@import "@unciatech/file-manager/styles";
@import "tw-animate-css";

@source "../../node_modules/@unciatech/file-manager";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
`),f(o);}async function S(o,e){console.log(`
\u{1F4E6} Creating Vite React application...`),execSync(`npm create vite@latest ${o} -- --template react-ts`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (Tailwind + File Manager)...`),execSync("npm install",{cwd:e,stdio:"inherit"}),execSync("npm install tailwindcss @tailwindcss/vite @unciatech/file-manager",{cwd:e,stdio:"inherit"});let s=i.join(e,"vite.config.ts");n.writeFileSync(s,`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`);let l=i.join(e,"src","index.css");n.writeFileSync(l,`@import "tailwindcss";
@import "@unciatech/file-manager/styles";
@source "../node_modules/@unciatech/file-manager";
`);let c=i.join(e,"src","components");n.existsSync(c)||n.mkdirSync(c,{recursive:true}),n.writeFileSync(i.join(c,"FileManagerDemo.tsx"),d("/"),"utf-8");let m=i.join(e,"src","App.tsx");n.writeFileSync(m,`import FileManagerDemo from "./components/FileManagerDemo";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </div>
  );
}

export default App;
`),f(o,"npm run dev");}function f(o,e="npm run dev"){console.log(`
=========================================`),console.log("\u{1F389} Your Media Library application is ready!"),console.log("========================================="),console.log(`
Next steps:`),console.log(`  cd ${o}`),console.log(`  ${e}`),console.log(`
Enjoy building! \u{1F5C2}\uFE0F
`);}x();