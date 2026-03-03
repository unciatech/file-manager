#!/usr/bin/env node
"use strict";var y=Object.create;var d=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var v=Object.getOwnPropertyNames;var h=Object.getPrototypeOf,S=Object.prototype.hasOwnProperty;var F=(n,e,o,c)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of v(e))!S.call(n,t)&&t!==o&&d(n,t,{get:()=>e[t],enumerable:!(c=x(e,t))||c.enumerable});return n};var p=(n,e,o)=>(o=n!=null?y(h(n)):{},F(e||!n||!n.__esModule?d(o,"default",{value:n,enumerable:!0}):o,n));var i=p(require("fs")),s=p(require("path")),a=require("child_process"),g=p(require("readline")),u=process.argv.slice(2),j=u[0],l=u[1],M=g.default.createInterface({input:process.stdin,output:process.stdout}),C=n=>new Promise(e=>M.question(n,e)),m=`"use client";

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
`;async function P(){if(j!=="init"&&(console.log("Usage: npx @unciatech/file-manager init [project-name]"),process.exit(0)),!l){console.log("\u{1F680} Generating <FileManagerDemo /> component in the current project...");let o=process.cwd();i.default.existsSync(s.default.join(process.cwd(),"components"))?o=s.default.join(process.cwd(),"components"):i.default.existsSync(s.default.join(process.cwd(),"src","components"))&&(o=s.default.join(process.cwd(),"src","components"));let c=s.default.join(o,"FileManagerDemo.tsx");i.default.existsSync(c)&&(console.error(`\u274C Error: ${c} already exists.`),process.exit(1)),i.default.writeFileSync(c,m,"utf-8"),console.log(`\u2705 Success! Created ${c}`),console.log(""),console.log("You can now import and render <FileManagerDemo /> anywhere in your application."),console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!"),process.exit(0)}console.log(`
\u{1F680} Initializing a new application: ${l}
`),console.log("Which framework would you like to use?"),console.log("  1) Next.js (App Router, Tailwind v4)"),console.log("  2) Vite (React, Tailwind v4)"),console.log("  3) Cancel");let n=await C(`
Select an option (1-3): `),e=s.default.join(process.cwd(),l);try{n==="1"?await k(l,e):n==="2"?await b(l,e):(console.log("Canceled."),process.exit(0))}catch(o){console.error(`
\u274C Scaffolding failed:`,o),process.exit(1)}process.exit(0)}async function k(n,e){console.log(`
\u{1F4E6} Creating Next.js application (this may take a minute)...`),(0,a.execSync)(`npx create-next-app@latest ${n} --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (@unciatech/file-manager, tailwindcss-animate)...`),(0,a.execSync)("npm install @unciatech/file-manager tailwindcss-animate",{cwd:e,stdio:"inherit"});let o=s.default.join(e,"src","components");i.default.existsSync(o)||i.default.mkdirSync(o,{recursive:!0}),i.default.writeFileSync(s.default.join(o,"FileManagerDemo.tsx"),m,"utf-8");let c=s.default.join(e,"src","app","page.tsx");i.default.writeFileSync(c,`import FileManagerDemo from "@/components/FileManagerDemo";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </main>
  );
}
`);let t=s.default.join(e,"src","app","globals.css");if(i.default.existsSync(t)){let r=i.default.readFileSync(t,"utf8");r.includes("@source")||(r=`@import "tailwindcss";
@plugin "tailwindcss-animate";
@source "../../node_modules/@unciatech/file-manager/dist";

`+r.replace('@import "tailwindcss";',""),i.default.writeFileSync(t,r))}f(n)}async function b(n,e){console.log(`
\u{1F4E6} Creating Vite React application...`),(0,a.execSync)(`npm create vite@latest ${n} -- --template react-ts`,{stdio:"inherit"}),console.log(`
\u{1F4E6} Installing dependencies (Tailwind + File Manager)...`),(0,a.execSync)("npm install",{cwd:e,stdio:"inherit"}),(0,a.execSync)("npm install tailwindcss @tailwindcss/vite @unciatech/file-manager",{cwd:e,stdio:"inherit"});let o=s.default.join(e,"vite.config.ts");i.default.writeFileSync(o,`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
`);let t=s.default.join(e,"src","index.css");i.default.writeFileSync(t,`@import "tailwindcss";
@source "../../node_modules/@unciatech/file-manager/dist";
`);let r=s.default.join(e,"src","components");i.default.existsSync(r)||i.default.mkdirSync(r,{recursive:!0}),i.default.writeFileSync(s.default.join(r,"FileManagerDemo.tsx"),m,"utf-8");let w=s.default.join(e,"src","App.tsx");i.default.writeFileSync(w,`import FileManagerDemo from "./components/FileManagerDemo";

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <FileManagerDemo />
    </div>
  );
}

export default App;
`),f(n,"npm run dev")}function f(n,e="npm run dev"){console.log("\\n========================================="),console.log("\u{1F389} Your Media Library application is ready!"),console.log("========================================="),console.log("\\nNext steps:"),console.log(`  cd ${n}`),console.log(`  ${e}`),console.log("\\nEnjoy building! \u{1F5C2}\uFE0F\\n")}P();
