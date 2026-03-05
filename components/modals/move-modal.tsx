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
import { Button } from "../ui/button";
import { FolderId, Folder, PaginationInfo } from "@/types/file-manager";
import { ChevronRightIcon, Loader2Icon } from '../icons';
import FolderIcon from "../icons/folder";
import { middleTruncate } from "@/lib/truncate-name";
import { CrossIcon } from "../icons";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

type FolderTreeState = {
  folders: Map<FolderId, Folder[]>; // parentId -> children
  // IDs currently fetching data (including null for root)
  // We can track which page is loading if needed, but simple boolean per folderId is often enough
  loading: Set<FolderId>; 
  loaded: Set<FolderId>;
  // Store pagination info per folderId (parentId)
  pagination: Map<FolderId, PaginationInfo>;
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
  selectedFolderId: FolderId | undefined;
  onSelect: (folderId: FolderId) => void;
  onLoadChildren: (folderId: FolderId, page?: number) => Promise<void>;
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
  const pagination = treeState.pagination.get(folder.id);

  // Intersection Observer for infinite scroll
  const { ref: observerRef, entry } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  const hasMore = pagination && pagination.currentPage < pagination.totalPages;

  useEffect(() => {
    if (isOpen && entry?.isIntersecting && hasMore && !isLoading) {
      const nextPage = (pagination?.currentPage || 1) + 1;
      onLoadChildren(folder.id, nextPage);
    }
  }, [entry?.isIntersecting, hasMore, isLoading, isOpen, pagination, folder.id, onLoadChildren]);


  const handleToggle = async () => {
    if (!hasChildren) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Load children if opening and not yet loaded
    if (newIsOpen && !isLoaded && !isLoading) {
      await onLoadChildren(folder.id, 1);
    }
  };

  const handleSelect = () => {
    if (!isDisabled) {
      onSelect(folder.id);
    }
  };

  return (
    <li >
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="p-1 -m-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors"
            aria-label={isOpen ? "Collapse folder" : "Expand folder"}
          >
            <ChevronRightIcon
              className={`size-4 text-gray-500 dark:text-zinc-400 transition-transform ${!isDisabled && isOpen ? 'rotate-90' : ''}`}
            />
          </button>
        ) : (
          <div className="w-4" />
        )}

        <button
          onClick={handleSelect}
          disabled={isDisabled}
          title={folder.name}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-xl flex-1 text-left transition-colors min-w-0 ${isSelected
              ? 'bg-blue-100 text-blue-600 font-semibold'
              : isDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-zinc-700'
            }`}
        >
          <FolderIcon className="size-8 text-white shrink-0" strokeWidth={1.5} />
          <div className="flex flex-col gap-1">
            <span className="truncate min-w-0">{ middleTruncate(folder.name, 15)}</span>
            {isDisabled ? <span className="text-[0.6rem] text-left font-medium text-gray-900 dark:text-zinc-300">(Already selected)</span> : ''}
          </div>
        </button>
      </div>

      {!isDisabled && isOpen && (
        <ul className="pl-6">
          {children.map((childFolder) => (
              <FolderTreeItem
                key={childFolder.id}
                folder={childFolder}
                selectedFolderId={selectedFolderId}
                onSelect={onSelect}
                onLoadChildren={onLoadChildren}
                disabledFolderIds={disabledFolderIds}
                treeState={treeState}
              />
            ))}
            
            {/* Loading Indicator / Sentinel */}
            {(isLoading || hasMore) && (
              <li ref={observerRef} className="py-2 pl-6 flex justify-start">
                 <Loader2Icon className="h-4 w-4 animate-spin text-blue-500" />
              </li>
            )}

             {/* Initial loading state specifically when no children loaded yet */}
             {isLoading && children.length === 0 && (
                 <li className="py-1">
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="text-sm text-gray-500 dark:text-zinc-400">Loading...</span>
                  </div>
                </li>
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

  const [targetFolderId, setTargetFolderId] = useState<FolderId | undefined>(undefined);
  const [treeState, setTreeState] = useState<FolderTreeState>({
    folders: new Map(),
    loading: new Set(),
    loaded: new Set(),
    pagination: new Map()
  });
  
  // Intersection Observer for Root list infinite scroll
  const { ref: rootObserverRef, entry: rootEntry } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  const rootPagination = treeState.pagination.get(null);
  const rootHasMore = rootPagination && rootPagination.currentPage < rootPagination.totalPages;
  const isRootLoading = treeState.loading.has(null);

  // Get list of folder IDs that should be disabled (can't move into themselves or their children)
  const disabledFolderIds = selectedFolders.map(f => f.id);

  // Get root folders from tree state
  const rootFolders = treeState.folders.get(null) || [];

  // Load root folders when modal opens
  useEffect(() => {
    if (isMoveFileModalOpen && !treeState.loaded.has(null) && !treeState.loading.has(null)) {
      loadFolders(null, 1);
    }
  }, [isMoveFileModalOpen]);

   // Trigger load more for root
   useEffect(() => {
    if (isMoveFileModalOpen && rootEntry?.isIntersecting && rootHasMore && !isRootLoading) {
        const nextPage = (rootPagination?.currentPage || 1) + 1;
        loadFolders(null, nextPage);
    }
  }, [rootEntry?.isIntersecting, rootHasMore, isRootLoading, rootPagination, isMoveFileModalOpen]);


  const loadFolders = async (folderId: FolderId, page: number = 1) => {
    // Prevent duplicate loading
    if (treeState.loading.has(folderId)) return;

    // Mark as loading
    setTreeState(prev => ({
      ...prev,
      loading: new Set(prev.loading).add(folderId)
    }));

    try {
      // Assuming 20 items per page for the modal list to be performant but substantial
      const result = await provider.getFolders(folderId, page, 20);

      setTreeState(prev => {
        const newLoading = new Set(prev.loading);
        newLoading.delete(folderId);

        const newLoaded = new Set(prev.loaded);
        newLoaded.add(folderId);

        const newFolders = new Map(prev.folders);
        const existingFolders = newFolders.get(folderId) || [];
        
        // Append if page > 1, otherwise replace (shouldn't really happen with this logic but safer)
        if (page > 1) {
            newFolders.set(folderId, [...existingFolders, ...result.folders]);
        } else {
            newFolders.set(folderId, result.folders);
        }

        const newPagination = new Map(prev.pagination);
        newPagination.set(folderId, result.pagination);

        return {
          folders: newFolders,
          loading: newLoading,
          loaded: newLoaded,
          pagination: newPagination
        };
      });
    } catch (error) {
      console.error(`Failed to load folders for ${folderId}:`, error);

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
    if (targetFolderId !== undefined) {
      bulkMove(targetFolderId);
      setIsMoveFileModalOpen(false);
      setTargetFolderId(undefined);
      setTreeState({
        folders: new Map(),
        loading: new Set(),
        loaded: new Set(),
        pagination: new Map()
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsMoveFileModalOpen(open);
    if (open) {
      loadFolders(null, 1);
    } else {
      setTargetFolderId(undefined);
      setTreeState({
        folders: new Map(),
        loading: new Set(),
        loaded: new Set(),
        pagination: new Map()
      });
    }
  };

  if (!isMoveFileModalOpen) return null;

  return (
    <Dialog open={isMoveFileModalOpen} onOpenChange={handleOpenChange} >
      <DialogContent className="p-0 max-w-3xl max-h-full m-auto md:max-h-[80vh] flex flex-col" variant="fullscreen" showCloseButton={false}>
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">
            <div className="flex w-full items-center justify-between gap-2">
            <span className="w-full text-left">
              Move Items
              <p className="text-gray-400 text-xs">
                Moving {selectedFiles.length} file
                {selectedFiles.length === 1 ? "" : "s"} and{" "}
                {selectedFolders.length} folder
                {selectedFolders.length === 1 ? "" : "s"}.
              </p>
              </span>

              <Button
                variant="outline"
                size="icon"
                radius="full"
                onClick={() => handleOpenChange(false)}
                className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
              >
            <CrossIcon className="size-5 text-gray-600 dark:text-zinc-400" />
            <span className="hidden">Close</span>
          </Button>
        </div>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="text-sm my-3 px-6 flex-1 flex flex-col min-h-0">
          <div className="space-y-4 flex flex-col flex-1 min-h-0">
            <div className="flex flex-col flex-1 min-h-0">
              <label className="block mb-2 font-medium text-gray-900 dark:text-zinc-100">
                Select destination folder:
              </label>

               {/* Root List */}
               <ul className="border  rounded-xl  p-2 shadow-inner overflow-y-auto flex-1 min-h-0">
                  {/* Root selection item */}
                  <li>
                    <div className="flex items-center gap-1.5 py-1">
                      <div className="w-4" />
                      <button
                        onClick={() => setTargetFolderId(null)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl flex-1 text-left transition-colors min-w-0 ${targetFolderId === null
                            ? 'bg-blue-100 text-blue-600 font-semibold'
                            : 'hover:bg-gray-100 dark:hover:bg-zinc-700'
                          }`}
                      >
                        <FolderIcon className="size-8 text-white shrink-0" strokeWidth={1.5} />
                        <div className="flex flex-col gap-1">
                          <span className="truncate min-w-0">Root Directory</span>
                        </div>
                      </button>
                    </div>
                  </li>
                  
                  {rootFolders.map((folder) => (
                    <FolderTreeItem
                      key={folder.id}
                      folder={folder}
                      selectedFolderId={targetFolderId}
                      onSelect={(id) => setTargetFolderId(id)}
                      onLoadChildren={loadFolders}
                      disabledFolderIds={disabledFolderIds}
                      treeState={treeState}
                    />
                  ))}
                  {(isRootLoading || rootHasMore) && (
                        <li ref={rootObserverRef} className="py-2 pl-6 flex justify-start">
                          <Loader2Icon className="h-5 w-5 animate-spin text-blue-500" />
                      </li>
                  )}
                  {rootFolders.length === 0 && !isRootLoading && !rootHasMore && (
                    <li className="text-gray-500 dark:text-zinc-400 text-sm text-center py-4">
                      No nested folders available
                    </li>
                  )}
                </ul>
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ">
          <DialogClose asChild>
            <Button type="button" variant="outline" radius="full" className='w-full md:w-auto'>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleMove} disabled={targetFolderId === undefined} radius="full" className='w-full md:w-auto'>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
