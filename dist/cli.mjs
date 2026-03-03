#!/usr/bin/env node
import n from"fs";import i from"path";import{execSync as l}from"child_process";import u from"readline";var m=process.argv.slice(2),f=m[0],a=m[1],w=u.createInterface({input:process.stdin,output:process.stdout}),y=o=>new Promise(e=>w.question(o,e)),p=`"use client";

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
`;async function x(){if(f!=="init"&&(console.log("Usage: npx @unciatech/file-manager init [project-name]"),process.exit(0)),!a){console.log("\u{1F680} Generating <FileManagerDemo /> component in the current project...");let s=process.cwd();n.existsSync(i.join(process.cwd(),"components"))?s=i.join(process.cwd(),"components"):n.existsSync(i.join(process.cwd(),"src","components"))&&(s=i.join(process.cwd(),"src","components"));let c=i.join(s,"FileManagerDemo.tsx");n.existsSync(c)&&(console.error(`\u274C Error: ${c} already exists.`),process.exit(1)),n.writeFileSync(c,p,"utf-8"),console.log(`\u2705 Success! Created ${c}`),console.log(""),console.log("You can now import and render <FileManagerDemo /> anywhere in your application."),console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!"),process.exit(0)}console.log(`
\u{1F680} Initializing a new application: ${a}
`),console.log("Which framework would you like to use?"),console.log("  1) Next.js (App Router, Tailwind v4)"),console.log("  2) Vite (React, Tailwind v4)"),console.log("  3) Cancel");let o=await y(`
Select an option (1-3): `),e=i.join(process.cwd(),a);try{o==="1"?await v(a,e):o==="2"?await h(a,e):(console.log("Canceled."),process.exit(0))}catch(s){console.error(`
\u274C Scaffolding failed:`,s),process.exit(1)}process.exit(0)}async function v(o,e){console.log(`
\u{1F4E6} Creating Next.js application (this may take a minute)...`),l(`npx create-next-app@latest ${o} --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (@unciatech/file-manager, tailwindcss-animate)...`),l("npm install @unciatech/file-manager tailwindcss-animate",{cwd:e,stdio:"inherit"});let s=i.join(e,"src","components");n.existsSync(s)||n.mkdirSync(s,{recursive:!0}),n.writeFileSync(i.join(s,"FileManagerDemo.tsx"),p,"utf-8");let c=i.join(e,"src","app","page.tsx");n.writeFileSync(c,`import FileManagerDemo from "@/components/FileManagerDemo";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let r=i.join(e,"src","app","globals.css");if(n.existsSync(r)){let t=n.readFileSync(r,"utf8");t.includes("@source")||(t=`@import "tailwindcss";
@plugin "tailwindcss-animate";
@source "../../node_modules/@unciatech/file-manager/dist";

`+t.replace('@import "tailwindcss";',""),n.writeFileSync(r,t))}d(o)}async function h(o,e){console.log(`
\u{1F4E6} Creating Vite React application...`),l(`npm create vite@latest ${o} -- --template react-ts`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (Tailwind + File Manager)...`),l("npm install",{cwd:e,stdio:"inherit"}),l("npm install tailwindcss @tailwindcss/vite @unciatech/file-manager",{cwd:e,stdio:"inherit"});let s=i.join(e,"vite.config.ts");n.writeFileSync(s,`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`);let r=i.join(e,"src","index.css");n.writeFileSync(r,`@import "tailwindcss";
@source "../../node_modules/@unciatech/file-manager/dist";
`);let t=i.join(e,"src","components");n.existsSync(t)||n.mkdirSync(t,{recursive:!0}),n.writeFileSync(i.join(t,"FileManagerDemo.tsx"),p,"utf-8");let g=i.join(e,"src","App.tsx");n.writeFileSync(g,`import FileManagerDemo from "./components/FileManagerDemo";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </div>
  );
}

export default App;
`),d(o,"npm run dev")}function d(o,e="npm run dev"){console.log("\\n========================================="),console.log("\u{1F389} Your Media Library application is ready!"),console.log("========================================="),console.log("\\nNext steps:"),console.log(`  cd ${o}`),console.log(`  ${e}`),console.log("\\nEnjoy building! \u{1F5C2}\uFE0F\\n")}x();
