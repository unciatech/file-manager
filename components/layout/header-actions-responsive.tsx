"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  CreateFolderAction,
  SearchAction,
  UploadFileAction,
} from "./header-actions";
import { useFileManager } from "@/context/file-manager-context";
import { PlusIcon, SearchIcon, UploadFolderIcon } from "../icons";

/**
 * Responsive wrapper for header actions that displays:
 * - Individual buttons on desktop (>= 768px)
 * - Dropdown menu on mobile/tablet (< 768px)
 */
export function ResponsiveHeaderActions() {
  const { setIsUploadModalOpen, setIsCreateFolderModalOpen, setIsSearchModalOpen } = useFileManager();

  return (
    <>
      {/* Desktop: Show individual buttons */}
      <div className="hidden md:flex gap-2">
        <UploadFileAction />
        <CreateFolderAction />
        <SearchAction />
      </div>

      {/* Mobile/Tablet: Show dropdown menu */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              radius="full"
              className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-linear-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setIsUploadModalOpen(true)}
              className="cursor-pointer"
            >
              <PlusIcon className="size-5 text-gray-900" stroke="black" strokeWidth="1" />
              <span className="inline">Upload File</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="cursor-pointer"
            >
              <UploadFolderIcon className="size-5 text-gray-900" />
              <span className="inline">Create Folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsSearchModalOpen(true)}
              className="cursor-pointer"
            >
              <SearchIcon className="size-5 text-gray-700" />
              <span className="inline">Search</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}



export function ModalResponsiveHeaderActions() {
  const { setIsUploadModalOpen, setIsCreateFolderModalOpen, setIsSearchModalOpen } = useFileManager();

  return (
    <>
      {/* Desktop: Show individual buttons */}
      <div className="hidden md:flex gap-2">
        <UploadFileAction />
        <CreateFolderAction />
      </div>

      {/* Mobile/Tablet: Show dropdown menu */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              radius="full"
              className="shadow-sm border-gray-300 bg-linear-to-b from-white to-gray-100 hover:bg-linear-to-b hover:from-gray-100 hover:to-gray-200 dark:from-gray-900 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700"
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setIsUploadModalOpen(true)}
              className="cursor-pointer"
            >
              <PlusIcon className="size-5 text-gray-900" stroke="black" strokeWidth="1" />
              <span className="inline">Upload File</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="cursor-pointer"
            >
              <UploadFolderIcon className="size-5 text-gray-900" />
              <span className="inline">Create Folder</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
