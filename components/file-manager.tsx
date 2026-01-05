"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { Button } from "@/components/ui/button";
import DialogContent, { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileManagerProps } from "@/types/file-manager";

export function FileManager(props: FileManagerProps) {
  const content = (
    <FileManagerComposition.Root {...props}>
      <div className="flex h-full relative pb-12 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <FileManagerComposition.Header />
          <FileManagerComposition.Content />
          <FileManagerComposition.Footer />
        </div>

        <FileManagerComposition.Overlays />
      </div>
    </FileManagerComposition.Root>
  );

  if (props.mode === "modal") {
    return (
      <Dialog open={true} onOpenChange={props.onClose}>
        <DialogContent className="p-0" variant="fullscreen">
          <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
            <DialogTitle className="px-6 text-base">
              Media
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="text-sm h-full my-3 ps-6 pe-5 me-1">
            {content}
          </ScrollArea>
          <DialogFooter className="px-6 py-4 border-t border-border">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button">Ok</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return content;
}
