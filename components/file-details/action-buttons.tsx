'use client';

import { FileMetaData } from '@/types/file-manager';
import { Download, Link2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DownloadIcon, FullscreenIcon, LinkIcon, TrashIcon } from '../icons';

interface ActionButtonsProps {
  file: FileMetaData;
  onDelete?: () => void;
  onDownload?: () => void;
  showFullscreen?: boolean;
  onFullscreen?: () => void;
}

export function ActionButtons({
  file,
  onDelete,
  onDownload,
  showFullscreen = false,
  onFullscreen,
}: ActionButtonsProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(file.url);
    toast.success('Link Copied', {
      description: 'File URL copied to clipboard',
    });
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
      toast.success('Download Started', {
        description: `Downloading ${file.name}`,
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onDelete}
        className="h-9 w-9"
        title="Delete"
      >
        <TrashIcon className="size-5.5 text-gray-700" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleDownload}
        className="h-9 w-9"
        title="Download"
      >
        <DownloadIcon className="size-5.5 text-gray-900" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        className="h-9 w-9"
        title="Copy Link"
      >
        <LinkIcon className="size-5.5 text-gray-600"  strokeWidth={2.5}/>
      </Button>

      {showFullscreen && onFullscreen && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFullscreen}
          className="h-9 w-9"
          title="Fullscreen"
        >
          <FullscreenIcon className="size-5.5 text-gray-600" stroke='currentColor' strokeWidth={1}/>
        </Button>
      )}
    </div>
  );
}
