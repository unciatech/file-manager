"use client";

import React from "react";

import { Trash2, Move, Info } from "lucide-react";
import { Folder, FolderId, Mode, SELECTION_MODE, SelectionMode } from "../../types/file-manager";

import { Checkbox } from "../ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";

import FolderIcon from "../icons/folder";


interface FolderCardProps {
  folder: Folder;
  isSelected: boolean;
  onSelect: (
    folder: Folder,
    event?: React.MouseEvent,
    isCheckboxClick?: boolean
  ) => void;
  onRightClick?: (folder: Folder, event: React.MouseEvent) => void;
  onDelete: (folderId: FolderId) => void;
  onMove: (folder: Folder) => void;
  onViewMetadata?: (folder: Folder) => void;
  selectionMode: SelectionMode;
  showCheckbox?: boolean;
  mode?: Mode;
  isInSelectionMode?: boolean;
}

export function FolderCard({
  folder,
  isSelected,
  onSelect,
  onRightClick,
  onDelete,
  onMove,
  onViewMetadata,
  selectionMode,
  showCheckbox,
  mode,
  isInSelectionMode
}: FolderCardProps) {


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      onDelete(folder.id);
    }
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMove(folder);
  };

  const handleViewMetadata = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewMetadata?.(folder);
  };

  const handleClick = (e: React.MouseEvent) => {
    onSelect(folder, e, false); // false = not checkbox click
  };

  const handleCheckboxChange = (checked: boolean | string) => {
    onSelect(folder, undefined, true); // true = checkbox click
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };


  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="group relative flex flex-col items-center justify-start transition-all duration-200 cursor-pointer w-full select-none"
          onDoubleClick={handleClick}
          onClick={handleClick}
        >
          {/* Icon Container: Gray background, rounded, subtle shadow */}
          {/* When selected, usually just the label is highlighted in Finder. */}
          <div className={`
                relative w-full aspect-square flex items-center justify-center mb-1 overflow-hidden rounded-2xl hover:bg-gray-200/60
                
                ${isSelected ? "bg-gray-200/60 " : ""}
            `}>
            <div className="w-[75%] h-[75%] flex items-center justify-center transform ">
              <FolderIcon className="w-full h-full text-blue-400 fill-blue-400/20 drop-shadow-sm" strokeWidth={1.5} />
            </div>

            {(selectionMode === SELECTION_MODE.MULTIPLE || showCheckbox) && (
              <div className={`absolute top-2 left-2 z-10 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-200`} onClick={handleCheckboxClick}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleCheckboxChange}
                  className="bg-white/90 border-gray-300 shadow-sm data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-full h-5 w-5"
                />
              </div>
            )}
          </div>

          {/* Text Label: Selection highlights background in blue */}
          <div className="w-full text-center px-0.5 flex flex-col items-center">
            <span className={`
                    text-[13px] font-medium leading-[1.3] tracking-tight line-clamp-2 px-2.5 pb-[2px] rounded-[6px] transition-colors duration-100 break-words max-w-full
                    ${isSelected
                ? "bg-[#2563EB] text-white antialiased shadow-sm"
                : "text-[#374151] group-hover:text-black"}
                `}>
              {folder.name}
            </span>

            <div className={`flex items-center justify-center gap-1 mt-1 transition-opacity duration-200 ${isSelected ? "opacity-60" : "opacity-100"}`}>
              <span className="text-[11px] text-blue-600 font-medium tracking-tight  px-1.5 rounded-full">{folder.fileCount} items</span>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      {/* Action Menu - Hidden when in selection mode or in modal mode */}
      {!isInSelectionMode && mode !== "modal" && (
        <ContextMenuContent className="w-56 rounded-xl shadow-xl bg-white/95 backdrop-blur-xl border-gray-200">
          <ContextMenuItem onClick={handleViewMetadata} className="text-sm font-medium">
            <Info className="size-4 mr-2" />
            Get Info
          </ContextMenuItem>
          <ContextMenuItem onClick={handleMove} className="text-sm font-medium">
            <Move className="size-4 mr-2" />
            Move to...
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-gray-200" />
          <ContextMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-700 focus:bg-red-50 text-sm font-medium">
            <Trash2 className="size-4 mr-2" />
            Move to Trash
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
