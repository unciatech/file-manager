"use client";

import React from "react";
import { MoveVerticalIcon } from '../icons';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Mode } from "../../types/file-manager";

export interface CardMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  variant?: "default" | "destructive";
  className?: string;
}

interface CardContextMenuProps {
  children: React.ReactNode;
  menuItems: CardMenuItem[];
  isInSelectionMode?: boolean;
  mode?: Mode;
}

export function CardContextMenu({
  children,
  menuItems,
  isInSelectionMode = false,
  mode,
}: CardContextMenuProps) {
  const shouldShowMenu = !isInSelectionMode && mode !== "modal";

  const renderMenuItems = (isDropdown: boolean = false) => {
    return menuItems.map((item, index) => {
      const isLast = index === menuItems.length - 1;
      const isDestructive = item.variant === "destructive";
      
      const MenuItemComponent = isDropdown ? DropdownMenuItem : ContextMenuItem;
      const SeparatorComponent = isDropdown ? DropdownMenuSeparator : ContextMenuSeparator;
      
      // Check if next item is destructive to add separator before it
      const nextItemIsDestructive = index < menuItems.length - 1 && menuItems[index + 1].variant === "destructive";
      
      return (
        <React.Fragment key={index}>
          <MenuItemComponent
            onClick={item.onClick}
            className={
              item.className ||
              `text-sm font-medium ${
                isDestructive
                  ? "text-red-600 focus:text-red-700 focus:bg-red-50"
                  : ""
              } ${index === 0 ? "rounded-t-xl" : ""} ${isLast ? "rounded-b-xl" : ""}`
            }
          >
            {item.icon}
            {item.label}
          </MenuItemComponent>
          {nextItemIsDestructive && !isLast && (
            <SeparatorComponent className="bg-gray-200 dark:bg-zinc-700" />
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative w-full h-full">
          {children}
          
          {/* Three-dot menu for mobile/tablet */}
          {shouldShowMenu && (
            <div
              className="absolute top-0 right-0 z-10 md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    radius="full"
                    className="focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <MoveVerticalIcon className="size-4 text-gray-700 dark:text-zinc-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl shadow-xl bg-white/50 dark:bg-zinc-900/80 backdrop-blur-2xl border-gray-200 dark:border-zinc-700">
                  {renderMenuItems(true)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      {/* Desktop right-click context menu */}
      {shouldShowMenu && (
        <ContextMenuContent className="w-56 rounded-2xl shadow-xl bg-white/50 dark:bg-zinc-900/80 backdrop-blur-2xl border-gray-200 dark:border-zinc-700">
          {renderMenuItems(false)}
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
