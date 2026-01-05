import { useFileManager } from "@/context/file-manager-context";
import { BulkActionBar } from "./bulk-actions-bar";
import { UnifiedGrid } from "../grid/unified-grid";

export function FileManagerContent() {

    const {
        mode,
        folders,
        currentFolder,
        selectedFiles,
        selectedFolders,
        files,
        isLoading,
        handleClearSelection,
        handleSelectAllGlobal,
        bulkDelete,
        setIsMoveFileModalOpen,
    } = useFileManager();

    return (
        <div>
            <BulkActionBar />
            <UnifiedGrid />
        </div>
    );
}