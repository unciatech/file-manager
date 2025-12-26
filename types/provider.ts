import { EntityId, FileMetaData, FileType, FolderId, Folder, PaginationInfo, VideoSource } from "./file-manager";
export type FileUploadInput = {
  file: File;
  metadata: Partial<FileMetaData>
  videoSource?: VideoSource; // Only used for videos, ignored for others
};

export interface IFileManagerProvider {

    //Read
    getFolders(folderId: FolderId): Promise<Folder[]>;
    getTags(): Promise<string[]>;
    getFiles(
      folderId : FolderId,
      fileTypes?: FileType[] | null,
      searchQuery?: string,  
      page?: number,
      limit?: number,
    ) : Promise<{files: FileMetaData[], pagination: PaginationInfo}>;


    //Create
    createFolder(name: string, parentId?: FolderId): Promise<Folder>;
    uploadFiles(files: FileUploadInput[], folderId?: FolderId): Promise<FileMetaData[]>;

    //Update
    renameFolder(folderId: EntityId, newName: string): Promise<Folder>;
    moveFiles(fileIds: EntityId[], newFolderId: FolderId): Promise<FileMetaData[]>;
    moveFolders(folderIds: FolderId[], newParentId: FolderId): Promise<Folder[]>;
    updateFileMetaData(fileId: EntityId, metaData: Partial<FileMetaData>): Promise<FileMetaData>;

    //Delete
    deleteFolder(folderId: EntityId): Promise<void>;
    deleteFile(fileId: EntityId): Promise<void>;
    deleteFiles(fileIds: EntityId[]): Promise<void>;
    deleteFolders(folderIds: EntityId[]): Promise<void>;

    //Find
    findFiles(searchQuery: string): Promise<FileMetaData[]>;
    findFolders(searchQuery: string): Promise<Folder[]>;
}