'use client';

import { useState, ChangeEvent } from 'react';
import { FileMetaData, VideoMetaData } from '@/types/file-manager';
import { DetailsLayout } from '@/components/file-details/details-layout';
import { FileDeleteButton, FileDownloadButton, FileCopyLinkButton } from '@/components/file-details/file-action-buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getFileSize } from '@/lib/file-size';
import { formatDate, formatDuration } from '@/lib/format-utils';

interface VideoModalProps {
  file: FileMetaData;
  onClose: () => void;
  onSave?: (updates: Partial<FileMetaData>) => void;
  onDelete?: () => void;
}

export function VideoModal({ file, onClose, onSave, onDelete }: VideoModalProps) {
  const [fileName, setFileName] = useState(file.name);
  const [caption, setCaption] = useState(file.caption || '');
  const videoMeta = file.metaData as VideoMetaData;

  const handleSave = () => {
    onSave?.({
      name: fileName,
      caption,
    });
    onClose();
  };

  const previewSection = (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <FileDeleteButton file={file} />
        <FileDownloadButton file={file} />
        <FileCopyLinkButton file={file} />
      </div>

      {/* Video Preview */}
      <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
        <video
          src={file.url}
          controls
          className="max-w-full max-h-full"
          style={{ maxHeight: '500px' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );

  const metadataSection = (
    <div className="space-y-6">
      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Size
          </p>
          <p className="text-sm font-medium">{getFileSize(file.size)}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Dimensions
          </p>
          <p className="text-sm font-medium">
            {file.width && file.height ? `${file.width}×${file.height}` : 'N/A'}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Duration
          </p>
          <p className="text-sm font-medium">
            {videoMeta?.duration ? formatDuration(videoMeta.duration) : 'N/A'}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Date
          </p>
          <p className="text-sm font-medium">
            {formatDate(file.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Extension
          </p>
          <p className="text-sm font-medium">{file.ext?.replace('.', '') || 'N/A'}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Video Source
          </p>
          <p className="text-sm font-medium capitalize">
            {videoMeta?.videoSource || 'local'}
          </p>
        </div>


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
    <div className="flex w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ">
      <Button variant="outline" onClick={onClose} radius="full" className='w-full md:w-auto'>
        Cancel
      </Button>
      <Button onClick={handleSave} radius="full" className='w-full md:w-auto'>
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
