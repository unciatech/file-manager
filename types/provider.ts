import { EntityId, FileMetaData, FileType, FolderId, Folder, PaginationInfo, VideoSource } from "./file-manager";
export type FileUploadInput = {
  file: File;
  metadata: Partial<FileMetaData>
  videoSource?: VideoSource; // Only used for videos, ignored for others
};

export interface IFileManagerProvider {

    //Read
    getFolder(folderId: FolderId): Promise<Folder | null>;
    getFolders(
      folderId: FolderId,
      page?: number,
      limit?: number,
      query?: string
    ): Promise<{folders: Folder[], pagination: PaginationInfo}>;
    getTags(): Promise<string[]>;
    getFiles(
      folderId : FolderId,
      fileTypes?: FileType[] | null,
      page?: number,
      limit?: number,
      query?: string,  
    ) : Promise<{files: FileMetaData[], pagination: PaginationInfo}>;
  
  /**
   * Get files and folders separately (folders always come first)
   * Folders are returned for the current page, followed by files
   */
  getItems(
    folderId: FolderId,
    fileTypes?: FileType[],
    page?: number,
    limit?: number,
    query?: string
  ): Promise<{
    folders: Folder[];
    files: FileMetaData[];
    pagination: PaginationInfo;
  }>;


    //Create
    createFolder(name: string, parentId?: FolderId): Promise<Folder>;
    uploadFiles(files: FileUploadInput[], folderId?: FolderId): Promise<FileMetaData[]>;

    //Update
    renameFolder(folderId: FolderId, newName: string): Promise<Folder>;
    moveFiles(fileIds: EntityId[], newFolderId: FolderId): Promise<FileMetaData[]>;
    moveFolders(folderIds: FolderId[], newParentId: FolderId): Promise<Folder[]>;
    updateFileMetaData(fileId: EntityId, metaData: Partial<FileMetaData>): Promise<FileMetaData>;

    //Delete
    deleteFiles(fileIds: EntityId[]): Promise<void>;
    deleteFolders(folderIds: FolderId[]): Promise<void>;

    //Find
    findFiles(searchQuery: string): Promise<FileMetaData[]>;
    findFolders(searchQuery: string): Promise<Folder[]>;
}