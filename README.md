# 🗂️ File Manager

A robust, production-ready file management component for any **React** application — works with Vite, Next.js, Remix, CRA, and more.

It supports deep folder nesting, drag-and-drop file uploads, metadata management for various file types (Images, Videos, Audio, Documents), unified grid layouts, and fully optimized loading states.

## 🌟 Key Features
- **Dual Operating Modes**: Use it as a standalone full-page media library or instantiate it as a picker modal for form inputs.
- **Unified Grid View**: Beautiful, responsive layout that intelligently renders thumbnails, icons, and metadata based on the file's MIME type.
- **Nested Folder Structure**: Infinite folder depth with smooth virtualized/paginated fetching.
- **Provider Agnostic**: Built on an `IFileManagerProvider` interface. You can easily hot-swap the mock data provider for a real backend (Node.js, Supabase, Strapi, etc.).
- **Bulk Actions**: Select multiple files/folders at once to bulk move or bulk delete.
- **Optimistic UI Updates**: Instant visual feedback when renaming folders or updating file descriptions, with silent background synchronization.
- **Graceful Error Handling**: Resilient `<FileManagerErrorBoundary>` that captures catastrophic failures and allows users to hard-reload safely without app crashes.

## 🛠️ Tech Stack
- **Framework**: React (any — Vite, Next.js, Remix, CRA)
- **Styling**: Tailwind CSS
- **Icons**: Custom SVG Icons
- **Notifications**: Sonner

> [!WARNING]
> This library is currently in **BETA**. Please report any bugs or feature requests on the GitHub issues page.

## Setup & Requirements

Because this library relies heavily on Tailwind CSS for minimal zero-config styling, ensure your app is configured to scan the library's components for Tailwind utility classes.

### Tailwind v4
If you are using **Tailwind CSS v4** (like in newer Next.js or Vite projects), add this to your main CSS file (`globals.css` or `index.css`). This pulls in the required theme configuration and ensures the library is scanned:

```css
@import "tailwindcss";
@import "@unciatech/file-manager/styles";
@source "../node_modules/@unciatech/file-manager";
```

### Tailwind v3
If you are still on **Tailwind v3**, add the library path to your `tailwind.config.ts`:

```ts
content: [
  // ... your other paths
  "./node_modules/@unciatech/file-manager/dist/**/*.{js,ts,jsx,tsx}",
],
```

## Basic Usage in Your Project

If you want to integrate this File Manager into your own React application (Next.js, Vite, Remix, CRA, etc.), follow this step-by-step guide.

### Step 1: Install the Package

Install the library via NPM:
```bash
npm install @unciatech/file-manager
```

**(Optional) ⚡ Magic Quick Start Scaffolding**
Instead of setting everything up manually, our init script can spawn a brand new full-stack application instantly:
```bash
npx @unciatech/file-manager init my-media-app
```
*It will ask if you want Next.js or Vite (React), install Tailwind, install the package, and set everything up including styles!*

**(CRITICAL) Import the styles:**
The init script includes this automatically, but if you are installing manually, add this import to your root layout / entry file:
```ts
import '@unciatech/file-manager/styles';
```

### Step 2: Create your Custom API Provider

The file manager is completely agnostic to your backend database. You simply need to create a class that implements the `IFileManagerProvider` interface.

Here is an example of what your custom provider might look like, making real API calls to your backend using `fetch`:

