import { useFileManager } from "@/context/file-manager-context";
import { BreadcrumbNavigation } from ".";

export function HeaderNavigation() {
  const {
    currentFolder,
    folders,
    handleFolderClick,
  } = useFileManager();

  return (
    <div className="flex w-full items-center gap-1 pr-4 lg:gap-2 lg:pr-6 mb-3">
      <BreadcrumbNavigation
        folders={folders}
        currentFolder={currentFolder}
        onFolderClick={handleFolderClick}
      />
    </div>
  );
}
