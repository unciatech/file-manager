"use client";

import { FileManagerModal } from "@/components/file-manager-modal";
import { Button } from "@/components/ui/button";
import { MockProvider } from "@/providers/mock-provider";
import { FileMetaData, SELECTION_MODE } from "@/types/file-manager";
import { IFileManagerProvider } from "@/types/provider";
import { Suspense, useState } from "react";

function ModalDemoContent() {
  const [provider] = useState<IFileManagerProvider>(() => new MockProvider());
  
  // Modal state managed via React state (not URL)
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileMetaData[]>([]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleFilesSelected = (files: FileMetaData[]) => {
    setSelectedFiles(files);
    handleClose();
  };

  return (
    <div className="p-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Multi-File Selection Modal Example</h1>
        <Button onClick={handleOpen}>Open File Manager (Multiple)</Button>
      </div>

      <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900 min-h-[200px]">
        <h2 className="text-lg font-semibold mb-2">Selected Files: {selectedFiles.length}</h2>
        {selectedFiles.length > 0 ? (
          <ul className="space-y-2">
            {selectedFiles.map((file) => (
              <li key={file.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs overflow-hidden">
                  {file.mime.startsWith("image/") ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{file.ext}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No files selected</p>
        )}
      </div>

      <FileManagerModal
        open={isOpen}
        onClose={handleClose}
        provider={provider}
        allowedFileTypes={["images", "videos", "audios", "files"]}
        fileSelectionMode={SELECTION_MODE.MULTIPLE}
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );
}

export default function ModalDemoPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <ModalDemoContent />
    </Suspense>
  );
}
