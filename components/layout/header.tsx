import { useFileManager } from "@/context/file-manager-context";
import { MODE, SELECTION_MODE } from "@/types/file-manager";
import { ReactNode } from "react";
import BreadcrumbNavigation from "./breadcrumb-navigation";
import SearchDialog from "../modals/search-modal";
import { Button } from "../ui/button";
import UploadFileIcon from "../icons/upload-file";
import UploadFolderIcon from "../icons/upload-folder";
import MoveIcon from "../icons/move";
import { Checkbox } from "../ui/checkbox";

export function FileManagerHeader() {
  const {
    mode,
    files,
    currentFolder,
    folders,
    selectedFiles,
    selectedFolders,
    selectionMode,
    handleSelectAllGlobal,
    getSelectionState,
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    acceptedFileTypesForModal,
    handleFolderClick,
    setIsMoveFileModalOpen,
  } = useFileManager();

  const currentFolders = folders.filter((f) => {
    if (currentFolder === null) return f.parentId === null;
    return f.parentId === currentFolder.id;
  });

  //action
  const moveAction: ReactNode = (
    <Button
      variant="outline"
      size="lg"
      className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-linear-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
      onClick={() => setIsMoveFileModalOpen(true)}
    >
      <MoveIcon className="size-5 mr-2" />
      Move
    </Button>
  );

  const searchAction: ReactNode = (
    <SearchDialog />
  );

  const selectAllAction: ReactNode = (
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

  const uploadFileAction: ReactNode = (
    <Button
      variant="outline"
      size="lg"
      className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-gradient-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
      onClick={() => setIsUploadModalOpen(true)}
    >
      <UploadFileIcon className="size-5 mr-2" />
      Upload File
    </Button>
  );

  const createFolderAction: ReactNode = (
    <Button
      variant="outline"
      size="lg"
      className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-gradient-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
      onClick={() => setIsCreateFolderModalOpen(true)}
    >
      <UploadFolderIcon className="size-5 mr-2" />
      Create Folder
    </Button>
  );

  const Breadcrumb: ReactNode = (
    <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 mb-3">
      <BreadcrumbNavigation
        folders={folders}
        currentFolder={currentFolder}
        onFolderClick={handleFolderClick}
      />
    </div>
  );

  //modal view
  if (mode === MODE.MODAL) {
    return (
      <div className="hidden md:flex md:flex-row w-full p-6 justify-between">
        {Breadcrumb}

        <div className="hidden md:flex md:flex-row gap-2">
          {selectionMode === SELECTION_MODE.MULTIPLE && selectedFiles.length + selectedFolders.length > 0 && moveAction}
          {selectionMode === SELECTION_MODE.MULTIPLE && selectAllAction}
        </div>
      </div>
    );
  }

  //page view
  if (mode === MODE.PAGE) {
    return (
      <div className="hidden md:flex md:flex-row w-full p-6 justify-between">
        {Breadcrumb}

        <div className="hidden md:flex md:flex-row gap-2">
          {selectedFiles.length + selectedFolders.length > 0 && moveAction}
          {uploadFileAction}
          {createFolderAction}
          {searchAction}
        </div>
      </div>
    );
  }
}
