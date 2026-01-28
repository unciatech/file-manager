"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileManagerModalProps } from "@/types/file-manager";
import { useFileManager } from "@/context/file-manager-context";
import { BulkActionsStatic, HeaderNavigation } from "./layout";
import { UnifiedGrid } from "./grid/unified-grid";
import { ModalResponsiveHeaderActions } from "./layout/header-actions-responsive";
import { CrossIcon } from "./icons";

export function FileManagerModal({
  open,
  onClose,
  ...props
}: FileManagerModalProps) {
  return (
    <FileManagerComposition.Modal {...props} onClose={onClose}>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="p-0" variant="fullscreen" showCloseButton={false}>
          <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
            <DialogTitle className="px-6 text-base">
              <div className="flex w-full justify-between gap-2">
                <HeaderNavigation />
                <ModalResponsiveHeaderActions />
                <Button
                  variant="outline"
                  size="icon"
                  radius="full"
                  onClick={onClose}
                  className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-linear-to-b hover:text-red-600 hover:border-red-200 hover:from-red-50 hover:to-red-100 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
                >
                  <CrossIcon className="size-5" />
                  <span className="hidden">Close</span>
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Browse and select files from your media library
            </DialogDescription>
          </DialogHeader>



          <div className="overflow-y-auto flex-1 pb-4">
            <UnifiedGrid />
            <FileManagerComposition.Footer />
            <FileManagerComposition.Overlays />
          </div>

          <FileManagerModalFooter onClose={onClose} />
        </DialogContent>
      </Dialog>
    </FileManagerComposition.Modal>
  );
}

function FileManagerModalFooter({ onClose }: { onClose: () => void }) {
  const { selectedFiles, onFilesSelected } = useFileManager();

  const handleSelect = () => {
    if (onFilesSelected && selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      onClose();
    }
  };

  return (
    <DialogFooter className="px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2">
      <BulkActionsStatic />
      <DialogClose asChild>
        <Button type="button" variant="outline" onClick={onClose} radius="full" className='w-full md:w-auto mr-0'>
          Cancel
        </Button>
      </DialogClose>
      <Button
        type="button"
        onClick={handleSelect}
        disabled={selectedFiles.length === 0}
        radius="full" className='w-full md:w-auto'
      >
        Select {selectedFiles.length > 0 && `(${selectedFiles.length})`}
      </Button>
    </DialogFooter>
  );
}
