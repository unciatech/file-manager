'use client';

import { useState } from 'react';
import { useFileManager } from '@/context/file-manager-context';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  useFileUpload,
  type EntityId,
} from '@/hooks/use-file-upload';
import { useUploadSimulation, type FileUploadItem } from '@/hooks/use-upload-simulation';
import {
  CloudUpload,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  RefreshCwIcon,
  Trash2,
  TriangleAlert,
  Upload,
  VideoIcon,
  XIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFileSize } from '@/lib/file-size';
import { fileTypesToAccept, getFileTypeFromMime, getFileTypesDescription } from '@/lib/file-type-utils';
import { FileUploadInput } from '@/types/provider';
import { middleTruncate } from '@/lib/truncate-name';
import { Icons } from '@/lib/icons';
import UploadCloudIcon from '../icons/upload-cloud';
import { CrossIcon } from '../icons';



export function UploadModal() {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadFiles,
    currentFolder,
    allowedFileTypes,
  } = useFileManager();

  const maxFiles = 50;
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  // Use allowedFileTypes for upload restrictions (applies to both page and modal mode)
  const acceptString = fileTypesToAccept(allowedFileTypes);
  const fileTypesDescription = getFileTypesDescription(allowedFileTypes);

  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);

  const [
    { isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept: acceptString,
    multiple: true,
    onFilesChange: (newFiles) => {
      // Convert to upload items when files change
      const newUploadItems = newFiles.map((file) => {
        // Check if this file already exists in uploadItems
        const existingFile = uploadItems.find((existing) => existing.id === file.id);

        if (existingFile) {
          // Preserve existing file status and progress
          return {
            ...existingFile,
            ...file,
          };
        } else {
          // New file - set to uploading
          return {
            ...file,
            progress: 0,
            status: 'uploading' as const,
          };
        }
      });

      setUploadItems(newUploadItems);
    },
  });

  // Use custom hook for upload simulation instead of inline useEffect
  useUploadSimulation(uploadItems, setUploadItems, true, 0.05);

  const removeUploadFile = (fileId: EntityId) => {
    removeFile(fileId);
  };

  const retryUpload = (fileId: EntityId) => {
    setUploadItems((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, progress: 0, status: 'uploading' as const, error: undefined } : file,
      ),
    );
  };

  const handleUpload = () => {
    // Filter only completed files
    const completedFiles = uploadItems.filter((item) => item.status === 'completed');
    
    if (completedFiles.length > 0) {
      // Convert to FileUploadInput format
      const fileInputs: FileUploadInput[] = completedFiles.map((item) => ({
        name: item.file.name,
        size: item.file.size,
        type: getFileTypeFromMime(item.file.type, item.file.name.split('.').pop()),
        lastModified: item.file instanceof File ? item.file.lastModified : Date.now(),
        file: item.file as File,
        metadata: {},
        videoSource: undefined,
      }));

      uploadFiles(fileInputs);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsUploadModalOpen(false);
    clearFiles();
    setUploadItems([]);
  };

  const getFileIcon = (file: File) => {
    const fileType = getFileTypeFromMime(file.type);
    return <Icons type={fileType} />;
  };

  const completedCount = uploadItems.filter((item) => item.status === 'completed').length;
  const uploadingCount = uploadItems.filter((item) => item.status === 'uploading').length;
  const canUpload = completedCount > 0 && uploadingCount === 0;

  return (
    <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
      <DialogContent className="p-0 max-w-4xl max-h-[80vh] flex flex-col" variant="default" showCloseButton={false}>
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">
            <div className="flex w-full items-center justify-between gap-2">
            <span>Upload Files</span>
              <Button
                variant="outline"
                size="icon"
                radius="full"
                onClick={() => setIsUploadModalOpen(false)}
                className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-linear-to-b hover:text-red-600 hover:border-red-200 hover:from-red-50 hover:to-red-100 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
              >
            <CrossIcon className="size-5" />
            <span className="hidden">Close</span>
          </Button>
        </div>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Upload Area */}
          <div
            className={cn(
              'relative rounded-lg border-dashed border-[2.5px]  bg-gray-100 border-gray-300 px-6 py-16 text-center transition-colors mb-4',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input {...getInputProps()} className="sr-only" />

            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                  isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
                )}
              >
                <UploadCloudIcon className='mb-3 text-zinc-400 dark:text-zinc-500'/>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drop files here or{' '}
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="cursor-pointer text-primary underline-offset-4 hover:underline"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  {fileTypesDescription} • Max size: {getFileSize(maxSize)} • Max files: {maxFiles}
                </p>
              </div>
            </div>
          </div>

          {/* Files Grid */}
          {uploadItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Files ({uploadItems.length}) • Completed: {completedCount}
                </h3>
                <div className="flex gap-2">
                  <Button onClick={openFileDialog} variant="outline" size="sm">
                    <CloudUpload className="size-4" />
                    Add files
                  </Button>
                  <Button onClick={clearFiles} variant="outline" size="sm">
                    <Trash2 className="size-4" />
                    Remove all
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {uploadItems.map((fileItem) => (
                  <div key={fileItem.id} className="relative group">
                    {/* Remove button */}
                    <Button
                      onClick={() => removeUploadFile(fileItem.id)}
                      variant="outline"
                      size="icon"
                      className="absolute -end-2 -top-2 z-10 size-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <XIcon className="size-3" />
                    </Button>

                    {/* Wrapper */}
                    <div className="relative overflow-hidden rounded-lg border bg-card transition-colors">
                      {/* Image preview or file icon area */}
                      <div className="relative aspect-square bg-muted border-b border-border">
                        {fileItem.file instanceof File && fileItem.file.type.startsWith('image/') && fileItem.preview ? (
                          <>
                            {/* Image cover */}
                            <img
                              src={fileItem.preview}
                              alt={fileItem.file.name}
                              className="h-full w-full object-cover"
                            />
                            {/* Progress overlay for uploading images */}
                            {fileItem.status === 'uploading' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="relative">
                                  <svg className="size-12 -rotate-90" viewBox="0 0 48 48">
                                    <circle
                                      cx="24"
                                      cy="24"
                                      r="20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      className="text-muted/60"
                                    />
                                    <circle
                                      cx="24"
                                      cy="24"
                                      r="20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeDasharray={`${2 * Math.PI * 20}`}
                                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - fileItem.progress / 100)}`}
                                      className="text-white transition-all duration-300"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          /* File icon area for non-images */
                          <div className="flex h-full items-center justify-center text-muted-foreground/80">
                            {fileItem.status === 'uploading' ? (
                              <div className="relative">
                                <svg className="size-12 -rotate-90" viewBox="0 0 48 48">
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="text-muted-foreground/20"
                                  />
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={`${2 * Math.PI * 20}`}
                                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - fileItem.progress / 100)}`}
                                    className="text-primary transition-all duration-300"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {fileItem.file instanceof File && getFileIcon(fileItem.file)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-4xl">
                                {fileItem.file instanceof File && getFileIcon(fileItem.file)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* File info footer */}
                      <div className="p-3">
                        <div className="space-y-1">
                          <p className="truncate text-sm font-medium">{fileItem.file.name}</p>
                          <div className="relative flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">{getFileSize(fileItem.file.size)}</span>

                            {fileItem.status === 'error' && fileItem.error && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => retryUpload(fileItem.id)}
                                    variant="ghost"
                                    size="icon"
                                    className="absolute end-0 -top-1.25 size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <RefreshCwIcon className="size-3 opacity-100" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Upload failed. Retry</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive" appearance="light" className="mt-5">
              <AlertIcon>
                <TriangleAlert />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>File upload error(s)</AlertTitle>
                <AlertDescription>
                  {errors.map((error, index) => (
                    <p key={index} className="last:mb-0">
                      {error}
                    </p>
                  ))}
                </AlertDescription>
              </AlertContent>
            </Alert>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ">
          <DialogClose asChild>
            <Button type="button" radius="full" variant="outline" onClick={handleClose} className='w-full md:w-auto'>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" radius="full" onClick={handleUpload} disabled={!canUpload} className='w-full md:w-auto'>
            Upload {completedCount > 0 && `(${completedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}