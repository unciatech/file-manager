# 🗂️ File Manager

A robust, production-ready React / Next.js file management system designed to mirror the capabilities of professional asset managers (like Google Drive, macOS Finder, or Strapi Media Library).

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
- **Framework**: Next.js / React
- **Styling**: Tailwind CSS
- **Icons**: Custom SVG Icons
- **Notifications**: Sonner

> [!WARNING]
> This library is currently in **BETA**. Please report any bugs or feature requests on the GitHub issues page.

## 🚀 How to Install and Use in Your Project

If you want to integrate this File Manager into your own Next.js or React application, follow this step-by-step guide.

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

**(CRITICAL) Configure Tailwind CSS:**
Because this library uses Tailwind CSS, you MUST tell your Tailwind compiler to scan the library components for utility classes, otherwise it will render with zero styles!

**For Tailwind v3 (`tailwind.config.ts`):**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Your existing paths...
    "./node_modules/@unciatech/file-manager/dist/**/*.js",
    "./node_modules/@unciatech/file-manager/dist/**/*.mjs",
  ],
  // ...
};
export default config;
```

**For Tailwind v4 (`globals.css`):**
```css
@import "tailwindcss";
@source "../node_modules/@unciatech/file-manager/dist";
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
import { FileManagerProvider } from "@/context/file-manager-context";
import { FileManager } from "@/components/file-manager";
import { MockProvider } from "@/providers/mock-provider";

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
        <FileManager />
      </FileManagerProvider>
    </div>
  );
}
```

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
