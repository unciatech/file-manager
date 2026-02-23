import * as react_jsx_runtime from 'react/jsx-runtime';

type FileUploadInput = {
    file: File;
    metadata: Partial<FileMetaData>;
    videoSource?: VideoSource;
};
interface IFileManagerProvider {
    getFolder(folderId: FolderId): Promise<Folder | null>;
    getFolders(folderId: FolderId, page?: number, limit?: number, query?: string): Promise<{
        folders: Folder[];
        pagination: PaginationInfo;
    }>;
    getTags(): Promise<string[]>;
    getFiles(folderId: FolderId, fileTypes?: FileType[] | null, page?: number, limit?: number, query?: string): Promise<{
        files: FileMetaData[];
        pagination: PaginationInfo;
    }>;
    /**
     * Get files and folders separately (folders always come first)
     * Folders are returned for the current page, followed by files
     */
    getItems(folderId: FolderId, fileTypes?: FileType[], page?: number, limit?: number, query?: string): Promise<{
        folders: Folder[];
        files: FileMetaData[];
        pagination: PaginationInfo;
    }>;
    createFolder(name: string, parentId?: FolderId): Promise<Folder>;
    uploadFiles(files: FileUploadInput[], folderId?: FolderId): Promise<FileMetaData[]>;
    renameFolder(folderId: FolderId, newName: string): Promise<Folder>;
    moveFiles(fileIds: EntityId[], newFolderId: FolderId): Promise<FileMetaData[]>;
    moveFolders(folderIds: FolderId[], newParentId: FolderId): Promise<Folder[]>;
    updateFileMetaData(fileId: EntityId, metaData: Partial<FileMetaData>): Promise<FileMetaData>;
    deleteFiles(fileIds: EntityId[]): Promise<void>;
    deleteFolders(folderIds: FolderId[]): Promise<void>;
    findFiles(searchQuery: string): Promise<FileMetaData[]>;
    findFolders(searchQuery: string): Promise<Folder[]>;
}

