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

export interface MetaDataType {
  /** Video or Audio duration in seconds. */
  duration?: number;
  /** Provider source for video content (e.g., 'local', 'youtube'). */
  videoSource?: VideoSource;
  /** Audio bitrate in kbps. */
  bitrate?: number;
  /** Total number of pages for document file types. */
  pageCount?: number;
  /** Original creator or author of the document. */
  author?: string;
  /** General description text used across multiple asset types. */
  description?: string;
}

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


/**
 * Core interface representing a File entity in the file manager.
 * Supports various formats (images, videos, audio, documents) via common fields
 * and nested metadata structures.
 */
export interface FileMetaData{
    /** Unique identifier for the file. */
    id: EntityId;
    /** Human-readable name of the file (including extension). */
    name: string;
    /** ID of the folder containing this file. Null represents the root directory. */
    folderId: FolderId;
    /** Path representation of the file's location (e.g., "/1/156"). */
    folderPath?: string; 
    
    // Core details
    /** Size of the file in bytes. */
    size: number;
    /** Direct URL path to access or download the full asset. */
    url: string;
    /** URL to an optimized, lightweight thumbnail or preview of the asset. */
    previewUrl?: string;
    /** Content-Type HTTP header representation (e.g., "image/jpeg"). */
    mime: string;
    /** File extension including the dot (e.g., ".jpg"). */
    ext?: string;
    /** Content hash for deduplication and cache busting. */
    hash?: string;
    
    // Additional CMS fields
    /** Accessible alt text for images to display when images are disabled. */
    alternativeText?: string;
    /** Caption text commonly used in images and videos. */
    caption?: string;
    /** Intrinsic width in pixels for image/video assets. */
    width?: number;
    /** Intrinsic height in pixels for image/video assets. */
    height?: number;
    
    // Rich formats (responsive images)
    /** Collection of generated optimized formats for images. */
    formats?: Record<string, FormatDetails>;

    /** Dynamic metadata payload containing properties specific to the asset type. */
    metaData: MetaDataType;
    
    /** Timestamp of file creation. */
    createdAt: Date;
    /** Timestamp of last file modification. */
    updatedAt: Date;
    /** Categorization tags for sorting and discovery. */
    tags?: string[];
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
    basePath: string;
    /**
     * Optional navigation callback. When provided, the library delegates all
     * URL navigation to this function instead of calling history.pushState
     * directly. Use this to plug in your own router:
     *   - React Router:    onNavigate={(url, opts) => navigate(url, { replace: opts?.replace })}
     *   - Next.js:         onNavigate={(url, opts) => opts?.replace ? router.replace(url) : router.push(url)}
     *   - TanStack Router: onNavigate={(url, opts) => router.navigate({ href: url, replace: opts?.replace })}
     * If omitted, falls back to history.pushState (works in any bare React app).
     */
    onNavigate?: (url: string, options?: { replace?: boolean; scroll?: boolean }) => void;
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
    basePath: string;
    /** @see FileManagerPageProps.onNavigate */
    onNavigate?: (url: string, options?: { replace?: boolean; scroll?: boolean }) => void;
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
  basePath: string;
  onFilesSelected?: (files: FileMetaData[]) => void;
  onClose?: () => void;
  maxUploadFiles?: number; // default: 50
  maxUploadSize?: number; // in bytes, default: 100MB
  /** @see FileManagerPageProps.onNavigate */
  onNavigate?: (url: string, options?: { replace?: boolean; scroll?: boolean }) => void;
}

export interface FileStateOptions {
  mode: Mode;
  selectionMode: SelectionMode;
  initialFolderId: FolderId;
  acceptedFileTypesForModal?: FileType[];
  allowedFileTypes?: FileType[];
  provider: IFileManagerProvider;
  basePath: string;

  //Modal Callbacks
  onFilesSelected?: (files: FileMetaData[]) => void;
  onClose?: () => void;

  /** @see FileManagerPageProps.onNavigate */
  onNavigate?: (url: string, options?: { replace?: boolean; scroll?: boolean }) => void;
}