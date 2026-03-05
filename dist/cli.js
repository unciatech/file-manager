#!/usr/bin/env node
"use strict";var h=Object.create;var g=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var F=Object.getOwnPropertyNames;var v=Object.getPrototypeOf,j=Object.prototype.hasOwnProperty;var M=(i,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let c of F(e))!j.call(i,c)&&c!==s&&g(i,c,{get:()=>e[c],enumerable:!(t=S(e,c))||t.enumerable});return i};var d=(i,e,s)=>(s=i!=null?h(v(i)):{},M(e||!i||!i.__esModule?g(s,"default",{value:i,enumerable:!0}):s,i));var n=d(require("fs")),o=d(require("path")),p=require("child_process"),f=d(require("readline")),y=process.argv.slice(2),P=y[0],l=y[1],w=f.default.createInterface({input:process.stdin,output:process.stdout}),C=i=>new Promise(e=>w.question(i,e)),u=`"use client";

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
`;async function k(){if(P!=="init"&&(console.log("Usage: npx @unciatech/file-manager init [project-name]"),process.exit(0)),!l){console.log("\u{1F680} Generating <FileManagerDemo /> component in the current project...");let s=process.cwd();n.default.existsSync(o.default.join(process.cwd(),"components"))?s=o.default.join(process.cwd(),"components"):n.default.existsSync(o.default.join(process.cwd(),"src","components"))&&(s=o.default.join(process.cwd(),"src","components"));let t=o.default.join(s,"FileManagerDemo.tsx");n.default.existsSync(t)&&(console.error(`\u274C Error: ${t} already exists.`),process.exit(1)),n.default.writeFileSync(t,u,"utf-8"),console.log(`\u2705 Success! Created ${t}`),console.log(""),console.log("You can now import and render <FileManagerDemo /> anywhere in your application."),console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!"),process.exit(0)}console.log(`
\u{1F680} Initializing a new application: ${l}
`),console.log("Which framework would you like to use?"),console.log("  1) Next.js (App Router, Tailwind v4)"),console.log("  2) Vite (React, Tailwind v4)"),console.log("  3) Cancel");let i=await C(`
Select an option (1-3): `),e=o.default.join(process.cwd(),l);n.default.existsSync(e)&&(console.error(`
\u274C Error: Directory "${l}" already exists in ${process.cwd()}.`),console.error("   Please choose a different project name or delete the existing directory first."),w.close(),process.exit(1));try{i==="1"?await D(l,e):i==="2"?await b(l,e):(console.log("Canceled."),process.exit(0))}catch(s){console.error(`
\u274C Scaffolding failed:`,s),process.exit(1)}process.exit(0)}async function D(i,e){console.log(`
\u{1F4E6} Creating Next.js application (this may take a minute)...`),(0,p.execSync)(`npx create-next-app@latest ${i} --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (@unciatech/file-manager, tailwindcss-animate)...`),(0,p.execSync)("npm install @unciatech/file-manager tailwindcss-animate",{cwd:e,stdio:"inherit"});let s=o.default.join(e,"src","components");n.default.existsSync(s)||n.default.mkdirSync(s,{recursive:!0}),n.default.writeFileSync(o.default.join(s,"FileManagerDemo.tsx"),u,"utf-8");let t=o.default.join(e,"src","app","page.tsx");n.default.writeFileSync(t,`import FileManagerDemo from "@/components/FileManagerDemo";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let c=o.default.join(e,"src","app","media","[[...path]]");n.default.mkdirSync(c,{recursive:!0}),n.default.writeFileSync(o.default.join(c,"page.tsx"),`import FileManagerDemo from "@/components/FileManagerDemo";

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let a=o.default.join(e,"src","app","layout.tsx");if(n.default.existsSync(a)){let r=n.default.readFileSync(a,"utf8");r.includes("@unciatech/file-manager/styles")||(r=r.replace(/^(import type)/m,`import '@unciatech/file-manager/styles';
$1`),n.default.writeFileSync(a,r))}let m=o.default.join(e,"src","app","globals.css");if(n.default.existsSync(m)){let r=n.default.readFileSync(m,"utf8");r.includes("@source")||(r=`@import "tailwindcss";
@plugin "tailwindcss-animate";
@source "../../node_modules/@unciatech/file-manager/dist";

`+r.replace('@import "tailwindcss";',""),n.default.writeFileSync(m,r))}x(i)}async function b(i,e){console.log(`
\u{1F4E6} Creating Vite React application...`),(0,p.execSync)(`npm create vite@latest ${i} -- --template react-ts`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (Tailwind + File Manager)...`),(0,p.execSync)("npm install",{cwd:e,stdio:"inherit"}),(0,p.execSync)("npm install tailwindcss @tailwindcss/vite @unciatech/file-manager",{cwd:e,stdio:"inherit"});let s=o.default.join(e,"vite.config.ts");n.default.writeFileSync(s,`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`);let c=o.default.join(e,"src","index.css");n.default.writeFileSync(c,`@import "tailwindcss";
@source "../../node_modules/@unciatech/file-manager/dist";
`);let a=o.default.join(e,"src","components");n.default.existsSync(a)||n.default.mkdirSync(a,{recursive:!0}),n.default.writeFileSync(o.default.join(a,"FileManagerDemo.tsx"),u,"utf-8");let m=o.default.join(e,"src","App.tsx");n.default.writeFileSync(m,`import FileManagerDemo from "./components/FileManagerDemo";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </div>
  );
}

export default App;
`),x(i,"npm run dev")}function x(i,e="npm run dev"){console.log(`
=========================================`),console.log("\u{1F389} Your Media Library application is ready!"),console.log("========================================="),console.log(`
Next steps:`),console.log(`  cd ${i}`),console.log(`  ${e}`),console.log(`
Enjoy building! \u{1F5C2}\uFE0F
`)}k();
