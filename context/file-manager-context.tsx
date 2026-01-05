"use client";

import { useFileHandlers, useFileState } from "@/hooks";
import { MockProvider } from "@/providers/mock-provider";
import { EntityId, FileManagerProps, FileMetaData, FileType, FolderId, Folder, PaginationInfo, Mode, SelectionMode, SELECTION_MODE, MODE } from "@/types/file-manager";
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
  isLoading: boolean;
  pagination: PaginationInfo;

  //modal
  isUploadModalOpen: boolean;
  isCreateFolderModalOpen: boolean;
  isMoveFileModalOpen: boolean;
  isRenameFolderModalOpen: boolean;


  mode: Mode;
  selectionMode: SelectionMode;
  acceptedFileTypesForModal?: FileType[]; // what type of files, your file-manager will handel, like images, videos, etc.

  // Provider
  provider: IFileManagerProvider;
  basePath?: string;

  // Setters
  setSearchQuery: (query: string) => void;
  setSelectedFiles: (files: FileMetaData[]) => void;
  setSelectedFolders: (folders: Folder[]) => void;
  
  //Modals Setters
  setIsUploadModalOpen: (isOpen: boolean) => void;
  setIsCreateFolderModalOpen: (isOpen: boolean) => void;
  setIsMoveFileModalOpen: (isOpen: boolean) => void;
  setIsRenameFolderModalOpen: (isOpen: boolean) => void;

  // Handlers
  handleFileClick: (file: FileMetaData, event?: React.MouseEvent, isCheckboxClick?: boolean) => void;
  handleFolderClick: (folder: Folder | null, event?: React.MouseEvent, isCheckboxClick?: boolean) => void;
  handleClearSelection: () => void;
  handleSelectAllGlobal: (checked: boolean) => void;

  setCurrentPage: (page: number) => void;

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
}: FileManagerProps & { children: React.ReactNode }) {
  
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
    searchQuery: state.searchQuery,
    isLoading: state.isLoading,
    pagination: state.pagination,
    isUploadModalOpen: state.isUploadModalOpen,
    isCreateFolderModalOpen: state.isCreateFolderModalOpen,
    isMoveFileModalOpen: state.isMoveFileModalOpen,
    isRenameFolderModalOpen: state.isRenameFolderModalOpen,
    mode: state.mode,
    selectionMode: state.selectionMode,
    acceptedFileTypesForModal: state.acceptedFileTypesForModal,

    // Setters
    setSearchQuery: state.setSearchQuery,
    setIsUploadModalOpen: state.setIsUploadModalOpen,
    setIsCreateFolderModalOpen: state.setIsCreateFolderModalOpen,
    setIsMoveFileModalOpen: state.setIsMoveFileModalOpen,

    setSelectedFiles: state.setSelectedFiles,
    setSelectedFolders: state.setSelectedFolders,
    setIsRenameFolderModalOpen: state.setIsRenameFolderModalOpen,

    // Handlers
    // Handlers
    handleFileClick: handlers.handleFileClick,
    handleFolderClick: handlers.handleFolderClick,
    handleClearSelection: handlers.handleClearSelection,
    handleSelectAllGlobal: handlers.handleSelectAllGlobal,

    setCurrentPage: handlers.setCurrentPage,


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
