import { useFileManager } from "@/context/file-manager-context";
import { Button } from "../ui/button";
import { CrossIcon, MoveIcon, TrashIcon } from "../icons";

interface ActionButtonsProps {
  totalSelected: number;
  onMove: () => void;
  onDelete: () => void;
  onClear: () => void;
}

function ActionButtons({ totalSelected, onMove, onDelete, onClear }: ActionButtonsProps) {
  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
        <Button
          variant="outline"
          size="lg"
          radius="full"
          onClick={onMove}
          className="text-sm font-normal bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border-gray-200 shadow-sm"
        >
          <MoveIcon className="size-4" />
          <span className="hidden sm:inline">Move</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          radius="full"
          onClick={onDelete}
          className="text-sm font-normal bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 shadow-sm"
        >
          <TrashIcon className="size-4" />
          <span className="hidden">Delete</span>
        </Button>
      </div>

      {/* Clear Button - Right aligned on desktop */}
      <div className="">
        <Button
          variant="outline"
          size="lg"
          onClick={onClear}
          className="rounded-full text-sm font-normal text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:font-bold hover:border-blue-200 transition-all duration-200"
        >
          <CrossIcon className="size-4 text-blue-600" />
          Clear
        </Button>
      </div>
    </>
  );
}

// Static variant - no floating behavior (for modals)
export function BulkActionsStatic() {
  const {
    selectedFiles,
    selectedFolders,
    bulkDelete,
    handleClearSelection,
    setIsMoveFileModalOpen,
  } = useFileManager();

  const totalSelected = selectedFiles.length + selectedFolders.length;

  if (totalSelected === 0) return null;

  const handleMove = () => setIsMoveFileModalOpen(true);

  return (
    <div className="w-full">

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <ActionButtons
          totalSelected={totalSelected}
          onMove={handleMove}
          onDelete={bulkDelete}
          onClear={handleClearSelection}
        />
      </div>

    </div>
  );
}

// Floating variant - fixed at bottom (for page mode)
export function BulkActionsFloating({ className }: { className?: string }) {
  const {
    selectedFiles,
    selectedFolders,
    bulkDelete,
    handleClearSelection,
    setIsMoveFileModalOpen,
  } = useFileManager();

  const totalSelected = selectedFiles.length + selectedFolders.length;

  if (totalSelected === 0) return null;

  const handleMove = () => setIsMoveFileModalOpen(true);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-lg ${className || ''}`}>
      <div className="px-4 sm:px-6 py-3 mx-auto">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ActionButtons
            totalSelected={totalSelected}
            onMove={handleMove}
            onDelete={bulkDelete}
            onClear={handleClearSelection}
          />
        </div>
      </div>
    </div>
  );
}

