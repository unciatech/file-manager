"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { FileManagerPageProps } from "@/types/file-manager";
import {
  CreateFolderAction,
  HeaderNavigation,
  MoveAction,
  SearchAction,
  UploadFileAction,
} from "./layout";

export function FileManager(props: FileManagerPageProps) {
  return (
    <FileManagerComposition.Page {...props}>
      <div className="flex h-full relative pb-12 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex w-full flex-col">
          <FileManagerComposition.Header>
            <div className="flex w-full justify-between gap-2">
              <HeaderNavigation />
              <div className="flex gap-2">
                <MoveAction />
                <UploadFileAction />
                <CreateFolderAction />
                <SearchAction />
              </div>
            </div>
          </FileManagerComposition.Header>
          <FileManagerComposition.Content />
          <FileManagerComposition.Footer />
        </div>

        <FileManagerComposition.Overlays />
      </div>
    </FileManagerComposition.Page>
  );
}
