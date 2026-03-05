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
      className='border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 active:scale-95 transition-all duration-200'
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
      className="border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 active:scale-95 transition-all duration-200"
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
      className={`border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 active:scale-95 transition-all duration-200
      ${copied
          ? 'text-green-700 dark:text-green-400 border-green-400 dark:border-green-700 bg-green-100 dark:bg-green-900/40 font-bold'
          : 'hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/40'
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
      className="border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/40 active:scale-95 transition-all duration-200"
      title="Fullscreen"
    >
      <FullscreenIcon className="size-5" strokeWidth={1} />
    </Button>
  );
}
