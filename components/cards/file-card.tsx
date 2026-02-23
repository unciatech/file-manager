"use client";

import React from "react";

import { Move } from "lucide-react";
import { FileMetaData, MODE, Mode, SELECTION_MODE, SelectionMode } from "../../types/file-manager";

import { Checkbox } from "../ui/checkbox";
import { CardContextMenu, CardMenuItem } from "./card-context-menu";

import { getFileSize } from "../../lib/file-size";
import { getFileComponents } from "../grid/file-component-registry";
import { TrashIcon } from "../icons";
import EditIcon from "../icons/edit";
import SelectIcon from "../icons/select";


interface FileCardProps {
  file: FileMetaData;
  isSelected: boolean;
  onSelect: (
    file: FileMetaData,
    event?: React.MouseEvent,
    isCheckboxClick?: boolean
  ) => void;
  onRightClick?: (file: FileMetaData, event: React.MouseEvent) => void;
  onDelete: (fileId: string | number) => void;
  onEdit: (file: FileMetaData) => void;
  onMove: (file: FileMetaData) => void;
  selectionMode: SelectionMode;
  showCheckbox?: boolean;
  mode?: Mode;
  isInSelectionMode?: boolean;
}

export function FileCard({
  file,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  onMove,
  selectionMode,
  showCheckbox = false,
  mode = MODE.PAGE,
  isInSelectionMode = false,
}: FileCardProps) {

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onDelete(file.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(file);
  };

  const handleSelectFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(file, undefined, true);
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMove(file);
  };

  const handleClick = (e: React.MouseEvent) => {
    onSelect(file, e, false); // false = not checkbox click
  };

  const handleCheckboxChange = (checked: boolean | string) => {
    onSelect(file, undefined, true); // true = checkbox click
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Resolve components from registry
  const { component: FilePreviewComponent, metadataComponent: FileMetadataComponent } = getFileComponents(
    file
  );

  const menuItems: CardMenuItem[] = [
    {
      label: "Edit",
      icon: <EditIcon className="size-6" />,
      onClick: handleEdit,
    },
    {
      label: "Select File",
      icon: <SelectIcon className="size-6" />,
      onClick: handleSelectFile,
    },
    {
      label: "Move to...",
      icon: <Move className="size-4 mr-2" />,
      onClick: handleMove,
    },
    {
      label: "Delete",
      icon: <TrashIcon className="size-5 mr-2 text-red-600" />,
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
        {/* When selected, often Finder darkens the icon slightly or adds a border. keeping it simple clean. */}
        <div className={`
              relative w-full aspect-square flex items-center justify-center mb-1 overflow-hidden rounded-2xl hover:bg-gray-200/60
              ${isSelected ? "bg-gray-200/60" : ""}
          `}>
          <div className="w-[75%] h-[75%] flex items-center justify-center">
            <FilePreviewComponent file={file} metaData={file.metaData} />
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
                  text-[13px] font-medium leading-[1.3] tracking-tight line-clamp-2 px-2.5 py-[2px] rounded-[6px] transition-colors duration-100 wrap-break-word max-w-full
                  ${isSelected
              ? "bg-[#2563EB] text-white antialiased shadow-sm"
              : "text-[#374151] group-hover:text-black"}
              `}>
            {file.name}
          </span>

          {/* Metadata: Only visible if not selected or style preference */}
          <div className={`flex flex-col items-center justify-center gap-0.5 mt-1 transition-opacity duration-200 ${isSelected ? "opacity-60" : "opacity-100"}`}>
            <span className="text-[11px] text-blue-600 font-medium tracking-tight">{getFileSize(file.size)}</span>
            {FileMetadataComponent ? (
              <div className="text-[11px] text-gray-400 flex items-center scale-95">
                <FileMetadataComponent file={file} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </CardContextMenu>
  );
}
