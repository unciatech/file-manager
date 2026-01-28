'use client';

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
import { middleTruncate } from '@/lib/truncate-name';
import { ChevronDown } from 'lucide-react';
import { useViewport } from '@/lib/use-viewport';

interface BreadcrumbNavigationProps {
  folders: Folder[];
  currentFolder: Folder | null;
  onFolderClick: (folder: Folder | null) => void;
}

const MAX_VISIBLE = {
  mobile: 3,
  tablet: 3,
  desktop: 6,
};

export default function BreadcrumbNavigation({ folders, currentFolder, onFolderClick }: Readonly<BreadcrumbNavigationProps>) {
  const { viewportMode } = useViewport();

  //TODO: Wrong logic, only works when complete folder tree is loaded
  const getCurrentPath = () => {
    const path: Folder[] = [];
    let tempFolder: Folder | null | undefined = currentFolder;

    while (tempFolder) {
      path.unshift(tempFolder); // Add to start of array
      // Traverse up using the nested parent object
      tempFolder = tempFolder.parent;
    }

    return path;
  };

  const path = getCurrentPath();

  // Calculate maxVisible based on viewport mode
  const maxVisible = viewportMode === 'mobile' 
    ? MAX_VISIBLE.mobile 
    : viewportMode === 'tablet' 
    ? MAX_VISIBLE.tablet 
    : MAX_VISIBLE.desktop;

  // For mobile/tablet: show dropdown select
  if (viewportMode === 'mobile' || viewportMode === 'tablet') {
    const allLocations = [
      { id: 'home', name: 'Home', folder: null },
      ...path.map((folder) => ({ id: folder.id, name: folder.name, folder }))
    ];
    
    const currentLocation = currentFolder 
      ? { id: currentFolder.id, name: currentFolder.name, folder: currentFolder }
      : { id: 'home', name: 'Home', folder: null };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="lg"
            className="w-full justify-between -ml-1 max-w-[280px] sm:max-w-xs"
          >
            <span className="truncate">{middleTruncate(currentLocation.name, 25)}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px] sm:w-[320px]">
          {allLocations.map((location) => (
            <DropdownMenuItem
              key={location.id}
              onClick={() => onFolderClick(location.folder)}
              className={location.id === currentLocation.id ? 'bg-accent' : ''}
            >
              {location.name === 'Home' && <HomeIcon className="mr-2 h-4 w-4" />}
              <span className="truncate">{middleTruncate(location.name, 30)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // For desktop: show traditional breadcrumb
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
            size="lg"
            className="-ml-1"
            onClick={() => onFolderClick(null)}
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
                      onClick={() => onFolderClick(folder)}
                    >
                     { middleTruncate(folder.name, 20)}
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
                <BreadcrumbPage className=" truncate">
                  { middleTruncate(folder.name, 20)}
                </BreadcrumbPage>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFolderClick(folder)}
                  className=" truncate"
                >
                  { middleTruncate(folder.name, 20)}
                </Button>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
