import { useFileManager } from "@/context/file-manager-context";
import { MODE } from "@/types/file-manager";
import { ReactNode } from "react";
import BreadcrumbNavigation from "./breadcrumb-navigation";
import SearchDialog from "../search/search-dialog";
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
    searchQuery,
    setSearchQuery,
    onClose,
    selectedFiles,
    selectedFolders,
    selectionMode,
    handleSelectAllGlobal,
    getGlobalCheckboxState,
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    acceptedFileTypes,
    handleFolderSelect,
    bulkDelete,
    setIsMoveFileModalOpen,
  } = useFileManager();

  const currentFolders = folders.filter((f) => {
    if (currentFolder === null) return f.parentId === null;
    return f.parentId === currentFolder.id;
  });

  const getExpectedFileTypesLabel = () => {
    if (!acceptedFileTypes || acceptedFileTypes.length === 0)
      return "Select Files";

    if (acceptedFileTypes.length === 1) {
      const typeLabels: Record<string, string> = {
        image: "Select Images",
        video: "Select Videos",
        pdf: "Select PDFs",
        excel: "Select Excel Files",
        powerpoint: "Select PowerPoint Files",
        document: "Select Documents",
      };
      return typeLabels[acceptedFileTypes[0]] || "Select Files";
    }

    if (
      acceptedFileTypes.length === 2 &&
      acceptedFileTypes.includes("image") &&
      acceptedFileTypes.includes("video")
    ) {
      return "Select Media Files";
    }

    return "Select Files";
  };

  //action
  const moveAction: ReactNode = (
    <Button
      variant="outline"
      size="lg"
      className="shadow-sm border-gray-300 bg-gradient-to-b from-white to-gray-100 hover:bg-gradient-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
      onClick={() => setIsMoveFileModalOpen(true)}
    >
      <MoveIcon className="w-4 h-4 mr-2" />
      Move
    </Button>
  );

  const searchAction: ReactNode = (
    <SearchDialog />
  );

  const selectAllAction: ReactNode = (
    <div className="flex flex-row items-center gap-2">
      <Checkbox
        checked={getGlobalCheckboxState()}
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
      className="shadow-sm border-gray-300 bg-gradient-to-b from-white to-gray-100 hover:bg-gradient-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
      onClick={() => setIsUploadModalOpen(true)}
    >
      <UploadFileIcon className="w-4 h-4 mr-2" />
      Upload File
    </Button>
  );

  const createFolderAction: ReactNode = (
    <Button
      variant="outline"
      size="lg"
      className="shadow-sm border-gray-300 bg-gradient-to-b from-white to-gray-100 hover:bg-gradient-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
      onClick={() => setIsCreateFolderModalOpen(true)}
    >
      <UploadFolderIcon className="w-4 h-4 mr-2" />
      Create Folder
    </Button>
  );

  const Breadcrumb: ReactNode = (
    <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 mb-3">
      <BreadcrumbNavigation
        folders={folders}
        currentFolder={currentFolder}
        onFolderSelect={handleFolderSelect}
      />
    </div>
  );

  //modal view
  if (mode === MODE.MODAL) {
    return (
      <div className="hidden md:flex md:flex-row w-full p-6 justify-between">
        {Breadcrumb}

        <div className="hidden md:flex md:flex-row gap-2">
          {selectionMode === "multiple" && selectedFiles.length + selectedFolders.length > 0 && moveAction}
          {selectionMode === "multiple" && selectAllAction}
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
