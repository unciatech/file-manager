'use client';

import { FileMetaData } from '@/types/file-manager';
import { Download, Link2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
        <Trash2 className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleDownload}
        className="h-9 w-9"
        title="Download"
      >
        <Download className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        className="h-9 w-9"
        title="Copy Link"
      >
        <Link2 className="h-4 w-4" />
      </Button>

      {showFullscreen && onFullscreen && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFullscreen}
          className="h-9 w-9"
          title="Fullscreen"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}
