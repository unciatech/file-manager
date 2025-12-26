"use client";

import {
  FileMetaData,
  FileStateOptions,
  FileType,
  Folder,
  FolderId,
  MODE,
  PaginationInfo,
} from "@/types/file-manager";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useFileState(options: FileStateOptions) {
  const {
    mode,
    selectionMode,
    initialFolderId,
    acceptedFileTypes,
    allowedFileTypes,
    provider,
    onFilesSelected,
    onClose,
  } = options;

  const router = useRouter();
  const params = useParams();

  // Determine initial folder from params if in page mode
  const folderId = useMemo<FolderId>(() => {
    if (mode === MODE.PAGE && params?.path) {
      const path = Array.isArray(params.path) ? params.path[0] : params.path;

      return typeof path === "string" && /^\d+$/.test(path)
        ? Number(path)
        : null;
    }

    return initialFolderId ?? null;
  }, [mode, params, initialFolderId]);

  // Core State
  const [files, setFiles] = useState<FileMetaData[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileMetaData[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]); 
  const [currentFolderId, setCurrentFolderId] = useState<FolderId>(folderId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileTypes, setSelectedFileTypes] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalFiles: 0,
    filesPerPage: 20,
  });

  // Ref to track latest pagination values to avoid stale closures
  const paginationRef = useRef(pagination);
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isMoveFileModalOpen, setIsMoveFileModalOpen] = useState(false);


  //load folders
  const loadFolders = useCallback(async () => {
    try {
      const foldersData = await provider.getFolders(currentFolderId || null);
      setFolders(foldersData);
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  }, [currentFolderId, provider]);
  
  // Load files
  const loadFiles = useCallback(async () => {
    const { currentPage, filesPerPage } = paginationRef.current;
    setIsLoading(true);
    try {
      const result = await provider.getFiles(
        currentFolderId || null,
        selectedFileTypes.length > 0 ? selectedFileTypes : null,
        searchQuery,
        currentPage,
        filesPerPage,
      );

      let filteredFiles = result.files;

      // Filter by accepted file types for modal mode
      if (mode === "modal" && acceptedFileTypes) {
        filteredFiles = filteredFiles.filter((file) =>
          acceptedFileTypes.includes(file.type)
        );
      }

      // Filter by allowed file types if specified
      if (allowedFileTypes) {
        filteredFiles = filteredFiles.filter((file) =>
          allowedFileTypes.includes(file.type)
        );
      }

      setFiles(filteredFiles);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, searchQuery, selectedFileTypes, mode, acceptedFileTypes, allowedFileTypes, provider]);

  // Initial data load
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Clear selected file when folder/search changes
  useEffect(() => {
    setSelectedFolders([]);
    setSelectedFiles([]);
  }, [currentFolderId, searchQuery]);


  const isInSelectionMode = () => selectedFiles.length > 0 || selectedFolders.length > 0;
  const getCurrentFolder = () => folders.find((f) => f.id === currentFolderId) || null;

  // Checkbox states
  const getGlobalCheckboxState = () => {
    const totalItems = files.length + (mode === "page" ? folders.length : 0);
    const selectedItems = selectedFiles.length + selectedFolders.length;
    if (selectedItems === 0) return false;
    if (selectedItems === totalItems) return true;
    return "indeterminate";
  };

  const getFoldersCheckboxState = () => {
    if (folders.length === 0) return false;
    if (selectedFolders.length === 0) return false;
    if (selectedFolders.length === folders.length) return true;
    return "indeterminate";
  };

  const getFilesCheckboxState = () => {
    if (files.length === 0) return false;
    if (selectedFiles.length === 0) return false;
    if (selectedFiles.length === files.length) return true;
    return "indeterminate";
  };
return {
    // State
    files,
    folders,
    selectedFiles,
    selectedFolders,
    currentFolderId,
    searchQuery,
    selectedFileTypes,
    isLoading,
    pagination,
    isUploadModalOpen,
    isCreateFolderModalOpen,
    isMoveFileModalOpen,
    currentFolders : folders,

    // Setters
    setFiles,
    setFolders,
    setSelectedFiles,
    setSelectedFolders,
    setCurrentFolderId,
    setSearchQuery,
    setSelectedFileTypes,
    setPagination,
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    setIsMoveFileModalOpen,

    // Loaders
    loadFolders,
    loadFiles,

    // Computed
    isInSelectionMode,
    getCurrentFolder,
    getGlobalCheckboxState,
    getFoldersCheckboxState,
    getFilesCheckboxState,

    // Config
    mode,
    selectionMode,
    acceptedFileTypes,
    provider,
    router,
    onFilesSelected,
    onClose,
  };
}

export type FileState = ReturnType<typeof useFileState>;
