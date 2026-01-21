import { useFileManager } from "@/context/file-manager-context";
import { ReactNode } from "react";
import BreadcrumbNavigation from "./breadcrumb-navigation";

export function FileManagerHeader({ children }: { children?: ReactNode }) {
  const {
    currentFolder,
    folders,
    handleFolderClick,
  } = useFileManager();

  const Breadcrumb: ReactNode = (
    <div className="flex w-full items-center gap-1 pr-4 lg:gap-2 lg:pr-6 mb-3">
      <BreadcrumbNavigation
        folders={folders}
        currentFolder={currentFolder}
        onFolderClick={handleFolderClick}
      />
    </div>
  );

  return (
    <div className="hidden md:flex md:flex-row w-full p-6 justify-between">
      {Breadcrumb}

      <div className="hidden md:flex md:flex-row gap-2">
        {children}
      </div>
    </div>
  );
}
