"use client";

import { useCallback, MouseEvent } from "react";
import { FileState } from "./use-file-state";
import { FileMetaData, Folder, FolderId, MODE } from "@/types/file-manager";
import { FileUploadInput } from "@/types/provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Helper function to toggle files in the selection
 * @param prev - Previous selection array
 * @param filesToToggle - Files to toggle
 * @returns Updated selection array
 */
const toggleFilesInSelection = (
  prev: FileMetaData[],
  filesToToggle: FileMetaData[]
): FileMetaData[] => {
  let updated = [...prev];
  filesToToggle.forEach((file) => {
    const isSelected = updated.some((f) => f.id === file.id);
    if (isSelected) {
      updated = updated.filter((f) => f.id !== file.id);
    } else {
      updated.push(file);
    }
  });
  return updated;
};

/**
 * Helper function to toggle folders in the selection
 * @param prev - Previous selection array
 * @param foldersToToggle - Folders to toggle
 * @returns Updated selection array
 */
const toggleFoldersInSelection = (
  prev: Folder[],
  foldersToToggle: Folder[]
): Folder[] => {
  let updated = [...prev];
  foldersToToggle.forEach((folder) => {
    const isSelected = updated.some((f) => f.id === folder.id);
    if (isSelected) {
      updated = updated.filter((f) => f.id !== folder.id);
    } else {
      updated.push(folder);
    }
  });
  return updated;
};

