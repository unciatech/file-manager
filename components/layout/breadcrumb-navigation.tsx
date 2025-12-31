'use client';

import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Folder } from '@/types/file-manager';
import HomeIcon from '@/components/icons/home';

interface BreadcrumbNavigationProps {
  folders: Folder[];
  currentFolder: Folder | null;
  onFolderSelect: (folderId: string | number | null) => void;
}

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
};

const MAX_VISIBLE = {
  mobile: 3,
  tablet: 3,
  desktop: 4,
};

export default function BreadcrumbNavigation({ folders, currentFolder, onFolderSelect }: Readonly<BreadcrumbNavigationProps>) {
  const [maxVisible, setMaxVisible] = useState(MAX_VISIBLE.desktop);

  useEffect(() => {
    const updateMaxVisible = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) {
        setMaxVisible(MAX_VISIBLE.mobile);
      } else if (width < BREAKPOINTS.tablet) {
        setMaxVisible(MAX_VISIBLE.tablet);
      } else {
        setMaxVisible(MAX_VISIBLE.desktop);
      }
    };

    updateMaxVisible();
    window.addEventListener('resize', updateMaxVisible);
    return () => window.removeEventListener('resize', updateMaxVisible);
  }, []);

  //TODO: Wrong logic, only works when complete folder tree is loaded
  const getCurrentPath = () => {
    const path: Folder[] = [];
    let tempFolder: Folder | null | undefined = currentFolder;

    while (tempFolder) {
      path.unshift(tempFolder);
      tempFolder = tempFolder.parentId
        ? folders.find((f) => f.id === tempFolder?.parentId) ?? undefined
        : undefined;
    }

    return path;
  };

  const path = getCurrentPath();

  // Calculate which items to show and which to collapse
  // We always show Home, so maxVisible includes Home + path items
  const totalItems = path.length + 1; // +1 for Home
  const shouldCollapse = totalItems > maxVisible;
  
  // If collapsing: show Home, ellipsis, then last (maxVisible - 2) items
  // -2 because Home and ellipsis take up 2 slots
  const visibleEndCount = shouldCollapse ? maxVisible - 2 : path.length;
  const collapsedItems = shouldCollapse ? path.slice(0, path.length - visibleEndCount) : [];
  const visibleItems = shouldCollapse ? path.slice(path.length - visibleEndCount) : path;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home Button */}
        <BreadcrumbItem>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => onFolderSelect(null)}
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Home
          </Button>
        </BreadcrumbItem>

        {/* Collapsed items in dropdown */}
        {shouldCollapse && collapsedItems.length > 0 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="size-6 p-0">
                    <BreadcrumbEllipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {collapsedItems.map((folder) => (
                    <DropdownMenuItem
                      key={folder.id}
                      onClick={() => onFolderSelect(folder.id)}
                    >
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {/* Visible path items */}
        {visibleItems.map((folder, index) => (
          <div key={folder.id} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === visibleItems.length - 1 ? (
                <BreadcrumbPage className="max-w-[150px] truncate">
                  {folder.name}
                </BreadcrumbPage>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFolderSelect(folder.id)}
                  className="max-w-[150px] truncate"
                >
                  {folder.name}
                </Button>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
