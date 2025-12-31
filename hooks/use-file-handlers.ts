"use client";

import { useCallback, MouseEvent } from "react";
import { FileState } from "./use-file-state";
import { FileMetaData, Folder, FolderId } from "@/types/file-manager";
import { FileUploadInput } from "@/types/provider";

export function useFileHandlers(state: FileState) {
  const {
    mode,
    selectionMode,
    files,
    selectedFiles,
    selectedFolders,
    currentFolder,
    currentFolders,
    setSelectedFiles,
    setSelectedFolders,
    setCurrentFolder,
    setPagination,
    loadFiles,
    loadFolders,
    isInSelectionMode,
    provider,
    router,
    onFilesSelected,
    onClose,
  } = state;

  //File Selection
  const handleFileSelect = useCallback(
    (file: FileMetaData, event?: MouseEvent, isCheckboxClick = false) => {
      if (isCheckboxClick) {
        setSelectedFiles((prev) => {
          const isSelected = prev.find((f) => f.id === file.id);
          if (isSelected) {
            return prev.filter((f) => f.id !== file.id);
          } else {
            return [...prev, file];
          }
        });
        return;
      }

      if (event && (event.metaKey || event.ctrlKey)) {
        setSelectedFiles((prev) => {
          const isSelected = prev.some((f) => f.id === file.id);
          return isSelected
            ? prev.filter((f) => f.id !== file.id)
            : [...prev, file];
        });
        return;
      }

      if (isInSelectionMode()) {
        setSelectedFiles((prev) => {
          const isSelected = prev.some((f) => f.id === file.id);
          return isSelected
            ? prev.filter((f) => f.id !== file.id)
            : [...prev, file];
        });
      } else {
        setSelectedFiles([file]);
        if (mode === "modal" && selectionMode === "single") {
          onFilesSelected?.([file]);
          onClose?.();
        }
      }
    },
    [
      mode,
      selectionMode,
      isInSelectionMode,
      setSelectedFiles,
      onFilesSelected,
      onClose,
    ]
  );


  // Folder Navigation
  const handleFolderSelect = useCallback((folderId: FolderId) => {
    // If navigating to root (null), set currentFolder to null immediately
    if (folderId === null) {
      setCurrentFolder(null);
    }
    // If we have the folder in the current list, we could set it immediately to avoid loading state
    // but the effect in useFileState will handle fetching details if needed.
    
    setSelectedFiles([]);
    setSelectedFolders([]);

    if (mode === "page") {
      const newUrl = (folderId === null ) ? "/media" : `/media/${folderId}`;
      router.push(newUrl);
    }
  }, [mode, router, setCurrentFolder, setSelectedFiles, setSelectedFolders]);

    // Folder Click (selection vs navigation)
  const handleFolderClick = useCallback((
    folder: Folder,
    event: MouseEvent,
    isCheckboxClick = false
  ) => {
    if (isCheckboxClick) {
      setSelectedFolders((prev) => {
        const isSelected = prev.some((f) => f.id === folder.id);
        return isSelected ? prev.filter((f) => f.id !== folder.id) : [...prev, folder];
      });
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      setSelectedFolders((prev) => {
        const isSelected = prev.some((f) => f.id === folder.id);
        return isSelected ? prev.filter((f) => f.id !== folder.id) : [...prev, folder];
      });
      return;
    }

    if (isInSelectionMode()) {
      setSelectedFolders((prev) => {
        const isSelected = prev.some((f) => f.id === folder.id);
        return isSelected ? prev.filter((f) => f.id !== folder.id) : [...prev, folder];
      });
    } else {
      handleFolderSelect(folder.id);
    }
  }, [isInSelectionMode, setSelectedFolders, handleFolderSelect]);

    // Selection helpers
  const handleClearSelection = useCallback(() => {
    setSelectedFiles([]);
    setSelectedFolders([]);
  }, [setSelectedFiles, setSelectedFolders]);

    const handleSelectAllGlobal = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedFiles(files);
      setSelectedFolders(mode === "page" ? currentFolders : []);
    } else {
      setSelectedFiles([]);
      setSelectedFolders([]);
    }
  }, [files, currentFolders, mode, setSelectedFiles, setSelectedFolders]);

  const handleSelectAllFolders = useCallback((checked: boolean) => {
    setSelectedFolders(checked ? currentFolders : []);
  }, [currentFolders, setSelectedFolders]);

  const handleSelectAllFiles = useCallback((checked: boolean) => {
    setSelectedFiles(checked ? files : []);
  }, [files, setSelectedFiles]);


  // Pagination
  const handlePageChange = useCallback((page: number) => {

    //update the provider pagination state if applicable
    

    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, [setPagination]);


  // CRUD Operations
  const uploadFiles = useCallback(async (fileUploadInput: FileUploadInput[]) => {
    try {
      await provider.uploadFiles(fileUploadInput, currentFolder?.id ?? null);
      await loadFiles();
      setSelectedFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }, [currentFolder, provider, loadFiles, setSelectedFiles]);
  const createFolder = useCallback(async (name: string) => {
    try {
      await provider.createFolder(
        name,
        currentFolder?.id ?? null
      );
      await loadFolders();
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  }, [currentFolder, provider, loadFolders, setSelectedFiles]);

  const bulkMove = useCallback(async (targetFolderId: FolderId) => {
    try {
      if (selectedFiles.length > 0) {
        await provider.moveFiles(selectedFiles.map((f) => f.id), targetFolderId);
      }
      if (selectedFolders.length > 0) {
        await provider.moveFolders(selectedFolders.map((f) => f.id), targetFolderId);
      }
      await loadFiles();
      await loadFolders();
      setSelectedFiles([]);
      setSelectedFolders([]);
    } catch (error) {
      console.error("Failed to move items:", error);
    }
  }, [selectedFiles, selectedFolders, provider, loadFiles, loadFolders, setSelectedFiles, setSelectedFolders]);

  const renameFolder = useCallback(async (folderId: string | number, newName: string) => {
    try {
      await provider.renameFolder(folderId, newName);
      await loadFolders();
    } catch (error) {
      console.error("Failed to rename folder:", error);
    }
  }, [provider, loadFolders]);

  const updateFileMetadata = useCallback(async (fileId: string | number, metadata: Partial<FileMetaData>) => {
    try {
      await provider.updateFileMetaData(fileId, metadata);
      await loadFiles();
    } catch (error) {
      console.error("Failed to update metadata:", error);
    }
  }, [provider, loadFiles]);

  const bulkDelete = useCallback(async () => {
    try {
      if (selectedFiles.length > 0) {
        await provider.deleteFiles(selectedFiles.map((f) => f.id));
      }
      if (selectedFolders.length > 0) {
        await provider.deleteFolders(selectedFolders.map((f) => f.id));
      }
      await loadFiles();
      await loadFolders();
      setSelectedFiles([]);
      setSelectedFolders([]);
    } catch (error) {
      console.error("Failed to delete items:", error);
    }
  }, [selectedFiles, selectedFolders, provider, loadFiles, loadFolders, setSelectedFiles, setSelectedFolders]);

  const refreshData = useCallback(async () => {
    await loadFolders();
    await loadFiles();
  }, [loadFolders, loadFiles]);

  return {
    // Selection handlers
    handleFileSelect,
    handleFolderSelect,
    handleFolderClick,
    handleClearSelection,
    handleSelectAllGlobal,
    handleSelectAllFolders,
    handleSelectAllFiles,
    handlePageChange,

    // CRUD
    uploadFiles,
    createFolder,
    bulkMove,
    renameFolder,
    updateFileMetadata,
    bulkDelete,
    refreshData,
  };
}

export type FileHandlers = ReturnType<typeof useFileHandlers>;
