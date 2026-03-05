"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useFileManager } from "@/context/file-manager-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toast } from "sonner";

import { FileMetaData, Folder } from "@/types/file-manager";
import { middleTruncate } from "@/lib/truncate-name";
import { FolderIcon, SearchIcon } from "../icons";
import { KbdGroup, Kbd } from "../ui/kbd";
import { getFileComponents } from "../grid/file-component-registry";

export default function SearchDialog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileResults, setFileResults] = useState<FileMetaData[]>([]);
  const [folderResults, setFolderResults] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const { provider, handleFolderClick, handleClearSelection, isSearchModalOpen, setIsSearchModalOpen, setFileDetailsModalFile } = useFileManager();

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const [files, folders] = await Promise.all([
        provider.findFiles(q),
        provider.findFolders(q),
      ]);
      setFileResults(files);
      setFolderResults(folders);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      toast.error("Search Failed", {
        description: message,
      });
      setFileResults([]);
      setFolderResults([]);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // Use debounced value to trigger search
  useEffect(() => {
    if (isSearchModalOpen && debouncedSearchQuery.length > 0) {
      doSearch(debouncedSearchQuery);
    } else {
      setFileResults([]);
      setFolderResults([]);
    }
  }, [debouncedSearchQuery, isSearchModalOpen, doSearch]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsSearchModalOpen(open);
    if (!open) {
      // Clear search when closing modal
      setSearchQuery('');
      setFileResults([]);
      setFolderResults([]);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        radius="full"
        className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        onClick={() => setIsSearchModalOpen(true)}>
        <SearchIcon className="size-4 text-gray-700 dark:text-zinc-300" />
        <span className="hidden">Search</span>
      </Button>
      
      <CommandDialog className="max-w-4xl w-full" open={isSearchModalOpen} onOpenChange={handleModalOpenChange} shouldFilter={false} >
        <CommandInput
          placeholder="Type to search files or folders..."
          value={searchQuery}
          onValueChange={handleInputChange}
        />
        <CommandList >
          {loading && <CommandEmpty>Searching...</CommandEmpty>}
          {!loading && fileResults.length === 0 && folderResults.length === 0 && !searchQuery && (
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <SearchIcon className="size-12 text-gray-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 mb-1">Search your files and folders</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Start typing to find what you're looking for</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
                  <KbdGroup>
                    <Kbd><span className="text-lg">⌘</span> + K</Kbd>
                  </KbdGroup>
                </p>
              </div>
            </CommandEmpty>
          )}
          {!loading && fileResults.length === 0 && folderResults.length === 0 && searchQuery && (
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <SearchIcon className="size-12 text-gray-300 dark:text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 mb-1">No results found</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Try searching with different keywords</p>
              </div>
            </CommandEmpty>
          )}
          {folderResults.length > 0 && (
            <CommandGroup heading="Folders">
              {folderResults.map((folder) => (
                <CommandItem
                  key={folder.id}
                  onSelect={() => {
                    handleClearSelection(); // Critical: prevent phantom selection
                    setIsSearchModalOpen(false);
                    handleFolderClick(folder);
                  }}
                >
                  <FolderIcon className="size-4  mr-2 shrink-0" strokeWidth={1.5} />
                  <span>{middleTruncate(folder.name, 60)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {fileResults.length > 0 && (
            <CommandGroup heading="Files">
              {fileResults.map((file) => {
                const { component: FilePreviewComponent } = getFileComponents(file);
                return (
                  <CommandItem
                    key={file.id}
                    onSelect={() => {
                      handleClearSelection();
                      setFileDetailsModalFile(file);
                    }}
                  >
                    <div className="size-6 mr-2 shrink-0 flex items-center justify-center">
                      <FilePreviewComponent file={file} metaData={file.metaData} />
                    </div>
                    <span>{middleTruncate(file.name, 60)}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
      
    </>
  );
}
