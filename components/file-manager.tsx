"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { FileManagerPageProps } from "@/types/file-manager";

export function FileManager(props: FileManagerPageProps) {
  return (
    <FileManagerComposition.Page {...props}>
      <div className="flex h-full relative pb-12 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <FileManagerComposition.Header />
          <FileManagerComposition.Content />
          <FileManagerComposition.Footer />
        </div>

        <FileManagerComposition.Overlays />
      </div>
    </FileManagerComposition.Page>
  );
}
