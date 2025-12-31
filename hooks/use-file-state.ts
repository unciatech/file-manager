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
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
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
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);


  //load folders
  const loadFolders = useCallback(async () => {
    try {
      // Need to fetch current folder details if we have an ID but no object (e.g. from URL)
      // This part is tricky because currentFolder might be null initially but folderId memo is set
      
      const foldersData = await provider.getFolders(currentFolder?.id ?? null);
      setFolders(foldersData);
    } catch (error) {
      console.error("Failed to load folders:", error);
    }
  }, [currentFolder, provider]);
  
  // Load files
  const loadFiles = useCallback(async () => {
    const { currentPage, filesPerPage } = paginationRef.current;
    setIsLoading(true);
    try {
      const result = await provider.getFiles(
        currentFolder?.id ?? null,
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
  }, [currentFolder, searchQuery, selectedFileTypes, mode, acceptedFileTypes, allowedFileTypes, provider]);

  // Initial data load & Current Folder Sync
  useEffect(() => {
    const fetchCurrentFolder = async () => {
       if (folderId && (!currentFolder || currentFolder.id !== folderId)) {
           try{
               const folder = await provider.getFolder(folderId);
               setCurrentFolder(folder);
           }catch(e){
               console.error("Failed to fetch current folder", e);
               setCurrentFolder(null); // Fallback to root? Or error state?
           }
       } else if (folderId === null && currentFolder !== null) {
           setCurrentFolder(null);
       }
    };
    fetchCurrentFolder();
  }, [folderId, provider]); // Removed currentFolder dependency to avoid loops, logic inside handles it

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
  }, [currentFolder, searchQuery]);


  const isInSelectionMode = () => selectedFiles.length > 0 || selectedFolders.length > 0;
  const getCurrentFolder = () => currentFolder;

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
    currentFolder,
    searchQuery,
    selectedFileTypes,
    isLoading,
    pagination,
    isUploadModalOpen,
    isCreateFolderModalOpen,
    isMoveFileModalOpen,
    isRenameFolderModalOpen,
    currentFolders : folders,

    // Setters
    setFiles,
    setFolders,
    setSelectedFiles,
    setSelectedFolders,
    setCurrentFolder,
    setSearchQuery,
    setSelectedFileTypes,

    setPagination,
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    setIsMoveFileModalOpen,
    setIsRenameFolderModalOpen,

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
