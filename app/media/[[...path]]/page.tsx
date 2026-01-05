"use client";

import { FileManager } from "@/components/file-manager";
import { MockProvider } from "@/providers/mock-provider";
import { IFileManagerProvider } from "@/types/provider";
import { useState } from "react";

export default function MediaPage() {
  const [provider] = useState<IFileManagerProvider>(() => new MockProvider());

  return (
    <FileManager
      mode="page"
      selectionMode="multiple"
      allowedFileTypes={["image", "video", "audio", "document", "other"]}
      viewMode="grid"
      initialFolderId={null}
      provider={provider}
    />
  );
}
