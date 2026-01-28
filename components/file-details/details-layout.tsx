'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { CrossIcon } from '../icons';

interface DetailsLayoutProps {
  title: string;
  open: boolean;
  onClose: () => void;
  previewSection: ReactNode;
  metadataSection: ReactNode;
  footer: ReactNode;
}

export function DetailsLayout({
  title,
  open,
  onClose,
  previewSection,
  metadataSection,
  footer,
}: DetailsLayoutProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} >
      <DialogContent className="p-0 max-w-6xl max-h-[90vh] flex flex-col" variant="default" showCloseButton={false}>


        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">
            <div className="flex w-full justify-between gap-2">
            <span>{title}</span>
              <Button
                variant="outline"
                size="icon"
                radius="full"
                onClick={() => onClose()}
                className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-linear-to-b hover:text-red-600 hover:border-red-200 hover:from-red-50 hover:to-red-100 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
              >
            <CrossIcon className="size-5" />
            <span className="hidden">Close</span>
          </Button>
        </div>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          {/* Content */}
          <div className="flex-1">
            <div className="h-full flex flex-col lg:flex-row">
              {/* Preview Section - Left side on desktop, top on mobile */}
              <div className="lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r overflow-y-auto">
                {previewSection}
              </div>

              {/* Metadata Section - Right side on desktop, bottom on mobile */}
              <div className="lg:w-1/2 p-6 overflow-y-auto">
                {metadataSection}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border">
          {footer}
        </DialogFooter>



      </DialogContent>
    </Dialog>
  );
}
