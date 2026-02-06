'use client';

import { useState, ChangeEvent } from 'react';
import { DocumentMetaData, FileMetaData } from '@/types/file-manager';
import { DetailsLayout } from '@/components/file-details/details-layout';
import { FileDeleteButton, FileDownloadButton, FileCopyLinkButton } from '@/components/file-details/file-action-buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getFileSize } from '@/lib/file-size';
import { formatDate } from '@/lib/format-utils';
import { getFileComponents } from '@/components/grid/file-component-registry';

interface FileModalProps {
  file: FileMetaData;
  onClose: () => void;
  onSave?: (updates: Partial<FileMetaData>) => void;
  onDelete?: () => void;
}

export function FileModal({ file, onClose, onSave, onDelete }: FileModalProps) {
  const [fileName, setFileName] = useState(file.name);
  const [description, setDescription] = useState('');
  const documentMeta = file.metaData as DocumentMetaData;

  const handleSave = () => {
    onSave?.({
      name: fileName,
      metaData: {
        ...file.metaData,
        description,
      },
    });
    onClose();
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

        {documentMeta?.pageCount && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Page Count
            </p>
            <p className="text-xs font-bold text-blue-600">{documentMeta.pageCount}</p>
          </div>
        )}

        {documentMeta?.author && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Author
            </p>
            <p className="text-xs font-bold text-blue-600">{documentMeta.author}</p>
          </div>
        )}


      </div>

      {/* Editable Fields */}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="fileName">File name</Label>
          <Input
            id="fileName"
            value={fileName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFileName(e.target.value)}
            placeholder="Enter file name"
          />
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
      <Button className='w-full md:w-auto' variant="outline" onClick={onClose} radius="full">
        Cancel
      </Button>
      <Button className='w-full md:w-auto' onClick={handleSave} radius="full">
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
