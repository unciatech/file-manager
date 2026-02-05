import { useFileManager } from "@/context/file-manager-context";
import { SELECTION_MODE } from "@/types/file-manager";
import SearchDialog from "../modals/search-modal";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import UploadFolderIcon from "../icons/upload-folder";
import MoveIcon from "../icons/move";
import { PlusIcon, SearchIcon } from "../icons";

export function MoveAction() {
  const {
    selectedFiles,
    selectedFolders,
    setIsMoveFileModalOpen,
  } = useFileManager();

  if (selectedFiles.length + selectedFolders.length === 0) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="border-gray-200 bg-white"
      onClick={() => setIsMoveFileModalOpen(true)}
    >
      <MoveIcon className="size-5" />
      <span className="hidden sm:inline">Move</span>
    </Button>
  );
}

export function SearchAction() {
  return <SearchDialog />;
}

export function SelectAllAction() {
  const {
    files,
    folders,
    currentFolder,
    handleSelectAllGlobal,
    getSelectionState,
    selectionMode,
  } = useFileManager();

  if (selectionMode !== SELECTION_MODE.MULTIPLE) {
    return null;
  }

  const currentFolders = folders.filter((f) => {
    if (currentFolder === null) return f.parentId === null;
    return f.parentId === currentFolder.id;
  });

  return (
    <div className="flex flex-row items-center gap-2">
      <Checkbox
        checked={getSelectionState()}
        onCheckedChange={handleSelectAllGlobal}
      />
      <span className="text-sm text-gray-600">
        Select All ({files.length + currentFolders.length} items)
      </span>
    </div>
  );
}

export function UploadFileAction() {
  const { setIsUploadModalOpen } = useFileManager();
  
  return (
    <Button
      variant="outline"
      size="md"
      radius="full"
      className="border-gray-200 bg-white text-md font-medium"
      onClick={() => setIsUploadModalOpen(true)}
    >
      <PlusIcon className="size-5 text-gray-900" stroke="black" strokeWidth="1" />
      <span className="hidden sm:inline">Upload File</span>
    </Button>
  );
}

export function CreateFolderAction() {
  const { setIsCreateFolderModalOpen } = useFileManager();

  return (
    <Button
      variant="outline"
      size="icon"
      radius="full"
      className="border-gray-200 bg-white"
      onClick={() => setIsCreateFolderModalOpen(true)}
    >
      <UploadFolderIcon className="size-5  text-gray-900" />
      <span className="hidden">Create Folder</span>
    </Button>
  );
}
