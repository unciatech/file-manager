"use client";

import { UploadModal } from "../modals/upload-modal";
import { CreateFolderModal } from "../modals/create-folder";
import { MoveModal } from "../modals/move-modal";

export function FileManagerOverlays() {
  return (
    <>
      <UploadModal />
      <CreateFolderModal />
      <MoveModal />
    </>
  );
}
