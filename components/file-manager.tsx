"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { FileManagerPageProps } from "@/types/file-manager";
import {
  BulkActionsFloating,
  HeaderNavigation,
  ResponsiveHeaderActions,
} from "./layout";
import { UnifiedGrid } from "./grid/unified-grid";

export function FileManager(props: FileManagerPageProps) {
  return (
    <FileManagerComposition.Page {...props}>
      <div className="flex h-full relative pb-12 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex w-full flex-col">
          <FileManagerComposition.Header>
            <div className="flex w-full justify-between gap-2">
              <HeaderNavigation />
              <ResponsiveHeaderActions />
            </div>
          </FileManagerComposition.Header>
          <BulkActionsFloating className="-mb-1" />
          <UnifiedGrid />
          <FileManagerComposition.Footer className="py-6" />
        </div>

        <FileManagerComposition.Overlays />
      </div>
    </FileManagerComposition.Page>
  );
}
