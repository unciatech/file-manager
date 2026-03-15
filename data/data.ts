import { Folder, Tag, FileMetaData } from "@/types/file-manager";

// Mock data storage
export let mockFolders: Folder[] = [];
export let mockTags: Tag[] = [];
export let mockFiles: FileMetaData[] = [];

export let isDataLoaded = false;
let initializationPromise: Promise<void> | null = null;

const DEFAULT_URL = "https://raw.githubusercontent.com/unciatech/file-manager/refs/heads/main/data/data.json";

/**
 * Normalizes Date strings from JSON into actual Date objects
 */
function normalizeData(data: any) {
  const normalizeItem = (item: any) => {
    if (item.createdAt) item.createdAt = new Date(item.createdAt);
    if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
    return item;
  };

  if (Array.isArray(data.mockFolders)) data.mockFolders.map(normalizeItem);
  if (Array.isArray(data.mockFiles)) data.mockFiles.map(normalizeItem);
  
  return data;
}

/**
 * Fetches JSON data from a URL and populates the mock data variables
 */
export async function initializeMockData(url: string = DEFAULT_URL): Promise<void> {
  if (isDataLoaded) return;
  
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      console.log(`[MockData] Fetching data from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch mock data: ${response.statusText}`);
      }
      
      let data = await response.json();
      data = normalizeData(data);

      mockFolders = data.mockFolders || [];
      mockTags = data.mockTags || [];
      mockFiles = data.mockFiles || [];
      
      isDataLoaded = true;
      console.log(`[MockData] Successfully initialized with ${mockFiles.length} files and ${mockFolders.length} folders.`);
    } catch (error) {
      console.error("[MockData] Error initializing data:", error);
      // Fallback to empty state to prevent hard crashes
      isDataLoaded = true; 
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}