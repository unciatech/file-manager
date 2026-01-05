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
        selectedFolders
    } = useFileManager();

    if (isLoading) {
        return (
            <div className="grid grid-0 gap-0 md:gap-3 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:px-4 lg:gap-2 lg:px-6 py-4">
                <h1>Loading...</h1>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 p-6 content-start">
            {folders.map((folder) => (
                <FolderCard
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolders.some(f => f.id === folder.id)}
                    onSelect={handleFolderClick}
                    onDelete={() => bulkDelete()}
                    onMove={() => { }}
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
                    onDelete={() => bulkDelete()} // TODO: Implement single delete if needed
                    onMove={() => { }} // TODO: Implement move
                    selectionMode={selectionMode}
                    mode={mode}
                    isInSelectionMode={isInSelectionMode()}
                />
            ))}
        </div>
    );
}