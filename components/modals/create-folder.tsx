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
import { Input } from "../ui/input";
import { CrossIcon } from "../icons";

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
      <DialogContent className="p-0" variant="default" showCloseButton={false}>
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border flex w-full justify-between">
          <DialogTitle className="px-6 text-base">
            <div className="flex w-full items-center justify-between gap-2">
            <span>Create New Folder</span>
              <Button
                variant="outline"
                size="icon"
                radius="full"
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-linear-to-b hover:text-red-600 hover:border-red-200 hover:from-red-50 hover:to-red-100 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
              >
                <CrossIcon className="size-5" />
                <span className="hidden">Close</span>
              </Button>
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
          />
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => setIsCreateFolderModalOpen(false)} radius="full" className='w-full md:w-auto'>
              Cancel
            </Button>
          </DialogClose>
          <Button
          type="button" 
          disabled={folderName.trim() === ""}
          onClick={handleCreate} radius="full" className='w-full md:w-auto'>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}