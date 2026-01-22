'use client'
import { FileManagerProvider } from "@/context/file-manager-context";
import {
  FileManagerContent,
  FileManagerFooter,
  FileManagerHeader,
  FileManagerOverlays,
} from "./layout";
import { FileManagerPageProps, FileManagerModalProps, MODE, SELECTION_MODE } from "@/types/file-manager";
import { ReactNode } from "react";

// Page Provider - wraps FileManagerProvider with page-specific defaults
export function FileManagerPageProvider({ 
  children, 
  ...props 
}: FileManagerPageProps & { children: ReactNode }) {
  return (
    <FileManagerProvider
      mode={MODE.PAGE}
      selectionMode={SELECTION_MODE.MULTIPLE}
      {...props}
    >
      {children}
    </FileManagerProvider>
  );
}

// Modal Provider - wraps FileManagerProvider with modal-specific defaults
export function FileManagerModalProvider({ 
  children,
  fileSelectionMode = SELECTION_MODE.SINGLE,
  acceptedFileTypes,
  viewMode = "grid",
  onFilesSelected,
  onClose,
  ...props 
}: Omit<FileManagerModalProps, 'open'> & { children: ReactNode }) {
  return (
    <FileManagerProvider
      mode={MODE.MODAL}
      selectionMode={fileSelectionMode}
      acceptedFileTypesForModal={acceptedFileTypes || props.allowedFileTypes}
      viewMode={viewMode}
      onFilesSelected={onFilesSelected}
      onClose={onClose}
      {...props}
    >
      {children}
    </FileManagerProvider>
  );
}

export const FileManagerComposition = {
    Page: FileManagerPageProvider,
    Modal: FileManagerModalProvider,
    Header: FileManagerHeader,
    Footer: FileManagerFooter,
    Content: FileManagerContent,
    Overlays: FileManagerOverlays,
}