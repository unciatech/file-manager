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
import { getFileTypeFromMime } from "@/lib/file-type-utils";

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

  getFolders(folderId: FolderId): Promise<Folder[]> {
    delay(500);
    // If folderId is provided, return only folder with similar parentId; else filter those folder with parentId null
    if (folderId !== null) {
      const filteredFolders = mockFolders.filter(
        (folder) => folder.parentId === folderId
      );
      return Promise.resolve(filteredFolders);
    }
    const rootFolders = mockFolders.filter((folder) => folder.parentId === null);
    return Promise.resolve(rootFolders);
  }
  getTags(): Promise<string[]> {
    return Promise.resolve(mockTags.map((tag) => tag.name));
  }
  getFiles(
    folderId: FolderId,
    fileTypes?: FileType[],
    page?: number,
    limit?: number,
    searchQuery?: string,
  ): Promise<{ files: FileMetaData[]; pagination: PaginationInfo }> {
    delay(500);
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
        const fileType = file.type || getFileTypeFromMime(file.mime, file.ext);
        return fileTypes.includes(fileType);
      });
    }

    // Filter by searchQuery
    if (searchQuery) {
      const query = searchQuery?.toLowerCase();
      filteredFiles = filteredFiles.filter((file) =>
        file.name.toLowerCase().includes(query)
      );
    }

    // Pagination
    const currentPage = page ?? 1;
    const filesPerPage = limit ?? 10;
    const totalFiles = filteredFiles.length;
    const totalPages = Math.ceil(totalFiles / filesPerPage);
    const startIndex = (currentPage - 1) * filesPerPage;
    const paginatedFiles = filteredFiles.slice(
      startIndex,
      startIndex + filesPerPage
    );

    return Promise.resolve({
      files: paginatedFiles,
      pagination: {
        currentPage,
        totalPages,
        totalFiles,
        filesPerPage,
      },
    });
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
      return {
        // Dimensions would normally require reading the image
        // dimensions: { width: 0, height: 0 },
        // altText: "",
        // caption: "",
      } as any; // Cast to any to avoid partial checks for now
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
    metaData: Partial<FileMetaData>
  ): Promise<FileMetaData> {
    const file = mockFiles.find((f) => f.id === fileId);
    if (!file) {
      return Promise.reject(new Error("File not found"));
    }
    file.metaData = { ...file.metaData, ...metaData };
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
