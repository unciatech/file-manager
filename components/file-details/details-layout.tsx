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
import { CloseButton } from '../ui/close-button';

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
      <DialogContent className="p-0 max-w-6xl w-full mx-auto flex flex-col" variant="fullscreen" showCloseButton={false}>
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">
            <div className="flex w-full justify-between gap-2">
              <span>{title}</span>
              <CloseButton onClick={() => onClose()} />
            </div>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <ScrollArea className="flex-1 h-0">
          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full">
            {/* Preview Section - Left side on desktop, top on mobile */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-700">
              {previewSection}
            </div>

            {/* Metadata Section - Right side on desktop, bottom on mobile */}
            <div className="p-6 overflow-y-auto ">
              {metadataSection}
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
