import { useFileManager } from "@/context/file-manager-context";

export function BulkActionBar() {
  const {
    selectedFiles,
    selectedFolders,
    bulkDelete,
    handleClearSelection,
    setIsMoveFileModalOpen,
  } = useFileManager();
  const totalSelected = selectedFiles.length + selectedFolders.length;
  if (totalSelected === 0) return null;

  return (
    <div className="bulk-action-bar">
      <span>
        {totalSelected} item{totalSelected > 1 ? "s" : ""} selected
      </span>
      <button onClick={() => setIsMoveFileModalOpen(true)}>Move</button>
      <button onClick={bulkDelete}>Delete</button>
      <button onClick={handleClearSelection}>Clear Selection</button>
    </div>
  );
}
