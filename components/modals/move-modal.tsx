'use client';

import { useState, useEffect } from "react";
import { useFileManager } from "@/context/file-manager-context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { FolderId, Folder } from "@/types/file-manager";
import { ChevronRight } from 'lucide-react';
import FolderIcon from "../icons/folder";
import { middleTruncate } from "@/lib/truncate-name";

type FolderTreeState = {
  folders: Map<FolderId, Folder[]>; // parentId -> children
  loading: Set<FolderId>;
  loaded: Set<FolderId>;
};

function FolderTreeItem({
  folder,
  selectedFolderId,
  onSelect,
  onLoadChildren,
  disabledFolderIds = [],
  treeState
}: {
  folder: Folder;
  selectedFolderId: FolderId;
  onSelect: (folderId: FolderId) => void;
  onLoadChildren: (folderId: FolderId) => Promise<void>;
  disabledFolderIds?: FolderId[];
  treeState: FolderTreeState;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = (folder.folderCount ?? 0) > 0;
  const isSelected = selectedFolderId === folder.id;
  const isDisabled = disabledFolderIds.includes(folder.id);
  const isLoading = treeState.loading.has(folder.id);
  const isLoaded = treeState.loaded.has(folder.id);
  const children = treeState.folders.get(folder.id) || [];

  const handleToggle = async () => {
    if (!hasChildren) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Load children if opening and not yet loaded
    if (newIsOpen && !isLoaded && !isLoading) {
      await onLoadChildren(folder.id);
    }
  };

  const handleSelect = () => {
    if (!isDisabled) {
      onSelect(folder.id);
    }
  };

  return (
    <li>
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-1 -m-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={isOpen ? "Collapse folder" : "Expand folder"}
          >
            <ChevronRight
              className={`size-4 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            />
          </button>
        ) : (
          <div className="w-4" />
        )}

        <button
          onClick={handleSelect}
          disabled={isDisabled}
          title={folder.name}
          className={`flex items-center gap-1.5 px-2 py-1 rounded flex-1 text-left transition-colors min-w-0 ${isSelected
              ? 'bg-blue-100 text-blue-900'
              : isDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100'
            }`}
        >
          <FolderIcon className="size-5 text-sky-500 shrink-0" strokeWidth={1.5} />
          <span className="truncate min-w-0">{ middleTruncate(folder.name)} {isDisabled ? <span className="text-xs">(Already selected)</span> : ''}</span>
        </button>
      </div>

      {isOpen && (
        <ul className="pl-6">
          {isLoading ? (
            <li className="py-1">
              <div className="flex items-center gap-1.5 px-2">
                <div className="size-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            </li>
          ) : (
            children.map((childFolder) => (
              <FolderTreeItem
                key={childFolder.id}
                folder={childFolder}
                selectedFolderId={selectedFolderId}
                onSelect={onSelect}
                onLoadChildren={onLoadChildren}
                disabledFolderIds={disabledFolderIds}
                treeState={treeState}
              />
            ))
          )}
        </ul>
      )}
    </li>
  );
}

export function MoveModal() {
  const {
    isMoveFileModalOpen,
    setIsMoveFileModalOpen,
    selectedFiles,
    selectedFolders,
    bulkMove,
    provider
  } = useFileManager();

  const [targetFolderId, setTargetFolderId] = useState<FolderId>(null);
  const [treeState, setTreeState] = useState<FolderTreeState>({
    folders: new Map(),
    loading: new Set(),
    loaded: new Set()
  });
  const [isLoadingRoot, setIsLoadingRoot] = useState(false);
  const [hasLoadedRoot, setHasLoadedRoot] = useState(false);

  // Get list of folder IDs that should be disabled (can't move into themselves or their children)
  const disabledFolderIds = selectedFolders.map(f => f.id);

  // Get root folders from tree state
  const rootFolders = treeState.folders.get(null) || [];

  // Load root folders when modal opens
  useEffect(() => {
    if (isMoveFileModalOpen && !hasLoadedRoot && !isLoadingRoot) {
      loadRootFolders();
    }
  }, [isMoveFileModalOpen]);

  const loadRootFolders = async () => {
    if (hasLoadedRoot) return;

    setIsLoadingRoot(true);
    try {
      const folders = await provider.getFolders(null);
      setTreeState(prev => ({
        ...prev,
        folders: new Map(prev.folders).set(null, folders)
      }));
      setHasLoadedRoot(true);
    } catch (error) {
      console.error('Failed to load root folders:', error);
    } finally {
      setIsLoadingRoot(false);
    }
  };

  // Load children for a specific folder
  const loadChildren = async (folderId: FolderId) => {
    // Mark as loading
    setTreeState(prev => ({
      ...prev,
      loading: new Set(prev.loading).add(folderId)
    }));

    try {
      const children = await provider.getFolders(folderId);

      setTreeState(prev => {
        const newLoading = new Set(prev.loading);
        newLoading.delete(folderId);

        const newLoaded = new Set(prev.loaded);
        newLoaded.add(folderId);

        const newFolders = new Map(prev.folders);
        newFolders.set(folderId, children);

        return {
          folders: newFolders,
          loading: newLoading,
          loaded: newLoaded
        };
      });
    } catch (error) {
      console.error('Failed to load folder children:', error);

      // Reset loading state on error
      setTreeState(prev => {
        const newLoading = new Set(prev.loading);
        newLoading.delete(folderId);

        return {
          ...prev,
          loading: newLoading
        };
      });
    }
  };

  const handleMove = () => {
    if (targetFolderId) {
      bulkMove(targetFolderId);
      setIsMoveFileModalOpen(false);
      setTargetFolderId(null);
      setHasLoadedRoot(false);
      setTreeState({
        folders: new Map(),
        loading: new Set(),
        loaded: new Set()
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsMoveFileModalOpen(open);
    if (open) {
      loadRootFolders();
    } else {
      setTargetFolderId(null);
      setHasLoadedRoot(false);
      setTreeState({
        folders: new Map(),
        loading: new Set(),
        loaded: new Set()
      });
    }
  };

  if (!isMoveFileModalOpen) return null;

  return (
    <Dialog open={isMoveFileModalOpen} onOpenChange={handleOpenChange} >
      <DialogContent className="p-0 max-w-3xl max-h-[90vh] flex flex-col" variant="default">
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">Move Items</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <ScrollArea className="text-sm h-full my-3 ps-6 pe-5 me-1">
          <div className="space-y-4">
            <p className="text-blue-600 text-xs">
              Moving {selectedFiles.length} file
              {selectedFiles.length === 1 ? "" : "s"} and{" "}
              {selectedFolders.length} folder
              {selectedFolders.length === 1 ? "" : "s"}.
            </p>

            <div>
              <label className="block mb-2 font-medium text-gray-900">
                Select destination folder:
              </label>

              {isLoadingRoot ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1">
                      <div className="size-5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="border border-gray-200 rounded-lg p-2 bg-white min-h-[200px]">
                  {rootFolders.length === 0 ? (
                    <li className="text-gray-500 text-center py-8">
                      No folders available
                    </li>
                  ) : (
                    rootFolders.map((folder) => (
                      <FolderTreeItem
                        key={folder.id}
                        folder={folder}
                        selectedFolderId={targetFolderId}
                        onSelect={setTargetFolderId}
                        onLoadChildren={loadChildren}
                        disabledFolderIds={disabledFolderIds}
                        treeState={treeState}
                      />
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleMove} disabled={!targetFolderId}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
