export const docsContent: Record<string, string> = {
  installation: `
# 📦 Installation

Install the file manager and required utilities:

\`\`\`bash
npm install @unciatech/file-manager class-variance-authority clsx tailwind-merge
\`\`\`

> ⚠️ This library relies on **Tailwind CSS** for styling.
> If your project does not use Tailwind yet, see the steps below.

---

## Import Styles

Import the file manager styles in your root file.

### Vite / React

\`\`\`ts
import "@unciatech/file-manager/styles"
\`\`\`

Place this inside \`main.tsx\` or \`App.tsx\`.

### Next.js

Import inside your root layout:

\`\`\`ts
import "@unciatech/file-manager/styles"
\`\`\`

Place this in \`app/layout.tsx\`.

---

## Configure Tailwind CSS

This library relies heavily on Tailwind CSS.

### Option A - Project Already Uses Tailwind

#### Tailwind v4
Add this to your main CSS file (\`globals.css\` or \`index.css\`):

\`\`\`css
@import "tailwindcss";
@import "@unciatech/file-manager/styles";

@source "../node_modules/@unciatech/file-manager";
\`\`\`

#### Tailwind v3
Update your \`tailwind.config.ts\`:

\`\`\`ts
content: [
  "./node_modules/@unciatech/file-manager/dist/**/*.{js,ts,jsx,tsx}",
]
\`\`\`

### Option B - Install Tailwind CSS

\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

Update \`tailwind.config.ts\`:

\`\`\`ts
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@unciatech/file-manager/dist/**/*.{js,ts,jsx,tsx}",
]
\`\`\`

Add to \`index.css\` or \`globals.css\`:

\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "@unciatech/file-manager/styles";
\`\`\`
  `,
  usage: `
# ⚡ File Manager & Pickers

You can instantly test the UI using the built-in \`MockProvider\`.

\`\`\`tsx
import { FileManager, MockProvider } from "@unciatech/file-manager"

const provider = new MockProvider()

export default function App() {
  return (
    <FileManager
      provider={provider}
      basePath="/"
      viewMode="grid"
      allowedFileTypes={["images", "videos", "files"]}
    />
  )
}
\`\`\`

## Dual Operating Modes

The file manager functions as both a full-page administrative view and a modal picker component. Simply render it within a Dialog.

\`\`\`tsx
import { useState } from 'react';
import { FileManager, MockProvider } from '@unciatech/file-manager';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const provider = new MockProvider();

function FilePickerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-white text-black rounded text-sm font-semibold">
          Open File Picker
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[80vh] p-0 overflow-hidden bg-[#0f0f0f] border-[#2c2c2c]">
        {/* Render FileManager inside a modal */}
        <FileManager
          provider={provider}
          basePath="/"
          viewMode="grid"
          onSelect={(files) => {
            console.log('Selected files:', files);
            setOpen(false); // Close Modal on selection
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
\`\`\`
`,
  providers: `
# 🔌 API & Storage Providers

Create a custom provider to connect the File Manager to your own backend API or storage service (like AWS S3, Cloudinary).

> 💡 **Pro Tip - The Mock Provider**
> If you are just prototyping and don't have a backend ready yet, you can skip this step entirely and use \`MockProvider\`.

## Building a Custom API Provider

The file manager is **backend-agnostic**.

Create a class implementing \`IFileManagerProvider\`.

\`\`\`ts
import {
  IFileManagerProvider,
  FolderId,
  FileUploadInput,
} from "@unciatech/file-manager"

export class MyCustomApiProvider implements IFileManagerProvider {
  private baseUrl = "https://api.mybackend.com/v1"

  async getFolders(folderId: FolderId, page = 1, limit = 24) {
    const parentQuery = folderId ? \`&parentId=\${folderId}\` : "&isRoot=true"

    const res = await fetch(
      \`\${this.baseUrl}/folders?page=\${page}&limit=\${limit}\${parentQuery}\`
    )

    if (!res.ok) throw new Error("Failed to fetch folders")

    const data = await res.json()

    return {
      folders: data.folders,
      pagination: data.pagination,
    }
  }

  async uploadFiles(filesInput: FileUploadInput[], folderId?: FolderId) {
    const formData = new FormData()

    if (folderId) {
      formData.append("folderId", String(folderId))
    }

    filesInput.forEach(({ file }) => {
      formData.append("files", file)
    })

    const res = await fetch(\`\${this.baseUrl}/upload\`, {
      method: "POST",
      body: formData,
    })

    return res.json()
  }
  
  // Implement other methods: move, delete, rename
}
\`\`\`

## Integrating the Custom Provider

Pass it to the \`FileManager\` instance:

\`\`\`tsx
const myProvider = new MyCustomApiProvider();

function App() {
  return <FileManager provider={myProvider} basePath="/" />;
}
\`\`\`
`,
  router: `
# 🔀 Router Integration

By default the file manager uses \`history.pushState\`.

If your app uses a router, pass the \`onNavigate\` prop.

---

## React Router

### Install

\`\`\`bash
npm install react-router-dom
\`\`\`

### main.tsx

\`\`\`tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
\`\`\`

---

## TanStack Router

### Install

\`\`\`bash
npm install @tanstack/react-router
\`\`\`

### main.tsx

\`\`\`tsx
import React from "react"
import ReactDOM from "react-dom/client"
import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router"

import App, { ModalPage } from "./App"
import "./index.css"

const rootRoute = createRootRoute()

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ModalPage,
})

const fullRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/full",
  component: App,
})

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: App,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  fullRoute,
  catchAllRoute,
])

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
\`\`\`
`,
  schema: `
# 🗄️ Database Schema (Optional)

Using **PostgreSQL** with JSON support is recommended for storing scalable, deeply nested file architectures.

Example **Prisma** schema:

\`\`\`prisma
model Folder {
  id          Int      @id @default(autoincrement())
  name        String
  parentId    Int?

  folderCount Int      @default(0)
  fileCount   Int      @default(0)

  pathId      Int      @default(0)
  path        String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  files       File[]

  @@index([parentId])
}

model File {
  id        Int      @id @default(autoincrement())
  name      String
  folderId  Int?

  size      Int
  url       String
  mime      String

  formats   Json?
  metaData  Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
\`\`\`
`,
  utilities: `
# 🛠️ File Type Utility

## Overview

The \`getFileTypeFromMime()\` utility function automatically determines the file type (\`FileType\`) from MIME type and file extension. This eliminates the need to store the \`type\` field explicitly in your file data.

## Function Signature

\`\`\`typescript
getFileTypeFromMime(mime: string, extension?: string): FileType
\`\`\`

## Usage Examples

### Example 1: Basic Usage

\`\`\`typescript
import { getFileTypeFromMime, FILE_TYPE } from '@unciatech/file-manager';

// Image file
const imageType = getFileTypeFromMime('image/jpeg', '.jpg');
// Returns: FILE_TYPE.IMAGE

// Video file
const videoType = getFileTypeFromMime('video/mp4', '.mp4');
// Returns: FILE_TYPE.VIDEO

// Audio file
const audioType = getFileTypeFromMime('audio/mpeg', '.mp3');
// Returns: FILE_TYPE.AUDIO

// Document file
const docType = getFileTypeFromMime('application/pdf', '.pdf');
// Returns: FILE_TYPE.FILE
\`\`\`

### Example 2: In Components

\`\`\`typescript
import { FileMetaData, getFileTypeFromMime, FILE_TYPE } from '@unciatech/file-manager';

function MyComponent({ file }: { file: FileMetaData }) {
  // Derive type dynamically
  const fileType = file.type || getFileTypeFromMime(file.mime, file.ext);
  
  // Use the type
  if (fileType === FILE_TYPE.IMAGE) {
    return <ImagePreview file={file} />;
  }
  // ... other cases
}
\`\`\`

## Supported File Types

### Images
- MIME: \`image/*\` (jpeg, png, gif, webp, avif, etc.)

### Videos
- MIME: \`video/*\` (mp4, webm, avi, mov, etc.)

### Audio
- MIME: \`audio/*\` (mp3, wav, ogg, etc.)

### Documents/Files
- **PDF**: \`application/pdf\`, \`.pdf\`
- **Word**: \`application/msword\`, \`.doc\`, \`.docx\`
- **Excel**: \`application/vnd.ms-excel\`, \`.xls\`, \`.xlsx\`
- **PowerPoint**: \`application/vnd.ms-powerpoint\`, \`.ppt\`, \`.pptx\`
- **Text**: \`text/plain\`, \`.txt\`
- **Archives**: \`application/zip\`, \`.zip\`, \`.rar\`, \`.7z\`
- **Code**: \`.json\`, \`.xml\`, \`.html\`, \`.css\`, \`.js\`, \`.ts\`

## Benefits

1. **Less Redundancy**: No need to store type when it can be derived from MIME
2. **Consistency**: Type is always correct based on MIME/extension
3. **Smaller Data**: Reduces payload size when fetching files from API
`
};
