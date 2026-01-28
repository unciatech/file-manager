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

import { FileMetaData, Folder, FileType, FILE_TYPE } from "@/types/file-manager";
import { middleTruncate } from "@/lib/truncate-name";
import {FolderIcon, SearchIcon} from "../icons";
import { Icons } from "@/lib/icons";
import { getIconType } from "@/lib/get-icon-type";

export default function SearchDialog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileResults, setFileResults] = useState<FileMetaData[]>([]);
  const [folderResults, setFolderResults] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const { provider, handleFolderClick, handleClearSelection, isSearchModalOpen, setIsSearchModalOpen } = useFileManager();

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchModalOpen(!isSearchModalOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

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

  return (
    <>
      <Button
      variant="outline"
      size="icon"
      radius="full"
      className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-linear-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
      onClick={() => setIsSearchModalOpen(true)}>
        <SearchIcon className="size-4 text-gray-700" />
        <span className="hidden">Search</span>
      </Button>
      <CommandDialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Type to search files or folders..."
          value={searchQuery}
          onValueChange={handleInputChange}
        />
        <CommandList>
          {loading && <CommandEmpty>Searching...</CommandEmpty>}
          {!loading && fileResults.length === 0 && folderResults.length === 0 && searchQuery && (
            <CommandEmpty>No results found.</CommandEmpty>
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
                  <span>{ middleTruncate(folder.name, 60)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {fileResults.length > 0 && (
            <CommandGroup heading="Files">
              {fileResults.map((file) => (
                <CommandItem key={file.id}>
                  <Icons type={getIconType(file.mime, file.ext)} className="size-4 mr-2 shrink-0" />
                  <span>{middleTruncate(file.name, 60)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
