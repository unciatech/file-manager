import { IFileManagerProvider } from "./provider";

// Mode
export const MODE = {
  PAGE: "page",
  MODAL: "modal",
} as const;
export const MODES = Object.values(MODE);
export type Mode = (typeof MODE)[keyof typeof MODE];

// File Type
export const FILE_TYPE = {
  IMAGE: "images",
  VIDEO: "videos",
  AUDIO: "audios",
  FILE: "files",
} as const;
export const FILE_TYPES = Object.values(FILE_TYPE);
export type FileType = (typeof FILE_TYPE)[keyof typeof FILE_TYPE];

// Selection Mode
export const SELECTION_MODE = {
  SINGLE: "single",
  MULTIPLE: "multiple",
} as const;
export const SELECTION_MODES = Object.values(SELECTION_MODE);
export type SelectionMode = (typeof SELECTION_MODE)[keyof typeof SELECTION_MODE];

// View Mode
export const VIEW_MODE = {
  GRID: "grid",
  LIST: "list",
} as const;
export const VIEW_MODES = Object.values(VIEW_MODE);
export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

// Video Source
export const VIDEO_SOURCE = {
  LOCAL: "local",
  REMOTE: "remote",
  YOUTUBE: "youtube",
  VIMEO: "vimeo",
} as const;
export const VIDEO_SOURCES = Object.values(VIDEO_SOURCE);
export type VideoSource = (typeof VIDEO_SOURCE)[keyof typeof VIDEO_SOURCE];

export type MetaDataType = VideoMetaData | DocumentMetaData | AudioMetaData | OtherMetaData;

// Type aliases for ID types
export type EntityId = string | number;
export type FolderId = string | number | null;

export interface Folder {
    id: FolderId;
    name: string;
    
    // Path based structure
    pathId: number; // Using number as per Strapi JSON
    path: string; // e.g. "/329/374"
    
    // Relations & Counts
    parent?: Folder | null;
    folderCount?: number;

    // Legacy/Compatible fields
    parentId: FolderId; 
    folderPath?: string; 
    color?: string;
    fileCount?: number;
    
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}



// NEW: Format details for responsive images
export interface FormatDetails {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
}


export interface FileMetaData{
    id: EntityId;
    name: string;
    folderId: FolderId;
    folderPath?: string; // e.g. "/1/156"
    
    // Core details
    size: number; //bytes
    url: string;
    mime: string; // e.g. "image/jpeg"
    ext?: string; // e.g. ".jpg"
    hash?: string;
    
    // Additional CMS fields
    alternativeText?: string;
    caption?: string;
    width?: number; // for images/videos
    height?: number; // for images/videos
    
    // Rich formats (responsive images)
    formats?: Record<string, FormatDetails>; // e.g. { "small": { ... }, "thumbnail": { ... } }

    metaData: MetaDataType; // Legacy/Specific data can still live here if not covered above
    
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}



export interface VideoMetaData{
    duration: number; // in seconds
    videoSource: VideoSource;
}

export interface DocumentMetaData{
    pageCount?: number;
    author?: string;
}

export interface AudioMetaData{
    duration: number; // in seconds
    bitrate?: number; // in kbps
}

export interface OtherMetaData{
    description?: string;
}

export interface Tag {
  id: EntityId
  name: string
  color?: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalFiles: number
  filesPerPage: number
}



// Props for page view (full-page file manager)
export interface FileManagerPageProps {
    allowedFileTypes: FileType[];
    viewMode: ViewMode;
    initialFolderId?: FolderId;
    provider: IFileManagerProvider;
    basePath?: string;
}

// Props for modal view (file picker/selector)
export interface FileManagerModalProps {
    // Modal-specific
    open: boolean;
    onClose: () => void;
    onFilesSelected: (files: FileMetaData[]) => void;
    fileSelectionMode?: SelectionMode; // default: "single" - how many files can be selected
    
    // File filtering
    allowedFileTypes: FileType[]; // What can be uploaded
    acceptedFileTypes?: FileType[]; // What can be selected/viewed (defaults to allowedFileTypes)
    
    // Common
    viewMode?: ViewMode; // default: "grid"
    initialFolderId?: FolderId;
    provider: IFileManagerProvider;
    basePath?: string;
}


// Internal props for FileManagerComposition.Root (used by both FileManager and FileManagerModal)
export interface FileManagerRootProps {
  mode: Mode;
  selectionMode: SelectionMode;
  allowedFileTypes: FileType[];
  viewMode: ViewMode;
  initialFolderId?: FolderId;
  acceptedFileTypesForModal?: FileType[];
  provider: IFileManagerProvider;
  basePath?: string;
  onFilesSelected?: (files: FileMetaData[]) => void;
  onClose?: () => void;
  maxUploadFiles?: number; // default: 50
  maxUploadSize?: number; // in bytes, default: 100MB
}

export interface FileStateOptions {
  mode: Mode;
  selectionMode: SelectionMode;
  initialFolderId: FolderId;
  acceptedFileTypesForModal?: FileType[];
  allowedFileTypes?: FileType[];
  provider: IFileManagerProvider;
  basePath?: string;

  //Modal Callbacks
  onFilesSelected?: (files: FileMetaData[]) => void;
  onClose?: () => void;
}