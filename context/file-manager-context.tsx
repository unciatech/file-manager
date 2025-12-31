"use client";

import { useFileHandlers, useFileState } from "@/hooks";
import { MockProvider } from "@/providers/mock-provider";
import { EntityId, FileManagerProps, FileMetaData, FileType, FolderId, Folder, PaginationInfo } from "@/types/file-manager";
import { FileUploadInput, IFileManagerProvider } from "@/types/provider";
import { createContext, useContext, useMemo, useState } from "react";

const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

// Context type - combines state and handlers

interface FileManagerContextType {
  // State
  files: FileMetaData[];
  folders: Folder[];
  selectedFiles: FileMetaData[];
  selectedFolders: Folder[];
  currentFolder: Folder | null;
  searchQuery: string;
  selectedFileTypes: FileType[];
  isLoading: boolean;
  pagination: PaginationInfo;
  isUploadModalOpen: boolean;
  isCreateFolderModalOpen: boolean;
  isMoveFileModalOpen: boolean;
  isRenameFolderModalOpen: boolean;
  mode: "page" | "modal";
  selectionMode: "single" | "multiple";
  acceptedFileTypes?: string[];

  // Provider
  provider: IFileManagerProvider;

  // Setters
  setSearchQuery: (query: string) => void;
  setSelectedFileTypes: (types: FileType[]) => void;
  setIsUploadModalOpen: (isOpen: boolean) => void;
  setIsCreateFolderModalOpen: (isOpen: boolean) => void;
  setIsMoveFileModalOpen: (isOpen: boolean) => void;
  setIsRenameFolderModalOpen: (isOpen: boolean) => void;
  setSelectedFiles: (files: FileMetaData[]) => void;
  setSelectedFolders: (folders: Folder[]) => void;

  // Handlers
  handleFileSelect: (file: FileMetaData, event?: React.MouseEvent, isCheckboxClick?: boolean) => void;
  handleFolderSelect: (folderId: FolderId) => void;
  handleFolderClick: (folder: Folder, event: React.MouseEvent, isCheckboxClick?: boolean) => void;
  handleClearSelection: () => void;
  handleSelectAllGlobal: (checked: boolean) => void;
  handleSelectAllFolders: (checked: boolean) => void;
  handleSelectAllFiles: (checked: boolean) => void;
  handlePageChange: (page: number) => void;

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
  getGlobalCheckboxState: () => boolean | "indeterminate";
  getFoldersCheckboxState: () => boolean | "indeterminate";
  getFilesCheckboxState: () => boolean | "indeterminate";

  // Callbacks
  onClose?: () => void;
  onFilesSelected?: (files: FileMetaData[]) => void;
}

export function FileManagerProvider({
  children,
  mode = "page",
  selectionMode = "single",
  allowedFileTypes,
  onFilesSelected,
  onClose,
  acceptedFileTypes,
  initialFolderId = null,
  provider : propProvider,
}: FileManagerProps & { children: React.ReactNode }) {
  
  // Stabilize provider - use useState with lazy initializer for stable fallback instance
  // This ensures the MockProvider is only created once if no provider is passed
  const [fallbackProvider] = useState<IFileManagerProvider>(() => new MockProvider());
  const provider = propProvider ?? fallbackProvider;

   // Use the state hook
  const state = useFileState({
    mode,
    selectionMode,
    initialFolderId,
    acceptedFileTypes,
    allowedFileTypes,
    provider,
    onFilesSelected,
    onClose,
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
    searchQuery: state.searchQuery,
    selectedFileTypes: state.selectedFileTypes,
    isLoading: state.isLoading,
    pagination: state.pagination,
    isUploadModalOpen: state.isUploadModalOpen,
    isCreateFolderModalOpen: state.isCreateFolderModalOpen,
    isMoveFileModalOpen: state.isMoveFileModalOpen,
    isRenameFolderModalOpen: state.isRenameFolderModalOpen,
    mode: state.mode,
    selectionMode: state.selectionMode,
    acceptedFileTypes: state.acceptedFileTypes,

    // Setters
    setSearchQuery: state.setSearchQuery,
    setSelectedFileTypes: state.setSelectedFileTypes,
    setIsUploadModalOpen: state.setIsUploadModalOpen,
    setIsCreateFolderModalOpen: state.setIsCreateFolderModalOpen,
    setIsMoveFileModalOpen: state.setIsMoveFileModalOpen,

    setSelectedFiles: state.setSelectedFiles,
    setSelectedFolders: state.setSelectedFolders,
    setIsRenameFolderModalOpen: state.setIsRenameFolderModalOpen,

    // Handlers
    handleFileSelect: handlers.handleFileSelect,
    handleFolderSelect: handlers.handleFolderSelect,
    handleFolderClick: handlers.handleFolderClick,
    handleClearSelection: handlers.handleClearSelection,
    handleSelectAllGlobal: handlers.handleSelectAllGlobal,
    handleSelectAllFolders: handlers.handleSelectAllFolders,
    handleSelectAllFiles: handlers.handleSelectAllFiles,
    handlePageChange: handlers.handlePageChange,

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
    getGlobalCheckboxState: state.getGlobalCheckboxState,
    getFoldersCheckboxState: state.getFoldersCheckboxState,
    getFilesCheckboxState: state.getFilesCheckboxState,

    // Callbacks
    onClose: state.onClose,
    onFilesSelected: state.onFilesSelected,
    provider,
  }), [state, handlers, provider]);

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
