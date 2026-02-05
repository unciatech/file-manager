import { useFileManager } from "@/context/file-manager-context";
import { FileCard } from "../cards/file-card";
import { FolderCard } from "../cards/folder-card";

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
        setIsMoveFileModalOpen,
        setFileDetailsModalFile
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
        
        // Use the metadata count, or fallback to 18 if no items expected
        return totalItems > 0 ? totalItems : 18;
    };

    const skeletonCount = getSkeletonCount();

    if (isLoading) {
        return (
            <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 content-start">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center justify-start w-full gap-2">
                        <div className="w-full aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                        <div className="flex flex-col items-center gap-1 w-full">
                            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 content-start">
            {folders.map((folder) => (
                <FolderCard
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolders.some(f => f.id === folder.id)}
                    onSelect={handleFolderClick}
                    onDelete={() => bulkDelete()}
                    onMove={(folder) => {
                        setSelectedFolders([folder]);
                        setSelectedFiles([]);
                        setIsMoveFileModalOpen(true);
                    }}
                    selectionMode={selectionMode}
                    mode={mode}
                    isInSelectionMode={isInSelectionMode()}
                />
            ))}
            {files.map((file) => (
                <FileCard
                    key={file.id}
                    file={file}
                    isSelected={selectedFiles.some(f => f.id === file.id)}
                    onSelect={handleFileClick}
                    onDelete={() => bulkDelete()}
                    onMove={(file) => {
                        setSelectedFiles([file]);
                        setSelectedFolders([]);
                        setIsMoveFileModalOpen(true);
                    }}
                    onViewMetadata={(file) => {
                        setFileDetailsModalFile(file);
                    }}
                    selectionMode={selectionMode}
                    mode={mode}
                    isInSelectionMode={isInSelectionMode()}
                />
            ))}
        </div>
    );
}