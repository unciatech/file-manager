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
  readonly title: string;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly previewSection: ReactNode;
  readonly metadataSection: ReactNode;
  readonly footer: ReactNode;
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="p-0 max-w-6xl w-full m-auto h-[80vh] flex flex-col overflow-hidden"
        variant="fullscreen"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="px-6 text-base">
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate">{title}</span>
              <CloseButton onClick={onClose} />
            </div>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

            {/* Preview */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-700 overflow-auto">
              {previewSection}
            </div>

            {/* Metadata */}
            <div className="p-6 overflow-auto">
              {metadataSection}
            </div>

          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
