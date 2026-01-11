'use client';

import { useState, ChangeEvent } from 'react';
import { AudioMetaData, FileMetaData } from '@/types/file-manager';
import { DetailsLayout } from '@/components/file-details/details-layout';
import { ActionButtons } from '@/components/file-details/action-buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getFileSize } from '@/lib/file-size';
import { formatDate, formatDuration } from '@/lib/format-utils';
import { Music } from 'lucide-react';

interface AudioModalProps {
  file: FileMetaData;
  onClose: () => void;
  onSave?: (updates: Partial<FileMetaData>) => void;
  onDelete?: () => void;
}

export function AudioModal({ file, onClose, onSave, onDelete }: AudioModalProps) {
  const [fileName, setFileName] = useState(file.name);
  const [caption, setCaption] = useState(file.caption || '');
  const audioMeta = file.metaData as AudioMetaData;

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
      <div className="mb-4">
        <ActionButtons file={file} onDelete={onDelete} />
      </div>

      {/* Audio Preview */}
      <div className="flex-1 flex flex-col items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-8">
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
            <Music className="w-16 h-16 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="w-full max-w-md">
          <audio
            src={file.url}
            controls
            className="w-full"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
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
            Duration
          </p>
          <p className="text-sm font-medium">
            {audioMeta?.duration ? formatDuration(audioMeta.duration) : 'N/A'}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Bitrate
          </p>
          <p className="text-sm font-medium">
            {audioMeta?.bitrate ? `${audioMeta.bitrate} kbps` : 'N/A'}
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
    <div className="flex justify-between items-center">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
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
