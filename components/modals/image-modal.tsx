'use client';

import { useState, ChangeEvent } from 'react';
import { Loader2Icon } from '../icons';
import { FileMetaData } from '@/types/file-manager';
import { DetailsLayout } from '@/components/file-details/details-layout';
import { FileDeleteButton, FileDownloadButton, FileCopyLinkButton, FileFullscreenButton } from '@/components/file-details/file-action-buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getFileSize } from '@/lib/file-size';
import { formatDate } from '@/lib/format-utils';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../ui/input-group';

/**
 * Props for the ImageModal component.
 */
interface ImageModalProps {
  /** The image file data object to display and edit. */
  file: FileMetaData;
  /** Callback fired when the modal is closed without saving or after a successful save. */
  onClose: () => void;
  /**
   * Asynchronous callback fired when the user saves their changes.
   * Receives a partial metadata object containing the requested updates.
   */
  onSave?: (updates: Partial<FileMetaData>) => Promise<void> | void;
  /** Optional callback fired when the user chooses to delete the image. */
  onDelete?: () => void;
}

/**
 * A modal component tailored for viewing and editing image assets.
 * Supports updating the file name, alternative text, and caption.
 * Displays a full-screen preview with the image set as a blurred background.
 */
export function ImageModal({ file, onClose, onSave, onDelete }: ImageModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState(file.name);
  const [alternativeText, setAlternativeText] = useState(file.alternativeText || '');
  const [caption, setCaption] = useState(file.caption || '');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.({
        name: fileName,
        alternativeText,
        caption,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const previewSection = (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <FileDeleteButton file={file} />
        <FileDownloadButton file={file} />
        <FileCopyLinkButton file={file} />
        <FileFullscreenButton file={file} onFullscreen={() => window.open(file.url, '_blank')} />
      </div>

      {/* Image Preview */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <img
          src={file.previewUrl || file.url}
          alt={file.alternativeText || file.name}
          className="max-w-full max-h-full object-contain"
        />
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
            Dimensions
          </p>
          <p className="text-xs font-bold text-blue-600">
            {file.width && file.height ? `${file.width}×${file.height}` : 'N/A'}
          </p>
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
          <p className="text-xs font-medium text-muted-foreground  tracking-wide mb-1">
            Extension
          </p>
          <p className="text-xs font-bold text-blue-600">{file.ext?.replace('.', '') || 'N/A'}</p>
        </div>


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
          <Label htmlFor="altText">Alternative text</Label>
          <Textarea
            id="altText"
            value={alternativeText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAlternativeText(e.target.value)}
            placeholder="Describe the image for accessibility"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            This text will be displayed if the asset can't be shown.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
            placeholder="Add a caption"
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
        Finish
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
