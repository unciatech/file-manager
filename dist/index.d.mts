import * as react_jsx_runtime from 'react/jsx-runtime';
import { e as FileManagerPageProps, f as FileManagerModalProps, g as FileManagerRootProps, c as FileMetaData, a as Folder, P as PaginationInfo, M as Mode, S as SelectionMode, b as FileType, I as IFileManagerProvider, d as FileUploadInput, F as FolderId, E as EntityId } from './file-manager-4KJI2OA3.mjs';
export { V as ViewMode } from './file-manager-4KJI2OA3.mjs';

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

export { FileManager, FileManagerModal, FileManagerModalProps, FileManagerPageProps, FileManagerProvider, FileMetaData, FileType, Folder, IFileManagerProvider, SelectionMode, useFileManager };
