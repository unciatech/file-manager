#!/usr/bin/env node
import r from"fs";import e from"path";var s=process.argv.slice(2);if(s[0]==="init"){console.log("\u{1F680} Initializing @unciatech/file-manager...");let n=`"use client";

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
`,i=process.cwd();r.existsSync(e.join(process.cwd(),"components"))?i=e.join(process.cwd(),"components"):r.existsSync(e.join(process.cwd(),"src","components"))&&(i=e.join(process.cwd(),"src","components"));let o=e.join(i,"FileManagerDemo.tsx");r.existsSync(o)&&(console.error(`\u274C Error: ${o} already exists.`),process.exit(1));try{r.writeFileSync(o,n,"utf-8"),console.log(`\u2705 Success! Created ${o}`),console.log(""),console.log("You can now import and render <FileManagerDemo /> anywhere in your application."),console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!")}catch(t){console.error("\u274C Failed to create initialization file:",t),process.exit(1)}}else console.log("Usage: npx @unciatech/file-manager init");
