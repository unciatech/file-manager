#!/usr/bin/env node
"use strict";var l=Object.create;var c=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var p=Object.getOwnPropertyNames;var d=Object.getPrototypeOf,g=Object.prototype.hasOwnProperty;var f=(e,o,r,s)=>{if(o&&typeof o=="object"||typeof o=="function")for(let n of p(o))!g.call(e,n)&&n!==r&&c(e,n,{get:()=>o[n],enumerable:!(s=m(o,n))||s.enumerable});return e};var a=(e,o,r)=>(r=e!=null?l(d(e)):{},f(o||!e||!e.__esModule?c(r,"default",{value:e,enumerable:!0}):r,e));var t=a(require("fs")),i=a(require("path")),u=process.argv.slice(2);if(u[0]==="init"){console.log("\u{1F680} Initializing @unciatech/file-manager...");let e=`"use client";

import React from "react";
import { FileManagerProvider } from "@unciatech/file-manager";
import { FileManager } from "@unciatech/file-manager";
import { MockProvider } from "@unciatech/file-manager";

export default function FileManagerDemo() {
  // Instantiate the mock provider for demonstration purposes
  const mockProvider = new MockProvider();

  return (
    <div className="h-screen w-full">
      <FileManagerProvider
        mode="page"
        selectionMode="multiple"
        allowedFileTypes={["images", "videos", "audios", "files"]}
        provider={mockProvider}
      >
        <FileManager />
      </FileManagerProvider>
    </div>
  );
}
`,o=process.cwd();t.default.existsSync(i.default.join(process.cwd(),"components"))?o=i.default.join(process.cwd(),"components"):t.default.existsSync(i.default.join(process.cwd(),"src","components"))&&(o=i.default.join(process.cwd(),"src","components"));let r=i.default.join(o,"FileManagerDemo.tsx");t.default.existsSync(r)&&(console.error(`\u274C Error: ${r} already exists.`),process.exit(1));try{t.default.writeFileSync(r,e,"utf-8"),console.log(`\u2705 Success! Created ${r}`),console.log(""),console.log("You can now import and render <FileManagerDemo /> anywhere in your application."),console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!")}catch(s){console.error("\u274C Failed to create initialization file:",s),process.exit(1)}}else console.log("Usage: npx @unciatech/file-manager init");
