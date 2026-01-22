"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileManagerModalProps, SELECTION_MODE } from "@/types/file-manager";
import { useFileManager } from "@/context/file-manager-context";
import { BulkActionBar } from "./layout";

export function FileManagerModal({
  open,
  onClose,
  ...props
}: FileManagerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0" variant="fullscreen">
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">
            Select {props.fileSelectionMode === SELECTION_MODE.SINGLE ? "Single File" : "Multiple Files"} 
          </DialogTitle>
          <DialogDescription className="sr-only">
            Browse and select files from your media library
          </DialogDescription>
        </DialogHeader>

        <FileManagerComposition.Modal {...props} onClose={onClose}>
          <div className="flex flex-col h-[calc(100vh-6rem)]">
            <ScrollArea className="text-sm flex-1 py-3">
              <div className="flex flex-col min-h-full">
                <FileManagerComposition.Header>
                  <BulkActionBar />
                </FileManagerComposition.Header>
                <FileManagerComposition.Content />
                <FileManagerComposition.Footer />
                <FileManagerComposition.Overlays />
              </div>
            </ScrollArea>

            <FileManagerModalFooter onClose={onClose} />
          </div>
        </FileManagerComposition.Modal>
      </DialogContent>
    </Dialog>
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
    <DialogFooter className="px-6 py-4 border-t border-border">
      <DialogClose asChild>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </DialogClose>
      <Button
        type="button"
        onClick={handleSelect}
        disabled={selectedFiles.length === 0}
      >
        Select {selectedFiles.length > 0 && `(${selectedFiles.length})`}
      </Button>
    </DialogFooter>
  );
}
