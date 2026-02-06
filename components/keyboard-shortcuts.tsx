"use client";

import { useEffect } from "react";
import { useFileManager } from "@/context/file-manager-context";

/**
 * Keyboard shortcuts for page mode file manager
 * Must be rendered inside FileManagerProvider
 */
export function KeyboardShortcuts() {
  const { 
    handleSelectAllGlobal, 
    handleClearSelection, 
    getSelectionState,
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isSearchModalOpen,
    setIsSearchModalOpen
  } = useFileManager();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K - Toggle Search Modal
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchModalOpen(!isSearchModalOpen);
      }

      // Cmd/Ctrl+A - Toggle Select All/Unselect All
      if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        
        // Toggle selection: if all are selected, unselect; otherwise select all
        const selectionState = getSelectionState();
        if (selectionState === true) {
          // All items are selected, so unselect them
          handleClearSelection();
        } else {
          // Nothing or some items selected, so select all
          handleSelectAllGlobal(true);
        }
      }

      // Cmd/Ctrl+F - Toggle Create Folder Modal
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCreateFolderModalOpen(!isCreateFolderModalOpen);
      }

      // Cmd/Ctrl+U - Toggle Upload Files Modal
      if (e.key === "u" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsUploadModalOpen(!isUploadModalOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectAllGlobal, handleClearSelection, getSelectionState, isCreateFolderModalOpen, setIsCreateFolderModalOpen, isUploadModalOpen, setIsUploadModalOpen, isSearchModalOpen, setIsSearchModalOpen]);

  return null;
}
