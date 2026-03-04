'use client';

import { FileMetaData } from '@/types/file-manager';
import { Loader2Icon } from '../icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DownloadIcon, FullscreenIcon, LinkIcon, TrashIcon } from '../icons';
import { useState } from 'react';
import { useFileManager } from '@/context/file-manager-context';
import CheckIcon from '../icons/check';
import { middleTruncate } from '@/lib/truncate-name';

// Individual file action button components - composable and reusable

interface FileButtonProps {
  file: FileMetaData;
}

export function FileDeleteButton({ file }: FileButtonProps) {
  const { provider, setFileDetailsModalFile, refreshData } = useFileManager();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Call provider's delete method directly with this specific file
      await provider.deleteFiles([file.id]);
      
      // Refresh the file list
      await refreshData();
      
      // Close the details modal after successful deletion
      setFileDetailsModalFile(null);
      
      toast.success('File Deleted', {
        description: `${middleTruncate(file.name, 20)} has been deleted`,
      });
    } catch (error) {
      toast.error('Delete failed');
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      radius="full"
      title="Delete"
      className='border-gray-200 bg-white hover:text-red-600 hover:border-red-200 hover:bg-red-50 active:scale-95 transition-transform'
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? (
        <Loader2Icon className="size-5 animate-spin" />
      ) : (
        <TrashIcon className="size-5" />
      )}
    </Button>
  );
}

export function FileDownloadButton({ file }: FileButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Default download behavior
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
      toast.success('Download Started', {
        description: `Downloading ${middleTruncate(file.name, 20)}`,
      });
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      radius="full"
      onClick={handleDownload}
      className="border-gray-200 bg-white hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition-transform"
      title="Download"
      disabled={downloading}
    >
      {downloading ? (
        <Loader2Icon className="size-5 animate-spin" />
      ) : (
        <DownloadIcon className="size-5" strokeWidth={2.5} />
      )}
    </Button>
  );
}

export function FileCopyLinkButton({ file }: FileButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(file.url);
      setCopied(true);
      toast.success('Link Copied', {
        description: 'File URL copied to clipboard',
      });
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      radius="full"
      onClick={handleCopyLink}
      className={`border-gray-200 bg-white active:scale-95 transition-all ${
        copied 
          ? 'text-green-700 border-green-400 bg-green-100 font-bold' 
          : 'hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50'
      }`}
      title="Copy Link"
      disabled={copied}
    >
      {copied ? (
        <CheckIcon className="size-5 animate-in zoom-in duration-200" strokeWidth={3} />
      ) : (
        <LinkIcon className="size-5" strokeWidth={2.5} />
      )}
    </Button>
  );
}

interface FileFullscreenButtonProps {
  file: FileMetaData;
  onFullscreen: () => void;
}

export function FileFullscreenButton({ file, onFullscreen }: FileFullscreenButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      radius="full"
      onClick={onFullscreen}
      className="border-gray-200 bg-white hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 active:scale-95 transition-transform"
      title="Fullscreen"
    >
      <FullscreenIcon className="size-5" strokeWidth={1} />
    </Button>
  );
}
