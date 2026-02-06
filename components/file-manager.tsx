"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { FileManagerPageProps } from "@/types/file-manager";
import { BulkActionsFloating } from "./layout/bulk-actions-bar";
import { HeaderNavigation } from "./layout/header-navigation";
import { ResponsiveHeaderActions } from "./layout/header-actions-responsive";
import { UnifiedGrid } from "./grid/unified-grid";
import { FileManagerErrorBoundary } from "./error-boundary";
import { KeyboardShortcuts } from "./keyboard-shortcuts";

export function FileManager(props: FileManagerPageProps) {
  return (
    <FileManagerErrorBoundary>
      <FileManagerComposition.Page {...props}>
        {/* Keyboard shortcuts - must be inside provider */}
        <KeyboardShortcuts />
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
            <FileManagerComposition.Footer className="pt-6 pb-10" />
          </div>

          <FileManagerComposition.Overlays />
        </div>
      </FileManagerComposition.Page>
    </FileManagerErrorBoundary>
  );
}
