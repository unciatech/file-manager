"use client";

import { MoveHorizontalIcon } from '../icons';
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
import { ThemeToggle } from "./theme-toggle";
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
        <ThemeToggle />
      </div>

      {/* Mobile/Tablet: Show dropdown menu */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              radius="full"
              className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <MoveHorizontalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl bg-white/50 dark:bg-zinc-900/80 backdrop-blur-2xl border-gray-200 dark:border-zinc-700">
            <DropdownMenuItem
              onClick={() => setIsUploadModalOpen(true)}
              className="cursor-pointer"
            >
              <PlusIcon className="size-5 text-gray-900 dark:text-zinc-100" />
              <span className="inline">Upload File</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="cursor-pointer"
            >
              <UploadFolderIcon className="size-5 text-gray-900 dark:text-zinc-100" />
              <span className="inline">Create Folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsSearchModalOpen(true)}
              className="cursor-pointer"
            >
              <SearchIcon className="size-5 text-gray-700 dark:text-zinc-300" />
              <span className="inline">Search</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}



export function ModalResponsiveHeaderActions({ onSearchClick }: { onSearchClick?: () => void }) {
  const { setIsUploadModalOpen, setIsCreateFolderModalOpen } = useFileManager();

  return (
    <>
      {/* Desktop: Show individual buttons */}
      <div className="hidden md:flex gap-2">
        <UploadFileAction />
        <CreateFolderAction />
        {onSearchClick ? (
          <Button
            variant="outline"
            size="icon"
            radius="full"
            className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            onClick={onSearchClick}
          >
            <SearchIcon className="size-5 text-gray-900 dark:text-zinc-100" />
            <span className="hidden">Search</span>
          </Button>
        ) : null}
      </div>

      {/* Mobile/Tablet: Show dropdown menu */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              radius="full"
              className="border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <MoveHorizontalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setIsUploadModalOpen(true)}
              className="cursor-pointer"
            >
              <PlusIcon className="size-5 text-gray-900 dark:text-zinc-100" />
              <span className="inline">Upload File</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="cursor-pointer"
            >
              <UploadFolderIcon className="size-5 text-gray-900 dark:text-zinc-100" />
              <span className="inline">Create Folder</span>
            </DropdownMenuItem>
            {onSearchClick ? (
              <DropdownMenuItem
                onClick={onSearchClick}
                className="cursor-pointer"
              >
                <SearchIcon className="size-5 text-gray-700 dark:text-zinc-300" />
                <span className="inline">Search</span>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
