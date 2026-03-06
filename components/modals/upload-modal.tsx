'use client';

import { useState } from 'react';
import { useFileManager } from '@/context/file-manager-context';
import { FileMetaData } from '@/types/file-manager';
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
import { type FileUploadItem } from '@/hooks/use-file-upload';
import { cn } from '@/lib/utils';
import { getFileSize } from '@/lib/file-size';
import { fileTypesToAccept, getFileTypeFromMime, getFileTypesDescription } from '@/lib/file-utils';
import { FileUploadInput } from '@/types/provider';
import UploadCloudIcon from '../icons/upload-cloud';
import { RefreshCwIcon, TriangleAlertIcon } from '../icons';
import { CloseButton } from "@/components/ui/close-button";
import { getFileComponents } from '../grid/file-component-registry';
import { KbdGroup, Kbd } from "../ui/kbd";


export function UploadModal() {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadFiles,
    allowedFileTypes,
    maxUploadFiles,
    maxUploadSize,
  } = useFileManager();

  // Use allowedFileTypes for upload restrictions (applies to both page and modal mode)
  const acceptString = fileTypesToAccept(allowedFileTypes);
  const fileTypesDescription = getFileTypesDescription(allowedFileTypes);

  // Track upload items (files in UI, immediately marked as completed)
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
    maxFiles: maxUploadFiles,
    maxSize: maxUploadSize,
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
            file: file.file as File,
          };
        } else {
          // New file - mark as completed immediately (no simulation)
          return {
            ...file,
            file: file.file as File,
            progress: 100,
            status: 'completed' as const,
          };
        }
      });

      setUploadItems(newUploadItems);
    },
  });

  // Upload simulation removed - files are marked as completed immediately

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
        metadata: {}
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

  const getFilePreviewComponent = (file: File, preview?: string) => {
    // Create a mock FileMetaData object to use with the registry
    const mockFileMetadata: FileMetaData = {
      id: 'temp',
      name: file.name,
      size: file.size,
      mime: file.type,
      ext: file.name.split('.').pop() || '',
      url: preview || '', // Use preview URL for images, empty for others
      createdAt: new Date(file.lastModified),
      updatedAt: new Date(file.lastModified),
      folderId: null,
      metaData: {},
    };

    // Get the appropriate component from registry
    const { component: FilePreviewComponent } = getFileComponents(mockFileMetadata);
    return <FilePreviewComponent file={mockFileMetadata} metaData={mockFileMetadata.metaData} />;
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
              <span>
                Upload Files
                <KbdGroup className="ml-2">
                  <Kbd><span className="text-lg">⌘</span> + U</Kbd>
                </KbdGroup>
              </span>
              <CloseButton onClick={() => setIsUploadModalOpen(false)} />
            </div>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Upload Area */}
          <div
            className={cn(
              'relative rounded-lg border-dashed border-[2.5px] bg-muted border-border px-6 py-16 text-center transition-colors mb-4',
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
                <UploadCloudIcon className='mb-3 text-muted-foreground' />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drop files here or{' '}
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="cursor-pointer text-primary underline-offset-4 underline"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  {fileTypesDescription} • Max size: {getFileSize(maxUploadSize)} • Max files: {maxUploadFiles}
                </p>
              </div>
            </div>
          </div>

          {/* Files Grid */}
          {uploadItems.length > 0 && (
            <div className="space-y-4">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {uploadItems.map((fileItem) => (
                  <div key={fileItem.id} className="relative group">
                    {/* Remove button */}
                    <CloseButton
                      onClick={() => removeUploadFile(fileItem.id)}
                      className="absolute -inset-e-2 -top-2 z-10 size-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      iconClassName="size-3"
                    />

                    {/* Wrapper */}
                    <div className="relative overflow-hidden rounded-lg border bg-card transition-colors">
                      {/* File preview area - uses component registry */}
                      <div className="relative aspect-square bg-muted border-b border-border">
                        <div className="flex h-full items-center justify-center p-4">
                          <div className="w-[75%] h-[75%] flex items-center justify-center">
                            {fileItem.status === 'uploading' ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <svg className="size-12 -rotate-90 absolute" viewBox="0 0 48 48">
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
                                {fileItem.file instanceof File && getFilePreviewComponent(fileItem.file, fileItem.preview)}
                              </div>
                            ) : (
                              fileItem.file instanceof File && getFilePreviewComponent(fileItem.file, fileItem.preview)
                            )}
                          </div>
                        </div>
                      </div>

                      {/* File info footer */}
                      <div className="p-3">
                        <div className="space-y-1">
                          <p className="truncate text-xs font-medium">{fileItem.file.name}</p>
                          <div className="relative flex items-center justify-between gap-2">
                            <span className="text-[11px] text-primary font-semibold tracking-tight">{getFileSize(fileItem.file.size)}</span>

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
                <TriangleAlertIcon />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>File upload error(s)</AlertTitle>
                <AlertDescription>
                  {errors.map((error) => (
                    <p key={error} className="last:mb-0">
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