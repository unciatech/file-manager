// Main components
export { FileManager } from './components/file-manager';
export { FileManagerModal } from './components/file-manager-modal';

// Types
export type {
  FileManagerPageProps,
  FileManagerModalProps,
  FileMetaData,
  Folder,
  FileType,
  ViewMode,
  SelectionMode,
} from './types/file-manager';

// Provider (if needed for advanced use cases)
export { FileManagerProvider, useFileManager } from './context/file-manager-context';

// Providers
export type { IFileManagerProvider } from './types/provider';
