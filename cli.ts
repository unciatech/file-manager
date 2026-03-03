#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args[0] === 'init') {
  console.log('🚀 Initializing @unciatech/file-manager...');

  const template = `"use client";

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
`;

  // Try to find a components directory, otherwise default to current dir
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

  try {
    fs.writeFileSync(targetFile, template, 'utf-8');
    console.log(`✅ Success! Created ${targetFile}`);
    console.log('');
    console.log("You can now import and render <FileManagerDemo /> anywhere in your application.");
    console.log("Don't forget to configure your Tailwind CSS content to scan the library for styles!");
  } catch (error) {
    console.error('❌ Failed to create initialization file:', error);
    process.exit(1);
  }
} else {
  console.log('Usage: npx @unciatech/file-manager init');
}
