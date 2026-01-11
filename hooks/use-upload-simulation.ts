import { useEffect } from 'react';

/**
 * File upload item with progress tracking
 */
export interface FileUploadItem {
  id: string | number;
  file: File | any; // Support both File and FileMetadata
  preview?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * Simulates upload progress for files in 'uploading' status.
 * This is a demo/development hook - replace with real upload logic in production.
 * 
 * @param uploadItems - Array of file upload items
 * @param setUploadItems - State setter for upload items
 * @param enabled - Whether simulation is enabled (default: true)
 * @param failureRate - Probability of simulated failure (0-1, default: 0.05 = 5%)
 * 
 * @example
 * const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
 * useUploadSimulation(uploadItems, setUploadItems, true);
 */
export function useUploadSimulation(
  uploadItems: FileUploadItem[],
  setUploadItems: React.Dispatch<React.SetStateAction<FileUploadItem[]>>,
  enabled: boolean = true,
  failureRate: number = 0.05
) {
  useEffect(() => {
    if (!enabled) return;

    const uploadingFiles = uploadItems.filter((file) => file.status === 'uploading');
    if (uploadingFiles.length === 0) return;

    const interval = setInterval(() => {
      setUploadItems((prev) =>
        prev.map((file) => {
          if (file.status !== 'uploading') return file;

          // Random increment between 5-25%
          const increment = Math.random() * 20 + 5;
          const newProgress = Math.min(file.progress + increment, 100);

          if (newProgress >= 100) {
            // Simulate occasional failures based on failure rate
            const shouldFail = Math.random() < failureRate;
            return {
              ...file,
              progress: 100,
              status: shouldFail ? ('error' as const) : ('completed' as const),
              error: shouldFail ? 'Upload failed. Please try again.' : undefined,
            };
          }

          return { ...file, progress: newProgress };
        }),
      );
    }, 500);

    return () => clearInterval(interval);
  }, [uploadItems, setUploadItems, enabled, failureRate]);
}