export function useFileHandlers(state: FileState) {
  const {
    mode,
    selectionMode,
    files,
    folders,
    selectedFiles,
    selectedFolders,
    currentFolder,
    setSelectedFiles,
    setSelectedFolders,
    setCurrentFolder,
    setPagination,
    loadFiles,
    loadFolders,
    isInSelectionMode,
    provider,
    onFilesSelected,
    onClose,
    basePath,
    setIsLoading,
    setFileDetailsModalFile,
  } = state;

  const router = useRouter();


  /**
   * Handles file click events
   * In modal mode: Selects the file and triggers callback
   * In page mode: Opens preview/details (placeholder)
   * 
   * @param file - The file that was clicked
   */
  /**
   * Handles file click/selection events
   * - Checkbox click or Ctrl/Cmd+click: Toggles file in selection
   * - Modal mode: Selects file and returns (single), or toggles (multiple)
   * - Page mode: Opens preview/details
   * 
   * @param file - The file that was clicked
   * @param event - Mouse event for detecting modifier keys
   * @param isCheckboxClick - Whether this was explicitly a selection action (checkbox)
   */
  const handleFileClick = useCallback(
    (file: FileMetaData, event?: MouseEvent, isCheckboxClick = false) => {
      const fileArray = [file];

      // 1. Explicit Selection Action (Checkbox or Ctrl/Cmd + Click)
      const isExplicitSelection = isCheckboxClick || (event && (event.metaKey || event.ctrlKey));

      if (isExplicitSelection) {
        setSelectedFiles((prev) => toggleFilesInSelection(prev, fileArray));
        return;
      }

      // 2. Already in Selection Mode -> Toggle behavior
      if (isInSelectionMode() && mode !== MODE.MODAL) {
         // In modal, we might want simple click to select, but for now consistent with page behavior:
         // If "Selecting...", click toggles. 
         setSelectedFiles((prev) => toggleFilesInSelection(prev, fileArray));
         return;
      }

      // 3. Modal Mode specific handling
      if (mode === MODE.MODAL) {
        if (selectionMode === "single") {
          setSelectedFiles([file]);
          onFilesSelected?.([file]);
          onClose?.();
        } else {
           // In multiple mode, regular click toggles
           setSelectedFiles((prev) => toggleFilesInSelection(prev, fileArray));
        }
        return;
      }

      // 4. Page Mode Regular Click -> Open Details Modal
      setFileDetailsModalFile(file);
    },
    [mode, selectionMode, isInSelectionMode, setSelectedFiles, onFilesSelected, onClose, setFileDetailsModalFile]
  );



  /**
   * Handles folder click/navigation events
   * - Checkbox click or Ctrl/Cmd+click: Toggles folder in selection
   * - Regular click: Navigates to the folder (clearing selections)
   * 
   * @param folder - The folder object, or null for Root
   * @param event - Mouse event for detecting modifier keys
   * @param isCheckboxClick - Whether this was explicitly a selection action
   */
  const handleFolderClick = useCallback(
    (folder: Folder | null, event?: MouseEvent, isCheckboxClick = false) => {
      const folderId = folder ? folder.id : null;

       // 1. Explicit Selection Action (Checkbox or Ctrl/Cmd + Click)
       // Note: Root (null) cannot be selected
      const isExplicitSelection = isCheckboxClick || (event && (event.metaKey || event.ctrlKey));
      
      if (isExplicitSelection && folder) {
        setSelectedFolders((prev) => toggleFoldersInSelection(prev, [folder]));
        return;
      }

      // 2. Already in Selection Mode -> Toggle (if not root)
      if (isInSelectionMode() && folder) {
        setSelectedFolders((prev) => toggleFoldersInSelection(prev, [folder]));
        return;
      }

      // 3. Navigation (Regular Click)
      if (mode === MODE.PAGE) {
        // Navigate immediately - let URL change trigger state updates
        // useFileState's useEffect will handle clearing selections
        setIsLoading(true); // Trigger loading explicitly for immediate feedback
        const path = basePath ?? '/media';
        const newUrl = folderId === null ? path : `${path}/${folderId}`;
        router.push(newUrl);
      } else {
        // Modal/other modes: manually update state
        setCurrentFolder(folder);
        setSelectedFiles([]);
        setSelectedFolders([]);
      }
    },
    [isInSelectionMode, mode, router, setCurrentFolder, setSelectedFolders, setSelectedFiles]
  );

  /**
   * Clears all selected files and folders
   */
  const handleClearSelection = useCallback(() => {
    setSelectedFiles([]);
    setSelectedFolders([]);
  }, [setSelectedFiles, setSelectedFolders]);

  /**
   * Selects or deselects all items (files and folders)
   * In page mode: Includes folders
   * In modal mode: Only files
   * 
   * @param checked - True to select all, false to deselect all
   */
  const handleSelectAllGlobal = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedFiles(files);
        setSelectedFolders(mode === MODE.PAGE ? folders : []);
      } else {
        setSelectedFiles([]);
        setSelectedFolders([]);
      }
    },
    [files, folders, mode, setSelectedFiles, setSelectedFolders]
  );



  /**
   * Updates the current page number
   * @param page - The new page number
   */
  const setCurrentPage = useCallback(
    (page: number) => {
      //update the provider pagination state if applicable

      setPagination((prev) => ({ ...prev, currentPage: page }));
    },
    [setPagination]
  );

  /**
   * Uploads files to the current folder
   * Clears selection after successful upload
   * 
   * @param fileUploadInput - Array of file upload data
   */
  const uploadFiles = useCallback(
    async (fileUploadInput: FileUploadInput[]) => {
      try {
        await provider.uploadFiles(fileUploadInput, currentFolder?.id ?? null);
        await loadFiles();
        setSelectedFiles([]);
        toast.success("Upload Successful", {
          description: `${fileUploadInput.length} file(s) uploaded successfully`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload files";
        toast.error("Upload Failed", {
          description: message,
        });
        console.error("Upload failed:", error);
      }
    },
    [currentFolder, provider, loadFiles, setSelectedFiles]
  );

  /**
   * Creates a new folder in the current directory
   * Clears selection after successful creation
   * 
   * @param name - Name of the folder to create
   */
  const createFolder = useCallback(
    async (name: string) => {
      try {
        await provider.createFolder(name, currentFolder?.id ?? null);
        await loadFolders();
        setSelectedFiles([]);
        toast.success("Folder Created", {
          description: `Folder "${name}" created successfully`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create folder";
        toast.error("Create Folder Failed", {
          description: message,
        });
        console.error("Failed to create folder:", error);
      }
    },
    [currentFolder, provider, loadFolders, setSelectedFiles]
  );

  /**
   * Moves selected files and folders to a target folder
   * Clears selection after successful move
   * 
   * @param targetFolderId - ID of the destination folder
   */
  const bulkMove = useCallback(
    async (targetFolderId: FolderId) => {
      try {
        if (selectedFiles.length > 0) {
          await provider.moveFiles(
            selectedFiles.map((f) => f.id),
            targetFolderId
          );
        }
        if (selectedFolders.length > 0) {
          await provider.moveFolders(
            selectedFolders.map((f) => f.id),
            targetFolderId
          );
        }
        await loadFiles();
        await loadFolders();
        setSelectedFiles([]);
        setSelectedFolders([]);
        const totalMoved = selectedFiles.length + selectedFolders.length;
        toast.success("Move Successful", {
          description: `${totalMoved} item(s) moved successfully`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to move items";
        toast.error("Move Failed", {
          description: message,
        });
        console.error("Failed to move items:", error);
      }
    },
    [
      selectedFiles,
      selectedFolders,
      provider,
      loadFiles,
      loadFolders,
      setSelectedFiles,
      setSelectedFolders,
    ]
  );

  /**
   * Renames a folder
   * @param folderId - ID of the folder to rename
   * @param newName - New name for the folder
   */
  const renameFolder = useCallback(
    async (folderId: string | number, newName: string) => {
      try {
        await provider.renameFolder(folderId, newName);
        await loadFolders();
        toast.success("Folder Renamed", {
          description: `Folder renamed to "${newName}"`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to rename folder";
        toast.error("Rename Failed", {
          description: message,
        });
        console.error("Failed to rename folder:", error);
      }
    },
    [provider, loadFolders]
  );

  /**
   * Updates metadata for a specific file
   * @param fileId - ID of the file to update
   * @param metadata - Partial metadata to update
   */
  const updateFileMetadata = useCallback(
    async (fileId: string | number, metadata: Partial<FileMetaData>) => {
      try {
        await provider.updateFileMetaData(fileId, metadata);
        await loadFiles();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update metadata";
        toast.error("Update Failed", {
          description: message,
        });
        console.error("Failed to update metadata:", error);
      }
    },
    [provider, loadFiles]
  );

  /**
   * Deletes all selected files and folders
   * Clears selection after successful deletion
   */
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
      const totalDeleted = selectedFiles.length + selectedFolders.length;
      toast.success("Delete Successful", {
        description: `${totalDeleted} item(s) deleted successfully`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete items";
      toast.error("Delete Failed", {
        description: message,
      });
      console.error("Failed to delete items:", error);
    }
  }, [
    selectedFiles,
    selectedFolders,
    provider,
    loadFiles,
    loadFolders,
    setSelectedFiles,
    setSelectedFolders,
  ]);

  /**
   * Refreshes all data by reloading folders and files
   */
  const refreshData = useCallback(async () => {
    await loadFolders();
    await loadFiles();
  }, [loadFolders, loadFiles]);

  return {
    // Selection handlers
    handleFileClick,
    handleFolderClick,
    handleClearSelection,
    handleSelectAllGlobal,

    setCurrentPage,

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
