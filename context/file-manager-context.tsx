"use client";

import { useFileHandlers } from "@/hooks/use-file-handlers";
import { useFileState } from "@/hooks/use-file-state";
import { EntityId, FileManagerRootProps, FileMetaData, FileType, FolderId, Folder, PaginationInfo, Mode, SelectionMode, SELECTION_MODE, MODE } from "@/types/file-manager";
import { FileUploadInput, IFileManagerProvider } from "@/types/provider";
import { createContext, useContext, useMemo } from "react";

const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

// Context type - combines state and handlers

interface FileManagerContextType {
  // State
  files: FileMetaData[];
  folders: Folder[];
  selectedFiles: FileMetaData[];
  selectedFolders: Folder[];
  currentFolder: Folder | null;
  isLoading: boolean;
  pagination: PaginationInfo;

  //modal
  isUploadModalOpen: boolean;
  isCreateFolderModalOpen: boolean;
  isSearchModalOpen: boolean;
  isMoveFileModalOpen: boolean;
  isRenameFolderModalOpen: boolean;
  fileDetailsModalFile: FileMetaData | null;


  mode: Mode;
  selectionMode: SelectionMode;
  allowedFileTypes: FileType[]; // What file types can be uploaded (both page and modal mode)
  acceptedFileTypesForModal?: FileType[]; // what type of files can be selected/viewed in modal mode
  maxUploadFiles: number; // Maximum number of files that can be uploaded at once
  maxUploadSize: number; // Maximum file size in bytes

  // Provider
  provider: IFileManagerProvider;
  basePath?: string;

  // Setters
  setSelectedFiles: (files: FileMetaData[]) => void;
  setSelectedFolders: (folders: Folder[]) => void;
  
  //Modals Setters
  setIsUploadModalOpen: (isOpen: boolean) => void;
  setIsCreateFolderModalOpen: (isOpen: boolean) => void;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  setIsMoveFileModalOpen: (isOpen: boolean) => void;
  setIsRenameFolderModalOpen: (isOpen: boolean) => void;
  setFileDetailsModalFile: (file: FileMetaData | null) => void;

  // Handlers
  handleFileClick: (file: FileMetaData, event?: React.MouseEvent, isCheckboxClick?: boolean) => void;
  handleFolderClick: (folder: Folder | null, event?: React.MouseEvent, isCheckboxClick?: boolean) => void;
  handleClearSelection: () => void;
  handleSelectAllGlobal: (checked: boolean) => void;

  setCurrentPage: (page: number) => void;
  handlePageChange: (page: number) => void;
  
  // Search
  searchQuery: string;
  updateSearchQuery: (query: string) => void;

  // CRUD
  uploadFiles: (fileUploadInput: FileUploadInput[]) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  bulkMove: (targetFolderId: FolderId) => Promise<void>;
  renameFolder: (folderId: EntityId, newName: string) => Promise<void>;
  updateFileMetadata: (fileId: EntityId, metadata: Partial<FileMetaData>) => Promise<void>;
  bulkDelete: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Computed
  isInSelectionMode: () => boolean;
  getCurrentFolder: () => Folder | null;
  getSelectionState: () => boolean | "indeterminate";


  // Callbacks for modal mode
  onClose?: () => void;
  onFilesSelected?: (files: FileMetaData[]) => void;
}

export function FileManagerProvider({
  children,
  mode = MODE.PAGE,
  selectionMode = SELECTION_MODE.SINGLE,
  allowedFileTypes,
  onFilesSelected,
  onClose,
  acceptedFileTypesForModal,
  initialFolderId = null,
  provider,
  basePath = "/media",
  maxUploadFiles = 50,
  maxUploadSize = 100 * 1024 * 1024, // 100MB
}: FileManagerRootProps & { children: React.ReactNode }) {
  
   // Use the state hook
  const state = useFileState({
    mode,
    selectionMode,
    initialFolderId,
    acceptedFileTypesForModal,
    allowedFileTypes,
    provider,
    onFilesSelected,
    onClose,
    basePath,
  });

    // Use the handlers hook
  const handlers = useFileHandlers(state);

  // Compose context value
  const value = useMemo<FileManagerContextType>(() => ({
    // State
    files: state.files,
    folders: state.folders,
    selectedFiles: state.selectedFiles,
    selectedFolders: state.selectedFolders,
    currentFolder: state.currentFolder,
    isLoading: state.isLoading,
    pagination: state.pagination,
    isUploadModalOpen: state.isUploadModalOpen,
    isCreateFolderModalOpen: state.isCreateFolderModalOpen,
    isSearchModalOpen: state.isSearchModalOpen,
    isMoveFileModalOpen: state.isMoveFileModalOpen,
    isRenameFolderModalOpen: state.isRenameFolderModalOpen,
    fileDetailsModalFile: state.fileDetailsModalFile,
    mode: state.mode,
    selectionMode: state.selectionMode,
    allowedFileTypes,
    acceptedFileTypesForModal: state.acceptedFileTypesForModal,
    maxUploadFiles,
    maxUploadSize,

    // Setters
    setIsUploadModalOpen: state.setIsUploadModalOpen,
    setIsCreateFolderModalOpen: state.setIsCreateFolderModalOpen,
    setIsSearchModalOpen: state.setIsSearchModalOpen,
    setIsMoveFileModalOpen: state.setIsMoveFileModalOpen,

    setSelectedFiles: state.setSelectedFiles,
    setSelectedFolders: state.setSelectedFolders,
    setIsRenameFolderModalOpen: state.setIsRenameFolderModalOpen,
    setFileDetailsModalFile: state.setFileDetailsModalFile,

    // Handlers
    handleFileClick: handlers.handleFileClick,
    handleFolderClick: handlers.handleFolderClick,
    handleClearSelection: handlers.handleClearSelection,
    handleSelectAllGlobal: handlers.handleSelectAllGlobal,

    setCurrentPage: handlers.setCurrentPage,
    handlePageChange: state.handlePageChange,
    
    // Search
    searchQuery: state.searchQuery,
    updateSearchQuery: state.updateSearchQuery,


    // CRUD
    uploadFiles: handlers.uploadFiles,
    createFolder: handlers.createFolder,
    bulkMove: handlers.bulkMove,
    renameFolder: handlers.renameFolder,
    updateFileMetadata: handlers.updateFileMetadata,
    bulkDelete: handlers.bulkDelete,
    refreshData: handlers.refreshData,

    // Computed
    isInSelectionMode: state.isInSelectionMode,
    getCurrentFolder: state.getCurrentFolder,
    getSelectionState: state.getSelectionState,


    // Callbacks
    onClose: state.onClose,
    onFilesSelected: state.onFilesSelected,
    provider,
    basePath: state.basePath,
  }), [state, handlers, provider, allowedFileTypes, maxUploadFiles, maxUploadSize]);

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
}

export function useFileManager() {
  const context = useContext(FileManagerContext);
  if (context === undefined) {
    throw new Error("useFileManager must be used within a FileManagerProvider");
  }
  return context;
}
