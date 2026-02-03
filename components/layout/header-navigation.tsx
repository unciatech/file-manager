import { useFileManager } from "@/context/file-manager-context";
import { Button } from "../ui/button";
import { middleTruncate } from "@/lib/truncate-name";
import { ChevronLeftIcon, HomeIcon } from "../icons";
import { Skeleton } from "../ui/skeleton";

export function HeaderNavigation() {
  const {
    currentFolder,
    handleFolderClick,
    isLoading
  } = useFileManager();

  const handleBackClick = async () => {
    window.history.back();
  };

  if(isLoading) {
    //show skeleton
    return (
      <div className="flex item-center w-full">
        <Skeleton className="rounded-full size-10 mr-2 shrink-0" />
        <Skeleton className="min-w-32 rounded-md h-full" />
      </div>
    )
  }

  return (
    <>
      {currentFolder ? (
        <div className="flex items-center flex-1 min-w-0 max-w-[calc(100%-40px)]">
          {/* back button */}

          <Button
            variant="outline"
            size="icon"
            radius="full"
            disabled={isLoading}
            className="border-gray-200 bg-white mr-2"
            onClick={handleBackClick}>
            <ChevronLeftIcon className="size-5" strokeWidth="1" stroke="black" />
          </Button>
          <h1 className="text-lg flex-1 min-w-0 align-middle font-semibold">{middleTruncate(currentFolder.name, 20)}</h1>
        </div>
      ) : (
        <div className="flex items-center flex-1 min-w-0 max-w-[calc(100%-40px)]">
          {/* home button */}
          <Button className="mr-2 shrink-0" radius="full" variant="ghost" mode="icon" size="icon"
            onClick={() => handleFolderClick(null)}>
            <HomeIcon className="size-6" />
          </Button>
          <h1 className="text-lg flex-1 min-w-0 align-middle font-semibold">Home</h1>
        </div>
      )}

      {/* <BreadcrumbNavigation
        folders={folders}
        currentFolder={currentFolder}
        onFolderClick={handleFolderClick}
      /> */}
    </>
  );
}
