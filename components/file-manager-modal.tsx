"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileManagerModalProps } from "@/types/file-manager";
import { useFileManager } from "@/context/file-manager-context";

export function FileManagerModal({
  open,
  onClose,
  ...props
}: FileManagerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0" variant="fullscreen">
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">Select Files</DialogTitle>
        </DialogHeader>
        
        <FileManagerComposition.Modal {...props} onClose={onClose}>
          <div className="flex flex-col h-full"> 
            <ScrollArea className="text-sm flex-1 my-3 ps-6 pe-5 me-1">
                <div className="flex h-full relative pb-12 overflow-hidden">
                  <div className="flex-1 flex flex-col">
                    <FileManagerComposition.Header />
                    <FileManagerComposition.Content />
                    <FileManagerComposition.Footer />
                  </div>
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
