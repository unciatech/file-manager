import { FileType, FILE_TYPE } from '@/types/file-manager';
import mime from 'mime';

/**
 * Determines the FileType based on MIME type and file extension
 * Uses the 'mime' library for accurate MIME type detection from extensions
 * @param mimeType - MIME type of the file (e.g., "image/jpeg", "video/mp4")
 * @param extension - File extension (e.g., ".jpg", "jpg")
 * @returns The corresponding FileType
 */
export function getFileTypeFromMime(mimeType: string, extension?: string): FileType {
  // Defensive check: ensure mimeType is a string
  if (typeof mimeType !== 'string') {
    console.warn('getFileTypeFromMime: mimeType is not a string:', mimeType);
    return FILE_TYPE.FILE;
  }

  let effectiveMime = mimeType;
  
  // If extension is provided, use it to get accurate MIME type
  if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, '');
    const detectedMime = mime.getType(ext);
    if (detectedMime) {
      effectiveMime = detectedMime;
    }
  }
  
  // Check main MIME type categories
  if (effectiveMime.startsWith('image/')) {
    return FILE_TYPE.IMAGE;
  }
  
  if (effectiveMime.startsWith('video/')) {
    return FILE_TYPE.VIDEO;
  }
  
  if (effectiveMime.startsWith('audio/')) {
    return FILE_TYPE.AUDIO;
  }
  
  // Everything else is a file/document
  return FILE_TYPE.FILE;
}

/**
 * Converts FileType array to MIME type accept string for file input
 * @param fileTypes - Array of FileType values
 * @returns Accept string for file input (e.g., "image/*,video/*")
 */
export function fileTypesToAccept(fileTypes?: FileType[]): string {
  if (!fileTypes || fileTypes.length === 0) {
    return '*/*';
  }

  const mimeTypes: string[] = [];

  for (const fileType of fileTypes) {
    switch (fileType) {
      case FILE_TYPE.IMAGE:
        mimeTypes.push('image/*');
        break;
      case FILE_TYPE.VIDEO:
        mimeTypes.push('video/*');
        break;
      case FILE_TYPE.AUDIO:
        mimeTypes.push('audio/*');
        break;
      case FILE_TYPE.FILE:
        // Accept common document, text, and archive types
        mimeTypes.push(
          'application/*',  // All application types (PDF, Office, archives, etc.)
          'text/*'          // All text types
        );
        break;
    }
  }

  return mimeTypes.join(',');
}

/**
 * Gets a human-readable description of allowed file types
 * @param fileTypes - Array of FileType values
 * @returns Human-readable string (e.g., "Images, Videos")
 */
export function getFileTypesDescription(fileTypes?: FileType[]): string {
  if (!fileTypes || fileTypes.length === 0) {
    return 'All files';
  }

  const descriptions: string[] = [];

  for (const fileType of fileTypes) {
    switch (fileType) {
      case FILE_TYPE.IMAGE:
        descriptions.push('Images');
        break;
      case FILE_TYPE.VIDEO:
        descriptions.push('Videos');
        break;
      case FILE_TYPE.AUDIO:
        descriptions.push('Audio');
        break;
      case FILE_TYPE.FILE:
        descriptions.push('Files');
        break;
    }
  }

  return descriptions.join(', ');
}
