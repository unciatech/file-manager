import { useFileManager } from "@/context/file-manager-context";
import { Button } from "../ui/button";
import { CrossIcon, MoveIcon, TrashIcon } from "../icons";
import { useEffect, useRef, useState } from "react";

export function BulkActionBar() {
  const {
    selectedFiles,
    selectedFolders,
    bulkDelete,
    handleClearSelection,
    setIsMoveFileModalOpen,
  } = useFileManager();
  
  const totalSelected = selectedFiles.length + selectedFolders.length;
  const barRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (totalSelected === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    if (barRef.current) {
      observer.observe(barRef.current);
    }

    return () => {
      if (barRef.current) {
        observer.unobserve(barRef.current);
      }
    };
  }, [totalSelected]);
  
  if (totalSelected === 0) return null;

  const ActionButtons = () => (
    <>
      {/* Selection Count */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
        <span className="text-sm font-medium text-gray-700">
          {totalSelected} item{totalSelected > 1 ? "s" : ""} selected
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMoveFileModalOpen(true)}
          className="h-8 px-3 text-sm font-normal bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
        >
          <MoveIcon className="size-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Move</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={bulkDelete}
          className="h-8 px-3 text-sm font-normal bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 shadow-sm"
        >
          <TrashIcon className="size-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>

      {/* Clear Button - Right aligned on desktop */}
      <div className="ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearSelection}
          className="h-8 px-3 underline text-sm font-normal text-blue-600 hover:text-blue-700 hover:bg-gray-100"
        >
          <CrossIcon className="size-4 text-blue-600" />
          Clear
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Original inline bulk actions bar */}
      <div ref={barRef} className="w-full">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ActionButtons />
          </div>
        </div>
      </div>

      {/* Floating bulk actions bar - appears at top when original is not visible */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg transition-transform duration-300 ${
          isVisible ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ActionButtons />
          </div>
        </div>
      </div>
    </>
  );
}
