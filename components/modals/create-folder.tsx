import { useState, useEffect } from "react";
import { useFileManager } from "@/context/file-manager-context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CloseButton } from "@/components/ui/close-button";
import { KbdGroup, Kbd } from "../ui/kbd";

export function CreateFolderModal() {
  const {
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    createFolder,
    renameFolder,
    folderToRename,
    setFolderToRename
  } = useFileManager();

  const [folderName, setFolderName] = useState("");

  // Determine if we're in rename mode
  const isRenameMode = isRenameFolderModalOpen;
  const isOpen = isCreateFolderModalOpen || isRenameFolderModalOpen;

  // Pre-fill the folder name when in rename mode
  useEffect(() => {
    if (isRenameFolderModalOpen && folderToRename) {
      setFolderName(folderToRename.name);
    } else if (!isCreateFolderModalOpen) {
      setFolderName("");
    }
  }, [isRenameFolderModalOpen, isCreateFolderModalOpen, folderToRename]);

  const handleSubmit = async () => {
    if (folderName.trim() !== "") {
      if (isRenameMode && folderToRename) {
        const folderId = folderToRename.id;
        if (folderId !== null) {
          await renameFolder(folderId, folderName.trim());
        }
        setIsRenameFolderModalOpen(false);
        setFolderToRename(null); // Clear the folder being renamed
      } else {
        createFolder(folderName.trim());
        setIsCreateFolderModalOpen(false);
      }
      setFolderName("");
    }
  };

  const handleClose = () => {
    if (isRenameMode) {
      setIsRenameFolderModalOpen(false);
      setFolderToRename(null); // Clear the folder being renamed
    } else {
      setIsCreateFolderModalOpen(false);
    }
    setFolderName("");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 max-w-xl m-auto max-h-[32vh] flex flex-col" variant="fullscreen" showCloseButton={false}>
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border flex w-full justify-between">
          <DialogTitle className="px-6 text-base">
            <div className="flex w-full items-center justify-between gap-2">
              <span>{isRenameMode ? "Rename Folder" : "Create New Folder"}

                {!isRenameMode && <span className="ml-4"><KbdGroup>
                  <Kbd><span className="text-lg">⌘</span> + F</Kbd>
                </KbdGroup></span>}
              </span>
              
              <CloseButton onClick={handleClose} />
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <label htmlFor="folder-name" className="hidden mb-2">Folder Name:</label>
          <Input
            id="folder-name"
            name="folder-name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && folderName.trim() !== "") {
                handleSubmit();
              }
            }}
          />
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={handleClose} radius="full" className='w-full md:w-auto'>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={folderName.trim() === ""}
            onClick={handleSubmit} radius="full" className='w-full md:w-auto'>
            {isRenameMode ? "Rename" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}