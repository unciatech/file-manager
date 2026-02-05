"use client";

import { cn } from "@/lib/utils";
import { UploadModal } from "../modals/upload-modal";
import { CreateFolderModal } from "../modals/create-folder";
import { MoveModal } from "../modals/move-modal";
import { ImageModal } from "../modals/image-modal";
import { VideoModal } from "../modals/video-modal";
import { AudioModal } from "../modals/audio-modal";
import { FileModal } from "../modals/file-modal";
import { useFileManager } from "@/context/file-manager-context";
import { getFileTypeFromMime } from "@/lib/file-utils";
import { FILE_TYPE, FileMetaData } from "@/types/file-manager";

export function FileManagerOverlays({ className }: { className?: string }) {
  const {
    fileDetailsModalFile,
    setFileDetailsModalFile,
    updateFileMetadata,
  } = useFileManager();

  const handleClose = () => {
    setFileDetailsModalFile(null);
  };

  const handleSave = async (updates: Partial<FileMetaData>) => {
    if (fileDetailsModalFile) {
      await updateFileMetadata(fileDetailsModalFile.id, updates);
    }
  };

  // Determine which modal to show based on file type
  const renderFileDetailsModal = () => {
    if (!fileDetailsModalFile) return null;

    const fileType = getFileTypeFromMime(
      fileDetailsModalFile.mime,
      fileDetailsModalFile.ext
    );

    switch (fileType) {
      case FILE_TYPE.IMAGE:
        return (
          <ImageModal
            file={fileDetailsModalFile}
            onClose={handleClose}
            onSave={handleSave}
          />
        );
      case FILE_TYPE.VIDEO:
        return (
          <VideoModal
            file={fileDetailsModalFile}
            onClose={handleClose}
            onSave={handleSave}
          />
        );
      case FILE_TYPE.AUDIO:
        return (
          <AudioModal
            file={fileDetailsModalFile}
            onClose={handleClose}
            onSave={handleSave}
          />
        );
      case FILE_TYPE.FILE:
      default:
        return (
          <FileModal
            file={fileDetailsModalFile}
            onClose={handleClose}
            onSave={handleSave}
          />
        );
    }
  };

  return (
    <div className={cn('', className)}>
      <UploadModal />
      <CreateFolderModal />
      <MoveModal />
      {renderFileDetailsModal()}
    </div>
  );
}
