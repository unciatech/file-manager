import { useFileManager } from "@/context/file-manager-context";
import { Button } from "../ui/button";
import { CrossIcon, MoveIcon, TrashIcon } from "../icons";

// Individual button components - composable and reusable

export function MoveButton() {
  const { setIsMoveFileModalOpen } = useFileManager();
  
  return (
    <Button
      variant="outline"
      size="lg"
      radius="full"
      onClick={() => setIsMoveFileModalOpen(true)}
      className="text-md font-medium bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border-gray-200 shadow-sm"
    >
      <MoveIcon className="size-5" />
      <span className="hidden sm:inline">Move</span>
    </Button>
  );
}

export function DeleteButton() {
  const { bulkDelete } = useFileManager();
  
  return (
    <Button
      variant="outline"
      size="lg"
      radius="full"
      onClick={bulkDelete}
      className="text-md font-medium bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 shadow-sm"
    >
      <TrashIcon className="size-5" />
      <span className="hidden">Delete</span>
    </Button>
  );
}

export function ClearSelectionButton() {
  const { handleClearSelection } = useFileManager();
  
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleClearSelection}
      className="rounded-full text-md font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:font-bold hover:border-blue-200 transition-all duration-200"
    >
      <CrossIcon className="size-5 text-blue-600" />
      Clear
    </Button>
  );
}

// Static variant - no floating behavior (for modals)
export function BulkActionsStatic() {
  const {
    selectedFiles,
    selectedFolders,
  } = useFileManager();

  const totalSelected = selectedFiles.length + selectedFolders.length;

  if (totalSelected === 0) return null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          <MoveButton />
          <DeleteButton />
        </div>
        <ClearSelectionButton />
      </div>
    </div>
  );
}

// Floating variant - fixed at bottom (for page mode)
export function BulkActionsFloating({ className }: { className?: string }) {
  const {
    selectedFiles,
    selectedFolders,
  } = useFileManager();

  const totalSelected = selectedFiles.length + selectedFolders.length;

  if (totalSelected === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-lg ${className || ''}`}>
      <div className="px-4 sm:px-6 py-3 mx-auto">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <MoveButton />
            <DeleteButton />
          </div>
          <ClearSelectionButton />
        </div>
      </div>
    </div>
  );
}

