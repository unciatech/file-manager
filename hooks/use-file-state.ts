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
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function useFileState(options: FileStateOptions) {
  const {
    mode,
    selectionMode,
    initialFolderId,
    acceptedFileTypesForModal,
    allowedFileTypes,
    provider,
    onFilesSelected,
    onClose,
    basePath,
  } = options;


  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Read pagination from URL
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limitFromUrl = Math.max(1, parseInt(searchParams.get('limit') || '24', 10));
  const queryFromUrl = searchParams.get('query') || '';


  // Determine folder from URL based on mode
  const folderId = useMemo<FolderId>(() => {
    if (mode === MODE.PAGE && params?.path) {
      // Page mode: Use path params (/media/123)
      const path = Array.isArray(params.path) ? params.path[0] : params.path;

      return typeof path === "string" && /^\d+$/.test(path)
        ? Number(path)
        : null;
    }

    if (mode === MODE.MODAL) {
      // Modal mode: Use search params (?folderId=123)
      const folderIdParam = searchParams.get('folderId');
      if (folderIdParam && /^\d+$/.test(folderIdParam)) {
        return Number(folderIdParam);
      }
    }

    return initialFolderId ?? null;
  }, [mode, params, searchParams, initialFolderId]);

  // Core State
  const [files, setFiles] = useState<FileMetaData[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileMetaData[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: pageFromUrl,
    totalPages: 1,
    totalFiles: 0,
    filesPerPage: limitFromUrl,
  });

  // Use ref to track current folder without triggering re-renders
  const currentFolderRef = useRef<Folder | null>(null);
  currentFolderRef.current = currentFolder;
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  
  // Track previous folder to detect changes
  const prevFolderIdRef = useRef<FolderId>(folderId);



  // Update URL params helper
  const updateUrlParams = useCallback((page: number, limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]); // Removed searchParams - it's read fresh on each call
  
  // Sync state when URL changes (browser back/forward)
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: pageFromUrl,
      filesPerPage: limitFromUrl,
    }));
    setSearchQuery(queryFromUrl);
  }, [pageFromUrl, limitFromUrl, queryFromUrl]);
  
  // Reset to page 1 when folder changes
  useEffect(() => {
    if (folderId !== prevFolderIdRef.current) {
      // Only update URL params in PAGE mode, not MODAL mode
      if (mode === MODE.PAGE) {
        updateUrlParams(1, limitFromUrl);
      }
      prevFolderIdRef.current = folderId;
    }
  }, [folderId, limitFromUrl, updateUrlParams, mode]);

  // Extract primitive values for dependency array (prevents unnecessary re-renders)
  const currentPage = pagination.currentPage;
  const filesPerPage = pagination.filesPerPage;

  // Consolidated useEffect: Sync current folder and load data
  // This replaces 4 separate useEffects to prevent re-render cascades
  useEffect(() => {
    let cancelled = false;

    const syncAndLoad = async () => {
      // Step 1: Sync current folder if needed
      if (folderId && (!currentFolderRef.current || currentFolderRef.current.id !== folderId)) {
        try {
          setIsLoading(true);
          const folder = await provider.getFolder(folderId);
          if (cancelled) return;
          setCurrentFolder(folder);
          
          // Load data for the new folder
          await loadDataForFolder(folder);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Failed to load folder";
          toast.error("Load Folder Failed", {
            description: message,
          });
          console.error("Failed to fetch current folder", e);
          if (cancelled) return;
          setCurrentFolder(null);
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      } else if (folderId === null && currentFolderRef.current !== null) {
        // Navigate to root
        setCurrentFolder(null);
        await loadDataForFolder(null);
      } else if (currentFolderRef.current) {
        // Folder is already set, just reload data (e.g., pagination changed)
        await loadDataForFolder(currentFolderRef.current);
      } else {
        // Initial load at root
        await loadDataForFolder(null);
      }
    };

    const loadDataForFolder = async (folder: Folder | null) => {
      if (cancelled) return;
      
      setIsLoading(true);
      try {
        // Determine file types based on mode
        let fileTypes: FileType[] | undefined = [];
        if (mode === MODE.MODAL) {
          fileTypes = acceptedFileTypesForModal;
        } else {
          fileTypes = allowedFileTypes;
        }

        // Use unified getItems method for combined pagination
        const result = await provider.getItems(
          folder?.id ?? null,
          fileTypes,
          currentPage,
          filesPerPage,
          searchQuery
        );

        if (cancelled) return;
        
        // Update state with combined results
        setFolders(result.folders);
        setFiles(result.files);
        setPagination(result.pagination);
        
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load data";
        toast.error("Load Data Failed", {
          description: message,
        });
        console.error("Failed to load data:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    syncAndLoad();

    return () => {
      cancelled = true;
    };
  }, [
    folderId,
    provider,
    mode,
    acceptedFileTypesForModal,
    allowedFileTypes,
    currentPage,
    filesPerPage,
    searchQuery,
  ]);

  // Clear selections when folder changes
  useEffect(() => {
    setSelectedFolders([]);
    setSelectedFiles([]);
  }, [currentFolder]);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMoveFileModalOpen, setIsMoveFileModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  
  // File Details Modal State
  const [fileDetailsModalFile, setFileDetailsModalFile] = useState<FileMetaData | null>(null);

  // Manual reload functions for components that need to refresh data
  const loadFolders = useCallback(async () => {
    try {
      const foldersResult = await provider.getFolders(
        currentFolder?.id ?? null,
        pagination.currentPage,
        pagination.filesPerPage
      );
      setFolders(foldersResult.folders);
      setPagination(foldersResult.pagination);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load folders";
      toast.error("Load Folders Failed", {
        description: message,
      });
      console.error("Failed to load folders:", error);
    }
  }, [currentFolder, provider, pagination, setFolders]);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      let fileTypes: FileType[] | undefined = [];
      if (mode === MODE.MODAL) {
        fileTypes = acceptedFileTypesForModal;
      } else {
        fileTypes = allowedFileTypes;
      }

      const result = await provider.getFiles(
        currentFolder?.id ?? null,
        fileTypes,
        pagination.currentPage,
        pagination.filesPerPage
      );

      setFiles(result.files);
      setPagination(result.pagination);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load files";
      toast.error("Load Files Failed", {
        description: message,
      });
      console.error("Failed to load files:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolder, acceptedFileTypesForModal, mode, allowedFileTypes, provider, pagination.currentPage, pagination.filesPerPage]);

  /**
   * Unified data loader that mirrors the main useEffect logic
   * Uses getItems for consistent pagination of files + folders together
   * @param silent - If true, skips showing loading state (for background refreshes)
   */
  const loadData = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      // Determine file types based on mode
      let fileTypes: FileType[] | undefined = [];
      if (mode === MODE.MODAL) {
        fileTypes = acceptedFileTypesForModal;
      } else {
        fileTypes = allowedFileTypes;
      }

      // Use unified getItems method for combined pagination
      const result = await provider.getItems(
        currentFolder?.id ?? null,
        fileTypes,
        currentPage,
        filesPerPage,
        searchQuery
      );

      setFolders(result.folders);
      setFiles(result.files);
      setPagination(result.pagination);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load data";
      toast.error("Load Data Failed", {
        description: message,
      });
      console.error("Failed to load data:", error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [currentFolder, mode, acceptedFileTypesForModal, allowedFileTypes, provider, currentPage, filesPerPage, searchQuery]);

  const isInSelectionMode = () => selectedFiles.length > 0 || selectedFolders.length > 0;
  const getCurrentFolder = () => currentFolder;

  // Checkbox states - memoized to prevent recalculation on every render
  const getSelectionState = useMemo(() => {
    return () => {
      const totalItems = files.length + (mode === MODE.PAGE ? folders.length : 0);
      const selectedItems = selectedFiles.length + selectedFolders.length;
      if (selectedItems === 0) return false;
      if (selectedItems === totalItems) return true;
      return "indeterminate";
    };
  }, [files.length, folders.length, selectedFiles.length, selectedFolders.length, mode]);



  // Pagination change handler
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    // Only update URL in PAGE mode, not MODAL mode
    if (mode === MODE.PAGE) {
      updateUrlParams(newPage, filesPerPage);
    }
  }, [updateUrlParams, filesPerPage, mode]);
  
  // Update search query and sync with URL
  const updateSearchQuery = useCallback((newQuery: string) => {
    setSearchQuery(newQuery);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery.trim()) {
      params.set('query', newQuery);
      params.set('page', '1'); // Reset to page 1 on new search
    } else {
      params.delete('query');
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]); // Removed searchParams - it's read fresh on each call

  return {
    // State
    files,
    folders,
    selectedFiles,
    selectedFolders,
    currentFolder,
    isLoading,
    pagination,
    isUploadModalOpen,
    isCreateFolderModalOpen,
    isSearchModalOpen,
    isMoveFileModalOpen,
    isRenameFolderModalOpen,
    fileDetailsModalFile,

    // Setters
    setFiles,
    setFolders,
    setSelectedFiles,
    setSelectedFolders,
    setCurrentFolder,
    setPagination,

    //Modal Setters
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    setIsSearchModalOpen,
    setIsMoveFileModalOpen,
    setIsRenameFolderModalOpen,
    setFileDetailsModalFile,

    // Loaders
    loadFolders,
    loadFiles,
    loadData,

    setIsLoading,

    // Computed
    isInSelectionMode,
    getCurrentFolder,
    getSelectionState,
    
    // Pagination handlers
    handlePageChange,
    
    // Search
    searchQuery,
    updateSearchQuery,

    // Config
    mode,
    selectionMode,
    acceptedFileTypesForModal,
    provider,
    onFilesSelected,
    onClose,
    basePath,
  };
}

export type FileState = ReturnType<typeof useFileState>;
