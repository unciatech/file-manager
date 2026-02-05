"use client";

import { FileManagerComposition } from "@/components/file-manager-root";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileManagerModalProps } from "@/types/file-manager";
import { useFileManager } from "@/context/file-manager-context";
import { BulkActionsStatic } from "./layout/bulk-actions-bar";
import { HeaderNavigation } from "./layout/header-navigation";
import { UnifiedGrid } from "./grid/unified-grid";
import { ModalResponsiveHeaderActions } from "./layout/header-actions-responsive";
import { CrossIcon, SearchIcon } from "./icons";
import { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function FileManagerModal({
  open,
  onClose,
  ...props
}: FileManagerModalProps) {
  return (
    <FileManagerComposition.Modal {...props} onClose={onClose}>
      <Dialog open={open} onOpenChange={onClose}>
        <ModalContent onClose={onClose} />
      </Dialog>
    </FileManagerComposition.Modal>
  );
}

function ModalContent({ onClose }: { onClose: () => void }) {
  const { updateSearchQuery } = useFileManager();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Update actual search query when debounced value changes
  useEffect(() => {
    updateSearchQuery(debouncedSearch);
  }, [debouncedSearch, updateSearchQuery]);

  // Focus search input when search becomes active
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  return (
    <DialogContent className="p-0" variant="fullscreen" showCloseButton={false}>
      <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
        <DialogTitle className="px-6 text-base">
          <div className="flex w-full justify-between gap-2">
            {isSearchActive ? (
              /* Inline Search Mode */
              <div className="flex items-center gap-4 flex-1">
                <SearchIcon className="size-5 text-gray-500 shrink-0" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search files and folders..."
                  className="border-none shadow-none focus-visible:ring-0 h-auto p-0 text-base font-semibold"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchInput('');
                      updateSearchQuery('');
                      setIsSearchActive(false);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  radius="full"
                  onClick={() => {
                    setSearchInput('');
                    updateSearchQuery('');
                    setIsSearchActive(false);
                  }}
                  className="border-gray-200 bg-white shrink-0"
                >
                  <CrossIcon className="size-5" />
                  <span className="sr-only">Cancel Search</span>
                </Button>
              </div>
            ) : (
              /* Normal Header Mode */
              <>
                <HeaderNavigation />
                <ModalResponsiveHeaderActions onSearchClick={() => setIsSearchActive(true)} />
                <Button
                  variant="outline"
                  size="icon"
                  radius="full"
                  onClick={onClose}
                  className="border-gray-200 bg-white"
                >
                  <CrossIcon className="size-5" />
                  <span className="hidden">Close</span>
                </Button>
              </>
            )}
          </div>
        </DialogTitle>
        <DialogDescription className="sr-only">
          Browse and select files from your media library
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto flex-1 pb-4">
        <UnifiedGrid />
        <FileManagerComposition.Footer className="my-4" />
        <FileManagerComposition.Overlays />
      </div>

      <FileManagerModalFooter onClose={onClose} />
    </DialogContent>
  );
}

function FileManagerModalFooter({ onClose }: { onClose: () => void }) {
  const { 
    selectedFiles, 
    onFilesSelected, 
    setSelectedFiles, 
    setSelectedFolders,
    updateSearchQuery,
    handlePageChange 
  } = useFileManager();

  const handleSelect = () => {
    if (onFilesSelected && selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      
      // Clear everything after selection
      setSelectedFiles([]);
      setSelectedFolders([]);
      updateSearchQuery('');
      handlePageChange(1);
      
      onClose();
    }
  };

  return (
    <DialogFooter className="px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2">
      <BulkActionsStatic />
      <DialogClose asChild>
        <Button type="button" variant="outline" onClick={onClose} radius="full" className='w-full md:w-auto mr-0'>
          Cancel
        </Button>
      </DialogClose>
      <Button
        type="button"
        onClick={handleSelect}
        disabled={selectedFiles.length === 0}
        radius="full" className='w-full md:w-auto'
      >
        Select {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
      </Button>
    </DialogFooter>
  );
}
