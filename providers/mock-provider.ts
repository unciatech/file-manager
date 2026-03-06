import { mockFiles, mockFolders, mockTags } from "@/data/data";
import {
  Folder,
  FileType,
  FileMetaData,
  PaginationInfo,
  MetaDataType,
  FILE_TYPE,
  VIDEO_SOURCE,
  VideoSource,
  EntityId,
  FolderId,
} from "@/types/file-manager";
import { FileUploadInput, IFileManagerProvider } from "@/types/provider";
import { getFileTypeFromMime } from "@/lib/file-utils";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockProvider implements IFileManagerProvider {

  getFolder(folderId: FolderId): Promise<Folder | null> {
    if (folderId === null) return Promise.resolve(null);
    const folder = mockFolders.find((f) => f.id === folderId);
    
    if (!folder) return Promise.resolve(null);

    // Deep copy to avoid mutating the original mock data during population
    const result: Folder = { ...folder };
    
    // Recursively populate parent
    let current = result;
    while (current.parentId !== null) {
      const parent = mockFolders.find((f) => f.id === current.parentId);
      if (parent) {
        current.parent = { ...parent };
        current = current.parent;
      } else {
        break;
      }
    }

    return Promise.resolve(result);
  }

  async getFolders(
    folderId: FolderId,
    page: number = 1,
    limit: number = 20,
    query: string = ''
  ): Promise<{folders: Folder[], pagination: PaginationInfo}> {
    await delay(300);
    
    // Filter folders by parent
    const filteredFolders = folderId === null
      ? mockFolders.filter((folder) => folder.parentId === null)
      : mockFolders.filter((folder) => folder.parentId === folderId);
    
    // Filter by search query
    let searchFiltered = filteredFolders;
    if (query?.trim()) {
      const searchLower = query.toLowerCase().trim();
      searchFiltered = filteredFolders.filter((folder) =>
        folder.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by creation date ascending (oldest first)
    const sortedFolders = searchFiltered.toSorted((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Apply pagination
    const totalFolders = sortedFolders.length;
    const totalPages = Math.ceil(totalFolders / limit);
    const startIndex = (page - 1) * limit;
    const paginatedFolders = sortedFolders.slice(startIndex, startIndex + limit);
    
    return {
      folders: paginatedFolders,
      pagination: {
        currentPage: page,
        totalPages,
        totalFiles: totalFolders,
        filesPerPage: limit
      }
    };
  }
  getTags(): Promise<string[]> {
    return Promise.resolve(mockTags.map((tag) => tag.name));
  }
  async getFiles(
    folderId: FolderId,
    fileTypes?: FileType[],
    page?: number,
    limit?: number,
    query?: string,
  ): Promise<{ files: FileMetaData[]; pagination: PaginationInfo }> {
    await delay(500);
    let filteredFiles = [...mockFiles];

    // Filter by folderId
    if (folderId !== null) {
      filteredFiles = filteredFiles.filter(
        (file) => file.folderId === folderId
      );
    }

    // Filter by fileTypes (derive type if not set)
    if (fileTypes && fileTypes.length > 0) {
      filteredFiles = filteredFiles.filter((file) => {
        const fileType =  getFileTypeFromMime(file.mime, file.ext);
        return fileTypes.includes(fileType);
      });
    }

    // Filter by searchQuery
    if (query) {
      const searchLower = query?.toLowerCase();
      filteredFiles = filteredFiles.filter((file) =>
        file.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date ascending (oldest first)
    const sortedFiles = filteredFiles.toSorted((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Pagination
    const currentPage = page ?? 1;
    const filesPerPage = limit ?? 10;
    const totalFiles = sortedFiles.length;
    const totalPages = Math.ceil(totalFiles / filesPerPage);
    const startIndex = (currentPage - 1) * filesPerPage;
    const paginatedFiles = sortedFiles.slice(
      startIndex,
      startIndex + filesPerPage
    );

    return {
      files: paginatedFiles,
      pagination: {
        currentPage,
        totalPages,
        totalFiles,
        filesPerPage,
      },
    };
  }
  
  /**
   * Get files and folders separately (folders always come first)
   * Folders are not paginated (all folders in current directory are returned)
   * Files are paginated after folders
   */
  async getItems(
    folderId: FolderId,
    fileTypes?: FileType[],
    page: number = 1,
    limit: number = 24,
    query: string = ''
  ): Promise<{
    folders: Folder[];
    files: FileMetaData[];
    pagination: PaginationInfo;
  }> {
    await delay(300);
    
    // Fetch all folders in current directory
    let filteredFolders = folderId === null
      ? mockFolders.filter((folder) => folder.parentId === null)
      : mockFolders.filter((folder) => folder.parentId === folderId);
    
    // Fetch all files in current directory
    let filteredFiles = folderId === null
      ? mockFiles.filter((file) => file.folderId === null)
      : mockFiles.filter((file) => file.folderId === folderId);

    // Filter by file types
    if (fileTypes && fileTypes.length > 0) {
      filteredFiles = filteredFiles.filter((file) => {
        const fileType = getFileTypeFromMime(file.mime, file.ext);
        return fileTypes.includes(fileType);
      });
    }
    
    // Apply search query to both folders and files
    if (query?.trim()) {
      const searchLower = query.toLowerCase().trim();
      
      filteredFolders = filteredFolders.filter((folder) =>
        folder.name.toLowerCase().includes(searchLower)
      );
      
      filteredFiles = filteredFiles.filter((file) =>
        file.name.toLowerCase().includes(searchLower) ||
        (file.ext?.toLowerCase().includes(searchLower) ?? false)
      );
    }
    
    // Sort folders by createdAt ASC (oldest first)
    const sortedFolders = filteredFolders.toSorted((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Sort files by createdAt ASC (oldest first)
    const sortedFiles = filteredFiles.toSorted((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Pagination is based on total items (folders + files)
    const totalItems = sortedFolders.length + sortedFiles.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // First, take folders from the start
    const foldersToShow = sortedFolders.slice(
      Math.max(0, startIndex),
      Math.min(sortedFolders.length, endIndex)
    );
    
    // Calculate how many file slots remain after folders
    const foldersTaken = foldersToShow.length;
    const fileSlots = limit - foldersTaken;
    
    // Calculate file offset taking into account folders on previous pages
    const fileStartIndex = Math.max(0, startIndex - sortedFolders.length);
    
    const filesToShow = sortedFiles.slice(fileStartIndex, fileStartIndex + fileSlots);
    
    return {
      folders: foldersToShow,
      files: filesToShow,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalFiles: totalItems,
        filesPerPage: limit
      }
    };
  }


  async createFolder(
    name: string,
    parentId?: FolderId
  ): Promise<Folder> {
    await delay(300);
    const newFolder: Folder = {
      id: Date.now(), // simple unique id
      name,
      parentId: parentId ?? null,
      pathId: typeof parentId === 'number' ? parentId : 0, // Fallback logic
      path: "",
      fileCount: 0,
      folderCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFolders.push(newFolder);
    return newFolder;
  }

  private getMetaDataType(file: File, videoSource?: VideoSource): MetaDataType {
    // Basic metadata extraction
    if (file.type.startsWith("image/")) {
      return {} as MetaDataType;
    } else if (file.type.startsWith("video/")) {
      return {
        duration: 0, // Mock
        videoSource: videoSource ?? VIDEO_SOURCE.LOCAL,
      };
    } else if (file.type.startsWith("audio/")) {
      return {
        duration: 0,
      };
    }
    // Default or other
    return {
      description: "",
    };
  }

  private getFileType(file: File): FileType {
    // Use the centralized utility function
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return getFileTypeFromMime(file.type, ext);
  }

  // Note: Static helper removed - use getFileTypeFromMime from lib/file-type-utils instead

  async uploadFiles(
    files: FileUploadInput[],
    folderId?: FolderId
  ): Promise<FileMetaData[]> {
    await delay(500);

    const uploadedFiles: FileMetaData[] = [];

    for (const { file, videoSource } of files) {
      const fileType = this.getFileType(file);
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      
      const newFile: FileMetaData = {
        id: Date.now() + Math.random(), // Ensure unique IDs
        name: file.name,
        folderId: folderId ?? null,
        size: file.size,
        url: URL.createObjectURL(file), // Mock URL
        // type field omitted - will be derived from mime/ext using getFileTypeFromMime
        mime: file.type || "application/octet-stream",
        ext: ext,
        metaData: this.getMetaDataType(file, videoSource),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        // Mock default dims for images if needed, or leave undefined
        width: fileType === FILE_TYPE.IMAGE ? 800 : undefined,
        height: fileType === FILE_TYPE.IMAGE ? 600 : undefined,
      };
      mockFiles.push(newFile);
      uploadedFiles.push(newFile);
    }

    return uploadedFiles;
  }

  renameFolder(folderId: EntityId, newName: string): Promise<Folder> {
    const folder = mockFolders.find((f) => f.id === folderId);
    if (!folder) {
      return Promise.reject(new Error("Folder not found"));
    }
    folder.name = newName;
    folder.updatedAt = new Date();
    return Promise.resolve(folder);
  }

  updateFileMetaData(
    fileId: EntityId,
    updates: Partial<FileMetaData>
  ): Promise<FileMetaData> {
    const file = mockFiles.find((f) => f.id === fileId);
    if (!file) {
      return Promise.reject(new Error("File not found"));
    }
    
    const { metaData, ...rootUpdates } = updates;
    
    // Update root properties like name, caption, altText
    Object.assign(file, rootUpdates);
    
    // Merge nested metadata properties (e.g. description) if present
    if (metaData) {
      file.metaData = { ...file.metaData, ...metaData };
    }
    
    file.updatedAt = new Date();
    return Promise.resolve(file);
  }

  deleteFiles(fileIds: EntityId[]): Promise<void> {
    for (const fileId of fileIds) {
      const fileIndex = mockFiles.findIndex((f) => f.id === fileId);
      if (fileIndex !== -1) {
        mockFiles.splice(fileIndex, 1);
      }
    }
    return Promise.resolve();
  }

  deleteFolders(folderIds: EntityId[]): Promise<void> {
    for (const folderId of folderIds) {
      const folderIndex = mockFolders.findIndex((f) => f.id === folderId);
      if (folderIndex !== -1) {
        //remove folder
        mockFolders.splice(folderIndex, 1);
        //remove files in the folder
        for (let i = mockFiles.length - 1; i >= 0; i--) {
          if (mockFiles[i].folderId === folderId) {
            mockFiles.splice(i, 1);
          }
        }
      }
    }
    return Promise.resolve();
  }

  findFiles(searchQuery: string): Promise<FileMetaData[]> {
    //search tags and file names
    const query = searchQuery?.toLowerCase();
    const foundFiles = mockFiles.filter(
      (file) =>
        file.name.toLowerCase().includes(query) ||
        file.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
    return Promise.resolve(foundFiles);
  }
  
  findFolders(searchQuery: string): Promise<Folder[]> {
    //search folder with names and tags
    const query = searchQuery?.toLowerCase();
    const foundFolders = mockFolders.filter((folder) =>
      folder.name.toLowerCase().includes(query)
    );
    return Promise.resolve(foundFolders);
  }

  moveFiles(fileIds: EntityId[], newFolderId: FolderId): Promise<FileMetaData[]> {
    // Move multiple files
    const movedFiles: FileMetaData[] = [];
    for (const fileId of fileIds) {
      const file = mockFiles.find((f) => f.id === fileId);
      if (file) {
        file.folderId = newFolderId;
        file.updatedAt = new Date();
        movedFiles.push(file);
      }
    }
    return Promise.resolve(movedFiles);   
  }
  moveFolders(folderIds: FolderId[], newParentId: FolderId): Promise<Folder[]> {
    // Move multiple folders
    const movedFolders: Folder[] = [];
    for (const folderId of folderIds) {
      const folder = mockFolders.find((f) => f.id === folderId);
      if (folder) {
        folder.parentId = newParentId;
        folder.updatedAt = new Date();
        movedFolders.push(folder);
      }
    }
    return Promise.resolve(movedFolders);
  }
}
