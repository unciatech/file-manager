"use client";

import React from "react";

import { Folder, FolderId, Mode, SELECTION_MODE, SelectionMode } from "../../types/file-manager";

import { Checkbox } from "../ui/checkbox";
import { CardContextMenu, CardMenuItem } from "./card-context-menu";

import FolderIcon from "../icons/folder";
import { TrashIcon, MoveIcon } from "../icons";
import EditIcon from "../icons/edit";
import SelectIcon from "../icons/select";


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
  onRename: (folder: Folder) => void;
  onMove: (folder: Folder) => void;
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
  onRename,
  onMove,
  selectionMode,
  showCheckbox,
  mode,
  isInSelectionMode
}: FolderCardProps) {


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${folder.name}"?\n\n⚠️ Warning: This will also delete all ${folder.fileCount} file(s) inside this folder.`)) {
      onDelete(folder.id);
    }
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRename(folder);
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMove(folder);
  };

  const handleSelectFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(folder, undefined, true);
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

  const menuItems: CardMenuItem[] = [
    {
      label: "Rename",
      icon: <EditIcon className="size-6" />,
      onClick: handleRename,
    },
    {
      label: "Select Folder",
      icon: <SelectIcon className="size-6" />,
      onClick: handleSelectFolder,
    },
    {
      label: "Move to...",
      icon: <MoveIcon className="size-5 mr-1" />,
      onClick: handleMove,
    },
    {
      label: "Delete",
      icon: <TrashIcon className="size-5 mr-1 text-red-600" />,
      onClick: handleDelete,
      variant: "destructive",
    },
  ];

  return (
    <CardContextMenu
      menuItems={menuItems}
      isInSelectionMode={isInSelectionMode}
      mode={mode}
    >
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
                  text-[13px] font-semibold leading-[1.3] tracking-tight line-clamp-2 px-2.5 pb-[2px] rounded-[6px] transition-colors duration-100 break-words max-w-full
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
    </CardContextMenu>
  );
}
