#!/usr/bin/env node
import e from"fs";import i from"path";import{execSync as p}from"child_process";import y from"readline";var u=process.argv.slice(2),w=u[0],a=u[1],g=y.createInterface({input:process.stdin,output:process.stdout}),x=o=>new Promise(n=>g.question(o,n)),d=`"use client";

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
`;async function h(){if(w!=="init"&&(console.log("Usage: npx @unciatech/file-manager init [project-name]"),process.exit(0)),!a){console.log("\u{1F680} Generating <FileManagerDemo /> component in the current project...");let s=process.cwd();e.existsSync(i.join(process.cwd(),"components"))?s=i.join(process.cwd(),"components"):e.existsSync(i.join(process.cwd(),"src","components"))&&(s=i.join(process.cwd(),"src","components"));let c=i.join(s,"FileManagerDemo.tsx");e.existsSync(c)&&(console.error(`\u274C Error: ${c} already exists.`),process.exit(1)),e.writeFileSync(c,d,"utf-8"),console.log(`\u2705 Success! Created ${c}`),console.log(""),console.log("You can now import and render <FileManagerDemo /> anywhere in your application."),console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!"),process.exit(0)}console.log(`
\u{1F680} Initializing a new application: ${a}
`),console.log("Which framework would you like to use?"),console.log("  1) Next.js (App Router, Tailwind v4)"),console.log("  2) Vite (React, Tailwind v4)"),console.log("  3) Cancel");let o=await x(`
Select an option (1-3): `),n=i.join(process.cwd(),a);e.existsSync(n)&&(console.error(`
\u274C Error: Directory "${a}" already exists in ${process.cwd()}.`),console.error("   Please choose a different project name or delete the existing directory first."),g.close(),process.exit(1));try{o==="1"?await S(a,n):o==="2"?await F(a,n):(console.log("Canceled."),process.exit(0))}catch(s){console.error(`
\u274C Scaffolding failed:`,s),process.exit(1)}process.exit(0)}async function S(o,n){console.log(`
\u{1F4E6} Creating Next.js application (this may take a minute)...`),p(`npx create-next-app@latest ${o} --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (@unciatech/file-manager, tailwindcss-animate)...`),p("npm install @unciatech/file-manager tailwindcss-animate",{cwd:n,stdio:"inherit"});let s=i.join(n,"src","components");e.existsSync(s)||e.mkdirSync(s,{recursive:!0}),e.writeFileSync(i.join(s,"FileManagerDemo.tsx"),d,"utf-8");let c=i.join(n,"src","app","page.tsx");e.writeFileSync(c,`import FileManagerDemo from "@/components/FileManagerDemo";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let m=i.join(n,"src","app","media","[[...path]]");e.mkdirSync(m,{recursive:!0}),e.writeFileSync(i.join(m,"page.tsx"),`import FileManagerDemo from "@/components/FileManagerDemo";

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let r=i.join(n,"src","app","layout.tsx");if(e.existsSync(r)){let t=e.readFileSync(r,"utf8");t.includes("@unciatech/file-manager/styles")||(t=t.replace(/^(import type)/m,`import '@unciatech/file-manager/styles';
$1`),e.writeFileSync(r,t))}let l=i.join(n,"src","app","globals.css");if(e.existsSync(l)){let t=e.readFileSync(l,"utf8");t.includes("@source")||(t=`@import "tailwindcss";
@plugin "tailwindcss-animate";
@source "../../node_modules/@unciatech/file-manager/dist";

`+t.replace('@import "tailwindcss";',""),e.writeFileSync(l,t))}f(o)}async function F(o,n){console.log(`
\u{1F4E6} Creating Vite React application...`),p(`npm create vite@latest ${o} -- --template react-ts`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (Tailwind + File Manager)...`),p("npm install",{cwd:n,stdio:"inherit"}),p("npm install tailwindcss @tailwindcss/vite @unciatech/file-manager",{cwd:n,stdio:"inherit"});let s=i.join(n,"vite.config.ts");e.writeFileSync(s,`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`);let m=i.join(n,"src","index.css");e.writeFileSync(m,`@import "tailwindcss";
@source "../../node_modules/@unciatech/file-manager/dist";
`);let r=i.join(n,"src","components");e.existsSync(r)||e.mkdirSync(r,{recursive:!0}),e.writeFileSync(i.join(r,"FileManagerDemo.tsx"),d,"utf-8");let l=i.join(n,"src","App.tsx");e.writeFileSync(l,`import FileManagerDemo from "./components/FileManagerDemo";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </div>
  );
}

export default App;
`),f(o,"npm run dev")}function f(o,n="npm run dev"){console.log(`
=========================================`),console.log("\u{1F389} Your Media Library application is ready!"),console.log("========================================="),console.log(`
Next steps:`),console.log(`  cd ${o}`),console.log(`  ${n}`),console.log(`
Enjoy building! \u{1F5C2}\uFE0F
`)}h();
