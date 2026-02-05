import mime from 'mime';
import { FileType, FILE_TYPE } from '@/types/file-manager';
import {
  PdfIcon,
  ExcelIcon,
  PptIcon,
  DocIcon,
  TextDocIcon,
  FileIcon,
  ZipIcon,
  JsonIcon,
  MusicIcon,
  RarIcon,
  ExeIcon,
  ImageIcon,
  VideoIcon,
  FolderWithFilesIcon,
  EmptyFolderIcon,
} from "@/components/icons";

/**
 * File Utilities
 * Consolidated module for file type detection, icon selection, and MIME type handling
 */

/**
 * Determines the FileType category based on MIME type and file extension
 * @param mimeType - MIME type of the file (e.g., "image/jpeg", "video/mp4")
 * @param extension - File extension (e.g., ".jpg", "jpg")
 * @returns The corresponding FileType (IMAGE, VIDEO, AUDIO, or FILE)
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
 * Determines the specific icon type to display based on MIME type and file extension
 * Returns specific types for icon rendering (pdf, excel, zip, etc.)
 * @param mimeType - MIME type of the file
 * @param extension - File extension
 * @returns Icon type string
 */
export function getIconType(mimeType: string, extension?: string): string {
  let effectiveMime = mimeType;
  
  // If extension is provided, use mime library to get accurate MIME type
  if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, '');
    const detectedMime = mime.getType(ext);
    if (detectedMime) {
      effectiveMime = detectedMime;
    }
  }
  
  // Media types (broad categories)
  if (effectiveMime.startsWith('image/')) {
    return 'image';
  }
  
  if (effectiveMime.startsWith('video/')) {
    return 'video';
  }
  
  if (effectiveMime.startsWith('audio/')) {
    return 'audio';
  }
  
  // Specific document types
  switch (effectiveMime) {
    case 'application/pdf':
      return 'pdf';
    
    case 'application/json':
      return 'json';
    
    // Archives
    case 'application/zip':
    case 'application/x-zip-compressed':
      return 'zip';
    
    case 'application/x-rar-compressed':
    case 'application/vnd.rar':
      return 'rar';
    
    // Executables
    case 'application/x-msdownload':
    case 'application/x-executable':
      return 'exe';
    
    // Microsoft Office - Excel
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
    case 'text/csv': // CSV files are spreadsheets
      return 'excel';
    
    // Microsoft Office - PowerPoint
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
      return 'powerpoint';
    
    // Microsoft Office - Word
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return 'document';
  }
  
  // Text files
  if (effectiveMime.startsWith('text/')) {
    return 'txt';
  }
  
  // Extension-based fallback for files that mime library doesn't handle well
  if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, '');
    
    switch (ext) {
      case 'exe':
      case 'msi':
        return 'exe';
      case 'zip':
        return 'zip';
      case 'rar':
        return 'rar';
      case 'pdf':
        return 'pdf';
      case 'csv':
        return 'excel';
    }
  }
  
  // Default fallback
  return 'file';
}

/**
 * Gets the React icon component for a given icon type
 * @param type - Icon type (e.g., 'pdf', 'image', 'folder')
 * @param className - Optional CSS class name
 * @param props - Additional props to pass to the icon component
 * @returns React icon component
 */
export const Icons = ({ type, className, ...props }: { type: string, className?: string }) => {
  switch (type) {
    case "folder-with-files":
      return <FolderWithFilesIcon className={className} {...props} />;
    case "folder":
      return <EmptyFolderIcon className={className} {...props} />;
    case "image":
      return <ImageIcon className={className} {...props} />;
    case "video":
      return <VideoIcon className={className} {...props} />;
    case "audio":
      return <MusicIcon className={className} {...props} />;
    case "pdf":
      return <PdfIcon className={className} {...props} />;
    case "excel":
    case "xlsx":
      return <ExcelIcon className={className} {...props} />;
    case "powerpoint":
    case "pptx":
      return <PptIcon className={className} {...props} />;
    case "document":
    case "docx":
    case "doc":
      return <DocIcon className={className} {...props} />;
    case "txt":
      return <TextDocIcon className={className} {...props} />;
    case "json":
      return <JsonIcon className={className} {...props} />;
    case "zip":
      return <ZipIcon className={className} {...props} />;
    case "rar":
      return <RarIcon className={className} {...props} />;
    case "exe":
      return <ExeIcon className={className} {...props} />;
    default:
      return <FileIcon className={className} {...props} />;
  }
};

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
