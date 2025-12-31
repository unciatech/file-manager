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
import { FileUploadInput } from "@/types/provider";

// Converts FileList to FileUploadInput[]
function filesToFileUploadInputs(fileList: FileList): FileUploadInput[] {
  return Array.from(fileList).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    file,
    metadata: {},
    videoSource: undefined,
  }));
}
export function UploadModal() {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadFiles
  } = useFileManager();

  const [selectedFiles, setSelectedFiles] = useState<FileUploadInput[] | null>(null);

  const handleUpload = () => {
    if (selectedFiles && selectedFiles.length > 0) {
      uploadFiles(selectedFiles);
      setIsUploadModalOpen(false);
      setSelectedFiles(null);
    }
  };


  if (!isUploadModalOpen) return null;

  return (
    <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
      <DialogContent className="p-0" variant="default">
        <DialogHeader className="pt-5 pb-3 m-0 border-b border-border">
          <DialogTitle className="px-6 text-base">Upload Files</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="p-6">
            <input
              type="file"
              multiple
              onChange={(e) =>
                setSelectedFiles(
                  e.target.files ? filesToFileUploadInputs(e.target.files) : null
                )
              }
              className="w-full"
            />
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleUpload} disabled={!selectedFiles || selectedFiles.length === 0}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}