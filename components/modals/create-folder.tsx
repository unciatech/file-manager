import { useState } from "react";
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

export function CreateFolderModal() {
  const {
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    createFolder
  } = useFileManager();

  const [folderName, setFolderName] = useState("");

  const handleCreate = () => {
    if (folderName.trim() !== "") {
      createFolder(folderName.trim());
      setIsCreateFolderModalOpen(false);
      setFolderName("");
    }
  };

  if (!isCreateFolderModalOpen) return null;

  return (
    <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
      <DialogContent className="p-0" variant="default">
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">Create New Folder</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="p-6">
            <label htmlFor="folder-name" className="block mb-2">Folder Name:</label>
            <input
              type="text"
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full p-2 border border-border rounded"
              placeholder="Enter folder name"
            />
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => setIsCreateFolderModalOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleCreate}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}