declare const MODE: {
    readonly PAGE: "page";
    readonly MODAL: "modal";
};
type Mode = (typeof MODE)[keyof typeof MODE];
declare const FILE_TYPE: {
    readonly IMAGE: "images";
    readonly VIDEO: "videos";
    readonly AUDIO: "audios";
    readonly FILE: "files";
};
type FileType = (typeof FILE_TYPE)[keyof typeof FILE_TYPE];
declare const SELECTION_MODE: {
    readonly SINGLE: "single";
    readonly MULTIPLE: "multiple";
};
type SelectionMode = (typeof SELECTION_MODE)[keyof typeof SELECTION_MODE];
declare const VIEW_MODE: {
    readonly GRID: "grid";
    readonly LIST: "list";
};
type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];
declare const VIDEO_SOURCE: {
    readonly LOCAL: "local";
    readonly REMOTE: "remote";
    readonly YOUTUBE: "youtube";
    readonly VIMEO: "vimeo";
};
type VideoSource = (typeof VIDEO_SOURCE)[keyof typeof VIDEO_SOURCE];
interface MetaDataType {
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
type EntityId = string | number;
type FolderId = string | number | null;
interface Folder {
    id: FolderId;
    name: string;
    pathId: number;
    path: string;
    parent?: Folder | null;
    folderCount?: number;
    parentId: FolderId;
    folderPath?: string;
    color?: string;
    fileCount?: number;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}
interface FormatDetails {
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
interface FileMetaData {
    /** Unique identifier for the file. */
    id: EntityId;
    /** Human-readable name of the file (including extension). */
    name: string;
    /** ID of the folder containing this file. Null represents the root directory. */
    folderId: FolderId;
    /** Path representation of the file's location (e.g., "/1/156"). */
    folderPath?: string;
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
    /** Accessible alt text for images to display when images are disabled. */
    alternativeText?: string;
    /** Caption text commonly used in images and videos. */
    caption?: string;
    /** Intrinsic width in pixels for image/video assets. */
    width?: number;
    /** Intrinsic height in pixels for image/video assets. */
    height?: number;
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
interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalFiles: number;
    filesPerPage: number;
}
interface FileManagerPageProps {
    allowedFileTypes: FileType[];
    viewMode: ViewMode;
    initialFolderId?: FolderId;
    provider: IFileManagerProvider;
    basePath?: string;
}
interface FileManagerModalProps {
    open: boolean;
    onClose: () => void;
    onFilesSelected: (files: FileMetaData[]) => void;
    fileSelectionMode?: SelectionMode;
    allowedFileTypes: FileType[];
    acceptedFileTypes?: FileType[];
    viewMode?: ViewMode;
    initialFolderId?: FolderId;
    provider: IFileManagerProvider;
    basePath?: string;
}
interface FileManagerRootProps {
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
    maxUploadFiles?: number;
    maxUploadSize?: number;
}

declare function FileManager(props: FileManagerPageProps): react_jsx_runtime.JSX.Element;

declare function FileManagerModal({ open, onClose, ...props }: FileManagerModalProps): react_jsx_runtime.JSX.Element;

interface FileManagerContextType {
    files: FileMetaData[];
    folders: Folder[];
    selectedFiles: FileMetaData[];
    selectedFolders: Folder[];
    currentFolder: Folder | null;
    isLoading: boolean;
    pagination: PaginationInfo;
    isUploadModalOpen: boolean;
    isCreateFolderModalOpen: boolean;
    isSearchModalOpen: boolean;
    isMoveFileModalOpen: boolean;
    isRenameFolderModalOpen: boolean;
    fileDetailsModalFile: FileMetaData | null;
    folderToRename: Folder | null;
    mode: Mode;
    selectionMode: SelectionMode;
    allowedFileTypes: FileType[];
    acceptedFileTypesForModal?: FileType[];
    maxUploadFiles: number;
    maxUploadSize: number;
    provider: IFileManagerProvider;
    basePath?: string;
    setSelectedFiles: (files: FileMetaData[]) => void;
    setSelectedFolders: (folders: Folder[]) => void;
    setIsUploadModalOpen: (isOpen: boolean) => void;
    setIsCreateFolderModalOpen: (isOpen: boolean) => void;
    setIsSearchModalOpen: (isOpen: boolean) => void;
    setIsMoveFileModalOpen: (isOpen: boolean) => void;
    setIsRenameFolderModalOpen: (isOpen: boolean) => void;
    setFileDetailsModalFile: (file: FileMetaData | null) => void;
    setFolderToRename: (folder: Folder | null) => void;
    handleFileClick: (file: FileMetaData, event?: React.MouseEvent, isCheckboxClick?: boolean) => void;
    handleFolderClick: (folder: Folder | null, event?: React.MouseEvent, isCheckboxClick?: boolean) => void;
    handleClearSelection: () => void;
    handleSelectAllGlobal: (checked: boolean) => void;
    handlePageChange: (page: number) => void;
    searchQuery: string;
    updateSearchQuery: (query: string) => void;
    uploadFiles: (fileUploadInput: FileUploadInput[]) => Promise<void>;
    createFolder: (name: string) => Promise<void>;
    bulkMove: (targetFolderId: FolderId) => Promise<void>;
    renameFolder: (folderId: EntityId, newName: string) => Promise<void>;
    updateFileMetadata: (fileId: EntityId, metadata: Partial<FileMetaData>) => Promise<void>;
    bulkDelete: () => Promise<void>;
    refreshData: () => Promise<void>;
    isInSelectionMode: () => boolean;
    getCurrentFolder: () => Folder | null;
    getSelectionState: () => boolean | "indeterminate";
    onClose?: () => void;
    onFilesSelected?: (files: FileMetaData[]) => void;
}
declare function FileManagerProvider({ children, mode, selectionMode, allowedFileTypes, onFilesSelected, onClose, acceptedFileTypesForModal, initialFolderId, provider, basePath, maxUploadFiles, maxUploadSize, }: FileManagerRootProps & {
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function useFileManager(): FileManagerContextType;

declare class MockProvider implements IFileManagerProvider {
    getFolder(folderId: FolderId): Promise<Folder | null>;
    getFolders(folderId: FolderId, page?: number, limit?: number, query?: string): Promise<{
        folders: Folder[];
        pagination: PaginationInfo;
    }>;
    getTags(): Promise<string[]>;
    getFiles(folderId: FolderId, fileTypes?: FileType[], page?: number, limit?: number, query?: string): Promise<{
        files: FileMetaData[];
        pagination: PaginationInfo;
    }>;
    /**
     * Get files and folders separately (folders always come first)
     * Folders are not paginated (all folders in current directory are returned)
     * Files are paginated after folders
     */
    getItems(folderId: FolderId, fileTypes?: FileType[], page?: number, limit?: number, query?: string): Promise<{
        folders: Folder[];
        files: FileMetaData[];
        pagination: PaginationInfo;
    }>;
    createFolder(name: string, parentId?: FolderId): Promise<Folder>;
    private getMetaDataType;
    private getFileType;
    uploadFiles(files: FileUploadInput[], folderId?: FolderId): Promise<FileMetaData[]>;
    renameFolder(folderId: EntityId, newName: string): Promise<Folder>;
    updateFileMetaData(fileId: EntityId, updates: Partial<FileMetaData>): Promise<FileMetaData>;
    deleteFiles(fileIds: EntityId[]): Promise<void>;
    deleteFolders(folderIds: EntityId[]): Promise<void>;
    findFiles(searchQuery: string): Promise<FileMetaData[]>;
    findFolders(searchQuery: string): Promise<Folder[]>;
    moveFiles(fileIds: EntityId[], newFolderId: FolderId): Promise<FileMetaData[]>;
    moveFolders(folderIds: FolderId[], newParentId: FolderId): Promise<Folder[]>;
}

export { FileManager, FileManagerModal, type FileManagerModalProps, type FileManagerPageProps, FileManagerProvider, type FileMetaData, type FileType, type Folder, type IFileManagerProvider, MockProvider, type SelectionMode, type ViewMode, useFileManager };
