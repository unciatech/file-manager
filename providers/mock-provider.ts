import { mockFiles, mockFolders, mockTags } from "@/data/data";
import {
  Folder,
  FileType,
  FileMetaData,
  PaginationInfo,
  MetaDataType,
  ImageFormat,
  VideoFormat,
  AudioFormat,
  DocumentFormat,
  OTHER_FORMAT,
  FILE_TYPE,
  VIDEO_SOURCE,
  isImageFormat,
  isVideoFormat,
  isAudioFormat,
  isDocumentFormat,
  isAllFileFormat,
  VideoSource,
  EntityId,
  FolderId,
} from "@/types/file-manager";
import { FileUploadInput, IFileManagerProvider } from "@/types/provider";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockProvider implements IFileManagerProvider {

  getFolders(folderId: FolderId): Promise<Folder[]> {
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
    searchQuery?: string,
    page?: number,
    limit?: number
  ): Promise<{ files: FileMetaData[]; pagination: PaginationInfo }> {
    let filteredFiles = [...mockFiles];

    // Filter by folderId
    if (folderId !== null) {
      filteredFiles = filteredFiles.filter(
        (file) => file.folderId === folderId
      );
    }

    // Filter by fileTypes
    if (fileTypes && fileTypes.length > 0) {
      filteredFiles = filteredFiles.filter((file) =>
        fileTypes.includes(file.type)
      );
    }

    // Filter by searchQuery
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
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
      fileCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFolders.push(newFolder);
    return newFolder;
  }

  private getMetaDataType(file: File, videoSource?: VideoSource): MetaDataType {
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!isAllFileFormat(fileExtension)) {
      throw new Error("Unsupported file format");
    }

    if (file.type.startsWith("image/") || isImageFormat(fileExtension)) {
      return {
        format: fileExtension as ImageFormat,
        dimensions: { width: 0, height: 0 },
        altText: "",
        caption: "",
      };
    } else if (file.type.startsWith("video/") || isVideoFormat(fileExtension)) {
      return {
        format: fileExtension as VideoFormat,
        duration: 0,
        dimensions: { width: 0, height: 0 },
        videoSource: videoSource ?? VIDEO_SOURCE.LOCAL,
      };
    } else if (file.type.startsWith("audio/") || isAudioFormat(fileExtension)) {
      return {
        format: fileExtension as AudioFormat,
        duration: 0,
      };
    } else if (
      file.type.startsWith("application/") ||
      isDocumentFormat(fileExtension)
    ) {
      return {
        format: fileExtension as DocumentFormat,
        pageCount: 0,
      };
    }
    // Default to OtherMetaData
    return {
      format: OTHER_FORMAT.ZIP,
      description: "",
    };
  }

  private getFileType(file: File): FileType {
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!isAllFileFormat(fileExtension)) {
      throw new Error("Unsupported file format");
    }

    if (file.type.startsWith("image/") || isImageFormat(fileExtension)) {
      return FILE_TYPE.IMAGE;
    } else if (file.type.startsWith("video/") || isVideoFormat(fileExtension)) {
      return FILE_TYPE.VIDEO;
    } else if (file.type.startsWith("audio/") || isAudioFormat(fileExtension)) {
      return FILE_TYPE.AUDIO;
    } else if (
      file.type.startsWith("application/") ||
      isDocumentFormat(fileExtension)
    ) {
      return FILE_TYPE.DOCUMENT;
    }
    return FILE_TYPE.OTHER;
  }

  async uploadFiles(
    files: FileUploadInput[],
    folderId?: FolderId
  ): Promise<FileMetaData[]> {
    await delay(500);

    const uploadedFiles: FileMetaData[] = [];

    for (const { file, videoSource } of files) {
      const newFile: FileMetaData = {
        id: Date.now() + Math.random(), // Ensure unique IDs
        name: file.name,
        folderId: folderId ?? null,
        size: file.size,
        url: URL.createObjectURL(file),
        type: this.getFileType(file),
        metaData: this.getMetaDataType(file, videoSource),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
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
  moveFile(
    fileId: EntityId,
    newFolderId: FolderId
  ): Promise<FileMetaData> {
    const file = mockFiles.find((f) => f.id === fileId);
    if (!file) {
      return Promise.reject(new Error("File not found"));
    }
    file.folderId = newFolderId;
    file.updatedAt = new Date();
    return Promise.resolve(file);
  }
  moveFolder(
    folderId: EntityId,
    newParentId: FolderId
  ): Promise<Folder> {
    const folder = mockFolders.find((f) => f.id === folderId);
    if (!folder) {
      return Promise.reject(new Error("Folder not found"));
    }
    folder.parentId = newParentId;
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

  deleteFolder(folderId: EntityId): Promise<void> {
    const folderIndex = mockFolders.findIndex((f) => f.id === folderId);
    if (folderIndex === -1) {
      return Promise.reject(new Error("Folder not found"));
    }
    //remove folder
    mockFolders.splice(folderIndex, 1);
    //remove files in the folder
    for (let i = mockFiles.length - 1; i >= 0; i--) {
      if (mockFiles[i].folderId === folderId) {
        mockFiles.splice(i, 1);
      }
    }
    return Promise.resolve();
  }

  deleteFile(fileId: EntityId): Promise<void> {
    const fileIndex = mockFiles.findIndex((f) => f.id === fileId);
    if (fileIndex === -1) {
      return Promise.reject(new Error("File not found"));
    }
    mockFiles.splice(fileIndex, 1);
    return Promise.resolve();
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
    const query = searchQuery.toLowerCase();
    const foundFiles = mockFiles.filter(
      (file) =>
        file.name.toLowerCase().includes(query) ||
        file.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
    return Promise.resolve(foundFiles);
  }
  
  findFolders(searchQuery: string): Promise<Folder[]> {
    //search folder with names and tags
    const query = searchQuery.toLowerCase();
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
