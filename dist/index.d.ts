import { F as FileManagerPageProps, a as FileManagerModalProps, b as FileManagerRootProps, c as FileMetaData, d as Folder, P as PaginationInfo, M as Mode, S as SelectionMode, e as FileType, I as IFileManagerProvider, f as FileUploadInput, g as FolderId, E as EntityId } from './mock-provider-D1q21QlM.js';
export { h as FILE_TYPE, i as FILE_TYPES, j as FileStateOptions, k as FormatDetails, l as MODE, m as MODES, n as MetaDataType, o as MockProvider, p as SELECTION_MODE, q as SELECTION_MODES, T as Tag, V as VIDEO_SOURCE, r as VIDEO_SOURCES, s as VIEW_MODE, t as VIEW_MODES, u as VideoSource, v as ViewMode } from './mock-provider-D1q21QlM.js';
import * as react_jsx_runtime from 'react/jsx-runtime';

declare function FileManager(props: Readonly<FileManagerPageProps>): react_jsx_runtime.JSX.Element;

declare function FileManagerModal({ open, onClose, ...props }: Readonly<FileManagerModalProps>): react_jsx_runtime.JSX.Element;

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
declare function FileManagerProvider({ children, mode, selectionMode, allowedFileTypes, onFilesSelected, onClose, acceptedFileTypesForModal, initialFolderId, provider, basePath, maxUploadFiles, maxUploadSize, // 100MB
onNavigate, }: FileManagerRootProps & {
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function useFileManager(): FileManagerContextType;

export { EntityId, FileManager, FileManagerModal, FileManagerModalProps, FileManagerPageProps, FileManagerProvider, FileManagerRootProps, FileMetaData, FileType, FileUploadInput, Folder, FolderId, IFileManagerProvider, Mode, PaginationInfo, SelectionMode, useFileManager };
