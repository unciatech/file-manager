"use client"

import { FileManagerProvider, useFileManager } from "@/context/file-manager-context"
import { FILE_TYPE, FileType } from "@/types/file-manager"
import { useState } from "react"

function getFileIcon(type: FileType): string {
  switch (type) {
    case "image":
      return "🖼️"
    case "document":
      return "📄"
    case "video":
      return "🎬"
    case "audio":
      return "🎵"
    default:
      return "📦"
  }
}

// Simple Modal Component
function Modal({ isOpen, onClose, title, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode 
}) {
  if (!isOpen) return null
  
  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <dialog
        open
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "400px",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          border: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>×</button>
        </div>
        {children}
      </dialog>
    </div>
  )
}

function FileManagerUI() {
  const {
    files,
    folders,
    selectedFiles,
    selectedFolders,
    currentFolder,
    searchQuery,
    isLoading,
    pagination,
    mode,
    selectionMode,
    isUploadModalOpen,
    isCreateFolderModalOpen,
    isMoveFileModalOpen,
    isRenameFolderModalOpen,
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    setIsMoveFileModalOpen,
    setSearchQuery,
    handleFileSelect,
    handleFolderSelect,
    handleFolderClick,
    handleClearSelection,
    handleSelectAllGlobal,
    handlePageChange,
    createFolder,
    uploadFiles,
    bulkMove,
    bulkDelete,
    refreshData,
    isInSelectionMode,
    getGlobalCheckboxState,
  } = useFileManager()

  const [newFolderName, setNewFolderName] = useState("")
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<File[]>([])
  const [targetFolderId, setTargetFolderId] = useState<string>("")

  const globalCheckState = getGlobalCheckboxState()

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1>File Manager Test UI</h1>
      
      {/* Info Bar */}
      <div style={{ marginBottom: "20px", padding: "10px", background: "#f0f0f0" }}>
        <p><strong>Mode:</strong> {mode} | <strong>Selection Mode:</strong> {selectionMode}</p>
        <p><strong>Current Folder:</strong> {currentFolder ? `${currentFolder.name} (ID: ${currentFolder.id})` : "Root"}</p>
        <p><strong>Selected Files:</strong> {selectedFiles.length} | <strong>Selected Folders:</strong> {selectedFolders.length}</p>
        <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
      </div>

      {/* Actions Bar */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px", width: "200px" }}
        />

        {/* Back to Root */}
        {currentFolder !== null && (
          <button onClick={() => handleFolderSelect(null)} style={{ padding: "8px 16px" }}>
            ← Back to Root
          </button>
        )}

        {/* Select All */}
        <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <input
            type="checkbox"
            checked={globalCheckState === true}
            ref={(el) => {
              if (el) {
                el.indeterminate = globalCheckState === "indeterminate"
              }
            }}
            onChange={(e) => handleSelectAllGlobal(e.target.checked)}
          />{" "}
          Select All
        </label>

        {/* Clear Selection */}
        {isInSelectionMode() && (
          <button onClick={handleClearSelection} style={{ padding: "8px 16px" }}>
            Clear Selection
          </button>
        )}

        {/* Delete Selected */}
        {isInSelectionMode() && (
          <button 
            onClick={bulkDelete} 
            style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none" }}
          >
            Delete Selected ({selectedFiles.length + selectedFolders.length})
          </button>
        )}

        {/* Refresh */}
        <button onClick={refreshData} style={{ padding: "8px 16px" }}>
          Refresh
        </button>

        {/* Upload Button */}
        <button 
          onClick={() => setIsUploadModalOpen(true)} 
          style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none" }}
        >
          📤 Upload Files
        </button>

        {/* Create Folder Button */}
        <button 
          onClick={() => setIsCreateFolderModalOpen(true)} 
          style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none" }}
        >
          📁 New Folder
        </button>

        {/* Move Selected Button */}
        {isInSelectionMode() && (
          <button 
            onClick={() => setIsMoveFileModalOpen(true)} 
            style={{ padding: "8px 16px", background: "#8b5cf6", color: "white", border: "none" }}
          >
            📦 Move Selected
          </button>
        )}
      </div>

      {/* Inline Create Folder (keeping for quick access) */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="New folder name..."
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          style={{ padding: "8px", width: "200px" }}
        />
        <button
          onClick={async () => {
            if (newFolderName.trim()) {
              await createFolder(newFolderName.trim())
              setNewFolderName("")
            }
          }}
          style={{ padding: "8px 16px" }}
        >
          Create Folder
        </button>
      </div>

      {/* Loading State */}
      {isLoading && <p>Loading...</p>}

      {/* Folders Section */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Folders ({folders.length})</h2>
        {folders.length === 0 ? (
          <p style={{ color: "#666" }}>No folders</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {folders.map((folder) => {
              const isSelected = selectedFolders.some((f) => f.id === folder.id)
              return (
                <div
                  key={folder.id}
                  style={{
                    padding: "15px",
                    border: isSelected ? "2px solid #3b82f6" : "1px solid #ccc",
                    background: isSelected ? "#eff6ff" : "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFolderClick(folder, {} as React.MouseEvent, true)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleFolderClick(folder, e)}
                      style={{ flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                    >
                      📁 <strong>{folder.name}</strong>
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
                    {folder.fileCount} files
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Files Section */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Files ({files.length})</h2>
        {files.length === 0 ? (
          <p style={{ color: "#666" }}>No files</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {files.map((file) => {
              const isSelected = selectedFiles.some((f) => f.id === file.id)
              return (
                <div
                  key={file.id}
                  style={{
                    padding: "15px",
                    border: isSelected ? "2px solid #3b82f6" : "1px solid #ccc",
                    background: isSelected ? "#eff6ff" : "white",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFileSelect(file, undefined, true)}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleFileSelect(file, e)}
                      style={{ flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                    >
                      {getFileIcon(file.type)}
                      {" "}{file.name}
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
                    {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {file.type === "image" && (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      style={{ width: "100%", height: "100px", objectFit: "cover", marginTop: "8px" }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          style={{ padding: "8px 16px" }}
        >
          Previous
        </button>
        <span>
          Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalFiles} total files)
        </span>
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          style={{ padding: "8px 16px" }}
        >
          Next
        </button>
      </div>

      {/* Debug: Selected Items */}
      {isInSelectionMode() && (
        <div style={{ marginTop: "20px", padding: "10px", background: "#fef3c7" }}>
          <h3>Selected Items Debug</h3>
          <p><strong>Files:</strong> {selectedFiles.map(f => f.name).join(", ") || "None"}</p>
          <p><strong>Folders:</strong> {selectedFolders.map(f => f.name).join(", ") || "None"}</p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => {
          setIsUploadModalOpen(false)
          setSelectedUploadFiles([])
        }} 
        title="Upload Files"
      >
        <div>
          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setSelectedUploadFiles(Array.from(e.target.files))
              }
            }}
            style={{ marginBottom: "16px", display: "block" }}
          />
          {selectedUploadFiles.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p><strong>Selected files:</strong></p>
              <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                {selectedUploadFiles.map((file) => (
                  <li key={file.name}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button 
              onClick={() => {
                setIsUploadModalOpen(false)
                setSelectedUploadFiles([])
              }}
              style={{ padding: "8px 16px" }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (selectedUploadFiles.length > 0) {
                  await uploadFiles(selectedUploadFiles.map(file => ({ file, metadata: {} })))
                  setIsUploadModalOpen(false)
                  setSelectedUploadFiles([])
                }
              }}
              disabled={selectedUploadFiles.length === 0}
              style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none" }}
            >
              Upload {selectedUploadFiles.length > 0 ? `(${selectedUploadFiles.length})` : ""}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Folder Modal */}
      <Modal 
        isOpen={isCreateFolderModalOpen} 
        onClose={() => {
          setIsCreateFolderModalOpen(false)
          setNewFolderName("")
        }} 
        title="Create New Folder"
      >
        <div>
          <input
            type="text"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            style={{ padding: "8px", width: "100%", marginBottom: "16px", boxSizing: "border-box" }}
            autoFocus
          />
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
            Creating in: {currentFolder ? `Folder ${currentFolder.name}` : "Root"}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button 
              onClick={() => {
                setIsCreateFolderModalOpen(false)
                setNewFolderName("")
              }}
              style={{ padding: "8px 16px" }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (newFolderName.trim()) {
                  await createFolder(newFolderName.trim())
                  setIsCreateFolderModalOpen(false)
                  setNewFolderName("")
                }
              }}
              disabled={!newFolderName.trim()}
              style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none" }}
            >
              Create Folder
            </button>
          </div>
        </div>
      </Modal>

      {/* Move Files Modal */}
      <Modal 
        isOpen={isMoveFileModalOpen} 
        onClose={() => {
          setIsMoveFileModalOpen(false)
          setTargetFolderId("")
        }} 
        title="Move Selected Items"
      >
        <div>
          <p style={{ marginBottom: "16px" }}>
            Moving {selectedFiles.length} file(s) and {selectedFolders.length} folder(s)
          </p>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="target-folder" style={{ display: "block", marginBottom: "8px" }}><strong>Target Folder:</strong></label>
            <select
              id="target-folder"
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              style={{ padding: "8px", width: "100%" }}
            >
              <option value="">Root (No folder)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={String(folder.id)}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button 
              onClick={() => {
                setIsMoveFileModalOpen(false)
                setTargetFolderId("")
              }}
              style={{ padding: "8px 16px" }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                let folderId: string | number | null = null
                if (targetFolderId !== "") {
                  folderId = Number.isNaN(Number(targetFolderId)) ? targetFolderId : Number(targetFolderId)
                }
                await bulkMove(folderId)
                setIsMoveFileModalOpen(false)
                setTargetFolderId("")
              }}
              style={{ padding: "8px 16px", background: "#8b5cf6", color: "white", border: "none" }}
            >
              Move Items
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function MediaPage() {
  return (
    <FileManagerProvider
      mode="page"
      selectionMode="multiple"
      allowedFileTypes={[FILE_TYPE.IMAGE, FILE_TYPE.DOCUMENT, FILE_TYPE.VIDEO, FILE_TYPE.AUDIO, FILE_TYPE.OTHER]}
      initialFolderId={null}
      viewMode="grid"
    >
      <FileManagerUI />
    </FileManagerProvider>
  )
}
