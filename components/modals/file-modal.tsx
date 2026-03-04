'use client';

import { useState, ChangeEvent } from 'react';
import { Loader2Icon } from '../icons';
import { FileMetaData } from '@/types/file-manager';
import { DetailsLayout } from '@/components/file-details/details-layout';
import { FileDeleteButton, FileDownloadButton, FileCopyLinkButton } from '@/components/file-details/file-action-buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getFileSize } from '@/lib/file-size';
import { formatDate } from '@/lib/format-utils';
import { getFileComponents } from '@/components/grid/file-component-registry';
import { Field, FieldLabel } from '../ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../ui/input-group';

interface FileModalProps {
  file: FileMetaData;
  onClose: () => void;
  onSave?: (updates: Partial<FileMetaData>) => Promise<void> | void;
}

export function FileModal({ file, onClose, onSave }: FileModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState(file.name);
  const [description, setDescription] = useState(file.metaData?.description || '');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.({
        name: fileName,
        metaData: {
          ...file.metaData,
          description,
        },
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const ext = file.ext?.replace('.', '') || 'file';
  
  // Resolve components from registry (same as grid view)
  const { component: FilePreviewComponent } = getFileComponents(file);

  const previewSection = (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <FileDeleteButton file={file} />
        <FileDownloadButton file={file} />
        <FileCopyLinkButton file={file} />
      </div>

      {/* File Icon Preview */}
      <div className="flex-1 flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8">
        <div className="mb-4 w-32 h-32 flex items-center justify-center">
          <FilePreviewComponent file={file} metaData={file.metaData} />
        </div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {ext} File
        </p>
      </div>
    </div>
  );

  const metadataSection = (
    <div className="space-y-6">
      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-wide mb-1">
            Size
          </p>
          <p className="text-xs font-bold text-blue-600">{getFileSize(file.size)}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground  tracking-wide mb-1">
            Date
          </p>
          <p className="text-xs font-bold text-blue-600">
            {formatDate(file.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-wide mb-1">
            Extension
          </p>
          <p className="text-xs font-bold text-blue-600">{ext}</p>
        </div>

        {file.metaData?.pageCount && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Page Count
            </p>
            <p className="text-xs font-bold text-blue-600">{file.metaData.pageCount}</p>
          </div>
        )}

        {file.metaData?.author && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Author
            </p>
            <p className="text-xs font-bold text-blue-600">{file.metaData.author}</p>
          </div>
        )}


      </div>

      {/* Editable Fields */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
         <div className="space-y-2">
          <Field className='gap-0'>
            <FieldLabel htmlFor="fileName">File name</FieldLabel>
            <InputGroup>
              <InputGroupInput id="fileName" placeholder="Enter file name" value={fileName.replace(file.ext || '', '')} onChange={(e: ChangeEvent<HTMLInputElement>) => setFileName(e.target.value)} />
              <InputGroupAddon align="inline-end" className='pr-1'>
                <InputGroupText className='font-bold bg-gray-200 rounded-lg py-1 px-3'>{file.ext}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Add a description"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="flex w-full justify-between items-center flex-col sm:flex-row gap-2 ">
      <Button className='w-full md:w-auto' variant="outline" onClick={onClose} radius="full" disabled={isSaving}>
        Cancel
      </Button>
      <Button className='w-full md:w-auto' onClick={handleSave} radius="full" disabled={isSaving}>
        {isSaving && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
        Save
      </Button>
    </div>
  );

  return (
    <DetailsLayout
      title="Details"
      open={true}
      onClose={onClose}
      previewSection={previewSection}
      metadataSection={metadataSection}
      footer={footer}
    />
  );
}
