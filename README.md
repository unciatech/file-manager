# 🗂️ File Manager

A robust, production-ready file management component for **React applications**.

It works with **Vite, Next.js, Remix, CRA**, and other React frameworks.

The library supports deep folder hierarchies, drag-and-drop uploads, metadata management for multiple file types (Images, Videos, Audio, Documents), and a responsive grid interface optimized for large media libraries.

---

# 🌟 Key Features

* **Dual Operating Modes** - Use as a full-page media library or as a picker modal.
* **Unified Grid View** - Responsive layout that intelligently renders thumbnails, icons, and metadata.
* **Nested Folder Structure** - Infinite folder depth with smooth paginated fetching.
* **Provider Agnostic** - Integrates with any backend through the `IFileManagerProvider` interface.
* **Bulk Actions** - Select and move/delete multiple files or folders.
* **Optimistic UI Updates** - Instant UI feedback with background synchronization.
* **Error Boundary Protection** - Built-in `<FileManagerErrorBoundary>` prevents crashes.

---

# 📦 Installation

Install the file manager and required utilities:

```bash
npm install @unciatech/file-manager class-variance-authority clsx tailwind-merge
```

> ⚠️ This library relies on **Tailwind CSS** for styling.
> If your project does not use Tailwind yet, install it in Step 3.

---

# ⚡ Quick Start

You can instantly test the UI using the built-in `MockProvider`.

```tsx
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
```

---

# 🛠 Setup & Requirements

## Step 1 - Install the Library

```bash
npm install @unciatech/file-manager class-variance-authority clsx tailwind-merge
```

---

## Step 2 - Import Styles

Import the file manager styles in your root file.

### Vite / React

```ts
import "@unciatech/file-manager/styles"
```

Place this inside:

```
main.tsx or App.tsx
```

### Next.js

Import inside your root layout:

```ts
import "@unciatech/file-manager/styles"
```

Place this in:

```
app/layout.tsx
```

---

# Step 3 - Configure Tailwind CSS

This library relies heavily on **Tailwind CSS**.

If your project **already uses Tailwind**, follow Option A.
If **not**, follow Option B.

---

## Option A - Project Already Uses Tailwind

### Tailwind v4

Add this to your main CSS file (`globals.css` or `index.css`):

```css
@import "tailwindcss";
@import "@unciatech/file-manager/styles";

@source "../node_modules/@unciatech/file-manager";
```

---

### Tailwind v3

Update your `tailwind.config.ts`:

```ts
content: [
  "./node_modules/@unciatech/file-manager/dist/**/*.{js,ts,jsx,tsx}",
]
```

---

## Option B - Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.ts`:

```ts
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@unciatech/file-manager/dist/**/*.{js,ts,jsx,tsx}",
]
```

Add to `index.css` or `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "@unciatech/file-manager/styles";
```

---

# Step 4 - Create Your Custom API Provider

> 💡 **Pro Tip - The Mock Provider**
> If you are just prototyping and don't have a backend ready yet, you can skip this step entirely.
>
> The library includes a fully functional `MockProvider` that simulates network latency and stores data in memory.

Example:

```tsx
import { FileManager, MockProvider } from "@unciatech/file-manager"

const provider = new MockProvider()

<FileManager provider={provider} basePath="/" viewMode="grid" />
```

---

### Using Your Own Backend

The file manager is **backend-agnostic**.

Create a class implementing `IFileManagerProvider`.

```ts
import {
  IFileManagerProvider,
  FolderId,
  FileUploadInput,
} from "@unciatech/file-manager"

export class MyCustomApiProvider implements IFileManagerProvider {
  private baseUrl = "https://api.mybackend.com/v1"

  async getFolders(folderId: FolderId, page = 1, limit = 24) {
    const parentQuery = folderId ? `&parentId=${folderId}` : "&isRoot=true"

    const res = await fetch(
      `${this.baseUrl}/folders?page=${page}&limit=${limit}${parentQuery}`
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

    const res = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      body: formData,
    })

    return res.json()
  }
}
```

---

# 🔀 Router Integration

By default the file manager uses `history.pushState`.

If your app uses a router, pass the `onNavigate` prop.

---

# Example - React Router

### Install

```bash
npm install react-router-dom
```

### main.tsx

```tsx
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
```

---

# Example - TanStack Router

### Install

```bash
npm install @tanstack/react-router
```

### main.tsx

```tsx
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
```

---

# 🗄️ Database Schema (Optional)

Using **PostgreSQL** with JSON support is recommended.

Example Prisma schema:

```prisma
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
```

---

# ⚠️ Status

> This library is currently in **BETA**.

Please report bugs or feature requests through **GitHub Issues**.

---

# License

MIT
