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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";

export function MoveModal() {
  const {
    isMoveFileModalOpen,
    setIsMoveFileModalOpen,
    selectedFiles,
    selectedFolders,
    folders,
    bulkMove
  } = useFileManager();

  const [targetFolderId, setTargetFolderId] = useState<string | number | null>(
    null
  );

  const handleMove = () => {
    if (targetFolderId) {
      bulkMove(targetFolderId);
      setIsMoveFileModalOpen(false);
      setTargetFolderId(null);
    }
  };

  if (!isMoveFileModalOpen) return null;


  return (
    <Dialog open={isMoveFileModalOpen} onOpenChange={setIsMoveFileModalOpen}>
      <DialogContent className="p-0" variant="fullscreen">
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">Move Items</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <ScrollArea className="text-sm h-full my-3 ps-6 pe-5 me-1">
          <div className="space-y-4">
            <p>
              Moving {selectedFiles.length} file
              {selectedFiles.length === 1 ? "" : "s"} and{" "}
              {selectedFolders.length} folder
              {selectedFolders.length === 1 ? "" : "s"}.
            </p>
            <div>
              <label htmlFor="target-folder">Select Target Folder:</label>
              <select
                id="target-folder"
                value={targetFolderId || ""}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="block mt-1 border rounded px-2 py-1"
              >
                <option value="" disabled>
                  -- Select a folder --
                </option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
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
