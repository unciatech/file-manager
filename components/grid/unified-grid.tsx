import { useFileManager } from "@/context/file-manager-context";
import { FileCard } from "../cards/file-card";
import { FolderCard } from "../cards/folder-card";
import { Button } from "../ui/button";
import { EmptyFolderIcon, FolderIcon, PlusIcon, UploadFileIcon } from "../icons";

export function UnifiedGrid() {
  const {
    files,
    folders,
    isLoading,
    handleFileClick,
    handleFolderClick,
    bulkDelete,
    mode,
    selectionMode,
    isInSelectionMode,
    selectedFiles,
    selectedFolders,
    currentFolder,
    setSelectedFiles,
    setSelectedFolders,
    setIsRenameFolderModalOpen,
    setIsMoveFileModalOpen,
    setIsUploadModalOpen,
    setFileDetailsModalFile,
    setFolderToRename,
  } = useFileManager();

  // Calculate expected item count for skeleton loading
  // This provides a smoother UX by showing the correct number of skeleton items
  const getSkeletonCount = () => {
    if (!currentFolder) {
      // Root folder - show default skeleton count
      return 18;
    }

    // For subfolders, show skeleton for expected folders + files from metadata
    const expectedFolders = currentFolder.folderCount || 0;
    const expectedFiles = currentFolder.fileCount || 0;
    const totalItems = expectedFolders + expectedFiles;

    return totalItems;
  };

  const skeletonCount = getSkeletonCount();
  const handleMoveSelectedItems = () => {
    setIsMoveFileModalOpen(true);
  };

  const handleDeleteSelectedItems = () => {
    bulkDelete();
  };

  const isEmpty = !isLoading && folders.length === 0 && files.length === 0;

  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 content-start">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={`skeleton-${currentFolder?.id ?? "root"}-${i}`}
            className="flex flex-col items-center justify-start w-full gap-2"
          >
            <div className="w-full aspect-square bg-muted rounded-2xl animate-pulse" />
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="p-4">
        <div className="mx-auto flex min-h-[340px] w-full bg-accent/10 flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border  px-6 py-16 text-center">
          <FolderIcon className="size-18" />

          <h3 className="text-2xl font-semibold tracking-tight text-foreground mt-4">
            {currentFolder ? "This Folder Is Empty" : "Cloud Storage Empty"}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground max-w-2xl w-full">
            {currentFolder
              ? "Upload files to this folder to keep everything organized and easy to find."
              : "Upload files to your cloud storage to access them anywhere."}
          </p>
          <Button
            type="button"
            variant="outline"
            radius="full"
            className="mt-8"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <PlusIcon className="size-4" />
            Upload Files
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 content-start">
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
          isSelected={selectedFolders.some((f) => f.id === folder.id)}
          onSelect={handleFolderClick}
          onDelete={(folderId) => bulkDelete({ folderIds: [folderId] })}
          onSelectionDelete={handleDeleteSelectedItems}
          onRename={(folder) => {
            setFolderToRename(folder);
            setIsRenameFolderModalOpen(true);
          }}
          onMove={(folder) => {
            setSelectedFolders([folder]);
            setSelectedFiles([]);
            setIsMoveFileModalOpen(true);
          }}
          onSelectionMove={handleMoveSelectedItems}
          selectionMode={selectionMode}
          mode={mode}
          isInSelectionMode={isInSelectionMode()}
        />
      ))}
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isSelected={selectedFiles.some((f) => f.id === file.id)}
          onSelect={handleFileClick}
          onDelete={(fileId) => bulkDelete({ fileIds: [fileId] })}
          onSelectionDelete={handleDeleteSelectedItems}
          onEdit={(file) => {
            setFileDetailsModalFile(file);
          }}
          onMove={(file) => {
            setSelectedFiles([file]);
            setSelectedFolders([]);
            setIsMoveFileModalOpen(true);
          }}
          onSelectionMove={handleMoveSelectedItems}
          selectionMode={selectionMode}
          mode={mode}
          isInSelectionMode={isInSelectionMode()}
        />
      ))}
    </div>
  );
}
