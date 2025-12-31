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
import SearchIcon from "@/components/icons/search";
import { Button } from "@/components/ui/button";
import { useFileManager } from "@/context/file-manager-context";

import { FileMetaData, Folder } from "@/types/file-manager";

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileResults, setFileResults] = useState<FileMetaData[]>([]);
  const [folderResults, setFolderResults] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const { provider, setSearchQuery: setGlobalSearchQuery, handleFolderSelect } = useFileManager();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const [files, folders] = await Promise.all([
        provider.findFiles(q),
        provider.findFolders(q),
      ]);
      setFileResults(files);
      setFolderResults(folders);
    } catch {
      setFileResults([]);
      setFolderResults([]);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    if (open && searchQuery.length > 0) {
      doSearch(searchQuery);
    } else {
      setFileResults([]);
      setFolderResults([]);
    }
  }, [searchQuery, open, doSearch]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setGlobalSearchQuery(value); // update global search query
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <SearchIcon />
        Search
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
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
                    setOpen(false);
                    handleFolderSelect(folder.id);
                    //navigate to folder if folder selected or open file if file selected

                  }}
                >
                  <span>{folder.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {fileResults.length > 0 && (
            <CommandGroup heading="Files">
              {fileResults.map((file) => (
                <CommandItem key={file.id}>
                  <span>{file.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
