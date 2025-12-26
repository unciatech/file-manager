import { IFileManagerProvider } from "./provider";

const createEnum = <Values extends readonly string[]>(values: Values) => {
  const map = Object.freeze(
    values.reduce((acc, value) => {
      acc[value.toUpperCase() as Uppercase<Values[number]>] = value;
      return acc;
    }, {} as Record<Uppercase<Values[number]>, Values[number]>)
  );

  const includes = (search: string): search is Values[number] =>
    (values as readonly string[]).includes(search);

  return {
    map,
    values,
    includes,
  } as const;
};

// Image Formats
const IMAGE_FORMAT_ENUM = createEnum([
  "jpeg",
  "png",
  "gif",
  "bmp",
  "svg",
  "webp",
  "avif",
] as const);
export const IMAGE_FORMAT = IMAGE_FORMAT_ENUM.map;
export const IMAGE_FORMATS = IMAGE_FORMAT_ENUM.values;
export const isImageFormat = IMAGE_FORMAT_ENUM.includes;
export type ImageFormat = typeof IMAGE_FORMATS[number];

// Video Formats
const VIDEO_FORMAT_ENUM = createEnum([
  "mp4",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mkv",
] as const);
export const VIDEO_FORMAT = VIDEO_FORMAT_ENUM.map;
export const VIDEO_FORMATS = VIDEO_FORMAT_ENUM.values;
export const isVideoFormat = VIDEO_FORMAT_ENUM.includes;
export type VideoFormat = typeof VIDEO_FORMATS[number];

// Document Formats
const DOCUMENT_FORMAT_ENUM = createEnum([
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "txt",
] as const);
export const DOCUMENT_FORMAT = DOCUMENT_FORMAT_ENUM.map;
export const DOCUMENT_FORMATS = DOCUMENT_FORMAT_ENUM.values;
export const isDocumentFormat = DOCUMENT_FORMAT_ENUM.includes;
export type DocumentFormat = typeof DOCUMENT_FORMATS[number];

// Audio Formats
const AUDIO_FORMAT_ENUM = createEnum([
  "mp3",
  "wav",
  "aac",
  "flac",
  "ogg",
] as const);
export const AUDIO_FORMAT = AUDIO_FORMAT_ENUM.map;
export const AUDIO_FORMATS = AUDIO_FORMAT_ENUM.values;
export const isAudioFormat = AUDIO_FORMAT_ENUM.includes;
export type AudioFormat = typeof AUDIO_FORMATS[number];

// Other Formats
const OTHER_FORMAT_ENUM = createEnum([
  "zip",
  "rar",
] as const);
export const OTHER_FORMAT = OTHER_FORMAT_ENUM.map;
export const OTHER_FORMATS = OTHER_FORMAT_ENUM.values;
export const isOtherFormat = OTHER_FORMAT_ENUM.includes;
export type OtherFormat = typeof OTHER_FORMATS[number];

// All File Formats
const ALL_FILE_FORMAT_ENUM = createEnum([
  ...IMAGE_FORMATS,
  ...VIDEO_FORMATS,
  ...DOCUMENT_FORMATS,
  ...AUDIO_FORMATS,
  ...OTHER_FORMATS,
] as const);
export const ALL_FILE_FORMAT = ALL_FILE_FORMAT_ENUM.map;
export const ALL_FILE_FORMATS = ALL_FILE_FORMAT_ENUM.values;
export const isAllFileFormat = ALL_FILE_FORMAT_ENUM.includes;
export type AllFileFormat = typeof ALL_FILE_FORMATS[number];

// Mode
export const MODE = {
  PAGE: "page",
  MODAL: "modal",
} as const;
export const MODES = Object.values(MODE);
export type Mode = (typeof MODE)[keyof typeof MODE];

// File Type
export const FILE_TYPE = {
  IMAGE: "image",
  VIDEO: "video",
  DOCUMENT: "document",
  AUDIO: "audio",
  OTHER: "other",
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

export type MetaDataType = ImageMetaData | VideoMetaData | DocumentMetaData | AudioMetaData | OtherMetaData;

// Type aliases for ID types
export type EntityId = string | number;
export type FolderId = string | number | null;

export interface Folder{
    id: EntityId;
    name: string;
    parentId: FolderId;
    color?: string;
    fileCount: number;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}



export interface FileMetaData{
    id: EntityId;
    name: string;
    folderId: FolderId;
    size: number; //bytes
    url: string;
    type: FileType;
    metaData: MetaDataType;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}

export interface ImageMetaData{
    caption?: string;
    altText?: string;
    dimensions: { width: number; height: number; };
    format: ImageFormat; // e.g., jpeg, png
    
}

export interface VideoMetaData{
    duration: number; // in seconds
    dimensions: { width: number; height: number; };
    format: VideoFormat; // e.g., mp4, avi
    videoSource: VideoSource;
}

export interface DocumentMetaData{
    pageCount?: number;
    author?: string;
    format: DocumentFormat; // e.g., pdf, docx
}

export interface AudioMetaData{
    duration: number; // in seconds
    bitrate?: number; // in kbps
    format: AudioFormat; // e.g., mp3, wav
}

export interface OtherMetaData{
    description?: string;
    format: OtherFormat; 
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


export interface FileManagerProps {
    mode: Mode;
    selectionMode: SelectionMode;
    allowedFileTypes: FileType[];
    viewMode: ViewMode;
    initialFolderId: FolderId;
    onFilesSelected?: (files: FileMetaData[] ) => void;
    onClose?: () => void;
    acceptedFileTypes?: FileType[] // For modal mode - what types to show
    provider: IFileManagerProvider
}


export interface FileStateOptions {
  mode: Mode;
  selectionMode: SelectionMode;
  initialFolderId: FolderId;
  acceptedFileTypes?: FileType[];
  allowedFileTypes?: FileType[];
  provider: IFileManagerProvider;
  onFilesSelected?: (files: FileMetaData[]) => void;
  onClose?: () => void;
}