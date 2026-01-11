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
import { fileTypesToAccept, getFileTypesDescription } from '@/lib/file-type-utils';
import { FileUploadInput } from '@/types/provider';



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
        type: item.file.type,
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
    const type = file.type;
    if (type.startsWith('image/')) return <ImageIcon className="size-6" />;
    if (type.startsWith('video/')) return <VideoIcon className="size-6" />;
    if (type.startsWith('audio/')) return <HeadphonesIcon className="size-6" />;
    if (type.includes('pdf')) return <FileTextIcon className="size-6" />;
    if (type.includes('word') || type.includes('doc')) return <FileTextIcon className="size-6" />;
    if (type.includes('excel') || type.includes('sheet')) return <FileSpreadsheetIcon className="size-6" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchiveIcon className="size-6" />;
    return <FileTextIcon className="size-6" />;
  };

  const completedCount = uploadItems.filter((item) => item.status === 'completed').length;
  const uploadingCount = uploadItems.filter((item) => item.status === 'uploading').length;
  const canUpload = completedCount > 0 && uploadingCount === 0;

  return (
    <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
      <DialogContent className="p-0 max-w-4xl max-h-[80vh] flex flex-col" variant="default">
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">
            Upload Files {currentFolder && `to ${currentFolder.name}`}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Upload Area */}
          <div
            className={cn(
              'relative rounded-lg border border-dashed p-6 text-center transition-colors mb-4',
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

            <div className="flex flex-col items-center gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors',
                  isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
                )}
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
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

        <DialogFooter className="px-6 py-4 border-t border-border">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleUpload} disabled={!canUpload}>
            Upload {completedCount > 0 && `(${completedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}