```typescript
// lib/my-api-provider.ts
import { 
  IFileManagerProvider, 
  FolderId, 
  FileUploadInput 
} from "@/types/file-manager"; // Or "@unciatech/file-manager" for external users

export class MyCustomApiProvider implements IFileManagerProvider {
  private baseUrl = "https://api.mybackend.com/v1";

  // Example 1: Fetching folders from your Real API
  async getFolders(folderId: FolderId, page = 1, limit = 24) {
    const parentQuery = folderId ? `&parentId=${folderId}` : "&isRoot=true";
    
    // Simulate real API Call
    const res = await fetch(`${this.baseUrl}/folders?page=${page}&limit=${limit}${parentQuery}`);
    
    if (!res.ok) throw new Error("Failed to fetch folders");
    
    const data = await res.json();
    
    return {
      folders: data.folders, // Array of Folder objects matching our interface
      pagination: data.pagination // { currentPage, totalPages, totalFiles, filesPerPage }
    };
  }

  // Example 2: Uploading files via multipart/form-data
  async uploadFiles(filesInput: FileUploadInput[], folderId?: FolderId) {
    const formData = new FormData();
    if (folderId) formData.append("folderId", String(folderId));
    
    filesInput.forEach(({ file }) => {
      formData.append("files", file);
    });

    const res = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData
    });

    return res.json(); // Returns array of FileMetaData
  }

  // ... Implement the remaining interface methods (getFiles, renameFolder, bulkMove, etc.)
}
```

> **💡 Pro Tip - The Mock Provider:**
> If you are just prototyping and don't have a backend ready yet, you can skip Step 2 entirely! We included a fully functional `MockProvider` that fakes network latency and stores data in memory. Just import it and use it right away to see the UI in action.

// app/media/page.tsx
import { FileManager, MockProvider } from "@unciatech/file-manager";
import "@unciatech/file-manager/styles";

// **Tailwind v4 Users:** Make sure your `globals.css` or `index.css` includes:
// @source "../node_modules/@unciatech/file-manager";
// OR import your real provider
import { MyCustomApiProvider } from "@/lib/my-api-provider"; 

export default function MediaLibraryPage() {
  // Instantiate the provider (Real or Mock)
  const apiProvider = new MockProvider(); 

  return (
    <div className="h-screen w-full">
      <FileManagerProvider
        mode="page"
        selectionMode="multiple"
        allowedFileTypes={["images", "videos", "audios", "files"]}
        provider={apiProvider}
      >
        <FileManager basePath="/media" />
      </FileManagerProvider>
    </div>
  );
}
```

---

## 🔀 Framework Router Integration

By default, the file manager uses the browser's native `history.pushState` API for navigation — no full page reloads, no dependencies. This works out of the box in any bare React app (Vite, CRA, etc.).

However, if your app already has its own router (React Router, Next.js, TanStack Router), you should pass the `onNavigate` prop so the file manager delegates all navigation to your router instead of calling `history.pushState` directly. This keeps your router's internal state in sync.

### React Router v6

```tsx
import { useNavigate } from 'react-router-dom';

function MyPage() {
  const navigate = useNavigate();

  return (
    <FileManager
      provider={provider}
      allowedFileTypes={['images', 'videos']}
      onNavigate={(url) => navigate(url)}
      basePath="/media"
    />
  );
}
```

### Next.js (App Router)

```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function MediaPage() {
  const router = useRouter();

  return (
    <FileManager
      provider={provider}
      allowedFileTypes={['images', 'videos']}
      onNavigate={(url) => router.push(url)}
      basePath="/media"
    />
  );
}
```

### TanStack Router

```tsx
import { useRouter } from '@tanstack/react-router';

function MyPage() {
  const router = useRouter();

  return (
    <FileManager
      provider={provider}
      allowedFileTypes={['images', 'videos']}
      onNavigate={(url) => router.navigate({ href: url })}
      basePath="/media"
    />
  );
}
```

```tsx
<FileManager
  provider={provider}
  allowedFileTypes={['images', 'videos']}
  basePath="/media"
  // no onNavigate needed
/>
```

## 🎮 Playgrounds & Reference Implementations

For complete, working examples of how to integrate the File Manager into different application architectures, check out the [playgrounds](file:///Users/avi/Developer/Uncia/file-manager/playgrounds) directory. These are fully functional Vite-based projects that demonstrate real-world integration patterns.

- **[React Router v7 Playground](file:///Users/avi/Developer/Uncia/file-manager/playgrounds/test-react-router)**: Demonstrates integration with `react-router-dom` using `useNavigate` and route-based navigation.
- **[TanStack Router Playground](file:///Users/avi/Developer/Uncia/file-manager/playgrounds/test-tanstack)**: Demonstrates integration with `@tanstack/react-router` using the `router` object and `href` based navigation.

These playgrounds are a great starting point for seeing how to handle:
- Styling with Tailwind CSS v4
- Mapping `onNavigate` to your framework's router
- Using the `MockProvider` for rapid prototyping
- Configuring `FileManagerModal` v/s full-page `FileManager`

---

> [!NOTE]
> The `onNavigate` prop is also available on `<FileManagerModal>` for modal mode.

---

## 💾 Database Schema Design

Because this application relies heavily on tree structures (Folders inside Folders) and varied JSON metadata (Video durations vs Document page counts), using a relational database with JSONB support (like PostgreSQL) is highly recommended. 

Below are production-ready schema examples using **Prisma** and **Drizzle ORM**.

### Option A: Prisma Schema (PostgreSQL/MySQL)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql"
  url      = env("DATABASE_URL")
}

model Folder {
  id          Int       @id @default(autoincrement())
  name        String
  
  // Self-referencing relationship for infinite folder depth
  parentId    Int?      
  parent      Folder?   @relation("FolderHierarchy", fields: [parentId], references: [id])
  children    Folder[]  @relation("FolderHierarchy")
  
  // Cached counts for fast UI rendering
  folderCount Int       @default(0)
  fileCount   Int       @default(0)
  
  // Path optimization
  pathId      Int       @default(0)
  path        String?   // e.g. "/1/5/12"
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  files       File[]

  @@index([parentId])
}

model File {
  id              Int       @id @default(autoincrement())
  name            String
  
  // Foreign Key to Folder
  folderId        Int?
  folder          Folder?   @relation(fields: [folderId], references: [id], onDelete: Cascade)
  folderPath      String?
  
  // Core Asset Data
  size            Int
  url             String
  previewUrl      String?   // Lightweight thumbnail URL
  mime            String    // e.g. "image/jpeg", "video/mp4"
  ext             String?
  hash            String?
  
  // Common Media Details
  alternativeText String?
  caption         String?
  width           Int?
  height          Int?
  
  // JSONB storage for flexible metadata 
  // (e.g., formats: { thumbnail: {...}, small: {...} })
  formats         Json?     
  // (e.g., metaData: { duration: 120, bitrate: 320, pageCount: 15 })
  metaData        Json?     
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([folderId])
}
```


### Option B: Drizzle ORM Schema (PostgreSQL)

If you prefer a lighter, TypeScript-first approach using Drizzle:

```typescript
import { pgTable, serial, varchar, integer, timestamp, jsonb, text } from "drizzle-orm/pg-core";

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  
  // Nullable parentId allows root-level folders
  parentId: integer("parent_id"), // Needs recursive FK setup in relations
  
  folderCount: integer("folder_count").default(0),
  fileCount: integer("file_count").default(0),
  
  pathId: integer("path_id").default(0),
  path: varchar("path", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "cascade" }),
  folderPath: varchar("folder_path", { length: 255 }),
  
  size: integer("size").notNull(),
  url: text("url").notNull(),
  previewUrl: text("preview_url"),
  mime: varchar("mime", { length: 100 }).notNull(),
  ext: varchar("ext", { length: 20 }),
  hash: varchar("hash", { length: 255 }),
  
  alternativeText: text("alternative_text"),
  caption: text("caption"),
  width: integer("width"),
  height: integer("height"),
  
  // JSONB is perfect for storing our dynamic metadata & responsive formats
  formats: jsonb("formats"),
  metaData: jsonb("meta_data"), 
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```
