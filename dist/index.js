var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// types/file-manager.ts
var MODE = {
  PAGE: "page",
  MODAL: "modal"
};
var MODES = Object.values(MODE);
var FILE_TYPE = {
  IMAGE: "images",
  VIDEO: "videos",
  AUDIO: "audios",
  FILE: "files"
};
var FILE_TYPES = Object.values(FILE_TYPE);
var SELECTION_MODE = {
  SINGLE: "single",
  MULTIPLE: "multiple"
};
var SELECTION_MODES = Object.values(SELECTION_MODE);
var VIEW_MODE = {
  GRID: "grid",
  LIST: "list"
};
var VIEW_MODES = Object.values(VIEW_MODE);
var VIDEO_SOURCE = {
  LOCAL: "local",
  REMOTE: "remote",
  YOUTUBE: "youtube",
  VIMEO: "vimeo"
};
var VIDEO_SOURCES = Object.values(VIDEO_SOURCE);

// hooks/use-file-handlers.ts
import { useCallback as useCallback2 } from "react";

// hooks/use-browser-router.ts
import { useCallback, useEffect, useMemo, useState } from "react";
var LOCATION_CHANGE_EVENT = "locationchange";
if (typeof window !== "undefined" && !window.__navigationPatched) {
  window.__navigationPatched = true;
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  window.history.pushState = function(...args) {
    const result = originalPushState.apply(this, args);
    setTimeout(() => window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT)), 0);
    return result;
  };
  window.history.replaceState = function(...args) {
    const result = originalReplaceState.apply(this, args);
    setTimeout(() => window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT)), 0);
    return result;
  };
}
function useBrowserRouter({ basePath, onNavigate } = {}) {
  const [pathname, setPathname] = useState(
    () => typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const [search, setSearch] = useState(
    () => typeof window !== "undefined" ? window.location.search : ""
  );
  useEffect(() => {
    const onUpdate = () => {
      setPathname(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener("popstate", onUpdate);
    window.addEventListener(LOCATION_CHANGE_EVENT, onUpdate);
    return () => {
      window.removeEventListener("popstate", onUpdate);
      window.removeEventListener(LOCATION_CHANGE_EVENT, onUpdate);
    };
  }, []);
  const push = useCallback(
    (url, options) => {
      if (onNavigate) {
        onNavigate(url, options);
      } else {
        history.pushState(null, "", url);
        if ((options == null ? void 0 : options.scroll) !== false) {
          window.scrollTo(0, 0);
        }
      }
    },
    [onNavigate]
  );
  const replace = useCallback(
    (url) => {
      if (onNavigate) {
        onNavigate(url, { replace: true });
      } else {
        history.replaceState(null, "", url);
      }
    },
    [onNavigate]
  );
  const back = useCallback(() => {
    history.back();
  }, []);
  const searchParams = useMemo(
    () => new URLSearchParams(search),
    [search]
  );
  const params = useMemo(() => {
    if (!basePath) return {};
    const base = basePath.replace(/\/$/, "");
    const normalizedBase = base.startsWith("/") ? base : `/${base}`;
    if (!pathname.startsWith(normalizedBase)) return {};
    const rest = pathname.slice(normalizedBase.length).replace(/^\//, "");
    if (!rest) return {};
    const segments = rest.split("/").filter(Boolean);
    return { path: segments[0] };
  }, [pathname, basePath]);
  return { push, replace, back, pathname, searchParams, params };
}

// hooks/use-file-handlers.ts
import { toast } from "sonner";
var toggleFilesInSelection = (prev, filesToToggle) => {
  let updated = [...prev];
  filesToToggle.forEach((file) => {
    const isSelected = updated.some((f) => f.id === file.id);
    if (isSelected) {
      updated = updated.filter((f) => f.id !== file.id);
    } else {
      updated.push(file);
    }
  });
  return updated;
};
var toggleFoldersInSelection = (prev, foldersToToggle) => {
  let updated = [...prev];
  foldersToToggle.forEach((folder) => {
    const isSelected = updated.some((f) => f.id === folder.id);
    if (isSelected) {
      updated = updated.filter((f) => f.id !== folder.id);
    } else {
      updated.push(folder);
    }
  });
  return updated;
};
function useFileHandlers(state) {
  const {
    mode,
    selectionMode,
    files,
    folders,
    selectedFiles,
    selectedFolders,
    currentFolder,
    setSelectedFiles,
    setSelectedFolders,
    setCurrentFolder,
    setFiles,
    setFolders,
    setPagination,
    loadData,
    isInSelectionMode,
    provider,
    onFilesSelected,
    onClose,
    basePath,
    setIsLoading,
    setFileDetailsModalFile
  } = state;
  const { push } = useBrowserRouter({ basePath: state.basePath, onNavigate: state.onNavigate });
  const handleFileClick = useCallback2(
    (file, event, isCheckboxClick = false) => {
      const fileArray = [file];
      const isExplicitSelection = isCheckboxClick || event && (event.metaKey || event.ctrlKey);
      if (isExplicitSelection) {
        setSelectedFiles((prev) => toggleFilesInSelection(prev, fileArray));
        return;
      }
      if (isInSelectionMode() && mode !== MODE.MODAL) {
        setSelectedFiles((prev) => toggleFilesInSelection(prev, fileArray));
        return;
      }
      if (mode === MODE.MODAL) {
        if (selectionMode === "single") {
          setSelectedFiles([file]);
          onFilesSelected == null ? void 0 : onFilesSelected([file]);
          onClose == null ? void 0 : onClose();
        } else {
          setSelectedFiles((prev) => toggleFilesInSelection(prev, fileArray));
        }
        return;
      }
      setFileDetailsModalFile(file);
    },
    [mode, selectionMode, isInSelectionMode, setSelectedFiles, onFilesSelected, onClose, setFileDetailsModalFile]
  );
  const handleFolderClick = useCallback2(
    (folder, event, isCheckboxClick = false) => {
      const folderId = folder ? folder.id : null;
      const isExplicitSelection = isCheckboxClick || event && (event.metaKey || event.ctrlKey);
      if (isExplicitSelection && folder) {
        setSelectedFolders((prev) => toggleFoldersInSelection(prev, [folder]));
        return;
      }
      if (isInSelectionMode() && folder) {
        setSelectedFolders((prev) => toggleFoldersInSelection(prev, [folder]));
        return;
      }
      if (mode === MODE.PAGE) {
        setIsLoading(true);
        const path = basePath != null ? basePath : "/media";
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const newUrl = folderId === null ? normalizedPath : `${normalizedPath}/${folderId}`;
        push(newUrl);
      } else {
        setIsLoading(true);
        setSelectedFiles([]);
        setSelectedFolders([]);
        const params = new URLSearchParams(globalThis.location.search);
        if (folderId === null) {
          params.delete("folderId");
        } else {
          params.set("folderId", String(folderId));
        }
        params.set("page", "1");
        const newUrl = `${globalThis.location.pathname}?${params.toString()}`;
        push(newUrl, { scroll: false });
      }
    },
    [isInSelectionMode, mode, push, setSelectedFolders, setSelectedFiles, basePath, setIsLoading]
  );
  const handleClearSelection = useCallback2(() => {
    setSelectedFiles([]);
    setSelectedFolders([]);
  }, [setSelectedFiles, setSelectedFolders]);
  const handleSelectAllGlobal = useCallback2(
    (checked) => {
      if (checked) {
        setSelectedFiles(files);
        setSelectedFolders(mode === MODE.PAGE ? folders : []);
      } else {
        setSelectedFiles([]);
        setSelectedFolders([]);
      }
    },
    [files, folders, mode, setSelectedFiles, setSelectedFolders]
  );
  const refreshData = useCallback2(async (silent = false) => {
    await loadData(silent);
  }, [loadData]);
  const uploadFiles = useCallback2(
    async (fileUploadInput) => {
      var _a;
      try {
        await provider.uploadFiles(fileUploadInput, (_a = currentFolder == null ? void 0 : currentFolder.id) != null ? _a : null);
        await refreshData(true);
        setSelectedFiles([]);
        toast.success("Upload Successful", {
          description: `${fileUploadInput.length} file(s) uploaded successfully`
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload files";
        toast.error("Upload Failed", {
          description: message
        });
        console.error("Upload failed:", error);
      }
    },
    [currentFolder, provider, refreshData, setSelectedFiles]
  );
  const createFolder = useCallback2(
    async (name) => {
      var _a;
      try {
        await provider.createFolder(name, (_a = currentFolder == null ? void 0 : currentFolder.id) != null ? _a : null);
        await refreshData(true);
        setSelectedFiles([]);
        toast.success("Folder Created", {
          description: `Folder "${name}" created successfully`
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create folder";
        toast.error("Create Folder Failed", {
          description: message
        });
        console.error("Failed to create folder:", error);
      }
    },
    [currentFolder, provider, refreshData, setSelectedFiles]
  );
  const bulkMove = useCallback2(
    async (targetFolderId) => {
      try {
        if (selectedFiles.length > 0) {
          await provider.moveFiles(
            selectedFiles.map((f) => f.id),
            targetFolderId
          );
        }
        if (selectedFolders.length > 0) {
          await provider.moveFolders(
            selectedFolders.map((f) => f.id),
            targetFolderId
          );
        }
        await refreshData(true);
        setSelectedFiles([]);
        setSelectedFolders([]);
        const totalMoved = selectedFiles.length + selectedFolders.length;
        toast.success("Move Successful", {
          description: `${totalMoved} item(s) moved successfully`
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to move items";
        toast.error("Move Failed", {
          description: message
        });
        console.error("Failed to move items:", error);
      }
    },
    [
      selectedFiles,
      selectedFolders,
      provider,
      refreshData,
      setSelectedFiles,
      setSelectedFolders
    ]
  );
  const renameFolder = useCallback2(
    async (folderId, newName) => {
      try {
        setFolders(
          (prev) => prev.map((f) => f.id === folderId ? __spreadProps(__spreadValues({}, f), { name: newName }) : f)
        );
        await provider.renameFolder(folderId, newName);
        await refreshData(true);
        toast.success("Folder Renamed", {
          description: `Folder renamed to "${newName}"`
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to rename folder";
        toast.error("Rename Failed", {
          description: message
        });
        console.error("Failed to rename folder:", error);
      }
    },
    [provider, refreshData, setFolders]
  );
  const updateFileMetadata = useCallback2(
    async (fileId, metadata) => {
      try {
        setFiles(
          (prev) => prev.map((f) => {
            if (f.id === fileId) {
              const _a = metadata, { metaData } = _a, rootUpdates = __objRest(_a, ["metaData"]);
              return __spreadProps(__spreadValues(__spreadValues({}, f), rootUpdates), {
                metaData: metaData ? __spreadValues(__spreadValues({}, f.metaData), metaData) : f.metaData
              });
            }
            return f;
          })
        );
        await provider.updateFileMetaData(fileId, metadata);
        await refreshData(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update metadata";
        toast.error("Update Failed", {
          description: message
        });
        console.error("Failed to update metadata:", error);
      }
    },
    [provider, refreshData, setFiles]
  );
  const bulkDelete = useCallback2(async () => {
    try {
      if (selectedFiles.length > 0) {
        await provider.deleteFiles(selectedFiles.map((f) => f.id));
      }
      if (selectedFolders.length > 0) {
        await provider.deleteFolders(selectedFolders.map((f) => f.id));
      }
      await refreshData(true);
      setSelectedFiles([]);
      setSelectedFolders([]);
      const totalDeleted = selectedFiles.length + selectedFolders.length;
      toast.success("Delete Successful", {
        description: `${totalDeleted} item(s) deleted successfully`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete items";
      toast.error("Delete Failed", {
        description: message
      });
      console.error("Failed to delete items:", error);
    }
  }, [
    selectedFiles,
    selectedFolders,
    provider,
    refreshData,
    setSelectedFiles,
    setSelectedFolders
  ]);
  return {
    // Selection handlers
    handleFileClick,
    handleFolderClick,
    handleClearSelection,
    handleSelectAllGlobal,
    // CRUD
    uploadFiles,
    createFolder,
    bulkMove,
    renameFolder,
    updateFileMetadata,
    bulkDelete,
    refreshData
  };
}

// hooks/use-file-state.ts
import { useCallback as useCallback3, useEffect as useEffect2, useMemo as useMemo2, useRef, useState as useState2 } from "react";
import { toast as toast2 } from "sonner";
function useFileState(options) {
  const {
    mode,
    selectionMode,
    initialFolderId,
    acceptedFileTypesForModal,
    allowedFileTypes,
    provider,
    onFilesSelected,
    onClose,
    basePath,
    onNavigate
  } = options;
  const { params, searchParams, push, replace, pathname } = useBrowserRouter({ basePath, onNavigate });
  const pageFromUrl = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
  const limitFromUrl = Math.max(1, Number.parseInt(searchParams.get("limit") || "24", 10));
  const queryFromUrl = searchParams.get("query") || "";
  const folderId = useMemo2(() => {
    if (mode === MODE.PAGE && (params == null ? void 0 : params.path)) {
      const path = Array.isArray(params.path) ? params.path[0] : params.path;
      return typeof path === "string" && /^\d+$/.test(path) ? Number(path) : null;
    }
    if (mode === MODE.MODAL) {
      const folderIdParam = searchParams.get("folderId");
      if (folderIdParam && /^\d+$/.test(folderIdParam)) {
        return Number(folderIdParam);
      }
    }
    return initialFolderId != null ? initialFolderId : null;
  }, [mode, params, searchParams, initialFolderId]);
  const [files, setFiles] = useState2([]);
  const [folders, setFolders] = useState2([]);
  const [selectedFiles, setSelectedFiles] = useState2([]);
  const [selectedFolders, setSelectedFolders] = useState2([]);
  const [currentFolder, setCurrentFolder] = useState2(null);
  const [isLoading, setIsLoading] = useState2(true);
  const [pagination, setPagination] = useState2({
    currentPage: pageFromUrl,
    totalPages: 1,
    totalFiles: 0,
    filesPerPage: limitFromUrl
  });
  const currentFolderRef = useRef(null);
  currentFolderRef.current = currentFolder;
  const [searchQuery, setSearchQuery] = useState2(queryFromUrl);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState2(queryFromUrl);
  useEffect2(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  const prevFolderIdRef = useRef(folderId);
  const updateUrlParams = useCallback3((page, limit, replaceUrl = false) => {
    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.set("page", page.toString());
    urlParams.set("limit", limit.toString());
    const newUrl = `${pathname}?${urlParams.toString()}`;
    if (replaceUrl) {
      replace(newUrl);
    } else {
      push(newUrl, { scroll: false });
    }
  }, [push, replace, pathname, searchParams]);
  useEffect2(() => {
    setPagination((prev) => __spreadProps(__spreadValues({}, prev), {
      currentPage: pageFromUrl,
      filesPerPage: limitFromUrl
    }));
    setSearchQuery(queryFromUrl);
  }, [pageFromUrl, limitFromUrl, queryFromUrl]);
  useEffect2(() => {
    if (folderId !== prevFolderIdRef.current) {
      if (mode === MODE.PAGE) {
        updateUrlParams(1, limitFromUrl, true);
      }
      prevFolderIdRef.current = folderId;
    }
  }, [folderId, limitFromUrl, updateUrlParams, mode]);
  const currentPage = pagination.currentPage;
  const filesPerPage = pagination.filesPerPage;
  useEffect2(() => {
    let cancelled = false;
    const syncAndLoad = async () => {
      if (folderId && (!currentFolderRef.current || currentFolderRef.current.id !== folderId)) {
        try {
          setIsLoading(true);
          const folder = await provider.getFolder(folderId);
          if (cancelled) return;
          setCurrentFolder(folder);
          await loadDataForFolder(folder);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Failed to load folder";
          toast2.error("Load Folder Failed", {
            description: message
          });
          console.error("Failed to fetch current folder", e);
          if (cancelled) return;
          setCurrentFolder(null);
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      } else if (folderId === null && currentFolderRef.current !== null) {
        setCurrentFolder(null);
        await loadDataForFolder(null);
      } else if (currentFolderRef.current) {
        await loadDataForFolder(currentFolderRef.current);
      } else {
        await loadDataForFolder(null);
      }
    };
    const loadDataForFolder = async (folder) => {
      var _a;
      if (cancelled) return;
      setIsLoading(true);
      try {
        let fileTypes = [];
        if (mode === MODE.MODAL) {
          fileTypes = acceptedFileTypesForModal;
        } else {
          fileTypes = allowedFileTypes;
        }
        const result = await provider.getItems(
          (_a = folder == null ? void 0 : folder.id) != null ? _a : null,
          fileTypes,
          currentPage,
          filesPerPage,
          debouncedSearchQuery
        );
        if (cancelled) return;
        setFolders(result.folders);
        setFiles(result.files);
        setPagination(result.pagination);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load data";
        toast2.error("Load Data Failed", {
          description: message
        });
        console.error("Failed to load data:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    syncAndLoad();
    return () => {
      cancelled = true;
    };
  }, [
    folderId,
    provider,
    mode,
    acceptedFileTypesForModal,
    allowedFileTypes,
    currentPage,
    filesPerPage,
    debouncedSearchQuery
  ]);
  useEffect2(() => {
    setSelectedFolders([]);
    setSelectedFiles([]);
  }, [currentFolder]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState2(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState2(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState2(false);
  const [isMoveFileModalOpen, setIsMoveFileModalOpen] = useState2(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState2(false);
  const [folderToRename, setFolderToRename] = useState2(null);
  const [fileDetailsModalFile, setFileDetailsModalFile] = useState2(null);
  const loadData = useCallback3(async (silent = false) => {
    var _a;
    if (!silent) {
      setIsLoading(true);
    }
    try {
      let fileTypes = [];
      if (mode === MODE.MODAL) {
        fileTypes = acceptedFileTypesForModal;
      } else {
        fileTypes = allowedFileTypes;
      }
      const result = await provider.getItems(
        (_a = currentFolder == null ? void 0 : currentFolder.id) != null ? _a : null,
        fileTypes,
        currentPage,
        filesPerPage,
        debouncedSearchQuery
      );
      setFolders(result.folders);
      setFiles(result.files);
      setPagination(result.pagination);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load data";
      toast2.error("Load Data Failed", {
        description: message
      });
      console.error("Failed to load data:", error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [currentFolder, mode, acceptedFileTypesForModal, allowedFileTypes, provider, currentPage, filesPerPage, debouncedSearchQuery]);
  const isInSelectionMode = () => selectedFiles.length > 0 || selectedFolders.length > 0;
  const getCurrentFolder = () => currentFolder;
  const getSelectionState = useMemo2(() => {
    return () => {
      const totalItems = files.length + (mode === MODE.PAGE ? folders.length : 0);
      const selectedItems = selectedFiles.length + selectedFolders.length;
      if (selectedItems === 0) return false;
      if (selectedItems === totalItems) return true;
      return "indeterminate";
    };
  }, [files.length, folders.length, selectedFiles.length, selectedFolders.length, mode]);
  const handlePageChange = useCallback3((newPage) => {
    setPagination((prev) => __spreadProps(__spreadValues({}, prev), { currentPage: newPage }));
    if (mode === MODE.PAGE) {
      updateUrlParams(newPage, filesPerPage);
    }
  }, [updateUrlParams, filesPerPage, mode]);
  const updateSearchQuery = useCallback3((newQuery) => {
    setSearchQuery(newQuery);
    const urlParams = new URLSearchParams(searchParams.toString());
    if (newQuery.trim()) {
      urlParams.set("query", newQuery);
      urlParams.set("page", "1");
    } else {
      urlParams.delete("query");
    }
    replace(`${pathname}?${urlParams.toString()}`);
  }, [replace, pathname, searchParams]);
  return {
    // State
    files,
    folders,
    selectedFiles,
    selectedFolders,
    currentFolder,
    isLoading,
    pagination,
    isUploadModalOpen,
    isCreateFolderModalOpen,
    isSearchModalOpen,
    isMoveFileModalOpen,
    isRenameFolderModalOpen,
    fileDetailsModalFile,
    folderToRename,
    // Setters
    setFiles,
    setFolders,
    setSelectedFiles,
    setSelectedFolders,
    setCurrentFolder,
    setPagination,
    //Modal Setters
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    setIsSearchModalOpen,
    setIsMoveFileModalOpen,
    setIsRenameFolderModalOpen,
    setFileDetailsModalFile,
    setFolderToRename,
    // Loaders
    loadData,
    setIsLoading,
    // Computed
    isInSelectionMode,
    getCurrentFolder,
    getSelectionState,
    // Pagination handlers
    handlePageChange,
    // Search
    searchQuery,
    updateSearchQuery,
    // Config
    mode,
    selectionMode,
    acceptedFileTypesForModal,
    provider,
    onFilesSelected,
    onClose,
    basePath,
    onNavigate
  };
}

// context/file-manager-context.tsx
import { createContext, useContext, useMemo as useMemo3 } from "react";
import { jsx } from "react/jsx-runtime";
var FileManagerContext = createContext(void 0);
function FileManagerProvider({
  children,
  mode = MODE.PAGE,
  selectionMode = SELECTION_MODE.SINGLE,
  allowedFileTypes,
  onFilesSelected,
  onClose,
  acceptedFileTypesForModal,
  initialFolderId = null,
  provider,
  basePath = "/media",
  maxUploadFiles = 50,
  maxUploadSize = 100 * 1024 * 1024,
  // 100MB
  onNavigate
}) {
  const state = useFileState({
    mode,
    selectionMode,
    initialFolderId,
    acceptedFileTypesForModal,
    allowedFileTypes,
    provider,
    onFilesSelected,
    onClose,
    basePath,
    onNavigate
  });
  const handlers = useFileHandlers(state);
  const value = useMemo3(() => ({
    // State
    files: state.files,
    folders: state.folders,
    selectedFiles: state.selectedFiles,
    selectedFolders: state.selectedFolders,
    currentFolder: state.currentFolder,
    isLoading: state.isLoading,
    pagination: state.pagination,
    isUploadModalOpen: state.isUploadModalOpen,
    isCreateFolderModalOpen: state.isCreateFolderModalOpen,
    isSearchModalOpen: state.isSearchModalOpen,
    isMoveFileModalOpen: state.isMoveFileModalOpen,
    isRenameFolderModalOpen: state.isRenameFolderModalOpen,
    fileDetailsModalFile: state.fileDetailsModalFile,
    folderToRename: state.folderToRename,
    mode: state.mode,
    selectionMode: state.selectionMode,
    allowedFileTypes,
    acceptedFileTypesForModal: state.acceptedFileTypesForModal,
    maxUploadFiles,
    maxUploadSize,
    // Setters
    setIsUploadModalOpen: state.setIsUploadModalOpen,
    setIsCreateFolderModalOpen: state.setIsCreateFolderModalOpen,
    setIsSearchModalOpen: state.setIsSearchModalOpen,
    setIsMoveFileModalOpen: state.setIsMoveFileModalOpen,
    setSelectedFiles: state.setSelectedFiles,
    setSelectedFolders: state.setSelectedFolders,
    setIsRenameFolderModalOpen: state.setIsRenameFolderModalOpen,
    setFileDetailsModalFile: state.setFileDetailsModalFile,
    setFolderToRename: state.setFolderToRename,
    // Handlers
    handleFileClick: handlers.handleFileClick,
    handleFolderClick: handlers.handleFolderClick,
    handleClearSelection: handlers.handleClearSelection,
    handleSelectAllGlobal: handlers.handleSelectAllGlobal,
    handlePageChange: state.handlePageChange,
    // Search
    searchQuery: state.searchQuery,
    updateSearchQuery: state.updateSearchQuery,
    // CRUD
    uploadFiles: handlers.uploadFiles,
    createFolder: handlers.createFolder,
    bulkMove: handlers.bulkMove,
    renameFolder: handlers.renameFolder,
    updateFileMetadata: handlers.updateFileMetadata,
    bulkDelete: handlers.bulkDelete,
    refreshData: handlers.refreshData,
    // Computed
    isInSelectionMode: state.isInSelectionMode,
    getCurrentFolder: state.getCurrentFolder,
    getSelectionState: state.getSelectionState,
    // Callbacks
    onClose: state.onClose,
    onFilesSelected: state.onFilesSelected,
    provider,
    basePath: state.basePath
  }), [state, handlers, provider, allowedFileTypes, maxUploadFiles, maxUploadSize]);
  return /* @__PURE__ */ jsx(FileManagerContext.Provider, { value, children });
}
function useFileManager() {
  const context = useContext(FileManagerContext);
  if (context === void 0) {
    throw new Error("useFileManager must be used within a FileManagerProvider");
  }
  return context;
}

// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// components/icons/pdf.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function PdfIcon(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 29.93 40.02",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx2("path", { fill: "#e5252a", d: "M5.21 0l13.38 0 11.34 11.82 0 22.99c0,2.88 -2.33,5.21 -5.2,5.21l-19.52 0c-2.88,0 -5.21,-2.33 -5.21,-5.21l0 -29.6c0,-2.88 2.33,-5.21 5.21,-5.21z" }),
        /* @__PURE__ */ jsx2("polygon", { fill: "#fff", fillOpacity: ".302", points: "18.58 0 18.58 11.73 29.93 11.73" }),
        /* @__PURE__ */ jsx2("path", { fill: "#fff", fillRule: "nonzero", d: "M5.79 29.86l0 -7.31 3.11 0c0.77,0 1.38,0.21 1.84,0.64 0.46,0.42 0.69,0.99 0.69,1.7 0,0.71 -0.23,1.28 -0.69,1.7 -0.46,0.43 -1.07,0.64 -1.84,0.64l-1.24 0 0 2.63 -1.87 0zm1.87 -4.22l1.03 0c0.28,0 0.5,-0.06 0.65,-0.2 0.15,-0.13 0.23,-0.31 0.23,-0.55 0,-0.24 -0.08,-0.42 -0.23,-0.55 -0.15,-0.14 -0.37,-0.2 -0.65,-0.2l-1.03 0 0 1.5zm4.54 4.22l0 -7.31 2.59 0c0.51,0 0.99,0.07 1.44,0.22 0.45,0.15 0.86,0.36 1.22,0.65 0.36,0.28 0.65,0.66 0.86,1.14 0.2,0.48 0.31,1.03 0.31,1.65 0,0.61 -0.11,1.16 -0.31,1.64 -0.21,0.48 -0.5,0.86 -0.86,1.14 -0.36,0.29 -0.77,0.5 -1.22,0.65 -0.45,0.15 -0.93,0.22 -1.44,0.22l-2.59 0zm1.83 -1.59l0.54 0c0.29,0 0.56,-0.03 0.81,-0.1 0.24,-0.07 0.47,-0.18 0.69,-0.33 0.21,-0.15 0.38,-0.36 0.5,-0.64 0.12,-0.28 0.18,-0.61 0.18,-0.99 0,-0.39 -0.06,-0.72 -0.18,-1 -0.12,-0.28 -0.29,-0.49 -0.5,-0.64 -0.22,-0.15 -0.45,-0.26 -0.69,-0.33 -0.25,-0.07 -0.52,-0.1 -0.81,-0.1l-0.54 0 0 4.13zm5.53 1.59l0 -7.31 5.2 0 0 1.59 -3.33 0 0 1.17 2.66 0 0 1.58 -2.66 0 0 2.97 -1.87 0z" })
      ]
    })
  );
}

// components/icons/excel.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function ExcelIcon(props) {
  return /* @__PURE__ */ jsxs2(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 17.69 23.65",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx3("path", { fill: "#00733b", d: "M3.08 0l7.91 0 6.7 6.99 0 13.58c0,1.7 -1.38,3.08 -3.08,3.08l-11.53 0c-1.7,0 -3.08,-1.38 -3.08,-3.08l0 -17.49c0,-1.7 1.38,-3.08 3.08,-3.08z" }),
        /* @__PURE__ */ jsx3("polygon", { fill: "#fff", fillOpacity: ".302", points: "10.98 0 10.98 6.93 17.69 6.93" }),
        /* @__PURE__ */ jsx3("path", { fill: "#fff", d: "M5.21 17.35l3.14 0 0 1.19 -3.14 0 0 -1.19zm4.12 -6.08l3.15 0 0 1.18 -3.15 0 0 -1.18zm-4.12 0l3.14 0 0 1.18 -3.14 0 0 -1.18zm4.12 2l3.15 0 0 1.19 -3.15 0 0 -1.19zm-4.12 0l3.14 0 0 1.19 -3.14 0 0 -1.19zm4.12 2.08l3.15 0 0 1.19 -3.15 0 0 -1.19zm-4.12 0l3.14 0 0 1.19 -3.14 0 0 -1.19zm4.12 2l3.15 0 0 1.19 -3.15 0 0 -1.19z" })
      ]
    })
  );
}

// components/icons/ppt.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function PptIcon(props) {
  return /* @__PURE__ */ jsxs3(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 24.33 32.53",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx4("path", { fill: "#e03303", d: "M4.23 0l10.88 0 9.22 9.61 0 18.69c0,2.33 -1.9,4.23 -4.23,4.23l-15.87 0c-2.34,0 -4.23,-1.9 -4.23,-4.23l0 -24.07c0,-2.34 1.89,-4.23 4.23,-4.23z" }),
        /* @__PURE__ */ jsx4("polygon", { fill: "#fff", fillOpacity: ".302", points: "15.1 0 15.1 9.53 24.33 9.53" }),
        /* @__PURE__ */ jsx4("path", { fill: "#fff", fillRule: "nonzero", d: "M11.76 16.13c-2.44,0.12 -4.38,2.15 -4.35,4.62 0.04,2.46 2.04,4.47 4.5,4.5 2.48,0.04 4.51,-1.9 4.62,-4.34 0.01,-0.12 -0.09,-0.22 -0.21,-0.22l-4.13 0c-0.12,0 -0.22,-0.1 -0.22,-0.21l0 -4.14c0,-0.12 -0.09,-0.21 -0.21,-0.21zm1.1 -0.67l0 4.13c0,0.12 0.09,0.21 0.21,0.21l4.14 0c0.12,0 0.21,-0.1 0.21,-0.22 -0.11,-2.34 -1.99,-4.22 -4.34,-4.33 -0.12,-0.01 -0.22,0.09 -0.22,0.21z" })
      ]
    })
  );
}

// components/icons/doc.tsx
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function DocIcon(props) {
  return /* @__PURE__ */ jsxs4(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 38.89 51.99",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx5("path", { fill: "#0263d1", fillRule: "nonzero", d: "M6.76 0l17.4 0 14.73 15.36 0 29.87c0,3.73 -3.03,6.76 -6.77,6.76l-25.36 0c-3.73,0 -6.76,-3.03 -6.76,-6.76l0 -38.47c0,-3.73 3.03,-6.76 6.76,-6.76z" }),
        /* @__PURE__ */ jsx5("polygon", { fill: "#fff", fillOpacity: ".302", points: "24.14 0 24.14 15.24 38.89 15.24" }),
        /* @__PURE__ */ jsx5("path", { fill: "#fff", fillRule: "nonzero", d: "M26.3 27.05l-13.71 0c-0.63,0 -1.15,-0.51 -1.15,-1.14 0,-0.63 0.52,-1.14 1.15,-1.14l13.71 0c0.63,0 1.14,0.51 1.14,1.14 0,0.63 -0.51,1.14 -1.14,1.14l0 0zm-4.57 13.71l-9.14 0c-0.63,0 -1.15,-0.51 -1.15,-1.14 0,-0.63 0.52,-1.14 1.15,-1.14l9.14 0c0.63,0 1.14,0.51 1.14,1.14 0,0.63 -0.51,1.14 -1.14,1.14l0 0zm4.57 -4.57l-13.71 0c-0.63,0 -1.15,-0.51 -1.15,-1.14 0,-0.63 0.52,-1.14 1.15,-1.14l13.71 0c0.63,0 1.14,0.51 1.14,1.14 0,0.63 -0.51,1.14 -1.14,1.14l0 0zm0 -4.57l-13.71 0c-0.63,0 -1.15,-0.51 -1.15,-1.14 0,-0.63 0.52,-1.14 1.15,-1.14l13.71 0c0.63,0 1.14,0.51 1.14,1.14 0,0.63 -0.51,1.14 -1.14,1.14l0 0z" })
      ]
    })
  );
}

// components/icons/text.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function TextDocIcon(props) {
  return /* @__PURE__ */ jsxs5(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 24.33 32.53",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx6("path", { fill: "#ffc000", d: "M4.23 0l10.88 0 9.22 9.61 0 18.69c0,2.33 -1.9,4.23 -4.23,4.23l-15.87 0c-2.34,0 -4.23,-1.9 -4.23,-4.23l0 -24.07c0,-2.34 1.89,-4.23 4.23,-4.23z" }),
        /* @__PURE__ */ jsx6("polygon", { fill: "#ffffff", fillOpacity: ".302", points: "15.1 0 15.1 9.53 24.33 9.53" }),
        /* @__PURE__ */ jsx6("path", { fill: "#ffffff", fillRule: "nonzero", d: "M16.45 21.21l-8.57 0c-0.4,0 -0.72,0.32 -0.72,0.72 0,0.39 0.32,0.71 0.72,0.71l8.57 0c0.4,0 0.72,-0.32 0.72,-0.71 0,-0.4 -0.32,-0.72 -0.72,-0.72l0 0zm0 2.86l-8.57 0c-0.4,0 -0.72,0.32 -0.72,0.72 0,0.39 0.32,0.71 0.72,0.71l8.57 0c0.4,0 0.72,-0.32 0.72,-0.71 0,-0.4 -0.32,-0.72 -0.72,-0.72l0 0zm-4.36 -8.57l-4.21 0c-0.4,0 -0.72,0.31 -0.72,0.71 0,0.4 0.32,0.71 0.72,0.71l4.21 0c0.4,0 0.72,-0.31 0.72,-0.71 0,-0.4 -0.32,-0.71 -0.72,-0.71l0 0zm4.36 2.85l-8.57 0c-0.4,0 -0.72,0.32 -0.72,0.72 0,0.39 0.32,0.71 0.72,0.71l8.57 0c0.4,0 0.72,-0.32 0.72,-0.71 0,-0.4 -0.32,-0.72 -0.72,-0.72l0 0z" })
      ]
    })
  );
}

// components/icons/file.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function FileIcon(props) {
  return /* @__PURE__ */ jsxs6(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      x: "0px",
      y: "0px",
      width: "100",
      height: "100",
      viewBox: "0 0 48 48",
      "aria-hidden": "true"
    }, props), {
      children: [
        /* @__PURE__ */ jsxs6("linearGradient", { id: "X-uD4Bgl9JIhUIufrZZzja_Pjo0BrMdm974_gr1", x1: "37.127", x2: "25.868", y1: "6.873", y2: "18.132", gradientUnits: "userSpaceOnUse", children: [
          /* @__PURE__ */ jsx7("stop", { offset: "0", stopColor: "#262626", stopOpacity: "0" }),
          /* @__PURE__ */ jsx7("stop", { offset: ".913", stopColor: "#262626", stopOpacity: ".8" })
        ] }),
        /* @__PURE__ */ jsx7("path", { fill: "url(#X-uD4Bgl9JIhUIufrZZzja_Pjo0BrMdm974_gr1)", d: "M28,4v8c0,2.209,1.791,4,4,4h8L28,4z", children: " " }),
        /* @__PURE__ */ jsxs6("linearGradient", { id: "X-uD4Bgl9JIhUIufrZZzjb_Pjo0BrMdm974_gr2", x1: "-8.398", x2: "74.731", y1: "51.185", y2: "-18.568", gradientUnits: "userSpaceOnUse", children: [
          /* @__PURE__ */ jsx7("stop", { offset: "0", stopColor: "#262626", stopOpacity: "0" }),
          /* @__PURE__ */ jsx7("stop", { offset: "1", stopColor: "#262626", stopOpacity: ".8" })
        ] }),
        /* @__PURE__ */ jsx7("path", { fill: "url(#X-uD4Bgl9JIhUIufrZZzjb_Pjo0BrMdm974_gr2)", d: "M40,16v23c0,2.761-2.239,5-5,5H8V9c0-2.761,2.239-5,5-5h15L40,16z" })
      ]
    })
  );
}

// components/icons/zip.tsx
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function ZipIcon(props) {
  return /* @__PURE__ */ jsxs7(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 24.33 32.53",
      width: "100",
      height: "100",
      "aria-hidden": "true"
    }, props), {
      children: [
        /* @__PURE__ */ jsx8("path", { fill: "#ffb11f", d: "M4.23 0l10.88 0 9.22 9.61 0 18.69c0,2.33 -1.9,4.23 -4.23,4.23l-15.87 0c-2.34,0 -4.23,-1.9 -4.23,-4.23l0 -24.07c0,-2.34 1.89,-4.23 4.23,-4.23z" }),
        /* @__PURE__ */ jsx8("polygon", { fill: "#fff", fillOpacity: ".302", points: "15.1 0 15.1 9.53 24.33 9.53" }),
        /* @__PURE__ */ jsx8("path", { fill: "#fff", fillRule: "nonzero", d: "M8.96 16.9l0 -2.22c0,-0.24 -0.19,-0.43 -0.43,-0.43l-1.2 0c-0.24,0 -0.43,0.19 -0.43,0.43l0 2.22 -0.67 1.96c-0.19,0.55 -0.1,1.16 0.24,1.63 0.33,0.47 0.88,0.75 1.46,0.75 0.58,0 1.12,-0.28 1.46,-0.75 0.34,-0.47 0.43,-1.08 0.24,-1.63l-0.67 -1.96zm-0.28 3.08c-0.34,0.49 -1.16,0.49 -1.51,0 -0.17,-0.24 -0.22,-0.56 -0.12,-0.84l0.22 -0.66 1.31 0 0.23 0.66c0.09,0.28 0.05,0.6 -0.13,0.84zm-3.41 -17.65l0 1.22c0,0.24 0.19,0.43 0.43,0.43l1.63 0 0 1.82 -1.63 0c-0.24,0 -0.43,0.19 -0.43,0.43l0 0.94c0,0.24 0.19,0.44 0.43,0.44l1.63 0 0 1.81 -1.63 0c-0.24,0 -0.43,0.19 -0.43,0.43l0 0.95c0,0.24 0.19,0.43 0.43,0.43l1.63 0 0 1.38c0,0.24 0.2,0.43 0.44,0.43l2.39 0c0.23,0 0.43,-0.19 0.43,-0.43l0 -0.95c0,-0.23 -0.2,-0.43 -0.43,-0.43l-1.64 0 0 -1.81 1.64 0c0.23,0 0.43,-0.19 0.43,-0.43l0 -0.95c0,-0.24 -0.2,-0.43 -0.43,-0.43l-1.64 0 0 -1.81 1.64 0c0.23,0 0.43,-0.2 0.43,-0.44l0 -0.94c0,-0.24 -0.2,-0.44 -0.43,-0.44l-1.64 0 0 -1.66c0,0 -3.25,0.01 -3.25,0.01z" })
      ]
    })
  );
}

// components/icons/json.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function JsonIcon(props) {
  return /* @__PURE__ */ jsxs8(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 20.49 27.4",
      width: "100",
      height: "100",
      "aria-hidden": "true"
    }, props), {
      children: [
        /* @__PURE__ */ jsx9("path", { fill: "#00a1e0", d: "M3.56 0l9.17 0 7.76 8.1 0 15.73c0,1.97 -1.59,3.57 -3.56,3.57l-13.37 0c-1.96,0 -3.56,-1.6 -3.56,-3.57l0 -20.27c0,-1.96 1.6,-3.56 3.56,-3.56z" }),
        /* @__PURE__ */ jsx9("polygon", { fill: "#fff", fillOpacity: ".302", points: "12.72 0 12.72 8.03 20.49 8.03" }),
        /* @__PURE__ */ jsx9("path", { fill: "#fff", fillRule: "nonzero", d: "M12.07 20.44l-0.52 0 0 -0.99 0.11 0c0.26,0 0.39,-0.14 0.39,-0.42l0 -1.45c0,-0.23 0.06,-0.41 0.16,-0.53 0.11,-0.11 0.27,-0.21 0.48,-0.3 -0.2,-0.08 -0.36,-0.18 -0.47,-0.3 -0.11,-0.12 -0.17,-0.29 -0.17,-0.52l0 -1.45c0,-0.28 -0.13,-0.42 -0.39,-0.42l-0.11 0 0 -0.99 0.52 0c0.31,0 0.56,0.1 0.76,0.3 0.2,0.2 0.3,0.45 0.3,0.75l0 1.55c0,0.38 0.21,0.57 0.63,0.57l0 1.03c-0.42,0 -0.63,0.19 -0.63,0.58l0 1.54c0,0.3 -0.1,0.55 -0.3,0.75 -0.2,0.2 -0.45,0.3 -0.76,0.3zm-3.65 0c-0.3,0 -0.56,-0.1 -0.76,-0.3 -0.2,-0.2 -0.3,-0.45 -0.3,-0.75l0 -1.54c0,-0.39 -0.21,-0.58 -0.63,-0.58l0 -1.03c0.42,0 0.63,-0.19 0.63,-0.57l0 -1.55c0,-0.3 0.1,-0.55 0.3,-0.75 0.2,-0.2 0.46,-0.3 0.76,-0.3l0.53 0 0 0.99 -0.12 0c-0.26,0 -0.39,0.14 -0.39,0.42l0 1.45c0,0.23 -0.05,0.4 -0.16,0.52 -0.11,0.12 -0.27,0.22 -0.48,0.3 0.21,0.09 0.37,0.19 0.48,0.3 0.11,0.12 0.16,0.3 0.16,0.53l0 1.45c0,0.28 0.13,0.42 0.39,0.42l0.12 0 0 0.99 -0.53 0z" })
      ]
    })
  );
}

// components/icons/music.tsx
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
function MusicIcon(props) {
  return /* @__PURE__ */ jsxs9(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 24.33 32.53",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx10("path", { fill: "#90c", d: "M4.23 0l10.88 0 9.22 9.61 0 18.69c0,2.33 -1.9,4.23 -4.23,4.23l-15.87 0c-2.34,0 -4.23,-1.9 -4.23,-4.23l0 -24.07c0,-2.34 1.89,-4.23 4.23,-4.23z" }),
        /* @__PURE__ */ jsx10("polygon", { fill: "#fff", fillOpacity: ".302", points: "15.1 0 15.1 9.53 24.33 9.53" }),
        /* @__PURE__ */ jsx10("path", { fill: "#fff", fillRule: "nonzero", d: "M15.07 21.38c0.31,-0.52 0.52,-1.18 0.56,-1.83 0.02,-0.42 -0.07,-0.86 -0.27,-1.27 -0.32,-0.65 -0.86,-1.01 -1.39,-1.37 -0.39,-0.26 -0.76,-0.51 -1.02,-0.86l-0.05 -0.06c-0.15,-0.21 -0.33,-0.45 -0.36,-0.65 -0.02,-0.2 -0.21,-0.34 -0.4,-0.33 -0.21,0.02 -0.36,0.18 -0.36,0.39l0 6.86c-0.32,-0.2 -0.72,-0.32 -1.16,-0.32 -1.06,0 -1.92,0.69 -1.92,1.54 0,0.85 0.86,1.54 1.92,1.54 1.06,0 1.93,-0.69 1.93,-1.54l0 -4.49c0.58,0.23 1.52,0.79 1.78,2.1 -0.05,0.07 -0.09,0.15 -0.15,0.21 -0.14,0.16 -0.12,0.4 0.04,0.55 0.16,0.14 0.4,0.12 0.54,-0.04 0.1,-0.12 0.2,-0.25 0.28,-0.4 0.01,-0.01 0.02,-0.02 0.03,-0.03z" })
      ]
    })
  );
}

// components/icons/rar.tsx
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
function RarIcon(props) {
  return /* @__PURE__ */ jsxs10(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 64 64",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx11("path", { fill: "#188a32", d: "M56,35v8c0,1.66-1.34,3-3,3H11c-1.66,0-3-1.34-3-3v-8c0-1.66,1.34-3,3-3h42C54.66,32,56,33.34,56,35z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#0082AA", d: "M44,29v5c0,1.66-1.34,3-3,3H23c-1.66,0-3-1.34-3-3v-5h4v4h16v-4H44z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#4d50c6", d: "M53,32H11c-1.657,0-3-1.343-3-3v-8c0-1.657,1.343-3,3-3h42c1.657,0,3,1.343,3,3v8\n					C56,30.657,54.657,32,53,32z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#e6275e", d: "M53,18H11c-1.657,0-3-1.343-3-3V7c0-1.657,1.343-3,3-3h42c1.657,0,3,1.343,3,3v8\n					C56,16.657,54.657,18,53,18z" }),
        /* @__PURE__ */ jsx11("rect", { width: "16", height: "42", x: "24", y: "4", fill: "#FAB400" }),
        /* @__PURE__ */ jsx11("path", { fill: "#DC9600", d: "M32,46L32,46c-4.418,0-8-3.582-8-8v-4h16v4C40,42.418,36.418,46,32,46z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#FAB400", d: "M32,44L32,44c-4.418,0-8-3.582-8-8v-4h16v4C40,40.418,36.418,44,32,44z" }),
        /* @__PURE__ */ jsx11("rect", { width: "16", height: "4", x: "24", y: "33", fill: "#DC9600" }),
        /* @__PURE__ */ jsx11("path", { fill: "#F0F0F0", d: "M44,17v16c0,1.66-1.34,3-3,3H23c-1.66,0-3-1.34-3-3V17c0-1.66,1.34-3,3-3h1v18h16V14h1\n					C42.66,14,44,15.34,44,17z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#D2D2D2", d: "M34,31v2c0,1.1-0.9,2-2,2s-2-0.9-2-2v-2H34z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#F0F0F0", d: "M32,34L32,34c-1.105,0-2-0.895-2-2v-8c0-1.105,0.895-2,2-2h0c1.105,0,2,0.895,2,2v8\n					C34,33.105,33.105,34,32,34z" }),
        /* @__PURE__ */ jsx11("circle", { cx: "32", cy: "18", r: "2", fill: "#C80A50" }),
        /* @__PURE__ */ jsx11("circle", { cx: "32", cy: "10", r: "2", fill: "#00A0C8" }),
        /* @__PURE__ */ jsx11("path", { fill: "#F0F0F0", d: "M34,18h-4c0-1.1,0.9-2,2-2S34,16.9,34,18z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#0A5078", d: "M47,60H17c-1.105,0-2-0.895-2-2V44c0-1.105,0.895-2,2-2h30c1.105,0,2,0.895,2,2v14\n					C49,59.105,48.105,60,47,60z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#F0F0F0", d: "M35,53h-6c-0.552,0-1-0.448-1-1v-3c0-2.206,1.794-4,4-4s4,1.794,4,4v3C36,52.552,35.552,53,35,53z\n							 M30,51h4v-2c0-1.103-0.897-2-2-2s-2,0.897-2,2V51z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#F0F0F0", d: "M29 57c-.552 0-1-.448-1-1v-4c0-.552.448-1 1-1s1 .448 1 1v4C30 56.552 29.552 57 29 57zM35 57c-.552 0-1-.448-1-1v-4c0-.552.448-1 1-1s1 .448 1 1v4C36 56.552 35.552 57 35 57zM42 53h-3c-.552 0-1-.448-1-1v-6c0-.552.448-1 1-1h3c2.206 0 4 1.794 4 4S44.206 53 42 53zM40 51h2c1.103 0 2-.897 2-2s-.897-2-2-2h-2V51z" }),
        /* @__PURE__ */ jsx11("path", { fill: "#F0F0F0", d: "M39 57c-.552 0-1-.448-1-1v-4c0-.552.448-1 1-1s1 .448 1 1v4C40 56.552 39.552 57 39 57zM45.001 57c-.367 0-.72-.202-.896-.553l-2-4c-.247-.494-.047-1.095.447-1.342.495-.248 1.095-.047 1.342.447l2 4c.247.494.047 1.095-.447 1.342C45.304 56.966 45.151 57 45.001 57z" }),
        /* @__PURE__ */ jsxs10("g", { children: [
          /* @__PURE__ */ jsx11("path", { fill: "#F0F0F0", d: "M22,53h-3c-0.552,0-1-0.448-1-1v-6c0-0.552,0.448-1,1-1h3c2.206,0,4,1.794,4,4S24.206,53,22,53z\n							 M20,51h2c1.103,0,2-0.897,2-2s-0.897-2-2-2h-2V51z" }),
          /* @__PURE__ */ jsx11("path", { fill: "#F0F0F0", d: "M19 57c-.552 0-1-.448-1-1v-4c0-.552.448-1 1-1s1 .448 1 1v4C20 56.552 19.552 57 19 57zM25.001 57c-.367 0-.72-.202-.896-.553l-2-4c-.247-.494-.047-1.095.447-1.342.495-.248 1.095-.047 1.342.447l2 4c.247.494.047 1.095-.447 1.342C25.304 56.966 25.151 57 25.001 57z" })
        ] })
      ]
    })
  );
}

// components/icons/exe.tsx
import { jsx as jsx12, jsxs as jsxs11 } from "react/jsx-runtime";
function ExeIcon(props) {
  return /* @__PURE__ */ jsxs11(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 48 48",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx12("path", { fill: "#e8e9ea", d: "M8.16,17.51V3.74c0-1.79,1.45-3.24,3.24-3.24h20.53l12.79,12.8v30.96c0,1.79-1.45,3.24-3.24,3.24H11.4\n				c-1.79,0-3.24-1.45-3.24-3.24v-1.62" }),
        /* @__PURE__ */ jsx12("path", { fill: "#697d7f", d: "M44.72 13.3h-9.93c-1.58 0-2.86-1.28-2.86-2.86V.5M11.53 25.42c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H4.78c-.83 0-1.5.67-1.5 1.5v11.53c0 .83.67 1.5 1.5 1.5h6.75c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H6.28v-2.76h3.98c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H6.28v-2.76H11.53zM36.33 25.42c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-6.75c-.83 0-1.5.67-1.5 1.5v11.53c0 .83.67 1.5 1.5 1.5h6.75c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-5.25v-2.76h3.98c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-3.98v-2.76H36.33zM15.55 36.67c.26.19.57.28.87.28.47 0 .93-.22 1.22-.63l2.92-4.07 2.92 4.07c.29.41.75.63 1.22.63.3 0 .61-.09.87-.28.67-.48.83-1.42.34-2.09l-3.51-4.89 3.51-4.89c.48-.67.33-1.61-.34-2.09-.67-.48-1.61-.33-2.09.34l-2.92 4.07-2.92-4.07c-.48-.67-1.42-.83-2.09-.34-.67.48-.83 1.42-.34 2.09l3.51 4.89-3.51 4.89C14.72 35.25 14.87 36.19 15.55 36.67z" })
      ]
    })
  );
}

// components/icons/image.tsx
import { jsx as jsx13, jsxs as jsxs12 } from "react/jsx-runtime";
function ImageIcon(props) {
  return /* @__PURE__ */ jsxs12(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 17.69 23.65",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx13("path", { fill: "#0ac963", d: "M3.08 0l7.91 0 6.7 6.99 0 13.58c0,1.7 -1.38,3.08 -3.08,3.08l-11.53 0c-1.7,0 -3.08,-1.38 -3.08,-3.08l0 -17.49c0,-1.7 1.38,-3.08 3.08,-3.08z" }),
        /* @__PURE__ */ jsx13("polygon", { fill: "#fff", fillOpacity: ".302", points: "10.98 0 10.98 6.93 17.69 6.93" }),
        /* @__PURE__ */ jsx13("path", { fill: "#fff", d: "M11.85 11.82l-6.01 0c-0.45,0 -0.82,0.37 -0.82,0.82l0 3.82c0,0.45 0.37,0.82 0.82,0.82l6.01 0c0.45,0 0.81,-0.37 0.81,-0.82l0 -3.82c0,-0.45 -0.36,-0.82 -0.81,-0.82zm-4.37 1.03c0.49,0 0.88,0.4 0.88,0.88 0,0.49 -0.39,0.89 -0.88,0.89 -0.49,0 -0.89,-0.4 -0.89,-0.89 0,-0.48 0.4,-0.88 0.89,-0.88zm4.64 3.61c0,0.15 -0.12,0.28 -0.27,0.28l-6.01 0c-0.15,0 -0.27,-0.13 -0.27,-0.28l0 -0.16 1.09 -1.09 0.9 0.9c0.11,0.11 0.28,0.11 0.39,0l2.26 -2.26 1.91 1.91 0 0.7 0 0z" })
      ]
    })
  );
}

// components/icons/video.tsx
import { jsx as jsx14, jsxs as jsxs13 } from "react/jsx-runtime";
function VideoIcon(props) {
  return /* @__PURE__ */ jsxs13(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      fillRule: "evenodd",
      clipRule: "evenodd",
      imageRendering: "optimizeQuality",
      shapeRendering: "geometricPrecision",
      textRendering: "geometricPrecision",
      viewBox: "0 0 29.93 40.02",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx14("path", { fill: "#fa0000", d: "M5.21 0l13.38 0 11.34 11.82 0 22.99c0,2.88 -2.33,5.21 -5.2,5.21l-19.52 0c-2.88,0 -5.21,-2.33 -5.21,-5.21l0 -29.6c0,-2.88 2.33,-5.21 5.21,-5.21z" }),
        /* @__PURE__ */ jsx14("polygon", { fill: "#fff", fillOpacity: ".302", points: "18.58 0 18.58 11.73 29.93 11.73" }),
        /* @__PURE__ */ jsx14("path", { fill: "#fff", fillRule: "nonzero", d: "M14.97 18.16c-3.57,0 -6.47,2.9 -6.47,6.47 0,3.57 2.9,6.46 6.47,6.46 3.57,0 6.46,-2.89 6.46,-6.46 0,-3.57 -2.9,-6.46 -6.46,-6.47zm2.72 6.67c-0.05,0.09 -0.12,0.16 -0.21,0.21l0 0 -3.69 1.85c-0.23,0.11 -0.51,0.02 -0.62,-0.21 -0.04,-0.06 -0.05,-0.13 -0.05,-0.21l0 -3.69c0,-0.26 0.21,-0.46 0.46,-0.46 0.07,0 0.14,0.01 0.21,0.05l3.69 1.84c0.23,0.12 0.32,0.39 0.21,0.62z" })
      ]
    })
  );
}

// components/icons/folder-with-files.tsx
import { jsx as jsx15, jsxs as jsxs14 } from "react/jsx-runtime";
function FolderWithFilesIcon(props) {
  return /* @__PURE__ */ jsxs14(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 64 64",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx15("path", { fill: "#5a5959", d: "M2.1,57.4h57.7c1.1,0,2.1-0.9,2.1-2.1V13.4c0-1.1-0.9-2.1-2.1-2.1H31c-0.8,0-1.5-0.4-1.8-1.1l-1.7-3.4\n		c-0.4-0.7-1.1-1.1-1.8-1.1H2.1C0.9,5.7,0,6.6,0,7.8v47.5C0,56.4,0.9,57.4,2.1,57.4z" }),
        /* @__PURE__ */ jsx15("path", { fill: "#504e4e", d: "M3,58.3h56.7c1.1,0,2.1-0.9,2.1-2.1V14.3c0-1.1-0.9-2.1-2.1-2.1H31c-0.8,0-1.5-0.4-1.8-1.1l-1.7-3.4\n		c-0.4-0.7-1.1-1.1-1.8-1.1H2.1C0.9,6.6,0,7.6,0,8.7v46.6C0,56.9,1.3,58.3,3,58.3z" }),
        /* @__PURE__ */ jsx15("rect", { width: "58.6", height: "21.1", x: "1.6", y: "14.7", fill: "#ffffff" }),
        /* @__PURE__ */ jsx15("rect", { width: ".8", height: "21.1", x: "1.6", y: "14.7", fill: "#f3f3f3" }),
        /* @__PURE__ */ jsx15("rect", { width: "58.6", height: ".9", x: "1.6", y: "14.7", fill: "#f3f1f1" }),
        /* @__PURE__ */ jsx15("path", { fill: "#676666", d: "M64,18.6v35.8c0,1.7-1.3,3-3,3H3c-1.7,0-3-1.3-3-3v-31c0-1.7,1.3-3,3-3h29.2c0.8,0,1.6-0.3,2.1-0.9l3-3\n		c0.6-0.6,1.3-0.9,2.1-0.9H61C62.7,15.6,64,17,64,18.6z" }),
        /* @__PURE__ */ jsx15("path", { fill: "#6f6d6d", d: "M64,19.5v35.8c0,1.7-1.3,3-3,3H3c-1.7,0-3-1.3-3-3v-31c0-1.7,1.3-3,3-3h29.2c0.8,0,1.6-0.3,2.1-0.9l3-3\n		c0.6-0.6,1.3-0.9,2.1-0.9H61C62.7,16.5,64,17.9,64,19.5z" })
      ]
    })
  );
}

// components/icons/empty-folder.tsx
import { jsx as jsx16, jsxs as jsxs15 } from "react/jsx-runtime";
function EmptyFolderIcon(props) {
  return /* @__PURE__ */ jsxs15(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 64 64",
      width: "100",
      height: "100"
    }, props), {
      children: [
        /* @__PURE__ */ jsx16("path", { fill: "#5a5959", d: "M2.1,57.4h57.7c1.1,0,2.1-0.9,2.1-2.1V13.4c0-1.1-0.9-2.1-2.1-2.1H31c-0.8,0-1.5-0.4-1.8-1.1l-1.7-3.4\n		c-0.4-0.7-1.1-1.1-1.8-1.1H2.1C0.9,5.7,0,6.6,0,7.8v47.5C0,56.4,0.9,57.4,2.1,57.4z" }),
        /* @__PURE__ */ jsx16("path", { fill: "#504e4e", d: "M3,58.3h56.7c1.1,0,2.1-0.9,2.1-2.1V14.3c0-1.1-0.9-2.1-2.1-2.1H31c-0.8,0-1.5-0.4-1.8-1.1l-1.7-3.4\n		c-0.4-0.7-1.1-1.1-1.8-1.1H2.1C0.9,6.6,0,7.6,0,8.7v46.6C0,56.9,1.3,58.3,3,58.3z" }),
        /* @__PURE__ */ jsx16("path", { fill: "#676666", d: "M64,18.6v35.8c0,1.7-1.3,3-3,3H3c-1.7,0-3-1.3-3-3v-31c0-1.7,1.3-3,3-3h29.2c0.8,0,1.6-0.3,2.1-0.9l3-3\n		c0.6-0.6,1.3-0.9,2.1-0.9H61C62.7,15.6,64,17,64,18.6z" }),
        /* @__PURE__ */ jsx16("path", { fill: "#6f6d6d", d: "M64,19.5v35.8c0,1.7-1.3,3-3,3H3c-1.7,0-3-1.3-3-3v-31c0-1.7,1.3-3,3-3h29.2c0.8,0,1.6-0.3,2.1-0.9l3-3\n		c0.6-0.6,1.3-0.9,2.1-0.9H61C62.7,16.5,64,17.9,64,19.5z" })
      ]
    })
  );
}

// components/icons/folder.tsx
import { jsx as jsx17, jsxs as jsxs16 } from "react/jsx-runtime";
function FolderIcon(props) {
  return /* @__PURE__ */ jsx17(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      "aria-hidden": "true"
    }, props), {
      children: /* @__PURE__ */ jsxs16("g", { fill: "none", children: [
        /* @__PURE__ */ jsx17("path", { d: "M16.2 5C17.8802 5 18.7202 5 19.362 5.32698C19.9265 5.6146 20.3854 6.07354 20.673 6.63803C21 7.27976 21 8.11984 21 9.8V11.2C21 12.8802 21 13.7202 20.673 14.362C20.3854 14.9265 19.9265 15.3854 19.362 15.673C18.7202 16 17.8802 16 16.2 16H7.8C6.11984 16 5.27976 16 4.63803 15.673C4.07354 15.3854 3.6146 14.9265 3.32698 14.362C3 13.7202 3 12.8802 3 11.2L3 6.8C3 5.11984 3 4.27976 3.32698 3.63803C3.6146 3.07354 4.07354 2.6146 4.63803 2.32698C5.27976 2 6.11984 2 7.8 2L9.28741 2C9.91355 2 10.2266 2 10.5108 2.0863C10.7624 2.1627 10.9964 2.28796 11.1996 2.45491C11.429 2.64349 11.6027 2.90398 11.95 3.42496L13 5H16.2Z", fill: "url(#1752500502786-6297956_folder_existing_0_ekojck6b3)", "data-glass": "origin", mask: "url(#1752500502786-6297956_folder_mask_2iow0yqdp)" }),
        /* @__PURE__ */ jsx17("path", { d: "M16.2 5C17.8802 5 18.7202 5 19.362 5.32698C19.9265 5.6146 20.3854 6.07354 20.673 6.63803C21 7.27976 21 8.11984 21 9.8V11.2C21 12.8802 21 13.7202 20.673 14.362C20.3854 14.9265 19.9265 15.3854 19.362 15.673C18.7202 16 17.8802 16 16.2 16H7.8C6.11984 16 5.27976 16 4.63803 15.673C4.07354 15.3854 3.6146 14.9265 3.32698 14.362C3 13.7202 3 12.8802 3 11.2L3 6.8C3 5.11984 3 4.27976 3.32698 3.63803C3.6146 3.07354 4.07354 2.6146 4.63803 2.32698C5.27976 2 6.11984 2 7.8 2L9.28741 2C9.91355 2 10.2266 2 10.5108 2.0863C10.7624 2.1627 10.9964 2.28796 11.1996 2.45491C11.429 2.64349 11.6027 2.90398 11.95 3.42496L13 5H16.2Z", fill: "url(#1752500502786-6297956_folder_existing_0_ekojck6b3)", "data-glass": "clone", filter: "url(#1752500502786-6297956_folder_filter_56qas2ark)", clipPath: "url(#1752500502786-6297956_folder_clipPath_gygn8e14a)" }),
        /* @__PURE__ */ jsx17("path", { d: "M17.4051 9C19.3327 9 20.2965 9 20.9861 9.39213C21.5914 9.73631 22.0581 10.2803 22.3062 10.9309C22.5889 11.6721 22.4424 12.6247 22.1492 14.5299L21.6262 17.9299C21.4039 19.3744 21.2928 20.0966 20.9388 20.6393C20.6267 21.1176 20.1846 21.4969 19.6644 21.7326C19.0742 22 18.3435 22 16.882 22L7.11801 22C5.65653 22 4.92579 22 4.33558 21.7326C3.8154 21.4969 3.3733 21.1176 3.06124 20.6393C2.70717 20.0966 2.59606 19.3744 2.37383 17.9299L1.85075 14.5299C1.55764 12.6247 1.41109 11.6721 1.6938 10.9309C1.94194 10.2803 2.40865 9.73631 3.01392 9.39213C3.70353 9 4.66733 9 6.59493 9L17.4051 9Z", fill: "url(#1752500502786-6297956_folder_existing_1_v5o9796uz)", "data-glass": "blur" }),
        /* @__PURE__ */ jsx17("path", { d: "M18.6807 9.00586C19.7975 9.02423 20.4692 9.09846 20.9864 9.39258C21.5915 9.73676 22.0586 10.2802 22.3067 10.9307C22.5894 11.6719 22.4426 12.6251 22.1495 14.5303L21.626 17.9297C21.4038 19.3742 21.2926 20.097 20.9385 20.6396L20.8155 20.8135C20.5147 21.2098 20.1193 21.5262 19.6641 21.7324C19.074 21.9997 18.3431 22 16.8819 22V21.25C17.624 21.25 18.1389 21.2495 18.543 21.2188C18.9374 21.1887 19.1709 21.133 19.3546 21.0498C19.7447 20.873 20.0766 20.5882 20.3106 20.2295C20.4208 20.0606 20.5119 19.8385 20.6016 19.4531C20.6935 19.0584 20.772 18.5489 20.8848 17.8154L21.4083 14.416C21.5568 13.4504 21.6601 12.7732 21.6954 12.2441C21.7302 11.7223 21.6913 11.4231 21.6055 11.1982C21.4194 10.7103 21.0693 10.3021 20.6153 10.0439C20.4061 9.92506 20.1166 9.84086 19.5958 9.7959C19.0675 9.75031 18.3823 9.75 17.4053 9.75H6.59479C5.61785 9.75 4.93266 9.75032 4.40436 9.7959C3.88353 9.84086 3.59399 9.92504 3.38483 10.0439C2.93088 10.3021 2.5807 10.7103 2.3946 11.1982C2.30885 11.4231 2.26996 11.7223 2.30475 12.2441C2.34005 12.7732 2.44331 13.4504 2.59186 14.416L3.1153 17.8154C3.22814 18.5489 3.30665 19.0584 3.3985 19.4531C3.4882 19.8385 3.5793 20.0606 3.68952 20.2295C3.92357 20.5882 4.25545 20.873 4.64558 21.0498C4.82929 21.133 5.06268 21.1887 5.4571 21.2188C5.86121 21.2495 6.37613 21.25 7.11823 21.25V22L6.14948 21.9961C5.44148 21.9856 4.96108 21.9493 4.56452 21.8213L4.336 21.7324C3.88079 21.5262 3.48544 21.2098 3.18464 20.8135L3.06159 20.6396C2.79608 20.2327 2.66703 19.7244 2.52546 18.8867L2.37409 17.9297L1.85065 14.5303C1.57585 12.744 1.42974 11.7947 1.64558 11.0723L1.6944 10.9307C1.91158 10.3615 2.29578 9.8738 2.79401 9.53027L3.01374 9.39258C3.70332 9.00046 4.66737 9 6.59479 9H17.4053L18.6807 9.00586ZM16.8819 21.25V22H7.11823V21.25H16.8819Z", fill: "url(#1752500502786-6297956_folder_existing_2_vhap9347d)" }),
        /* @__PURE__ */ jsxs16("defs", { children: [
          /* @__PURE__ */ jsxs16("linearGradient", { id: "1752500502786-6297956_folder_existing_0_ekojck6b3", x1: "12", y1: "2", x2: "12", y2: "16", gradientUnits: "userSpaceOnUse", children: [
            /* @__PURE__ */ jsx17("stop", { stopColor: "#575757" }),
            /* @__PURE__ */ jsx17("stop", { offset: "1", stopColor: "#151515" })
          ] }),
          /* @__PURE__ */ jsxs16("linearGradient", { id: "1752500502786-6297956_folder_existing_1_v5o9796uz", x1: "23", y1: "15.5", x2: "1", y2: "15.5", gradientUnits: "userSpaceOnUse", children: [
            /* @__PURE__ */ jsx17("stop", { stopColor: "#E3E3E5", stopOpacity: ".6" }),
            /* @__PURE__ */ jsx17("stop", { offset: "1", stopColor: "#BBBBC0", stopOpacity: ".6" })
          ] }),
          /* @__PURE__ */ jsxs16("linearGradient", { id: "1752500502786-6297956_folder_existing_2_vhap9347d", x1: "12", y1: "9", x2: "12", y2: "16.528", gradientUnits: "userSpaceOnUse", children: [
            /* @__PURE__ */ jsx17("stop", { stopColor: "#fff" }),
            /* @__PURE__ */ jsx17("stop", { offset: "1", stopColor: "#fff", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ jsx17("filter", { id: "1752500502786-6297956_folder_filter_56qas2ark", x: "-100%", y: "-100%", width: "400%", height: "400%", filterUnits: "objectBoundingBox", primitiveUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsx17("feGaussianBlur", { stdDeviation: "2", x: "0%", y: "0%", width: "100%", height: "100%", in: "SourceGraphic", edgeMode: "none", result: "blur" }) }),
          /* @__PURE__ */ jsx17("clipPath", { id: "1752500502786-6297956_folder_clipPath_gygn8e14a", children: /* @__PURE__ */ jsx17("path", { d: "M17.4051 9C19.3327 9 20.2965 9 20.9861 9.39213C21.5914 9.73631 22.0581 10.2803 22.3062 10.9309C22.5889 11.6721 22.4424 12.6247 22.1492 14.5299L21.6262 17.9299C21.4039 19.3744 21.2928 20.0966 20.9388 20.6393C20.6267 21.1176 20.1846 21.4969 19.6644 21.7326C19.0742 22 18.3435 22 16.882 22L7.11801 22C5.65653 22 4.92579 22 4.33558 21.7326C3.8154 21.4969 3.3733 21.1176 3.06124 20.6393C2.70717 20.0966 2.59606 19.3744 2.37383 17.9299L1.85075 14.5299C1.55764 12.6247 1.41109 11.6721 1.6938 10.9309C1.94194 10.2803 2.40865 9.73631 3.01392 9.39213C3.70353 9 4.66733 9 6.59493 9L17.4051 9Z", fill: "url(#1752500502786-6297956_folder_existing_1_v5o9796uz)" }) }),
          /* @__PURE__ */ jsxs16("mask", { id: "1752500502786-6297956_folder_mask_2iow0yqdp", children: [
            /* @__PURE__ */ jsx17("rect", { width: "100%", height: "100%", fill: "#FFF" }),
            /* @__PURE__ */ jsx17("path", { d: "M17.4051 9C19.3327 9 20.2965 9 20.9861 9.39213C21.5914 9.73631 22.0581 10.2803 22.3062 10.9309C22.5889 11.6721 22.4424 12.6247 22.1492 14.5299L21.6262 17.9299C21.4039 19.3744 21.2928 20.0966 20.9388 20.6393C20.6267 21.1176 20.1846 21.4969 19.6644 21.7326C19.0742 22 18.3435 22 16.882 22L7.11801 22C5.65653 22 4.92579 22 4.33558 21.7326C3.8154 21.4969 3.3733 21.1176 3.06124 20.6393C2.70717 20.0966 2.59606 19.3744 2.37383 17.9299L1.85075 14.5299C1.55764 12.6247 1.41109 11.6721 1.6938 10.9309C1.94194 10.2803 2.40865 9.73631 3.01392 9.39213C3.70353 9 4.66733 9 6.59493 9L17.4051 9Z", fill: "#000" })
          ] })
        ] })
      ] })
    })
  );
}

// components/icons/home.tsx
import { jsx as jsx18, jsxs as jsxs17 } from "react/jsx-runtime";
function HomeIcon(props) {
  return /* @__PURE__ */ jsxs17(
    "svg",
    __spreadProps(__spreadValues({
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true"
    }, props), {
      children: [
        /* @__PURE__ */ jsx18(
          "path",
          {
            opacity: "0.4",
            d: "M13.4919 2.29395C13.0743 1.94268 12.5457 1.75 11.9997 1.75C11.5221 1.75 11.058 1.89775 10.6697 2.16992L10.5085 2.29395L1.5974 9.78906C1.18491 10.1364 1.13178 10.7528 1.47924 11.165C1.78946 11.5327 2.31307 11.6121 2.71557 11.3789V15.9531V15.955C2.71555 17.0543 2.71553 17.9612 2.7976 18.6885C2.88313 19.4463 3.06823 20.1292 3.52318 20.7217L3.68627 20.9199C3.85487 21.1119 4.04268 21.2876 4.24584 21.4434L4.47143 21.6016C5.01004 21.9427 5.61706 22.0932 6.281 22.168C7.00121 22.2491 7.89724 22.249 8.98176 22.249H8.99975H14.9997H15.0178C16.1023 22.249 16.9983 22.2491 17.7185 22.168C18.4771 22.0825 19.1606 21.8977 19.7537 21.4434L19.9529 21.2803C20.145 21.1119 20.3205 20.9245 20.4763 20.7217L20.6345 20.4961C20.976 19.9581 21.127 19.3517 21.2019 18.6885C21.284 17.9612 21.2839 17.0543 21.2839 15.955V15.9531V11.3789C21.6864 11.6121 22.21 11.5327 22.5203 11.165C22.846 10.7785 22.8199 10.2127 22.4753 9.85742L13.4919 2.29395Z",
            fill: "#141B34"
          }
        ),
        /* @__PURE__ */ jsx18(
          "path",
          {
            d: "M14.9998 17V22.249H8.99979V17C8.99979 15.5859 9.00002 14.8788 9.43924 14.4395C9.87855 14.0001 10.5857 14 11.9998 14C13.4139 14 14.121 14.0002 14.5603 14.4395C14.9997 14.8788 14.9998 15.5858 14.9998 17Z",
            fill: "#141B34"
          }
        )
      ]
    })
  );
}

// components/icons/search.tsx
import { jsx as jsx19 } from "react/jsx-runtime";
function SearchIcon(props) {
  return /* @__PURE__ */ jsx19(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      fill: "currentColor",
      viewBox: "0 0 48 48",
      "aria-hidden": "true"
    }, props), {
      children: /* @__PURE__ */ jsx19("path", { fill: "currentColor", d: "M46.599 46.599a4.498 4.498 0 0 1-6.363 0l-7.941-7.941C29.028 40.749 25.167 42 21 42 9.402 42 0 32.598 0 21S9.402 0 21 0s21 9.402 21 21c0 4.167-1.251 8.028-3.342 11.295l7.941 7.941a4.498 4.498 0 0 1 0 6.363zM21 6C12.717 6 6 12.714 6 21s6.717 15 15 15c8.286 0 15-6.714 15-15S29.286 6 21 6z" })
    })
  );
}

// components/icons/move.tsx
import { jsx as jsx20, jsxs as jsxs18 } from "react/jsx-runtime";
function MoveIcon(props) {
  return /* @__PURE__ */ jsxs18(
    "svg",
    __spreadProps(__spreadValues({
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true"
    }, props), {
      children: [
        /* @__PURE__ */ jsx20(
          "path",
          {
            fill: "currentColor",
            opacity: "0.4",
            d: "M20.4155 3.66085C22.3012 5.52939 19.2842 20.7253 16.1883 20.9931C13.5911 21.2177 12.7819 16.0954 12.2348 14.4719C11.695 12.8696 11.0943 12.2927 9.50513 11.767C5.46811 10.4315 3.4496 9.76374 3.04996 8.70639C1.99171 5.90649 18.0071 1.27438 20.4155 3.66085Z"
          }
        ),
        /* @__PURE__ */ jsx20(
          "path",
          {
            fill: "currentColor",
            d: "M3.04996 8.70639C3.4496 9.76374 5.46811 10.4315 9.50513 11.767C10.3308 12.0402 10.8897 12.3271 11.3118 12.7646L20.4155 3.66085C18.0071 1.27438 1.99171 5.90649 3.04996 8.70639Z"
          }
        )
      ]
    })
  );
}

// components/icons/upload-folder.tsx
import { jsx as jsx21, jsxs as jsxs19 } from "react/jsx-runtime";
function UploadFolderIcon(props) {
  return /* @__PURE__ */ jsxs19(
    "svg",
    __spreadProps(__spreadValues({
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true"
    }, props), {
      children: [
        /* @__PURE__ */ jsx21(
          "path",
          {
            fillRule: "evenodd",
            clipRule: "evenodd",
            d: "M17.75 11.7499C18.3023 11.7499 18.75 12.1977 18.75 12.7499V15.7499H21.75C22.3023 15.7499 22.75 16.1977 22.75 16.7499C22.75 17.3022 22.3023 17.7499 21.75 17.7499H18.75V20.7499C18.75 21.3022 18.3023 21.7499 17.75 21.7499C17.1977 21.7499 16.75 21.3022 16.75 20.7499V17.7499H13.75C13.1977 17.7499 12.75 17.3022 12.75 16.7499C12.75 16.1977 13.1977 15.7499 13.75 15.7499H16.75V12.7499C16.75 12.1977 17.1977 11.7499 17.75 11.7499Z",
            fill: "currentColor"
          }
        ),
        /* @__PURE__ */ jsx21(
          "path",
          {
            opacity: "0.4",
            d: "M9.4626 2.48876C8.82373 2.24919 8.11205 2.24951 7.08264 2.24996C6.2039 2.24995 5.32205 2.24999 4.7497 2.30044C4.15996 2.35243 3.64388 2.46238 3.17258 2.7254C2.56533 3.06428 2.06428 3.56534 1.7254 4.17258C1.46238 4.64388 1.35242 5.15996 1.30044 5.7497C1.24999 6.32205 1.24999 7.03077 1.25 7.9095V11.0574C1.24999 13.3658 1.24998 15.1748 1.43975 16.5863C1.63399 18.031 2.03933 19.1711 2.93414 20.0659C3.82895 20.9607 4.96897 21.366 6.41371 21.5603C7.82519 21.75 9.63423 21.75 11.9426 21.75H13.2923C14.1084 21.75 14.8409 21.75 15.5 21.7383V18.9999H13.75C12.5074 18.9999 11.5 17.9926 11.5 16.7499C11.5 15.5073 12.5074 14.4999 13.75 14.4999H15.5V12.7499C15.5 11.5073 16.5074 10.4999 17.75 10.4999C18.9926 10.4999 20 11.5073 20 12.7499V14.4999H22.7383C22.75 13.8408 22.75 13.1084 22.75 12.2923C22.75 11.2733 22.75 10.3688 22.683 9.70949C22.6137 9.02893 22.4669 8.43872 22.118 7.91661C21.8444 7.50715 21.4929 7.15559 21.0834 6.88199C20.5613 6.53313 19.9711 6.38628 19.2905 6.31705C18.6312 6.24998 17.8095 6.24999 16.7905 6.25L13.2361 6.25C12.92 6.25 12.7396 6.24908 12.6064 6.23531C12.5044 6.22817 12.4348 6.15255 12.4128 6.11563C12.3409 6.0027 12.0838 5.48909 11.9425 5.20636C11.4704 4.25121 10.8581 3.01205 9.4626 2.48876Z",
            fill: "currentColor"
          }
        )
      ]
    })
  );
}

// components/icons/chevron-right.tsx
import { jsx as jsx22 } from "react/jsx-runtime";
function ChevronRightIcon(props) {
  return /* @__PURE__ */ jsx22(
    "svg",
    __spreadProps(__spreadValues({
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, props), {
      children: /* @__PURE__ */ jsx22("path", { d: "M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18", stroke: "#141B34", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
    })
  );
}

// components/icons/chevron-left.tsx
import { jsx as jsx23 } from "react/jsx-runtime";
function ChevronLeftIcon(props) {
  return /* @__PURE__ */ jsx23(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, props), {
      children: /* @__PURE__ */ jsx23("path", { fill: "currentColor", d: "M16.62 2.99c-.49-.49-1.28-.49-1.77 0L6.54 11.3c-.39.39-.39 1.02 0 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.38 12l7.25-7.25c.48-.48.48-1.28-.01-1.76z" })
    })
  );
}

// components/icons/plus.tsx
import { jsx as jsx24 } from "react/jsx-runtime";
function PlusIcon(props) {
  return /* @__PURE__ */ jsx24(
    "svg",
    __spreadProps(__spreadValues({
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: /* @__PURE__ */ jsx24("path", { fill: "currentColor", d: "M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z" })
    })
  );
}

// components/icons/trash.tsx
import { jsx as jsx25, jsxs as jsxs20 } from "react/jsx-runtime";
function TrashIcon(props) {
  return /* @__PURE__ */ jsxs20(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, props), {
      children: [
        /* @__PURE__ */ jsx25("path", { fill: "currentColor", d: "M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877" }),
        /* @__PURE__ */ jsx25("path", { fill: "currentColor", fillRule: "evenodd", d: "M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.041-.433.409-.75.82-.707", clipRule: "evenodd" }),
        /* @__PURE__ */ jsx25("path", { fill: "currentColor", d: "M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886", opacity: "0.5" })
      ]
    })
  );
}

// components/icons/cross.tsx
import { jsx as jsx26, jsxs as jsxs21 } from "react/jsx-runtime";
function CrossIcon(props) {
  return /* @__PURE__ */ jsxs21(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      stroke: "currentColor",
      strokeWidth: 3.5,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: [
        /* @__PURE__ */ jsx26("path", { d: "M18 6L6 18" }),
        /* @__PURE__ */ jsx26("path", { d: "M6 6L18 18" })
      ]
    })
  );
}

// components/icons/download.tsx
import { jsx as jsx27, jsxs as jsxs22 } from "react/jsx-runtime";
function DownloadIcon(props) {
  return /* @__PURE__ */ jsxs22(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: [
        /* @__PURE__ */ jsx27("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /* @__PURE__ */ jsx27("path", { d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" }),
        /* @__PURE__ */ jsx27("path", { d: "M7 11l5 5l5 -5" }),
        /* @__PURE__ */ jsx27("path", { d: "M12 4l0 12" })
      ]
    })
  );
}

// components/icons/link.tsx
import { jsx as jsx28, jsxs as jsxs23 } from "react/jsx-runtime";
function LinkIcon(props) {
  return /* @__PURE__ */ jsxs23(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: [
        /* @__PURE__ */ jsx28("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /* @__PURE__ */ jsx28("path", { d: "M9 15l6 -6" }),
        /* @__PURE__ */ jsx28("path", { d: "M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" }),
        /* @__PURE__ */ jsx28("path", { d: "M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" })
      ]
    })
  );
}

// components/icons/fullscreen.tsx
import { jsx as jsx29 } from "react/jsx-runtime";
function FullscreenIcon(props) {
  return /* @__PURE__ */ jsx29(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: /* @__PURE__ */ jsx29("path", { fill: "currentColor", fillRule: "evenodd", d: "M9.944 1.25H10a.75.75 0 0 1 0 1.5c-1.907 0-3.261.002-4.29.14c-1.005.135-1.585.389-2.008.812S3.025 4.705 2.89 5.71c-.138 1.029-.14 2.383-.14 4.29a.75.75 0 0 1-1.5 0v-.056c0-1.838 0-3.294.153-4.433c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238c1.14-.153 2.595-.153 4.433-.153m8.345 1.64c-1.027-.138-2.382-.14-4.289-.14a.75.75 0 0 1 0-1.5h.056c1.838 0 3.294 0 4.433.153c1.172.158 2.121.49 2.87 1.238c.748.749 1.08 1.698 1.238 2.87c.153 1.14.153 2.595.153 4.433V10a.75.75 0 0 1-1.5 0c0-1.907-.002-3.261-.14-4.29c-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812M2 13.25a.75.75 0 0 1 .75.75c0 1.907.002 3.262.14 4.29c.135 1.005.389 1.585.812 2.008s1.003.677 2.009.812c1.028.138 2.382.14 4.289.14a.75.75 0 0 1 0 1.5h-.056c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433V14a.75.75 0 0 1 .75-.75m20 0a.75.75 0 0 1 .75.75v.056c0 1.838 0 3.294-.153 4.433c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-1.14.153-2.595.153-4.433.153H14a.75.75 0 0 1 0-1.5c1.907 0 3.262-.002 4.29-.14c1.005-.135 1.585-.389 2.008-.812s.677-1.003.812-2.009c.138-1.027.14-2.382.14-4.289a.75.75 0 0 1 .75-.75", clipRule: "evenodd" })
    })
  );
}

// components/icons/check.tsx
import { jsx as jsx30, jsxs as jsxs24 } from "react/jsx-runtime";
function CheckIcon(props) {
  return /* @__PURE__ */ jsxs24(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: [
        /* @__PURE__ */ jsx30("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /* @__PURE__ */ jsx30("path", { d: "M5 12l5 5l10 -10" })
      ]
    })
  );
}

// components/icons/select.tsx
import { jsx as jsx31 } from "react/jsx-runtime";
function SelectIcon(props) {
  return /* @__PURE__ */ jsx31(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, props), {
      children: /* @__PURE__ */ jsx31("path", { fill: "currentColor", fillRule: "evenodd", d: "M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-5.97-3.03a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47l2.235-2.235L14.97 8.97a.75.75 0 0 1 1.06 0", clipRule: "evenodd" })
    })
  );
}

// components/icons/edit.tsx
import { jsx as jsx32 } from "react/jsx-runtime";
function EditIcon(props) {
  return /* @__PURE__ */ jsx32(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      x: "0px",
      y: "0px",
      width: "100",
      height: "100",
      viewBox: "0 0 72 72",
      fill: "currentColor"
    }, props), {
      children: /* @__PURE__ */ jsx32("path", { d: "M38.406 22.234l11.36 11.36L28.784 54.576l-12.876 4.307c-1.725.577-3.367-1.065-2.791-2.79l4.307-12.876L38.406 22.234zM41.234 19.406l5.234-5.234c1.562-1.562 4.095-1.562 5.657 0l5.703 5.703c1.562 1.562 1.562 4.095 0 5.657l-5.234 5.234L41.234 19.406z" })
    })
  );
}

// components/icons/move-horizontal.tsx
import { jsx as jsx33, jsxs as jsxs25 } from "react/jsx-runtime";
function MoveHorizontalIcon(props) {
  return /* @__PURE__ */ jsxs25(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: [
        /* @__PURE__ */ jsx33("circle", { cx: "12", cy: "12", r: "1" }),
        /* @__PURE__ */ jsx33("circle", { cx: "19", cy: "12", r: "1" }),
        /* @__PURE__ */ jsx33("circle", { cx: "5", cy: "12", r: "1" })
      ]
    })
  );
}

// components/icons/move-vertical.tsx
import { jsx as jsx34 } from "react/jsx-runtime";
function MoveVerticalIcon(props) {
  return /* @__PURE__ */ jsx34(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: /* @__PURE__ */ jsx34("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M12 6.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5zm0 14a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5zM13.75 12a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0z", fill: "#000000" })
    })
  );
}

// components/icons/minus.tsx
import { jsx as jsx35 } from "react/jsx-runtime";
function MinusIcon(props) {
  return /* @__PURE__ */ jsx35(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: /* @__PURE__ */ jsx35("path", { d: "M18 11h-12c-1.104 0-2 .896-2 2s.896 2 2 2h12c1.104 0 2-.896 2-2s-.896-2-2-2z" })
    })
  );
}

// components/icons/loader-2.tsx
import { jsx as jsx36, jsxs as jsxs26 } from "react/jsx-runtime";
function Loader2Icon(props) {
  return /* @__PURE__ */ jsxs26(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: [
        /* @__PURE__ */ jsx36("path", { d: "M12 3L12 6", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx36("path", { d: "M21 12L18 12", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx36("path", { d: "M12 21L12 18", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx36("path", { d: "M3 12L6 12", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx36("path", { d: "M5.63586 5.63605L7.75718 7.75737", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx36("path", { d: "M18.3639 5.63605L16.2426 7.75737", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx36("path", { d: "M18.3641 18.3639L16.2428 16.2426", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx36("path", { d: "M5.63623 18.3639L7.75755 16.2426", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
      ]
    })
  );
}

// components/icons/play.tsx
import { jsx as jsx37 } from "react/jsx-runtime";
function PlayIcon(props) {
  return /* @__PURE__ */ jsx37(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, props), {
      children: /* @__PURE__ */ jsx37("path", { d: "M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671V5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z" })
    })
  );
}

// components/icons/alert-circle.tsx
import { jsx as jsx38 } from "react/jsx-runtime";
function AlertCircleIcon(props) {
  return /* @__PURE__ */ jsx38(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: /* @__PURE__ */ jsx38("path", { clipRule: "evenodd", d: "M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM7 9V3H9V9H7ZM7 13V11H9V13H7Z", fill: "#030708", fillRule: "evenodd" })
    })
  );
}

// components/icons/refresh-cw.tsx
import { jsx as jsx39, jsxs as jsxs27 } from "react/jsx-runtime";
function RefreshCwIcon(props) {
  return /* @__PURE__ */ jsxs27(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: [
        /* @__PURE__ */ jsx39("path", { id: "primary", d: "M14,18H9A6,6,0,0,1,5.54,7.11", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }),
        /* @__PURE__ */ jsx39("path", { id: "primary-2", "data-name": "primary", d: "M10,6h5a6,6,0,0,1,3.46,10.89", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }),
        /* @__PURE__ */ jsx39("polyline", { id: "primary-3", "data-name": "primary", points: "12 16 14 18 12 20", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" }),
        /* @__PURE__ */ jsx39("polyline", { id: "primary-4", "data-name": "primary", points: "12 8 10 6 12 4", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2" })
      ]
    })
  );
}

// components/icons/triangle-alert.tsx
import { jsx as jsx40 } from "react/jsx-runtime";
function TriangleAlertIcon(props) {
  return /* @__PURE__ */ jsx40(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: /* @__PURE__ */ jsx40("path", { d: "M9.821,118.048h104.4c7.3,0,12-7.7,8.7-14.2l-52.2-92.5c-3.601-7.199-13.9-7.199-17.5,0l-52.2,92.5   C-2.179,110.348,2.521,118.048,9.821,118.048z M70.222,96.548c0,4.8-3.5,8.5-8.5,8.5s-8.5-3.7-8.5-8.5v-0.2c0-4.8,3.5-8.5,8.5-8.5   s8.5,3.7,8.5,8.5V96.548z M57.121,34.048h9.801c2.699,0,4.3,2.3,4,5.2l-4.301,37.6c-0.3,2.7-2.1,4.4-4.6,4.4s-4.3-1.7-4.6-4.4   l-4.301-37.6C52.821,36.348,54.422,34.048,57.121,34.048z" })
    })
  );
}

// components/ui/pagination.tsx
import { jsx as jsx41, jsxs as jsxs28 } from "react/jsx-runtime";
var Pagination = (_a) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx41(
    "nav",
    __spreadValues({
      "data-slot": "pagination",
      role: "navigation",
      "aria-label": "pagination",
      className: cn("mx-auto flex w-full justify-center", className)
    }, props)
  );
};
function PaginationContent(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx41("ul", __spreadValues({ "data-slot": "pagination-content", className: cn("flex flex-row items-center gap-1", className) }, props));
}
function PaginationItem(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx41("li", __spreadValues({ "data-slot": "pagination-item", className: cn("", className) }, props));
}
var PaginationEllipsis = (_a) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsxs28(
    "span",
    __spreadProps(__spreadValues({
      "data-slot": "pagination-ellipsis",
      "aria-hidden": true,
      className: cn("flex h-9 w-9 items-center justify-center", className)
    }, props), {
      children: [
        /* @__PURE__ */ jsx41(MoveHorizontalIcon, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx41("span", { className: "sr-only", children: "More pages" })
      ]
    })
  );
};

// components/ui/button.tsx
import { cva } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import { jsx as jsx42 } from "react/jsx-runtime";
var buttonVariants = cva(
  "cursor-pointer group whitespace-nowrap focus-visible:outline-hidden inline-flex items-center justify-center has-data-[arrow=true]:justify-between whitespace-nowrap text-sm font-medium ring-offset-background transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90",
        mono: "bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black hover:bg-zinc-950/90 dark:hover:bg-zinc-300/90 data-[state=open]:bg-zinc-950/90 dark:data-[state=open]:bg-zinc-300/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 data-[state=open]:bg-destructive/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 data-[state=open]:bg-secondary/90",
        outline: "bg-background text-accent-foreground border border-input hover:bg-accent data-[state=open]:bg-accent",
        dashed: "text-accent-foreground border border-input border-dashed bg-background hover:bg-accent hover:text-accent-foreground data-[state=open]:text-accent-foreground",
        ghost: "text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        dim: "text-muted-foreground hover:text-foreground data-[state=open]:text-foreground",
        foreground: "",
        inverse: ""
      },
      appearance: {
        default: "",
        ghost: ""
      },
      underline: {
        solid: "",
        dashed: ""
      },
      underlined: {
        solid: "",
        dashed: ""
      },
      size: {
        lg: "h-10 px-4 text-sm gap-1.5 [&_svg:not([class*=size-])]:size-4",
        md: "h-9 px-3 gap-1.5 text-sm [&_svg:not([class*=size-])]:size-4",
        sm: "h-8 px-2.5 gap-1.25 text-xs [&_svg:not([class*=size-])]:size-3.5",
        xs: "h-7 px-2 gap-1 text-xs [&_svg:not([class*=size-])]:size-3.5",
        icon: "size-9 [&_svg:not([class*=size-])]:size-4 shrink-0"
      },
      autoHeight: {
        true: "",
        false: ""
      },
      radius: {
        md: "rounded-md",
        full: "rounded-full"
      },
      mode: {
        default: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        icon: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0",
        link: "text-primary h-auto p-0 bg-transparent rounded-none hover:bg-transparent data-[state=open]:bg-transparent",
        input: `
            justify-start font-normal hover:bg-background [&_svg]:transition-colors [&_svg]:hover:text-foreground data-[state=open]:bg-background 
            focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/30 
            [[data-state=open]>&]:border-ring [[data-state=open]>&]:outline-hidden [[data-state=open]>&]:ring-[3px] 
            [[data-state=open]>&]:ring-ring/30 
            aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
            in-data-[invalid=true]:border-destructive/60 in-data-[invalid=true]:ring-destructive/10  dark:in-data-[invalid=true]:border-destructive dark:in-data-[invalid=true]:ring-destructive/20
          `
      },
      placeholder: {
        true: "text-muted-foreground",
        false: ""
      }
    },
    compoundVariants: [
      // Icons opacity for default mode
      {
        variant: "ghost",
        mode: "default",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      {
        variant: "outline",
        mode: "default",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      {
        variant: "dashed",
        mode: "default",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      {
        variant: "secondary",
        mode: "default",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      // Icons opacity for default mode
      {
        variant: "outline",
        mode: "input",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      {
        variant: "outline",
        mode: "icon",
        className: "[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60"
      },
      // Auto height
      {
        size: "xs",
        autoHeight: true,
        className: "h-auto min-h-7"
      },
      {
        size: "md",
        autoHeight: true,
        className: "h-auto min-h-9"
      },
      {
        size: "sm",
        autoHeight: true,
        className: "h-auto min-h-8"
      },
      {
        size: "lg",
        autoHeight: true,
        className: "h-auto min-h-10"
      },
      // Shadow support
      {
        variant: "primary",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "mono",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "secondary",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "outline",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "dashed",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "destructive",
        mode: "default",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      // Shadow support
      {
        variant: "primary",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "mono",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "secondary",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "outline",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "dashed",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      {
        variant: "destructive",
        mode: "icon",
        appearance: "default",
        className: "shadow-xs shadow-black/5"
      },
      // Link
      {
        variant: "primary",
        mode: "link",
        underline: "solid",
        className: "font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid"
      },
      {
        variant: "primary",
        mode: "link",
        underline: "dashed",
        className: "font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1"
      },
      {
        variant: "primary",
        mode: "link",
        underlined: "solid",
        className: "font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid"
      },
      {
        variant: "primary",
        mode: "link",
        underlined: "dashed",
        className: "font-medium text-primary hover:text-primary/90 [&_svg]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1"
      },
      {
        variant: "inverse",
        mode: "link",
        underline: "solid",
        className: "font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid"
      },
      {
        variant: "inverse",
        mode: "link",
        underline: "dashed",
        className: "font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1"
      },
      {
        variant: "inverse",
        mode: "link",
        underlined: "solid",
        className: "font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid"
      },
      {
        variant: "inverse",
        mode: "link",
        underlined: "dashed",
        className: "font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1"
      },
      {
        variant: "foreground",
        mode: "link",
        underline: "solid",
        className: "font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid"
      },
      {
        variant: "foreground",
        mode: "link",
        underline: "dashed",
        className: "font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1"
      },
      {
        variant: "foreground",
        mode: "link",
        underlined: "solid",
        className: "font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid"
      },
      {
        variant: "foreground",
        mode: "link",
        underlined: "dashed",
        className: "font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1"
      },
      // Ghost
      {
        variant: "primary",
        appearance: "ghost",
        className: "bg-transparent text-primary/90 hover:bg-primary/5 data-[state=open]:bg-primary/5"
      },
      {
        variant: "destructive",
        appearance: "ghost",
        className: "bg-transparent text-destructive/90 hover:bg-destructive/5 data-[state=open]:bg-destructive/5"
      },
      {
        variant: "ghost",
        mode: "icon",
        className: "text-muted-foreground"
      },
      // Size
      {
        size: "xs",
        mode: "icon",
        className: "w-7 h-7 p-0 [[&_svg:not([class*=size-])]:size-3.5"
      },
      {
        size: "sm",
        mode: "icon",
        className: "w-8 h-8 p-0 [[&_svg:not([class*=size-])]:size-3.5"
      },
      {
        size: "md",
        mode: "icon",
        className: "w-9 h-9 p-0 [&_svg:not([class*=size-])]:size-4"
      },
      {
        size: "icon",
        className: "w-9 h-9 p-0 [&_svg:not([class*=size-])]:size-4"
      },
      {
        size: "lg",
        mode: "icon",
        className: "w-10 h-10 p-0 [&_svg:not([class*=size-])]:size-4"
      },
      // Input mode
      {
        mode: "input",
        placeholder: true,
        variant: "outline",
        className: "font-normal text-muted-foreground"
      },
      {
        mode: "input",
        variant: "outline",
        size: "sm",
        className: "gap-1.25"
      },
      {
        mode: "input",
        variant: "outline",
        size: "md",
        className: "gap-1.5"
      },
      {
        mode: "input",
        variant: "outline",
        size: "lg",
        className: "gap-1.5"
      }
    ],
    defaultVariants: {
      variant: "primary",
      mode: "default",
      size: "md",
      radius: "md",
      appearance: "default"
    }
  }
);
function Button(_a) {
  var _b = _a, {
    className,
    selected,
    variant,
    radius,
    appearance,
    mode,
    size,
    autoHeight,
    underlined,
    underline,
    asChild = false,
    placeholder = false
  } = _b, props = __objRest(_b, [
    "className",
    "selected",
    "variant",
    "radius",
    "appearance",
    "mode",
    "size",
    "autoHeight",
    "underlined",
    "underline",
    "asChild",
    "placeholder"
  ]);
  const Comp = asChild ? SlotPrimitive.Slot : "button";
  return /* @__PURE__ */ jsx42(
    Comp,
    __spreadValues(__spreadValues({
      "data-slot": "button",
      className: cn(
        buttonVariants({
          variant,
          size,
          radius,
          appearance,
          mode,
          autoHeight,
          placeholder,
          underlined,
          underline,
          className
        }),
        asChild && props.disabled && "pointer-events-none opacity-50"
      )
    }, selected && { "data-state": "open" }), props)
  );
}

// components/layout/footer.tsx
import { jsx as jsx43, jsxs as jsxs29 } from "react/jsx-runtime";
function getPageNumbers(current, total) {
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "ellipsis", total);
  } else if (current >= total - 3) {
    pages.push(1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "ellipsis", current - 1, current, current + 1, "ellipsis", total);
  }
  return pages;
}
function FileManagerFooter({ className }) {
  const { pagination, handlePageChange, files, folders } = useFileManager();
  const { currentPage, totalPages } = pagination;
  const totalItems = ((files == null ? void 0 : files.length) || 0) + ((folders == null ? void 0 : folders.length) || 0);
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  return /* @__PURE__ */ jsx43(Pagination, { className, children: /* @__PURE__ */ jsxs29(PaginationContent, { children: [
    /* @__PURE__ */ jsx43(PaginationItem, { children: /* @__PURE__ */ jsx43(
      Button,
      {
        variant: "ghost",
        radius: "full",
        asChild: true,
        disabled: currentPage === 1,
        onClick: () => currentPage > 1 && handlePageChange(currentPage - 1),
        children: /* @__PURE__ */ jsxs29("span", { children: [
          /* @__PURE__ */ jsx43(ChevronLeftIcon, { className: "rtl:rotate-180" }),
          " Previous"
        ] })
      }
    ) }),
    pageNumbers.map(
      (page, idx) => page === "ellipsis" ? /* @__PURE__ */ jsx43(PaginationItem, { children: /* @__PURE__ */ jsx43(PaginationEllipsis, {}) }, `ellipsis-${currentPage}-${totalPages}-${idx}`) : /* @__PURE__ */ jsx43(PaginationItem, { children: /* @__PURE__ */ jsx43(
        Button,
        {
          variant: page === currentPage ? "outline" : "ghost",
          mode: "icon",
          size: "icon",
          radius: "full",
          asChild: true,
          onClick: () => handlePageChange(page),
          disabled: page === currentPage,
          children: /* @__PURE__ */ jsx43("span", { children: page })
        }
      ) }, page)
    ),
    /* @__PURE__ */ jsx43(PaginationItem, { children: /* @__PURE__ */ jsx43(
      Button,
      {
        variant: "ghost",
        radius: "full",
        asChild: true,
        disabled: currentPage === totalPages,
        onClick: () => currentPage < totalPages && handlePageChange(currentPage + 1),
        children: /* @__PURE__ */ jsxs29("span", { children: [
          "Next ",
          /* @__PURE__ */ jsx43(ChevronRightIcon, { className: "rtl:rotate-180" })
        ] })
      }
    ) })
  ] }) });
}

// components/layout/header.tsx
import { jsx as jsx44 } from "react/jsx-runtime";
function FileManagerHeader({
  children,
  className
}) {
  return /* @__PURE__ */ jsx44("div", { className: cn("p-4 flex md:flex-row gap-2", className), children });
}

// components/modals/upload-modal.tsx
import { useState as useState6 } from "react";

// components/ui/dialog.tsx
import { cva as cva2 } from "class-variance-authority";
import { Dialog as DialogPrimitive } from "radix-ui";
import { jsx as jsx45, jsxs as jsxs30 } from "react/jsx-runtime";
var dialogContentVariants = cva2(
  "flex flex-col fixed outline-0 z-50 border border-border bg-background text-foreground shadow-lg shadow-black/5 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl",
  {
    variants: {
      variant: {
        default: "left-[50%] top-[50%] max-w-lg translate-x-[-50%] translate-y-[-50%] w-full p-6 max-h-[90dvh]",
        fullscreen: "top-5 left-5 right-5 bottom-5"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Dialog(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx45(DialogPrimitive.Root, __spreadValues({ "data-slot": "dialog" }, props));
}
function DialogPortal(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx45(DialogPrimitive.Portal, __spreadValues({ "data-slot": "dialog-portal" }, props));
}
function DialogClose(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx45(DialogPrimitive.Close, __spreadValues({ "data-slot": "dialog-close" }, props));
}
function DialogOverlay(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx45(
    DialogPrimitive.Overlay,
    __spreadValues({
      "data-slot": "dialog-overlay",
      className: cn(
        "fixed inset-0 z-50 bg-black/30 [backdrop-filter:blur(4px)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )
    }, props)
  );
}
function DialogContent(_a) {
  var _b = _a, {
    className,
    children,
    showCloseButton = true,
    overlay = true,
    variant
  } = _b, props = __objRest(_b, [
    "className",
    "children",
    "showCloseButton",
    "overlay",
    "variant"
  ]);
  return /* @__PURE__ */ jsxs30(DialogPortal, { children: [
    overlay && /* @__PURE__ */ jsx45(DialogOverlay, {}),
    /* @__PURE__ */ jsxs30(
      DialogPrimitive.Content,
      __spreadProps(__spreadValues({
        "data-slot": "dialog-content",
        className: cn(dialogContentVariants({ variant }), className)
      }, props), {
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxs30(DialogClose, { className: "cursor-pointer outline-0 absolute end-5 top-5 rounded-full opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
            /* @__PURE__ */ jsx45(CrossIcon, { className: "size-4 text-gray-600 dark:text-zinc-400" }),
            /* @__PURE__ */ jsx45("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      })
    )
  ] });
}
var DialogHeader = (_a) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx45(
    "div",
    __spreadValues({
      "data-slot": "dialog-header",
      className: cn("flex flex-col space-y-1 text-center sm:text-start mb-5", className)
    }, props)
  );
};
var DialogFooter = (_a) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx45(
    "div",
    __spreadValues({
      "data-slot": "dialog-footer",
      className: cn("flex flex-col-reverse sm:flex-row sm:justify-end pt-5 sm:space-x-2.5", className)
    }, props)
  );
};
function DialogTitle(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx45(
    DialogPrimitive.Title,
    __spreadValues({
      "data-slot": "dialog-title",
      className: cn("text-lg font-semibold leading-none tracking-tight", className)
    }, props)
  );
}
function DialogDescription(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx45(
    DialogPrimitive.Description,
    __spreadValues({
      "data-slot": "dialog-description",
      className: cn("text-sm text-muted-foreground", className)
    }, props)
  );
}

// components/ui/alert.tsx
import { cva as cva3 } from "class-variance-authority";
import { jsx as jsx46, jsxs as jsxs31 } from "react/jsx-runtime";
var alertVariants = cva3("flex items-stretch w-full gap-2 group-[.toaster]:w-(--width)", {
  variants: {
    variant: {
      secondary: "",
      primary: "",
      destructive: "",
      success: "",
      info: "",
      mono: "",
      warning: ""
    },
    icon: {
      primary: "",
      destructive: "",
      success: "",
      info: "",
      warning: ""
    },
    appearance: {
      solid: "",
      outline: "",
      light: "",
      stroke: "text-foreground"
    },
    size: {
      lg: "rounded-lg p-4 gap-3 text-base [&>[data-slot=alert-icon]>svg]:size-6 *:data-slot=alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-1",
      md: "rounded-lg p-3.5 gap-2.5 text-sm [&>[data-slot=alert-icon]>svg]:size-5 *:data-slot=alert-icon:mt-0 [&_[data-slot=alert-close]]:mt-0.5",
      sm: "rounded-md px-3 py-2.5 gap-2 text-xs [&>[data-slot=alert-icon]>svg]:size-4 *:data-alert-icon:mt-0.5 [&_[data-slot=alert-close]]:mt-0.25 [&_[data-slot=alert-close]_svg]:size-3.5"
    }
  },
  compoundVariants: [
    /* Solid */
    {
      variant: "secondary",
      appearance: "solid",
      className: "bg-muted text-foreground"
    },
    {
      variant: "primary",
      appearance: "solid",
      className: "bg-primary text-primary-foreground"
    },
    {
      variant: "destructive",
      appearance: "solid",
      className: "bg-destructive text-destructive-foreground"
    },
    {
      variant: "success",
      appearance: "solid",
      className: "bg-[var(--color-success,var(--color-green-500))] text-[var(--color-success-foreground,var(--color-white))]"
    },
    {
      variant: "info",
      appearance: "solid",
      className: "bg-[var(--color-info,var(--color-violet-600))] text-[var(--color-info-foreground,var(--color-white))]"
    },
    {
      variant: "warning",
      appearance: "solid",
      className: "bg-[var(--color-warning,var(--color-yellow-500))] text-[var(--color-warning-foreground,var(--color-white))]"
    },
    {
      variant: "mono",
      appearance: "solid",
      className: "bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black *:data-slot-[alert=close]:text-white"
    },
    /* Outline */
    {
      variant: "secondary",
      appearance: "outline",
      className: "border border-border bg-background text-foreground [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "primary",
      appearance: "outline",
      className: "border border-border bg-background text-primary [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "destructive",
      appearance: "outline",
      className: "border border-border bg-background text-destructive [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "success",
      appearance: "outline",
      className: "border border-border bg-background text-[var(--color-success,var(--color-green-500))] [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "info",
      appearance: "outline",
      className: "border border-border bg-background text-[var(--color-info,var(--color-violet-600))] [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "warning",
      appearance: "outline",
      className: "border border-border bg-background text-[var(--color-warning,var(--color-yellow-500))] [&_[data-slot=alert-close]]:text-foreground"
    },
    {
      variant: "mono",
      appearance: "outline",
      className: "border border-border bg-background text-foreground [&_[data-slot=alert-close]]:text-foreground"
    },
    /* Light */
    {
      variant: "secondary",
      appearance: "light",
      className: "bg-muted border border-border text-foreground"
    },
    {
      variant: "primary",
      appearance: "light",
      className: "text-foreground bg-[var(--color-primary-soft,var(--color-blue-50))] border border-[var(--color-primary-alpha,var(--color-blue-100))] [&_[data-slot=alert-icon]]:text-primary dark:bg-[var(--color-primary-soft,var(--color-blue-950))] dark:border-[var(--color-primary-alpha,var(--color-blue-900))]"
    },
    {
      variant: "destructive",
      appearance: "light",
      className: "bg-[var(--color-destructive-soft,var(--color-red-50))] border border-[var(--color-destructive-alpha,var(--color-red-100))] text-foreground [&_[data-slot=alert-icon]]:text-destructive dark:bg-[var(--color-destructive-soft,var(--color-red-950))] dark:border-[var(--color-destructive-alpha,var(--color-red-900))] "
    },
    {
      variant: "success",
      appearance: "light",
      className: "bg-[var(--color-success-soft,var(--color-green-50))] border border-[var(--color-success-alpha,var(--color-green-200))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-success-foreground,var(--color-green-600))] dark:bg-[var(--color-success-soft,var(--color-green-950))] dark:border-[var(--color-success-alpha,var(--color-green-900))]"
    },
    {
      variant: "info",
      appearance: "light",
      className: "bg-[var(--color-info-soft,var(--color-violet-50))] border border-[var(--color-info-alpha,var(--color-violet-100))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-info-foreground,var(--color-violet-600))] dark:bg-[var(--color-info-soft,var(--color-violet-950))] dark:border-[var(--color-info-alpha,var(--color-violet-900))]"
    },
    {
      variant: "warning",
      appearance: "light",
      className: "bg-[var(--color-warning-soft,var(--color-yellow-50))] border border-[var(--color-warning-alpha,var(--color-yellow-200))] text-foreground [&_[data-slot=alert-icon]]:text-[var(--color-warning-foreground,var(--color-yellow-600))] dark:bg-[var(--color-warning-soft,var(--color-yellow-950))] dark:border-[var(--color-warning-alpha,var(--color-yellow-900))]"
    },
    /* Mono */
    {
      variant: "mono",
      icon: "primary",
      className: "[&_[data-slot=alert-icon]]:text-primary"
    },
    {
      variant: "mono",
      icon: "warning",
      className: "[&_[data-slot=alert-icon]]:text-[var(--color-warning-foreground,var(--color-yellow-600))]"
    },
    {
      variant: "mono",
      icon: "success",
      className: "[&_[data-slot=alert-icon]]:text-[var(--color-success-foreground,var(--color-green-600))]"
    },
    {
      variant: "mono",
      icon: "destructive",
      className: "[&_[data-slot=alert-icon]]:text-destructive"
    },
    {
      variant: "mono",
      icon: "info",
      className: "[&_[data-slot=alert-icon]]:text-[var(--color-info-foreground,var(--color-violet-600))]"
    }
  ],
  defaultVariants: {
    variant: "secondary",
    appearance: "solid",
    size: "md"
  }
});
function Alert(_a) {
  var _b = _a, { className, variant, size, icon, appearance, close = false, onClose, children } = _b, props = __objRest(_b, ["className", "variant", "size", "icon", "appearance", "close", "onClose", "children"]);
  return /* @__PURE__ */ jsxs31(
    "div",
    __spreadProps(__spreadValues({
      "data-slot": "alert",
      role: "alert",
      className: cn(alertVariants({ variant, size, icon, appearance }), className)
    }, props), {
      children: [
        children,
        close && /* @__PURE__ */ jsx46(
          "button",
          {
            onClick: onClose,
            "aria-label": "Dismiss",
            "data-slot": "alert-close",
            className: cn("group shrink-0 size-4 cursor-pointer"),
            children: /* @__PURE__ */ jsx46(CrossIcon, { className: "opacity-60 group-hover:opacity-100 size-4" })
          }
        )
      ]
    })
  );
}
function AlertTitle(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx46("div", __spreadValues({ "data-slot": "alert-title", className: cn("grow tracking-tight", className) }, props));
}
function AlertIcon(_a) {
  var _b = _a, { children, className } = _b, props = __objRest(_b, ["children", "className"]);
  return /* @__PURE__ */ jsx46("div", __spreadProps(__spreadValues({ "data-slot": "alert-icon", className: cn("shrink-0", className) }, props), { children }));
}
function AlertDescription(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx46(
    "div",
    __spreadValues({
      "data-slot": "alert-description",
      className: cn("text-sm [&_p]:leading-relaxed [&_p]:mb-2", className)
    }, props)
  );
}
function AlertContent(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx46(
    "div",
    __spreadValues({
      "data-slot": "alert-content",
      className: cn("space-y-2 [&_[data-slot=alert-title]]:font-semibold", className)
    }, props)
  );
}

// components/ui/tooltip.tsx
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { jsx as jsx47, jsxs as jsxs32 } from "react/jsx-runtime";
function TooltipProvider(_a) {
  var _b = _a, { delayDuration = 0 } = _b, props = __objRest(_b, ["delayDuration"]);
  return /* @__PURE__ */ jsx47(TooltipPrimitive.Provider, __spreadValues({ "data-slot": "tooltip-provider", delayDuration }, props));
}
function Tooltip(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx47(TooltipProvider, { children: /* @__PURE__ */ jsx47(TooltipPrimitive.Root, __spreadValues({ "data-slot": "tooltip" }, props)) });
}
function TooltipTrigger(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx47(TooltipPrimitive.Trigger, __spreadValues({ "data-slot": "tooltip-trigger" }, props));
}
function TooltipContent(_a) {
  var _b = _a, {
    className,
    sideOffset = 0,
    children
  } = _b, props = __objRest(_b, [
    "className",
    "sideOffset",
    "children"
  ]);
  return /* @__PURE__ */ jsx47(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsxs32(
    TooltipPrimitive.Content,
    __spreadProps(__spreadValues({
      "data-slot": "tooltip-content",
      sideOffset,
      className: cn(
        "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        className
      )
    }, props), {
      children: [
        children,
        /* @__PURE__ */ jsx47(TooltipPrimitive.Arrow, { className: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
      ]
    })
  ) });
}

// lib/file-size.ts
function getFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// hooks/use-file-upload.ts
import { useCallback as useCallback4, useRef as useRef2, useState as useState3, useEffect as useEffect3 } from "react";
var useFileUpload = (options = {}) => {
  const {
    maxFiles = Number.POSITIVE_INFINITY,
    maxSize = Number.POSITIVE_INFINITY,
    accept = "*",
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
    onError
  } = options;
  const [state, setState] = useState3({
    files: initialFiles.map((file) => ({
      file,
      id: file.id,
      preview: file.url
    })),
    isDragging: false,
    errors: []
  });
  const inputRef = useRef2(null);
  useEffect3(() => {
    return () => {
      state.files.forEach((file) => {
        if (file.preview && file.file instanceof File) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [state.files]);
  const validateFile = useCallback4(
    (file) => {
      if (file.size > maxSize) {
        return `File "${file.name}" exceeds the maximum size of ${getFileSize(maxSize)}.`;
      }
      if (accept !== "*") {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const fileType = file instanceof File ? file.type || "" : file.type;
        const fileExtension = `.${file.name.split(".").pop()}`;
        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExtension.toLowerCase() === type.toLowerCase();
          }
          if (type.endsWith("/*")) {
            const baseType = type.split("/")[0];
            return fileType.startsWith(`${baseType}/`);
          }
          return fileType === type;
        });
        if (!isAccepted) {
          return `File "${file.name}" is not an accepted file type.`;
        }
      }
      return null;
    },
    [accept, maxSize]
  );
  const createPreview = useCallback4((file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return file.url;
  }, []);
  const generateUniqueId = useCallback4((file) => {
    if (file instanceof File) {
      return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return file.id.toString();
  }, []);
  const clearFiles = useCallback4(() => {
    setState((prev) => {
      for (const file of prev.files) {
        if (file.preview && file.file instanceof File && file.file.type.startsWith("image/")) {
          URL.revokeObjectURL(file.preview);
        }
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      const newState = __spreadProps(__spreadValues({}, prev), {
        files: [],
        errors: []
      });
      onFilesChange == null ? void 0 : onFilesChange(newState.files);
      return newState;
    });
  }, [onFilesChange]);
  const addFiles = useCallback4(
    (newFiles) => {
      if (!newFiles || newFiles.length === 0) return;
      const newFilesArray = Array.from(newFiles);
      const errors = [];
      setState((prev) => __spreadProps(__spreadValues({}, prev), { errors: [] }));
      if (!multiple) {
        clearFiles();
      }
      setState((prev) => {
        if (multiple && maxFiles !== Number.POSITIVE_INFINITY && prev.files.length + newFilesArray.length > maxFiles) {
          errors.push(`You can only upload a maximum of ${maxFiles} files.`);
          onError == null ? void 0 : onError(errors);
          return __spreadProps(__spreadValues({}, prev), { errors });
        }
        const validFiles = [];
        for (const file of newFilesArray) {
          if (multiple) {
            const isDuplicate = prev.files.some(
              (existingFile) => existingFile.file.name === file.name && existingFile.file.size === file.size
            );
            if (isDuplicate) {
              continue;
            }
          }
          if (file.size > maxSize) {
            errors.push(
              multiple ? `Some files exceed the maximum size of ${getFileSize(maxSize)}.` : `File exceeds the maximum size of ${getFileSize(maxSize)}.`
            );
            continue;
          }
          const error = validateFile(file);
          if (error) {
            errors.push(error);
          } else {
            validFiles.push({
              file,
              id: generateUniqueId(file),
              preview: createPreview(file)
            });
          }
        }
        if (validFiles.length > 0) {
          onFilesAdded == null ? void 0 : onFilesAdded(validFiles);
          const newFiles2 = multiple ? [...prev.files, ...validFiles] : validFiles;
          onFilesChange == null ? void 0 : onFilesChange(newFiles2);
          return __spreadProps(__spreadValues({}, prev), {
            files: newFiles2,
            errors
          });
        } else if (errors.length > 0) {
          onError == null ? void 0 : onError(errors);
          return __spreadProps(__spreadValues({}, prev), {
            errors
          });
        }
        return prev;
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [
      maxFiles,
      multiple,
      maxSize,
      validateFile,
      createPreview,
      generateUniqueId,
      clearFiles,
      onFilesChange,
      onFilesAdded,
      onError
    ]
  );
  const removeFile = useCallback4(
    (id) => {
      setState((prev) => {
        const fileToRemove = prev.files.find((file) => file.id === id);
        if ((fileToRemove == null ? void 0 : fileToRemove.preview) && fileToRemove.file instanceof File && fileToRemove.file.type.startsWith("image/")) {
          URL.revokeObjectURL(fileToRemove.preview);
        }
        const newFiles = prev.files.filter((file) => file.id !== id);
        onFilesChange == null ? void 0 : onFilesChange(newFiles);
        return __spreadProps(__spreadValues({}, prev), {
          files: newFiles,
          errors: []
        });
      });
    },
    [onFilesChange]
  );
  const clearErrors = useCallback4(() => {
    setState((prev) => __spreadProps(__spreadValues({}, prev), {
      errors: []
    }));
  }, []);
  const handleDragEnter = useCallback4((e) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => __spreadProps(__spreadValues({}, prev), { isDragging: true }));
  }, []);
  const handleDragLeave = useCallback4((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setState((prev) => __spreadProps(__spreadValues({}, prev), { isDragging: false }));
  }, []);
  const handleDragOver = useCallback4((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback4(
    (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      setState((prev) => __spreadProps(__spreadValues({}, prev), { isDragging: false }));
      if ((_a = inputRef.current) == null ? void 0 : _a.disabled) {
        return;
      }
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (multiple) {
          addFiles(e.dataTransfer.files);
        } else {
          const file = e.dataTransfer.files[0];
          addFiles([file]);
        }
      }
    },
    [addFiles, multiple]
  );
  const handleFileChange = useCallback4(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
    },
    [addFiles]
  );
  const openFileDialog = useCallback4(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);
  const getInputProps = useCallback4(
    (props = {}) => {
      var _a;
      return __spreadProps(__spreadValues({}, props), {
        type: "file",
        onChange: handleFileChange,
        accept: props.accept || accept,
        multiple: (_a = props.multiple) != null ? _a : multiple,
        ref: inputRef
      });
    },
    [accept, multiple, handleFileChange]
  );
  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps
    }
  ];
};

// lib/file-utils.tsx
import mime from "mime";
import { jsx as jsx48 } from "react/jsx-runtime";
function getFileTypeFromMime(mimeType, extension) {
  if (typeof mimeType !== "string") {
    console.warn("getFileTypeFromMime: mimeType is not a string:", mimeType);
    return FILE_TYPE.FILE;
  }
  let effectiveMime = mimeType;
  if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, "");
    const detectedMime = mime.getType(ext);
    if (detectedMime) {
      effectiveMime = detectedMime;
    }
  }
  if (effectiveMime.startsWith("image/")) {
    return FILE_TYPE.IMAGE;
  }
  if (effectiveMime.startsWith("video/")) {
    return FILE_TYPE.VIDEO;
  }
  if (effectiveMime.startsWith("audio/")) {
    return FILE_TYPE.AUDIO;
  }
  return FILE_TYPE.FILE;
}
function getIconType(mimeType, extension) {
  let effectiveMime = mimeType;
  if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, "");
    const detectedMime = mime.getType(ext);
    if (detectedMime) {
      effectiveMime = detectedMime;
    }
  }
  if (effectiveMime.startsWith("image/")) {
    return "image";
  }
  if (effectiveMime.startsWith("video/")) {
    return "video";
  }
  if (effectiveMime.startsWith("audio/")) {
    return "audio";
  }
  switch (effectiveMime) {
    case "application/pdf":
      return "pdf";
    case "application/json":
      return "json";
    // Archives
    case "application/zip":
    case "application/x-zip-compressed":
      return "zip";
    case "application/x-rar-compressed":
    case "application/vnd.rar":
      return "rar";
    // Executables
    case "application/x-msdownload":
    case "application/x-executable":
      return "exe";
    // Microsoft Office - Excel
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.ms-excel":
    case "text/csv":
      return "excel";
    // Microsoft Office - PowerPoint
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    case "application/vnd.ms-powerpoint":
      return "powerpoint";
    // Microsoft Office - Word
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/msword":
      return "document";
  }
  if (effectiveMime.startsWith("text/")) {
    return "txt";
  }
  if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, "");
    switch (ext) {
      case "exe":
      case "msi":
        return "exe";
      case "zip":
        return "zip";
      case "rar":
        return "rar";
      case "pdf":
        return "pdf";
      case "csv":
        return "excel";
    }
  }
  return "file";
}
var Icons = (_a) => {
  var _b = _a, { type, className } = _b, props = __objRest(_b, ["type", "className"]);
  switch (type) {
    case "folder-with-files":
      return /* @__PURE__ */ jsx48(FolderWithFilesIcon, __spreadValues({ className }, props));
    case "folder":
      return /* @__PURE__ */ jsx48(EmptyFolderIcon, __spreadValues({ className }, props));
    case "image":
      return /* @__PURE__ */ jsx48(ImageIcon, __spreadValues({ className }, props));
    case "video":
      return /* @__PURE__ */ jsx48(VideoIcon, __spreadValues({ className }, props));
    case "audio":
      return /* @__PURE__ */ jsx48(MusicIcon, __spreadValues({ className }, props));
    case "pdf":
      return /* @__PURE__ */ jsx48(PdfIcon, __spreadValues({ className }, props));
    case "excel":
    case "xlsx":
      return /* @__PURE__ */ jsx48(ExcelIcon, __spreadValues({ className }, props));
    case "powerpoint":
    case "pptx":
      return /* @__PURE__ */ jsx48(PptIcon, __spreadValues({ className }, props));
    case "document":
    case "docx":
    case "doc":
      return /* @__PURE__ */ jsx48(DocIcon, __spreadValues({ className }, props));
    case "txt":
      return /* @__PURE__ */ jsx48(TextDocIcon, __spreadValues({ className }, props));
    case "json":
      return /* @__PURE__ */ jsx48(JsonIcon, __spreadValues({ className }, props));
    case "zip":
      return /* @__PURE__ */ jsx48(ZipIcon, __spreadValues({ className }, props));
    case "rar":
      return /* @__PURE__ */ jsx48(RarIcon, __spreadValues({ className }, props));
    case "exe":
      return /* @__PURE__ */ jsx48(ExeIcon, __spreadValues({ className }, props));
    default:
      return /* @__PURE__ */ jsx48(FileIcon, __spreadValues({ className }, props));
  }
};
function fileTypesToAccept(fileTypes) {
  if (!fileTypes || fileTypes.length === 0) {
    return "*/*";
  }
  const mimeTypes = [];
  for (const fileType of fileTypes) {
    switch (fileType) {
      case FILE_TYPE.IMAGE:
        mimeTypes.push("image/*");
        break;
      case FILE_TYPE.VIDEO:
        mimeTypes.push("video/*");
        break;
      case FILE_TYPE.AUDIO:
        mimeTypes.push("audio/*");
        break;
      case FILE_TYPE.FILE:
        mimeTypes.push(
          "application/*",
          // All application types (PDF, Office, archives, etc.)
          "text/*"
          // All text types
        );
        break;
    }
  }
  return mimeTypes.join(",");
}
function getFileTypesDescription(fileTypes) {
  if (!fileTypes || fileTypes.length === 0) {
    return "All files";
  }
  const descriptions = [];
  for (const fileType of fileTypes) {
    switch (fileType) {
      case FILE_TYPE.IMAGE:
        descriptions.push("Images");
        break;
      case FILE_TYPE.VIDEO:
        descriptions.push("Videos");
        break;
      case FILE_TYPE.AUDIO:
        descriptions.push("Audio");
        break;
      case FILE_TYPE.FILE:
        descriptions.push("Files");
        break;
    }
  }
  return descriptions.join(", ");
}

// components/icons/upload-cloud.tsx
import { jsx as jsx49, jsxs as jsxs33 } from "react/jsx-runtime";
function UploadCloudIcon(props) {
  return /* @__PURE__ */ jsxs33(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "40",
      height: "40",
      viewBox: "0 0 24 24",
      fill: "none",
      color: "currentColor"
    }, props), {
      children: [
        /* @__PURE__ */ jsx49("path", { d: "M13.0059 21.25C13.0059 21.8023 12.5581 22.25 12.0059 22.25C11.4536 22.25 11.0059 21.8023 11.0059 21.25L11.0059 16.75L10.4116 16.75C10.236 16.7501 10.0203 16.7503 9.84387 16.7282L9.84053 16.7278C9.71408 16.712 9.13804 16.6402 8.86368 16.0746C8.58872 15.5078 8.89065 15.0076 8.95597 14.8994L8.95841 14.8954C9.05062 14.7424 9.18477 14.5715 9.29511 14.4309L9.31885 14.4007C9.61348 14.0249 9.99545 13.5406 10.3759 13.1496C10.5657 12.9545 10.783 12.7533 11.0139 12.5944C11.2191 12.4532 11.5693 12.25 12 12.25C12.4307 12.25 12.7809 12.4532 12.9861 12.5944C13.217 12.7533 13.4343 12.9545 13.6241 13.1496C14.0046 13.5406 14.3865 14.0249 14.6812 14.4007L14.7049 14.4309C14.8152 14.5715 14.9494 14.7424 15.0416 14.8954L15.044 14.8994C15.1093 15.0076 15.4113 15.5078 15.1363 16.0746C14.862 16.6402 14.2859 16.712 14.1595 16.7278L14.1561 16.7282C13.9797 16.7503 13.764 16.7501 13.5884 16.75L13.0059 16.75L13.0059 21.25Z", fill: "currentColor", fillRule: "evenodd" }),
        /* @__PURE__ */ jsx49("path", { d: "M1.25 12.5C1.25 9.85827 3.03106 7.63322 5.45825 6.9592C5.65424 6.90478 5.75224 6.87756 5.80872 6.81971C5.8652 6.76186 5.88991 6.66386 5.93931 6.46785C6.62272 3.75655 9.07671 1.75002 12 1.75002C15.2149 1.75002 17.8628 4.17733 18.2112 7.29925C18.2385 7.54461 18.2522 7.66731 18.3147 7.7383C18.3772 7.80929 18.4989 7.83881 18.7423 7.89787C21.0422 8.4559 22.75 10.5285 22.75 13C22.75 15.8995 20.3995 18.25 17.5 18.25H16.4006C15.942 18.25 15.7126 18.25 15.6826 18.2119C15.6679 18.1933 15.6641 18.1839 15.6617 18.1604C15.6567 18.1121 15.8519 17.9223 16.2425 17.5427C17.2326 16.5804 17.255 14.9976 16.2927 14.0075C15.6442 13.1982 15.0315 12.3422 14.2379 11.6663C13.6086 11.1303 12.8426 10.75 12 10.75C11.1574 10.75 10.3914 11.1303 9.76209 11.6663C8.96846 12.3422 8.35575 13.1982 7.7073 14.0075C6.74496 14.9976 6.76745 16.5804 7.75753 17.5427C8.14807 17.9223 8.34334 18.1121 8.33832 18.1604C8.33587 18.1839 8.33206 18.1933 8.31739 18.2119C8.28737 18.25 8.05801 18.25 7.59942 18.25H7C3.82436 18.25 1.25 15.6757 1.25 12.5Z", fill: "currentColor" })
      ]
    })
  );
}

// components/ui/close-button.tsx
import { forwardRef } from "react";
import { jsx as jsx50, jsxs as jsxs34 } from "react/jsx-runtime";
var CloseButton = forwardRef(
  (_a, ref) => {
    var _b = _a, { className, iconClassName, label = "Close" } = _b, props = __objRest(_b, ["className", "iconClassName", "label"]);
    return /* @__PURE__ */ jsxs34(
      Button,
      __spreadProps(__spreadValues({
        ref,
        variant: "outline",
        size: "icon",
        radius: "full",
        type: "button",
        className: cn(
          "border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400",
          "hover:text-red-600 hover:border-red-300 hover:bg-red-50",
          "dark:hover:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-900/40",
          "active:scale-95 transition-all duration-200",
          className
        )
      }, props), {
        children: [
          /* @__PURE__ */ jsx50(CrossIcon, { className: cn("size-5 transition-colors text-inherit", iconClassName) }),
          /* @__PURE__ */ jsx50("span", { className: "sr-only", children: label })
        ]
      })
    );
  }
);
CloseButton.displayName = "CloseButton";

// components/cards/image-card.tsx
import { useState as useState4 } from "react";
import { jsx as jsx51, jsxs as jsxs35 } from "react/jsx-runtime";
function ImageCard({ file }) {
  var _a;
  const [hasError, setHasError] = useState4(false);
  const imageSrc = file.previewUrl || file.url;
  if (imageSrc && !hasError) {
    return /* @__PURE__ */ jsx51(
      "img",
      {
        src: imageSrc,
        alt: ((_a = file == null ? void 0 : file.name) == null ? void 0 : _a.substring(0, 10)) || "image",
        className: "w-full h-full object-contain rounded-md drop-shadow-md",
        onError: () => setHasError(true)
      }
    );
  }
  return /* @__PURE__ */ jsx51(ImageIcon, {});
}
function ImageCardMetadata({ file }) {
  if (!file.caption) return null;
  return /* @__PURE__ */ jsxs35("p", { className: "text-xs text-primary line-clamp-2 mb-2", children: [
    file.height,
    " x ",
    file.width
  ] });
}

// components/cards/video-card.tsx
import { useState as useState5 } from "react";
import { jsx as jsx52, jsxs as jsxs36 } from "react/jsx-runtime";
function VideoCard({ file, className }) {
  const [hasError, setHasError] = useState5(false);
  if (file.previewUrl && !hasError) {
    return /* @__PURE__ */ jsxs36("div", { className: "relative w-full h-full", children: [
      /* @__PURE__ */ jsx52(
        "img",
        {
          src: file.previewUrl,
          className: "w-full h-full object-contain rounded-md",
          alt: file.name,
          onError: () => setHasError(true)
        }
      ),
      /* @__PURE__ */ jsx52("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsx52("div", { className: "bg-black/60 rounded-full p-2 backdrop-blur-xs", children: /* @__PURE__ */ jsx52(PlayIcon, { className: "size-5 text-white fill-white" }) }) })
    ] });
  }
  if (file.url && !hasError) {
    return /* @__PURE__ */ jsxs36("div", { className: "relative w-full h-full", children: [
      /* @__PURE__ */ jsx52(
        "video",
        {
          src: `${file.url}#t=0.001`,
          className: "w-full h-full object-contain rounded-md",
          preload: "metadata",
          muted: true,
          playsInline: true,
          onError: () => setHasError(true)
        }
      ),
      /* @__PURE__ */ jsx52("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsx52("div", { className: "bg-black/60 rounded-full p-2 backdrop-blur-xs", children: /* @__PURE__ */ jsx52(PlayIcon, { className: "size-5 text-white fill-white" }) }) })
    ] });
  }
  return /* @__PURE__ */ jsx52("div", { className: "w-full h-full flex items-center justify-center bg-transparent", children: /* @__PURE__ */ jsx52("div", { className: "text-center", children: /* @__PURE__ */ jsx52("div", { className: "text-4xl", children: /* @__PURE__ */ jsx52(Icons, { type: "video", className }) }) }) });
}
function VideoCardMetadata({ file }) {
  var _a;
  if (!((_a = file.metaData) == null ? void 0 : _a.duration)) return null;
  return /* @__PURE__ */ jsxs36("p", { className: "text-xs text-primary mb-2", children: [
    "Duration: ",
    Math.floor(file.metaData.duration / 60),
    ":",
    (file.metaData.duration % 60).toString().padStart(2, "0")
  ] });
}

// components/cards/audio-card.tsx
import { jsx as jsx53, jsxs as jsxs37 } from "react/jsx-runtime";
function AudioCard({ file, className }) {
  return /* @__PURE__ */ jsx53("div", { className: "w-full h-full flex items-center justify-center bg-transparent", children: /* @__PURE__ */ jsx53("div", { className: "text-center", children: /* @__PURE__ */ jsx53("div", { className: "text-4xl", children: /* @__PURE__ */ jsx53(Icons, { type: "audio", className }) }) }) });
}
function AudioCardMetadata({ file }) {
  var _a;
  if (!((_a = file.metaData) == null ? void 0 : _a.duration)) return null;
  return /* @__PURE__ */ jsxs37("p", { className: "text-xs text-primary mb-2", children: [
    "Duration: ",
    Math.floor(file.metaData.duration / 60),
    ":",
    (file.metaData.duration % 60).toString().padStart(2, "0")
  ] });
}

// components/cards/document-card.tsx
import { jsx as jsx54, jsxs as jsxs38 } from "react/jsx-runtime";
function DocumentCard({ file, className }) {
  const iconType = getIconType(file.mime, file.ext);
  return /* @__PURE__ */ jsx54("div", { className: "w-full h-full flex items-center justify-center bg-transparent relative", children: file.previewUrl ? /* @__PURE__ */ jsx54(
    "img",
    {
      src: file.previewUrl,
      alt: file.name,
      className: "w-full h-full object-contain rounded-md drop-shadow-md"
    }
  ) : /* @__PURE__ */ jsx54("div", { className: "text-center", children: /* @__PURE__ */ jsx54("div", { className: "text-4xl", children: /* @__PURE__ */ jsx54(Icons, { type: iconType, className }) }) }) });
}
function DocumentCardMetadata({ file }) {
  var _a;
  if (!((_a = file.metaData) == null ? void 0 : _a.pageCount)) return null;
  return /* @__PURE__ */ jsxs38("p", { className: "text-xs text-primary mb-2", children: [
    "Pages: ",
    file.metaData.pageCount
  ] });
}

// components/cards/default-card.tsx
import { jsx as jsx55 } from "react/jsx-runtime";
function DefaultCard({ file }) {
  const iconType = getIconType(file.mime, file.ext);
  return /* @__PURE__ */ jsx55(Icons, { type: iconType });
}

// components/grid/file-component-registry.tsx
var FILE_COMPONENT_REGISTRY = {
  images: {
    component: ImageCard,
    metadataComponent: ImageCardMetadata
  },
  videos: {
    component: VideoCard,
    metadataComponent: VideoCardMetadata
  },
  files: {
    component: DocumentCard,
    metadataComponent: DocumentCardMetadata
  },
  audios: {
    component: AudioCard,
    metadataComponent: AudioCardMetadata
  },
  default: {
    component: DefaultCard
  }
};
function getFileComponents(file) {
  const type = getFileTypeFromMime(file.mime, file.ext);
  return FILE_COMPONENT_REGISTRY[type] || FILE_COMPONENT_REGISTRY.default;
}

// components/ui/kbd.tsx
import { jsx as jsx56 } from "react/jsx-runtime";
function Kbd(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx56(
    "kbd",
    __spreadValues({
      "data-slot": "kbd",
      className: cn(
        "bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none",
        "[&_svg:not([class*='size-'])]:size-3",
        "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        className
      )
    }, props)
  );
}
function KbdGroup(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx56("kbd", __spreadValues({ "data-slot": "kbd-group", className: cn("inline-flex items-center gap-1", className) }, props));
}

// components/modals/upload-modal.tsx
import { jsx as jsx57, jsxs as jsxs39 } from "react/jsx-runtime";
function UploadModal() {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadFiles,
    allowedFileTypes,
    maxUploadFiles,
    maxUploadSize
  } = useFileManager();
  const acceptString = fileTypesToAccept(allowedFileTypes);
  const fileTypesDescription = getFileTypesDescription(allowedFileTypes);
  const [uploadItems, setUploadItems] = useState6([]);
  const [
    { isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps
    }
  ] = useFileUpload({
    maxFiles: maxUploadFiles,
    maxSize: maxUploadSize,
    accept: acceptString,
    multiple: true,
    onFilesChange: (newFiles) => {
      const newUploadItems = newFiles.map((file) => {
        const existingFile = uploadItems.find((existing) => existing.id === file.id);
        if (existingFile) {
          return __spreadProps(__spreadValues(__spreadValues({}, existingFile), file), {
            file: file.file
          });
        } else {
          return __spreadProps(__spreadValues({}, file), {
            file: file.file,
            progress: 100,
            status: "completed"
          });
        }
      });
      setUploadItems(newUploadItems);
    }
  });
  const removeUploadFile = (fileId) => {
    removeFile(fileId);
  };
  const retryUpload = (fileId) => {
    setUploadItems(
      (prev) => prev.map(
        (file) => file.id === fileId ? __spreadProps(__spreadValues({}, file), { progress: 0, status: "uploading", error: void 0 }) : file
      )
    );
  };
  const handleUpload = () => {
    const completedFiles = uploadItems.filter((item) => item.status === "completed");
    if (completedFiles.length > 0) {
      const fileInputs = completedFiles.map((item) => ({
        name: item.file.name,
        size: item.file.size,
        type: getFileTypeFromMime(item.file.type, item.file.name.split(".").pop()),
        lastModified: item.file instanceof File ? item.file.lastModified : Date.now(),
        file: item.file,
        metadata: {}
      }));
      uploadFiles(fileInputs);
      handleClose();
    }
  };
  const handleClose = () => {
    setIsUploadModalOpen(false);
    clearFiles();
    setUploadItems([]);
  };
  const getFilePreviewComponent = (file, preview) => {
    const mockFileMetadata = {
      id: "temp",
      name: file.name,
      size: file.size,
      mime: file.type,
      ext: file.name.split(".").pop() || "",
      url: preview || "",
      // Use preview URL for images, empty for others
      createdAt: new Date(file.lastModified),
      updatedAt: new Date(file.lastModified),
      folderId: null,
      metaData: {}
    };
    const { component: FilePreviewComponent } = getFileComponents(mockFileMetadata);
    return /* @__PURE__ */ jsx57(FilePreviewComponent, { file: mockFileMetadata, metaData: mockFileMetadata.metaData });
  };
  const completedCount = uploadItems.filter((item) => item.status === "completed").length;
  const uploadingCount = uploadItems.filter((item) => item.status === "uploading").length;
  const canUpload = completedCount > 0 && uploadingCount === 0;
  return /* @__PURE__ */ jsx57(Dialog, { open: isUploadModalOpen, onOpenChange: setIsUploadModalOpen, children: /* @__PURE__ */ jsxs39(DialogContent, { className: "p-0 max-w-4xl max-h-[80vh] flex flex-col", variant: "default", showCloseButton: false, children: [
    /* @__PURE__ */ jsxs39(DialogHeader, { className: "pt-5 pb-3 m-0 border-b border-border", children: [
      /* @__PURE__ */ jsx57(DialogTitle, { className: "px-6 text-base", children: /* @__PURE__ */ jsxs39("div", { className: "flex w-full items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs39("span", { children: [
          "Upload Files",
          /* @__PURE__ */ jsx57(KbdGroup, { className: "ml-2", children: /* @__PURE__ */ jsxs39(Kbd, { children: [
            /* @__PURE__ */ jsx57("span", { className: "text-lg", children: "\u2318" }),
            " + U"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx57(CloseButton, { onClick: () => setIsUploadModalOpen(false) })
      ] }) }),
      /* @__PURE__ */ jsx57(DialogDescription, {})
    ] }),
    /* @__PURE__ */ jsxs39("div", { className: "p-6 overflow-y-auto flex-1", children: [
      /* @__PURE__ */ jsxs39(
        "div",
        {
          className: cn(
            "relative w-full rounded-xl border-2 border-dashed bg-muted border-muted-foreground/25 px-6 py-16 text-center transition-colors mb-4",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          ),
          onDragEnter: handleDragEnter,
          onDragLeave: handleDragLeave,
          onDragOver: handleDragOver,
          onDrop: handleDrop,
          children: [
            /* @__PURE__ */ jsx57("input", __spreadProps(__spreadValues({}, getInputProps()), { className: "sr-only" })),
            /* @__PURE__ */ jsxs39("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsx57(
                "div",
                {
                  className: cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                    isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
                  ),
                  children: /* @__PURE__ */ jsx57(UploadCloudIcon, { className: "mb-3 text-muted-foreground" })
                }
              ),
              /* @__PURE__ */ jsxs39("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs39("p", { className: "text-sm font-medium", children: [
                  "Drop files here or",
                  " ",
                  /* @__PURE__ */ jsx57(
                    "button",
                    {
                      type: "button",
                      onClick: openFileDialog,
                      className: "cursor-pointer text-primary underline-offset-4 underline",
                      children: "browse files"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs39("p", { className: "text-xs text-muted-foreground", children: [
                  fileTypesDescription,
                  " \u2022 Max size: ",
                  getFileSize(maxUploadSize),
                  " \u2022 Max files: ",
                  maxUploadFiles
                ] })
              ] })
            ] })
          ]
        }
      ),
      uploadItems.length > 0 && /* @__PURE__ */ jsx57("div", { className: "space-y-4", children: /* @__PURE__ */ jsx57("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4", children: uploadItems.map((fileItem) => /* @__PURE__ */ jsxs39("div", { className: "relative group", children: [
        /* @__PURE__ */ jsx57(
          CloseButton,
          {
            onClick: () => removeUploadFile(fileItem.id),
            className: "absolute -inset-e-2 -top-2 z-10 size-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100",
            iconClassName: "size-3"
          }
        ),
        /* @__PURE__ */ jsxs39("div", { className: "relative overflow-hidden rounded-lg border border-muted-foreground/25 bg-card transition-colors", children: [
          /* @__PURE__ */ jsx57("div", { className: "relative aspect-square bg-muted border-muted-foreground/25", children: /* @__PURE__ */ jsx57("div", { className: "flex h-full items-center justify-center p-4", children: /* @__PURE__ */ jsx57("div", { className: "w-[75%] h-[75%] flex items-center justify-center", children: fileItem.status === "uploading" ? /* @__PURE__ */ jsxs39("div", { className: "relative w-full h-full flex items-center justify-center", children: [
            /* @__PURE__ */ jsxs39("svg", { className: "size-12 -rotate-90 absolute", viewBox: "0 0 48 48", children: [
              /* @__PURE__ */ jsx57(
                "circle",
                {
                  cx: "24",
                  cy: "24",
                  r: "20",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "3",
                  className: "text-muted-foreground/20"
                }
              ),
              /* @__PURE__ */ jsx57(
                "circle",
                {
                  cx: "24",
                  cy: "24",
                  r: "20",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "3",
                  strokeDasharray: `${2 * Math.PI * 20}`,
                  strokeDashoffset: `${2 * Math.PI * 20 * (1 - fileItem.progress / 100)}`,
                  className: "text-primary transition-all duration-300",
                  strokeLinecap: "round"
                }
              )
            ] }),
            fileItem.file instanceof File && getFilePreviewComponent(fileItem.file, fileItem.preview)
          ] }) : fileItem.file instanceof File && getFilePreviewComponent(fileItem.file, fileItem.preview) }) }) }),
          /* @__PURE__ */ jsx57("div", { className: "p-3", children: /* @__PURE__ */ jsxs39("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx57("p", { className: "truncate text-xs font-medium", children: fileItem.file.name }),
            /* @__PURE__ */ jsxs39("div", { className: "relative flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsx57("span", { className: "text-[11px] text-primary font-semibold tracking-tight", children: getFileSize(fileItem.file.size) }),
              fileItem.status === "error" && fileItem.error && /* @__PURE__ */ jsxs39(Tooltip, { children: [
                /* @__PURE__ */ jsx57(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx57(
                  Button,
                  {
                    onClick: () => retryUpload(fileItem.id),
                    variant: "ghost",
                    size: "icon",
                    className: "absolute end-0 -top-1.25 size-6 text-destructive hover:bg-destructive/10 hover:text-destructive",
                    children: /* @__PURE__ */ jsx57(RefreshCwIcon, { className: "size-3 opacity-100" })
                  }
                ) }),
                /* @__PURE__ */ jsx57(TooltipContent, { children: "Upload failed. Retry" })
              ] })
            ] })
          ] }) })
        ] })
      ] }, fileItem.id)) }) }),
      errors.length > 0 && /* @__PURE__ */ jsxs39(Alert, { variant: "destructive", appearance: "light", className: "mt-5", children: [
        /* @__PURE__ */ jsx57(AlertIcon, { children: /* @__PURE__ */ jsx57(TriangleAlertIcon, {}) }),
        /* @__PURE__ */ jsxs39(AlertContent, { children: [
          /* @__PURE__ */ jsx57(AlertTitle, { children: "File upload error(s)" }),
          /* @__PURE__ */ jsx57(AlertDescription, { children: errors.map((error) => /* @__PURE__ */ jsx57("p", { className: "last:mb-0", children: error }, error)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs39(DialogFooter, { className: "px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ", children: [
      /* @__PURE__ */ jsx57(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx57(Button, { type: "button", radius: "full", variant: "outline", onClick: handleClose, className: "w-full md:w-auto", children: "Cancel" }) }),
      /* @__PURE__ */ jsxs39(Button, { type: "button", radius: "full", onClick: handleUpload, disabled: !canUpload, className: "w-full md:w-auto", children: [
        "Upload ",
        completedCount > 0 && `(${completedCount})`
      ] })
    ] })
  ] }) });
}

// components/modals/create-folder.tsx
import { useState as useState7 } from "react";

// components/ui/input.tsx
import { cva as cva4 } from "class-variance-authority";
import { jsx as jsx58 } from "react/jsx-runtime";
var inputVariants = cva4(
  `
    flex w-full bg-background border border-input shadow-xs shadow-black/5 transition-[color,box-shadow] text-foreground placeholder:text-muted-foreground/80 
    focus-visible:ring-ring/30  focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px]     
    disabled:cursor-not-allowed disabled:opacity-60 
    [&[readonly]]:bg-muted/80 [&[readonly]]:cursor-not-allowed
    file:h-full [&[type=file]]:py-0 file:border-solid file:border-input file:bg-transparent 
    file:font-medium file:not-italic file:text-foreground file:p-0 file:border-0 file:border-e
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
  `,
  {
    variants: {
      variant: {
        lg: "h-10 px-4 text-sm rounded-md file:pe-4 file:me-4",
        md: "h-9 px-3 text-sm rounded-md file:pe-3 file:me-3",
        sm: "h-8 px-2.5 text-xs rounded-md file:pe-2.5 file:me-2.5"
      }
    },
    defaultVariants: {
      variant: "md"
    }
  }
);
var inputAddonVariants = cva4(
  "flex items-center shrink-0 justify-center bg-muted border border-input shadow-xs shadow-[rgba(0,0,0,0.05)] text-secondary-foreground [&_svg]:text-secondary-foreground/60",
  {
    variants: {
      variant: {
        lg: "rounded-md h-10 min-w-10 px-4 text-sm [&_svg:not([class*=size-])]:size-4.5",
        md: "rounded-md h-9 min-w-9 px-3 text-sm [&_svg:not([class*=size-])]:size-4.5",
        sm: "rounded-md h-8 min-w-7 text-xs px-2.5 [&_svg:not([class*=size-])]:size-3.5"
      },
      mode: {
        default: "",
        icon: "px-0 justify-center"
      }
    },
    defaultVariants: {
      variant: "md",
      mode: "default"
    }
  }
);
var inputGroupVariants = cva4(
  `
    flex items-stretch
    [&_[data-slot=input]]:grow
    [&_[data-slot=input-addon]:has(+[data-slot=input])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=input])]:border-e-0
    [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:border-e-0 
    [&_[data-slot=input]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=input]+[data-slot=input-addon]]:border-s-0
    [&_[data-slot=input-addon]:has(+[data-slot=button])]:rounded-e-none
    [&_[data-slot=input]+[data-slot=button]]:rounded-s-none
    [&_[data-slot=button]+[data-slot=input]]:rounded-s-none
    [&_[data-slot=input-addon]+[data-slot=input]]:rounded-s-none
    [&_[data-slot=input-addon]+[data-slot=datefield]]:[&_[data-slot=input]]:rounded-s-none
    [&_[data-slot=datefield]:has(+[data-slot=input-addon])]:[&_[data-slot=input]]:rounded-e-none
    [&_[data-slot=input]:has(+[data-slot=button])]:rounded-e-none
    [&_[data-slot=input]:has(+[data-slot=input-addon])]:rounded-e-none
    [&_[data-slot=datefield]]:grow
    [&_[data-slot=datefield]+[data-slot=input-addon]]:rounded-s-none 
    [&_[data-slot=datefield]+[data-slot=input-addon]]:border-s-0
    [&_[data-slot=datefield]:has(~[data-slot=input-addon])]:[&_[data-slot=input]]:rounded-e-none
    [&_[data-slot=datefield]~[data-slot=input-addon]]:rounded-s-none
  `,
  {
    variants: {},
    defaultVariants: {}
  }
);
var inputWrapperVariants = cva4(
  `
    flex items-center gap-1.5
    has-[:focus-visible]:ring-ring/30 
    has-[:focus-visible]:border-ring
    has-[:focus-visible]:outline-none 
    has-[:focus-visible]:ring-[3px]

    [&_[data-slot=datefield]]:grow 
    [&_[data-slot=input]]:data-focus-within:ring-transparent  
    [&_[data-slot=input]]:data-focus-within:ring-0 
    [&_[data-slot=input]]:data-focus-within:border-0 
    [&_[data-slot=input]]:flex 
    [&_[data-slot=input]]:w-full 
    [&_[data-slot=input]]:outline-none 
    [&_[data-slot=input]]:transition-colors 
    [&_[data-slot=input]]:text-foreground
    [&_[data-slot=input]]:placeholder:text-muted-foreground 
    [&_[data-slot=input]]:border-0 
    [&_[data-slot=input]]:bg-transparent 
    [&_[data-slot=input]]:p-0
    [&_[data-slot=input]]:shadow-none 
    [&_[data-slot=input]]:focus-visible:ring-0 
    [&_[data-slot=input]]:h-auto 
    [&_[data-slot=input]]:disabled:cursor-not-allowed
    [&_[data-slot=input]]:disabled:opacity-50    

    [&_svg]:text-muted-foreground 
    [&_svg]:shrink-0

    has-[[aria-invalid=true]]:border-destructive/60 
    has-[[aria-invalid=true]]:ring-destructive/10 
    dark:has-[[aria-invalid=true]]:border-destructive 
    dark:has-[[aria-invalid=true]]:ring-destructive/20    
  `,
  {
    variants: {
      variant: {
        sm: "gap-1.25 [&_svg:not([class*=size-])]:size-3.5",
        md: "gap-1.5 [&_svg:not([class*=size-])]:size-4",
        lg: "gap-1.5 [&_svg:not([class*=size-])]:size-4"
      }
    },
    defaultVariants: {
      variant: "md"
    }
  }
);
function Input(_a) {
  var _b = _a, {
    className,
    type,
    variant
  } = _b, props = __objRest(_b, [
    "className",
    "type",
    "variant"
  ]);
  return /* @__PURE__ */ jsx58("input", __spreadValues({ "data-slot": "input", type, className: cn(inputVariants({ variant }), className) }, props));
}

// components/modals/create-folder.tsx
import { jsx as jsx59, jsxs as jsxs40 } from "react/jsx-runtime";
function CreateFolderModal() {
  const {
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    createFolder,
    renameFolder,
    folderToRename,
    setFolderToRename
  } = useFileManager();
  const [editedName, setEditedName] = useState7(null);
  const isRenameMode = isRenameFolderModalOpen;
  const isOpen = isCreateFolderModalOpen || isRenameFolderModalOpen;
  const defaultFolderName = isRenameMode && folderToRename ? folderToRename.name : "";
  const folderName = editedName != null ? editedName : defaultFolderName;
  const handleSubmit = async () => {
    if (folderName.trim() !== "") {
      if (isRenameMode && folderToRename) {
        const folderId = folderToRename.id;
        if (folderId !== null) {
          await renameFolder(folderId, folderName.trim());
        }
        setIsRenameFolderModalOpen(false);
        setFolderToRename(null);
      } else {
        createFolder(folderName.trim());
        setIsCreateFolderModalOpen(false);
      }
      setEditedName(null);
    }
  };
  const handleClose = () => {
    if (isRenameMode) {
      setIsRenameFolderModalOpen(false);
      setFolderToRename(null);
    } else {
      setIsCreateFolderModalOpen(false);
    }
    setEditedName(null);
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx59(Dialog, { open: isOpen, onOpenChange: handleClose, children: /* @__PURE__ */ jsxs40(DialogContent, { className: "p-0 max-w-xl m-auto max-h-[32vh] flex flex-col", variant: "fullscreen", showCloseButton: false, children: [
    /* @__PURE__ */ jsx59(DialogHeader, { className: "pt-5 pb-3 m-0 border-b border-border flex w-full justify-between", children: /* @__PURE__ */ jsx59(DialogTitle, { className: "px-6 text-base", children: /* @__PURE__ */ jsxs40("div", { className: "flex w-full items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs40("span", { children: [
        isRenameMode ? "Rename Folder" : "Create New Folder",
        !isRenameMode && /* @__PURE__ */ jsx59("span", { className: "ml-4", children: /* @__PURE__ */ jsx59(KbdGroup, { children: /* @__PURE__ */ jsxs40(Kbd, { children: [
          /* @__PURE__ */ jsx59("span", { className: "text-lg", children: "\u2318" }),
          " + F"
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsx59(CloseButton, { onClick: handleClose })
    ] }) }) }),
    /* @__PURE__ */ jsxs40("div", { className: "p-6", children: [
      /* @__PURE__ */ jsx59("label", { htmlFor: "folder-name", className: "hidden mb-2", children: "Folder Name:" }),
      /* @__PURE__ */ jsx59(
        Input,
        {
          id: "folder-name",
          name: "folder-name",
          value: folderName,
          onChange: (e) => setEditedName(e.target.value),
          placeholder: "Enter folder name",
          autoFocus: true,
          onKeyDown: (e) => {
            if (e.key === "Enter" && folderName.trim() !== "") {
              handleSubmit();
            }
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs40(DialogFooter, { className: "px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ", children: [
      /* @__PURE__ */ jsx59(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx59(Button, { type: "button", variant: "outline", onClick: handleClose, radius: "full", className: "w-full md:w-auto", children: "Cancel" }) }),
      /* @__PURE__ */ jsx59(
        Button,
        {
          type: "button",
          disabled: folderName.trim() === "",
          onClick: handleSubmit,
          radius: "full",
          className: "w-full md:w-auto",
          children: isRenameMode ? "Rename" : "Create"
        }
      )
    ] })
  ] }) });
}

// components/modals/move-modal.tsx
import { useState as useState9, useEffect as useEffect5, useCallback as useCallback5, useRef as useRef4 } from "react";

// lib/truncate-name.ts
function middleTruncate(text, maxLength = 30) {
  if (text.length <= maxLength) return text;
  const start = text.slice(0, Math.ceil(maxLength / 2));
  const end = text.slice(-Math.floor(maxLength / 2));
  return `${start}...${end}`;
}

// hooks/use-intersection-observer.ts
import { useEffect as useEffect4, useRef as useRef3, useState as useState8 } from "react";
function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0%"
} = {}) {
  const [entry, setEntry] = useState8();
  const [node, setNode] = useState8(null);
  const observer = useRef3(null);
  useEffect4(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
    if (node) {
      if (typeof globalThis !== "undefined" && "IntersectionObserver" in globalThis) {
        observer.current = new IntersectionObserver(
          ([newEntry]) => {
            setEntry(newEntry);
          },
          { threshold, root, rootMargin }
        );
        observer.current.observe(node);
      }
    }
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, threshold, root, rootMargin]);
  return { ref: setNode, entry };
}

// components/modals/move-modal.tsx
import { jsx as jsx60, jsxs as jsxs41 } from "react/jsx-runtime";
function FolderTreeItem({
  folder,
  selectedFolderId,
  onSelect,
  onLoadChildren,
  disabledFolderIds = [],
  treeState
}) {
  var _a;
  const [isOpen, setIsOpen] = useState9(false);
  const hasChildren = ((_a = folder.folderCount) != null ? _a : 0) > 0;
  const isSelected = selectedFolderId === folder.id;
  const isDisabled = disabledFolderIds.includes(folder.id);
  const isLoading = treeState.loading.has(folder.id);
  const isLoaded = treeState.loaded.has(folder.id);
  const children = treeState.folders.get(folder.id) || [];
  const pagination = treeState.pagination.get(folder.id);
  const { ref: observerRef, entry } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px"
  });
  const hasMore = pagination && pagination.currentPage < pagination.totalPages;
  useEffect5(() => {
    if (isOpen && (entry == null ? void 0 : entry.isIntersecting) && hasMore && !isLoading) {
      const nextPage = ((pagination == null ? void 0 : pagination.currentPage) || 1) + 1;
      onLoadChildren(folder.id, nextPage);
    }
  }, [entry == null ? void 0 : entry.isIntersecting, hasMore, isLoading, isOpen, pagination, folder.id, onLoadChildren]);
  const handleToggle = async () => {
    if (!hasChildren) return;
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && !isLoaded && !isLoading) {
      await onLoadChildren(folder.id, 1);
    }
  };
  const handleSelect = () => {
    if (!isDisabled) {
      onSelect(folder.id);
    }
  };
  const selectedClassName = "bg-blue-100 text-blue-600 dark:text-blue-400 font-semibold";
  const disabledClassName = "opacity-50 cursor-not-allowed";
  const defaultClassName = "hover:bg-gray-100 dark:hover:bg-zinc-700";
  let buttonClassName = defaultClassName;
  if (isSelected) {
    buttonClassName = selectedClassName;
  } else if (isDisabled) {
    buttonClassName = disabledClassName;
  }
  return /* @__PURE__ */ jsxs41("li", { children: [
    /* @__PURE__ */ jsxs41("div", { className: "flex items-center gap-1.5 py-1", children: [
      hasChildren ? /* @__PURE__ */ jsx60(
        "button",
        {
          onClick: handleToggle,
          className: "p-1 -m-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors",
          "aria-label": isOpen ? "Collapse folder" : "Expand folder",
          children: /* @__PURE__ */ jsx60(
            ChevronRightIcon,
            {
              className: `size-4 text-gray-500 dark:text-zinc-400 transition-transform ${!isDisabled && isOpen ? "rotate-90" : ""}`
            }
          )
        }
      ) : /* @__PURE__ */ jsx60("div", { className: "w-4" }),
      /* @__PURE__ */ jsxs41(
        "button",
        {
          onClick: handleSelect,
          disabled: isDisabled,
          title: folder.name,
          className: `flex items-center gap-1.5 px-2 py-1 rounded-xl flex-1 text-left transition-colors min-w-0 ${buttonClassName}`,
          children: [
            /* @__PURE__ */ jsx60(FolderIcon, { className: "size-8 text-white shrink-0", strokeWidth: 1.5 }),
            /* @__PURE__ */ jsxs41("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx60("span", { className: "truncate min-w-0", children: middleTruncate(folder.name, 15) }),
              isDisabled ? /* @__PURE__ */ jsx60("span", { className: "text-[0.6rem] text-left font-medium text-gray-900 dark:text-zinc-300", children: "(Already selected)" }) : ""
            ] })
          ]
        }
      )
    ] }),
    !isDisabled && isOpen && /* @__PURE__ */ jsxs41("ul", { className: "pl-6", children: [
      children.map((childFolder) => /* @__PURE__ */ jsx60(
        FolderTreeItem,
        {
          folder: childFolder,
          selectedFolderId,
          onSelect,
          onLoadChildren,
          disabledFolderIds,
          treeState
        },
        childFolder.id
      )),
      (isLoading || hasMore) && /* @__PURE__ */ jsx60("li", { ref: observerRef, className: "py-2 pl-6 flex justify-start", children: /* @__PURE__ */ jsx60(Loader2Icon, { className: "h-4 w-4 animate-spin text-blue-500" }) }),
      isLoading && children.length === 0 && /* @__PURE__ */ jsx60("li", { className: "py-1", children: /* @__PURE__ */ jsx60("div", { className: "flex items-center gap-1.5 px-2", children: /* @__PURE__ */ jsx60("span", { className: "text-sm text-gray-500 dark:text-zinc-400", children: "Loading..." }) }) })
    ] })
  ] });
}
function MoveModal() {
  const {
    isMoveFileModalOpen,
    setIsMoveFileModalOpen,
    selectedFiles,
    selectedFolders,
    bulkMove,
    provider
  } = useFileManager();
  const [targetFolderId, setTargetFolderId] = useState9(void 0);
  const [treeState, setTreeState] = useState9({
    folders: /* @__PURE__ */ new Map(),
    loading: /* @__PURE__ */ new Set(),
    loaded: /* @__PURE__ */ new Set(),
    pagination: /* @__PURE__ */ new Map()
  });
  const fetchingRef = useRef4(/* @__PURE__ */ new Set());
  const hasInitializedRef = useRef4(false);
  const { ref: rootObserverRef, entry: rootEntry } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px"
  });
  const rootPagination = treeState.pagination.get(null);
  const rootHasMore = rootPagination && rootPagination.currentPage < rootPagination.totalPages;
  const isRootLoading = treeState.loading.has(null);
  const disabledFolderIds = selectedFolders.map((f) => f.id);
  const rootFolders = treeState.folders.get(null) || [];
  const loadFolders = useCallback5(async (folderId, page = 1) => {
    if (fetchingRef.current.has(folderId)) return;
    fetchingRef.current.add(folderId);
    setTreeState((prev) => __spreadProps(__spreadValues({}, prev), {
      loading: new Set(prev.loading).add(folderId)
    }));
    try {
      const result = await provider.getFolders(folderId, page, 20);
      setTreeState((prev) => {
        const newLoading = new Set(prev.loading);
        newLoading.delete(folderId);
        const newLoaded = new Set(prev.loaded);
        newLoaded.add(folderId);
        const newFolders = new Map(prev.folders);
        const existingFolders = newFolders.get(folderId) || [];
        if (page > 1) {
          newFolders.set(folderId, [...existingFolders, ...result.folders]);
        } else {
          newFolders.set(folderId, result.folders);
        }
        const newPagination = new Map(prev.pagination);
        newPagination.set(folderId, result.pagination);
        return {
          folders: newFolders,
          loading: newLoading,
          loaded: newLoaded,
          pagination: newPagination
        };
      });
    } catch (error) {
      console.error(`Failed to load folders for ${folderId}:`, error);
      setTreeState((prev) => {
        const newLoading = new Set(prev.loading);
        newLoading.delete(folderId);
        return __spreadProps(__spreadValues({}, prev), { loading: newLoading });
      });
    } finally {
      fetchingRef.current.delete(folderId);
    }
  }, [provider]);
  useEffect5(() => {
    if (isMoveFileModalOpen) {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        loadFolders(null, 1);
      }
    } else {
      hasInitializedRef.current = false;
    }
  }, [isMoveFileModalOpen, loadFolders]);
  useEffect5(() => {
    if (isMoveFileModalOpen && (rootEntry == null ? void 0 : rootEntry.isIntersecting) && rootHasMore && !isRootLoading) {
      const nextPage = ((rootPagination == null ? void 0 : rootPagination.currentPage) || 1) + 1;
      loadFolders(null, nextPage);
    }
  }, [isMoveFileModalOpen, rootEntry == null ? void 0 : rootEntry.isIntersecting, rootHasMore, isRootLoading, rootPagination, loadFolders]);
  const handleMove = () => {
    if (targetFolderId !== void 0) {
      bulkMove(targetFolderId);
      setIsMoveFileModalOpen(false);
      setTargetFolderId(void 0);
      setTreeState({
        folders: /* @__PURE__ */ new Map(),
        loading: /* @__PURE__ */ new Set(),
        loaded: /* @__PURE__ */ new Set(),
        pagination: /* @__PURE__ */ new Map()
      });
    }
  };
  const handleOpenChange = (open) => {
    setIsMoveFileModalOpen(open);
    if (!open) {
      setTargetFolderId(void 0);
      setTreeState({
        folders: /* @__PURE__ */ new Map(),
        loading: /* @__PURE__ */ new Set(),
        loaded: /* @__PURE__ */ new Set(),
        pagination: /* @__PURE__ */ new Map()
      });
      fetchingRef.current.clear();
    }
  };
  if (!isMoveFileModalOpen) return null;
  return /* @__PURE__ */ jsx60(Dialog, { open: isMoveFileModalOpen, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxs41(DialogContent, { className: "p-0 max-w-3xl max-h-full m-auto md:max-h-[80vh] flex flex-col", variant: "fullscreen", showCloseButton: false, children: [
    /* @__PURE__ */ jsxs41(DialogHeader, { className: "pt-5 pb-3 m-0 border-b border-border", children: [
      /* @__PURE__ */ jsx60(DialogTitle, { className: "px-6 text-base", children: /* @__PURE__ */ jsxs41("div", { className: "flex w-full items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs41("span", { className: "w-full text-left", children: [
          "Move Items",
          /* @__PURE__ */ jsxs41("p", { className: "text-gray-400 text-xs", children: [
            "Moving ",
            selectedFiles.length,
            " file",
            selectedFiles.length === 1 ? "" : "s",
            " and",
            " ",
            selectedFolders.length,
            " folder",
            selectedFolders.length === 1 ? "" : "s",
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsx60(CloseButton, { onClick: () => handleOpenChange(false) })
      ] }) }),
      /* @__PURE__ */ jsx60(DialogDescription, {})
    ] }),
    /* @__PURE__ */ jsx60("div", { className: "text-sm my-3 px-6 flex-1 flex flex-col min-h-0", children: /* @__PURE__ */ jsx60("div", { className: "space-y-4 flex flex-col flex-1 min-h-0", children: /* @__PURE__ */ jsxs41("div", { className: "flex flex-col flex-1 min-h-0", children: [
      /* @__PURE__ */ jsx60("label", { htmlFor: "destination-folder", className: "block mb-2 font-medium text-gray-900 dark:text-zinc-100", children: "Select destination folder:" }),
      /* @__PURE__ */ jsxs41("ul", { id: "destination-folder", className: "border rounded-xl p-2 shadow-inner overflow-y-auto flex-1 min-h-0", children: [
        /* @__PURE__ */ jsx60("li", { children: /* @__PURE__ */ jsxs41("div", { className: "flex items-center gap-1.5 py-1", children: [
          /* @__PURE__ */ jsx60("div", { className: "w-4" }),
          /* @__PURE__ */ jsxs41(
            "button",
            {
              onClick: () => setTargetFolderId(null),
              className: `flex items-center gap-1.5 px-2 py-1 rounded-xl flex-1 text-left transition-colors min-w-0 ${targetFolderId === null ? "bg-blue-100 text-blue-600 dark:text-blue-400 font-semibold" : "hover:bg-gray-100 dark:hover:bg-zinc-700"}`,
              children: [
                /* @__PURE__ */ jsx60(FolderIcon, { className: "size-8 text-white shrink-0", strokeWidth: 1.5 }),
                /* @__PURE__ */ jsx60("div", { className: "flex flex-col gap-1", children: /* @__PURE__ */ jsx60("span", { className: "truncate min-w-0", children: "Root Directory" }) })
              ]
            }
          )
        ] }) }),
        rootFolders.map((folder) => /* @__PURE__ */ jsx60(
          FolderTreeItem,
          {
            folder,
            selectedFolderId: targetFolderId,
            onSelect: (id) => setTargetFolderId(id),
            onLoadChildren: loadFolders,
            disabledFolderIds,
            treeState
          },
          folder.id
        )),
        (isRootLoading || rootHasMore) && /* @__PURE__ */ jsx60("li", { ref: rootObserverRef, className: "py-2 pl-6 flex justify-start", children: /* @__PURE__ */ jsx60(Loader2Icon, { className: "h-5 w-5 animate-spin text-blue-500" }) }),
        rootFolders.length === 0 && !isRootLoading && !rootHasMore && /* @__PURE__ */ jsx60("li", { className: "text-gray-500 dark:text-zinc-400 text-sm text-center py-4", children: "No nested folders available" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs41(DialogFooter, { className: "px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ", children: [
      /* @__PURE__ */ jsx60(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx60(Button, { type: "button", variant: "outline", radius: "full", className: "w-full md:w-auto", children: "Cancel" }) }),
      /* @__PURE__ */ jsx60(Button, { type: "button", onClick: handleMove, disabled: targetFolderId === void 0, radius: "full", className: "w-full md:w-auto", children: "Move" })
    ] })
  ] }) });
}

// components/modals/image-modal.tsx
import { useState as useState11 } from "react";

// components/file-details/details-layout.tsx
import { jsx as jsx61, jsxs as jsxs42 } from "react/jsx-runtime";
function DetailsLayout({
  title,
  open,
  onClose,
  previewSection,
  metadataSection,
  footer
}) {
  return /* @__PURE__ */ jsx61(Dialog, { open, onOpenChange: (isOpen) => !isOpen && onClose(), children: /* @__PURE__ */ jsxs42(
    DialogContent,
    {
      className: "p-0 max-w-6xl w-full m-auto h-[80vh] flex flex-col overflow-hidden",
      variant: "fullscreen",
      showCloseButton: false,
      children: [
        /* @__PURE__ */ jsxs42(DialogHeader, { className: "pt-5 pb-3 border-b border-border shrink-0", children: [
          /* @__PURE__ */ jsx61(DialogTitle, { className: "px-6 text-base", children: /* @__PURE__ */ jsxs42("div", { className: "flex w-full items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsx61("span", { className: "truncate", children: title }),
            /* @__PURE__ */ jsx61(CloseButton, { onClick: onClose })
          ] }) }),
          /* @__PURE__ */ jsx61(DialogDescription, {})
        ] }),
        /* @__PURE__ */ jsx61("div", { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxs42("div", { className: "grid grid-cols-1 lg:grid-cols-2 h-full", children: [
          /* @__PURE__ */ jsx61("div", { className: "p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-700 overflow-auto", children: previewSection }),
          /* @__PURE__ */ jsx61("div", { className: "p-6 overflow-auto", children: metadataSection })
        ] }) }),
        /* @__PURE__ */ jsx61(DialogFooter, { className: "px-6 py-4 border-t border-border shrink-0", children: footer })
      ]
    }
  ) });
}

// components/file-details/file-action-buttons.tsx
import { toast as toast3 } from "sonner";
import { useState as useState10 } from "react";
import { jsx as jsx62 } from "react/jsx-runtime";
function FileDeleteButton({ file }) {
  const { provider, setFileDetailsModalFile, refreshData } = useFileManager();
  const [deleting, setDeleting] = useState10(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await provider.deleteFiles([file.id]);
      await refreshData();
      setFileDetailsModalFile(null);
      toast3.success("File Deleted", {
        description: `${middleTruncate(file.name, 20)} has been deleted`
      });
    } catch (e) {
      toast3.error("Delete failed");
      setDeleting(false);
    }
  };
  return /* @__PURE__ */ jsx62(
    Button,
    {
      variant: "outline",
      size: "icon",
      radius: "full",
      title: "Delete",
      className: "border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 active:scale-95 transition-all duration-200",
      onClick: handleDelete,
      disabled: deleting,
      children: deleting ? /* @__PURE__ */ jsx62(Loader2Icon, { className: "size-5 animate-spin" }) : /* @__PURE__ */ jsx62(TrashIcon, { className: "size-5" })
    }
  );
}
function FileDownloadButton({ file }) {
  const [downloading, setDownloading] = useState10(false);
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.click();
      toast3.success("Download Started", {
        description: `Downloading ${middleTruncate(file.name, 20)}`
      });
    } catch (e) {
      toast3.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };
  return /* @__PURE__ */ jsx62(
    Button,
    {
      variant: "outline",
      size: "icon",
      radius: "full",
      onClick: handleDownload,
      className: "border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 active:scale-95 transition-all duration-200",
      title: "Download",
      disabled: downloading,
      children: downloading ? /* @__PURE__ */ jsx62(Loader2Icon, { className: "size-5 animate-spin" }) : /* @__PURE__ */ jsx62(DownloadIcon, { className: "size-5", strokeWidth: 2.5 })
    }
  );
}
function FileCopyLinkButton({ file }) {
  const [copied, setCopied] = useState10(false);
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(file.url);
      setCopied(true);
      toast3.success("Link Copied", {
        description: "File URL copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2e3);
    } catch (e) {
      toast3.error("Failed to copy link");
    }
  };
  return /* @__PURE__ */ jsx62(
    Button,
    {
      variant: "outline",
      size: "icon",
      radius: "full",
      onClick: handleCopyLink,
      className: `border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 active:scale-95 transition-all duration-200
      ${copied ? "text-green-700 dark:text-green-400 border-green-400 dark:border-green-700 bg-green-100 dark:bg-green-900/40 font-bold" : "hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/40"}`,
      title: "Copy Link",
      disabled: copied,
      children: copied ? /* @__PURE__ */ jsx62(CheckIcon, { className: "size-5 animate-in zoom-in duration-200", strokeWidth: 3 }) : /* @__PURE__ */ jsx62(LinkIcon, { className: "size-5", strokeWidth: 2.5 })
    }
  );
}
function FileFullscreenButton({ onFullscreen }) {
  return /* @__PURE__ */ jsx62(
    Button,
    {
      variant: "outline",
      size: "icon",
      radius: "full",
      onClick: onFullscreen,
      className: "border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/40 active:scale-95 transition-all duration-200",
      title: "Fullscreen",
      children: /* @__PURE__ */ jsx62(FullscreenIcon, { className: "size-5", strokeWidth: 1 })
    }
  );
}

// components/ui/textarea.tsx
import { cva as cva5 } from "class-variance-authority";
import { jsx as jsx63 } from "react/jsx-runtime";
var textareaVariants = cva5(
  `
    w-full bg-background border border-input bg-background text-foreground shadow-xs shadow-black/5 transition-[color,box-shadow] 
    text-foreground placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] 
    focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 [&[readonly]]:opacity-70 
    aria-invalid:border-destructive aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
  `,
  {
    variants: {
      variant: {
        sm: "px-2.5 py-2.5 text-xs rounded-md",
        md: "px-3 py-3 text-sm rounded-md",
        lg: "px-4 py-4 text-sm rounded-md"
      }
    },
    defaultVariants: {
      variant: "md"
    }
  }
);
function Textarea(_a) {
  var _b = _a, {
    className,
    variant
  } = _b, props = __objRest(_b, [
    "className",
    "variant"
  ]);
  return /* @__PURE__ */ jsx63("textarea", __spreadValues({ "data-slot": "textarea", className: cn(textareaVariants({ variant }), className) }, props));
}

// components/ui/label.tsx
import { cva as cva6 } from "class-variance-authority";
import { Label as LabelPrimitive } from "radix-ui";
import { jsx as jsx64 } from "react/jsx-runtime";
var labelVariants = cva6(
  "text-sm leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "font-medium",
        secondary: "font-normal"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);
function Label(_a) {
  var _b = _a, {
    className,
    variant
  } = _b, props = __objRest(_b, [
    "className",
    "variant"
  ]);
  return /* @__PURE__ */ jsx64(LabelPrimitive.Root, __spreadValues({ "data-slot": "label", className: cn(labelVariants({ variant }), className) }, props));
}

// lib/format-utils.ts
function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// components/ui/field.tsx
import { useMemo as useMemo4 } from "react";
import { cva as cva7 } from "class-variance-authority";
import { jsx as jsx65, jsxs as jsxs43 } from "react/jsx-runtime";
var fieldVariants = cva7(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
        ],
        responsive: [
          "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
        ]
      }
    },
    defaultVariants: {
      orientation: "vertical"
    }
  }
);
function Field(_a) {
  var _b = _a, {
    className,
    orientation = "vertical"
  } = _b, props = __objRest(_b, [
    "className",
    "orientation"
  ]);
  return /* @__PURE__ */ jsx65(
    "div",
    __spreadValues({
      role: "group",
      "data-slot": "field",
      "data-orientation": orientation,
      className: cn(fieldVariants({ orientation }), className)
    }, props)
  );
}
function FieldLabel(_a) {
  var _b = _a, {
    className
  } = _b, props = __objRest(_b, [
    "className"
  ]);
  return /* @__PURE__ */ jsx65(
    Label,
    __spreadValues({
      "data-slot": "field-label",
      className: cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
        className
      )
    }, props)
  );
}

// components/ui/input-group.tsx
import { cva as cva8 } from "class-variance-authority";
import { jsx as jsx66 } from "react/jsx-runtime";
function InputGroup(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx66(
    "div",
    __spreadValues({
      "data-slot": "input-group",
      role: "group",
      className: cn(
        "group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
        "h-9 min-w-0 has-[>textarea]:h-auto",
        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",
        // Error state.
        "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
        className
      )
    }, props)
  );
}
var inputGroupAddonVariants = cva8(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end": "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start": "order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
        "block-end": "order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5"
      }
    },
    defaultVariants: {
      align: "inline-start"
    }
  }
);
function InputGroupAddon(_a) {
  var _b = _a, {
    className,
    align = "inline-start"
  } = _b, props = __objRest(_b, [
    "className",
    "align"
  ]);
  return /* @__PURE__ */ jsx66(
    "div",
    __spreadValues({
      role: "group",
      "data-slot": "input-group-addon",
      "data-align": align,
      className: cn(inputGroupAddonVariants({ align }), className),
      onClick: (e) => {
        var _a2, _b2;
        if (e.target.closest("button")) {
          return;
        }
        (_b2 = (_a2 = e.currentTarget.parentElement) == null ? void 0 : _a2.querySelector("input")) == null ? void 0 : _b2.focus();
      }
    }, props)
  );
}
var inputGroupButtonVariants = cva8(
  "text-sm shadow-none flex gap-2 items-center",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 px-2 rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
        sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
        "icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0"
      }
    },
    defaultVariants: {
      size: "xs"
    }
  }
);
function InputGroupText(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx66(
    "span",
    __spreadValues({
      className: cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )
    }, props)
  );
}
function InputGroupInput(_a) {
  var _b = _a, {
    className
  } = _b, props = __objRest(_b, [
    "className"
  ]);
  return /* @__PURE__ */ jsx66(
    Input,
    __spreadValues({
      "data-slot": "input-group-control",
      className: cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )
    }, props)
  );
}

// components/modals/image-modal.tsx
import { jsx as jsx67, jsxs as jsxs44 } from "react/jsx-runtime";
function ImageModal({ file, onClose, onSave }) {
  var _a;
  const [isSaving, setIsSaving] = useState11(false);
  const [fileName, setFileName] = useState11(file.name);
  const [alternativeText, setAlternativeText] = useState11(file.alternativeText || "");
  const [caption, setCaption] = useState11(file.caption || "");
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await (onSave == null ? void 0 : onSave({
        name: fileName,
        alternativeText,
        caption
      }));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };
  const previewSection = /* @__PURE__ */ jsxs44("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs44("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsx67(FileDeleteButton, { file }),
      /* @__PURE__ */ jsx67(FileDownloadButton, { file }),
      /* @__PURE__ */ jsx67(FileCopyLinkButton, { file }),
      /* @__PURE__ */ jsx67(FileFullscreenButton, { onFullscreen: () => window.open(file.url, "_blank") })
    ] }),
    /* @__PURE__ */ jsx67(
      "div",
      {
        className: "flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden",
        style: {
          backgroundImage: `
            linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
        },
        children: /* @__PURE__ */ jsx67(
          "img",
          {
            src: file.previewUrl || file.url,
            alt: file.alternativeText || file.name,
            className: "max-w-full max-h-full object-contain"
          }
        )
      }
    )
  ] });
  const metadataSection = /* @__PURE__ */ jsxs44("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs44("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs44("div", { children: [
        /* @__PURE__ */ jsx67("p", { className: "text-xs font-medium text-muted-foreground tracking-wide mb-1", children: "Size" }),
        /* @__PURE__ */ jsx67("p", { className: "text-xs font-bold text-primary", children: getFileSize(file.size) })
      ] }),
      /* @__PURE__ */ jsxs44("div", { children: [
        /* @__PURE__ */ jsx67("p", { className: "text-xs font-medium text-muted-foreground  tracking-wide mb-1", children: "Dimensions" }),
        /* @__PURE__ */ jsx67("p", { className: "text-xs font-bold text-primary", children: file.width && file.height ? `${file.width}\xD7${file.height}` : "N/A" })
      ] }),
      /* @__PURE__ */ jsxs44("div", { children: [
        /* @__PURE__ */ jsx67("p", { className: "text-xs font-medium text-muted-foreground  tracking-wide mb-1", children: "Date" }),
        /* @__PURE__ */ jsx67("p", { className: "text-xs font-bold text-primary", children: formatDate(file.createdAt) })
      ] }),
      /* @__PURE__ */ jsxs44("div", { children: [
        /* @__PURE__ */ jsx67("p", { className: "text-xs font-medium text-muted-foreground  tracking-wide mb-1", children: "Extension" }),
        /* @__PURE__ */ jsx67("p", { className: "text-xs font-bold text-primary", children: ((_a = file.ext) == null ? void 0 : _a.replace(".", "")) || "N/A" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs44("div", { className: "space-y-4 pt-4 border-t border-border", children: [
      /* @__PURE__ */ jsx67("div", { className: "space-y-2", children: /* @__PURE__ */ jsxs44(Field, { className: "gap-0", children: [
        /* @__PURE__ */ jsx67(FieldLabel, { htmlFor: "fileName", children: "File name" }),
        /* @__PURE__ */ jsxs44(InputGroup, { children: [
          /* @__PURE__ */ jsx67(InputGroupInput, { id: "fileName", placeholder: "Enter file name", value: fileName.replace(file.ext || "", ""), onChange: (e) => setFileName(e.target.value) }),
          /* @__PURE__ */ jsx67(InputGroupAddon, { align: "inline-end", className: "pr-1", children: /* @__PURE__ */ jsx67(InputGroupText, { className: "font-bold bg-accent rounded-lg py-1 px-3", children: file.ext }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs44("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx67(Label, { htmlFor: "altText", children: "Alternative text" }),
        /* @__PURE__ */ jsx67(
          Textarea,
          {
            id: "altText",
            value: alternativeText,
            onChange: (e) => setAlternativeText(e.target.value),
            placeholder: "Describe the image for accessibility",
            rows: 3
          }
        ),
        /* @__PURE__ */ jsx67("p", { className: "text-xs text-muted-foreground", children: "This text will be displayed if the asset can't be shown." })
      ] }),
      /* @__PURE__ */ jsxs44("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx67(Label, { htmlFor: "caption", children: "Caption" }),
        /* @__PURE__ */ jsx67(
          Textarea,
          {
            id: "caption",
            value: caption,
            onChange: (e) => setCaption(e.target.value),
            placeholder: "Add a caption",
            rows: 3
          }
        )
      ] })
    ] })
  ] });
  const footer = /* @__PURE__ */ jsxs44("div", { className: "flex w-full justify-between items-center flex-col sm:flex-row gap-2 ", children: [
    /* @__PURE__ */ jsx67(Button, { className: "w-full md:w-auto", variant: "outline", onClick: onClose, radius: "full", disabled: isSaving, children: "Cancel" }),
    /* @__PURE__ */ jsxs44(Button, { className: "w-full md:w-auto", onClick: handleSave, radius: "full", disabled: isSaving, children: [
      isSaving && /* @__PURE__ */ jsx67(Loader2Icon, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Finish"
    ] })
  ] });
  return /* @__PURE__ */ jsx67(
    DetailsLayout,
    {
      title: "Details",
      open: true,
      onClose,
      previewSection,
      metadataSection,
      footer
    }
  );
}

// components/modals/video-modal.tsx
import { useState as useState12 } from "react";
import { jsx as jsx68, jsxs as jsxs45 } from "react/jsx-runtime";
function VideoModal({ file, onClose, onSave }) {
  var _a, _b, _c;
  const [isSaving, setIsSaving] = useState12(false);
  const [fileName, setFileName] = useState12(file.name);
  const [caption, setCaption] = useState12(file.caption || "");
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await (onSave == null ? void 0 : onSave({
        name: fileName,
        caption
      }));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };
  const previewSection = /* @__PURE__ */ jsxs45("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs45("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsx68(FileDeleteButton, { file }),
      /* @__PURE__ */ jsx68(FileDownloadButton, { file }),
      /* @__PURE__ */ jsx68(FileCopyLinkButton, { file })
    ] }),
    /* @__PURE__ */ jsx68("div", { className: "flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx68(
      "video",
      {
        src: file.url,
        controls: true,
        className: "max-w-full max-h-full",
        style: { maxHeight: "500px" },
        children: "Your browser does not support the video tag."
      }
    ) })
  ] });
  const metadataSection = /* @__PURE__ */ jsxs45("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs45("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs45("div", { children: [
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Size" }),
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-bold text-primary", children: getFileSize(file.size) })
      ] }),
      /* @__PURE__ */ jsxs45("div", { children: [
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Dimensions" }),
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-bold text-primary", children: file.width && file.height ? `${file.width}\xD7${file.height}` : "N/A" })
      ] }),
      /* @__PURE__ */ jsxs45("div", { children: [
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Duration" }),
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-bold text-primary", children: ((_a = file.metaData) == null ? void 0 : _a.duration) ? formatDuration(file.metaData.duration) : "N/A" })
      ] }),
      /* @__PURE__ */ jsxs45("div", { children: [
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Date" }),
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-bold text-primary", children: formatDate(file.createdAt) })
      ] }),
      /* @__PURE__ */ jsxs45("div", { children: [
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Extension" }),
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-bold text-primary", children: ((_b = file.ext) == null ? void 0 : _b.replace(".", "")) || "N/A" })
      ] }),
      /* @__PURE__ */ jsxs45("div", { children: [
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Video Source" }),
        /* @__PURE__ */ jsx68("p", { className: "text-xs font-bold text-primary capitalize", children: ((_c = file.metaData) == null ? void 0 : _c.videoSource) || "local" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs45("div", { className: "space-y-4 pt-4 border-t border-border", children: [
      /* @__PURE__ */ jsx68("div", { className: "space-y-2", children: /* @__PURE__ */ jsxs45(Field, { className: "gap-0", children: [
        /* @__PURE__ */ jsx68(FieldLabel, { htmlFor: "fileName", children: "File name" }),
        /* @__PURE__ */ jsxs45(InputGroup, { children: [
          /* @__PURE__ */ jsx68(InputGroupInput, { id: "fileName", placeholder: "Enter file name", value: fileName.replace(file.ext || "", ""), onChange: (e) => setFileName(e.target.value) }),
          /* @__PURE__ */ jsx68(InputGroupAddon, { align: "inline-end", className: "pr-1", children: /* @__PURE__ */ jsx68(InputGroupText, { className: "font-bold bg-accent rounded-lg py-1 px-3", children: file.ext }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs45("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx68(Label, { htmlFor: "caption", children: "Caption" }),
        /* @__PURE__ */ jsx68(
          Textarea,
          {
            id: "caption",
            value: caption,
            onChange: (e) => setCaption(e.target.value),
            placeholder: "Add a caption",
            rows: 3
          }
        )
      ] })
    ] })
  ] });
  const footer = /* @__PURE__ */ jsxs45("div", { className: "flex w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2 ", children: [
    /* @__PURE__ */ jsx68(Button, { variant: "outline", onClick: onClose, radius: "full", className: "w-full md:w-auto", disabled: isSaving, children: "Cancel" }),
    /* @__PURE__ */ jsxs45(Button, { onClick: handleSave, radius: "full", className: "w-full md:w-auto", disabled: isSaving, children: [
      isSaving && /* @__PURE__ */ jsx68(Loader2Icon, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Finish"
    ] })
  ] });
  return /* @__PURE__ */ jsx68(
    DetailsLayout,
    {
      title: "Details",
      open: true,
      onClose,
      previewSection,
      metadataSection,
      footer
    }
  );
}

// components/modals/audio-modal.tsx
import { useState as useState13 } from "react";
import { jsx as jsx69, jsxs as jsxs46 } from "react/jsx-runtime";
function AudioModal({ file, onClose, onSave }) {
  var _a, _b, _c;
  const [isSaving, setIsSaving] = useState13(false);
  const [fileName, setFileName] = useState13(file.name);
  const [caption, setCaption] = useState13(file.caption || "");
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await (onSave == null ? void 0 : onSave({
        name: fileName,
        caption
      }));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };
  const previewSection = /* @__PURE__ */ jsxs46("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs46("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsx69(FileDeleteButton, { file }),
      /* @__PURE__ */ jsx69(FileDownloadButton, { file }),
      /* @__PURE__ */ jsx69(FileCopyLinkButton, { file })
    ] }),
    /* @__PURE__ */ jsxs46("div", { className: "flex-1 flex flex-col items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-8", children: [
      /* @__PURE__ */ jsx69("div", { className: "mb-8", children: /* @__PURE__ */ jsx69("div", { className: "w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center", children: /* @__PURE__ */ jsx69(MusicIcon, { className: "w-16 h-16 text-purple-600 dark:text-purple-400" }) }) }),
      /* @__PURE__ */ jsx69("div", { className: "w-full max-w-md", children: /* @__PURE__ */ jsxs46(
        "audio",
        {
          src: file.url,
          controls: true,
          className: "w-full",
          children: [
            /* @__PURE__ */ jsx69("track", { kind: "captions", srcLang: "en", label: "English" }),
            "Your browser does not support the audio tag."
          ]
        }
      ) })
    ] })
  ] });
  const metadataSection = /* @__PURE__ */ jsxs46("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs46("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs46("div", { children: [
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Size" }),
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-bold text-primary", children: getFileSize(file.size) })
      ] }),
      /* @__PURE__ */ jsxs46("div", { children: [
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Duration" }),
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-bold text-primary", children: ((_a = file.metaData) == null ? void 0 : _a.duration) ? formatDuration(file.metaData.duration) : "N/A" })
      ] }),
      /* @__PURE__ */ jsxs46("div", { children: [
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Bitrate" }),
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-bold text-primary", children: ((_b = file.metaData) == null ? void 0 : _b.bitrate) ? `${file.metaData.bitrate} kbps` : "N/A" })
      ] }),
      /* @__PURE__ */ jsxs46("div", { children: [
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Date" }),
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-bold text-primary", children: formatDate(file.createdAt) })
      ] }),
      /* @__PURE__ */ jsxs46("div", { children: [
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Extension" }),
        /* @__PURE__ */ jsx69("p", { className: "text-xs font-bold text-primary", children: ((_c = file.ext) == null ? void 0 : _c.replace(".", "")) || "N/A" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs46("div", { className: "space-y-4 pt-4 border-t border-border", children: [
      /* @__PURE__ */ jsx69("div", { className: "space-y-2", children: /* @__PURE__ */ jsxs46(Field, { className: "gap-0", children: [
        /* @__PURE__ */ jsx69(FieldLabel, { htmlFor: "fileName", children: "File name" }),
        /* @__PURE__ */ jsxs46(InputGroup, { children: [
          /* @__PURE__ */ jsx69(InputGroupInput, { id: "fileName", placeholder: "Enter file name", value: fileName.replace(file.ext || "", ""), onChange: (e) => setFileName(e.target.value) }),
          /* @__PURE__ */ jsx69(InputGroupAddon, { align: "inline-end", className: "pr-1", children: /* @__PURE__ */ jsx69(InputGroupText, { className: "font-bold bg-accent rounded-lg py-1 px-3", children: file.ext }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs46("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx69(Label, { htmlFor: "caption", children: "Caption" }),
        /* @__PURE__ */ jsx69(
          Textarea,
          {
            id: "caption",
            value: caption,
            onChange: (e) => setCaption(e.target.value),
            placeholder: "Add a caption",
            rows: 3
          }
        )
      ] })
    ] })
  ] });
  const footer = /* @__PURE__ */ jsxs46("div", { className: "flex gap-2 w-full sm:justify-between justify-center items-center flex-col sm:flex-row ", children: [
    /* @__PURE__ */ jsx69(Button, { variant: "outline", onClick: onClose, radius: "full", className: "w-full md:w-auto", disabled: isSaving, children: "Cancel" }),
    /* @__PURE__ */ jsxs46(Button, { onClick: handleSave, radius: "full", className: "w-full md:w-auto", disabled: isSaving, children: [
      isSaving && /* @__PURE__ */ jsx69(Loader2Icon, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Finish"
    ] })
  ] });
  return /* @__PURE__ */ jsx69(
    DetailsLayout,
    {
      title: "Details",
      open: true,
      onClose,
      previewSection,
      metadataSection,
      footer
    }
  );
}

// components/modals/file-modal.tsx
import { useState as useState14 } from "react";
import { jsx as jsx70, jsxs as jsxs47 } from "react/jsx-runtime";
function FileModal({ file, onClose, onSave }) {
  var _a, _b, _c, _d;
  const [isSaving, setIsSaving] = useState14(false);
  const [fileName, setFileName] = useState14(file.name);
  const [description, setDescription] = useState14(((_a = file.metaData) == null ? void 0 : _a.description) || "");
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await (onSave == null ? void 0 : onSave({
        name: fileName,
        metaData: __spreadProps(__spreadValues({}, file.metaData), {
          description
        })
      }));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };
  const ext = ((_b = file.ext) == null ? void 0 : _b.replace(".", "")) || "file";
  const { component: FilePreviewComponent } = getFileComponents(file);
  const previewSection = /* @__PURE__ */ jsxs47("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs47("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsx70(FileDeleteButton, { file }),
      /* @__PURE__ */ jsx70(FileDownloadButton, { file }),
      /* @__PURE__ */ jsx70(FileCopyLinkButton, { file })
    ] }),
    /* @__PURE__ */ jsxs47("div", { className: "flex-1 flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8", children: [
      /* @__PURE__ */ jsx70("div", { className: "mb-4 w-32 h-32 flex items-center justify-center", children: /* @__PURE__ */ jsx70(FilePreviewComponent, { file, metaData: file.metaData }) }),
      /* @__PURE__ */ jsxs47("p", { className: "text-sm font-medium text-muted-foreground uppercase tracking-wider", children: [
        ext,
        " File"
      ] })
    ] })
  ] });
  const metadataSection = /* @__PURE__ */ jsxs47("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs47("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs47("div", { children: [
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-medium text-muted-foreground tracking-wide mb-1", children: "Size" }),
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-bold text-blue-600 dark:text-blue-400", children: getFileSize(file.size) })
      ] }),
      /* @__PURE__ */ jsxs47("div", { children: [
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-medium text-muted-foreground  tracking-wide mb-1", children: "Date" }),
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-bold text-blue-600 dark:text-blue-400", children: formatDate(file.createdAt) })
      ] }),
      /* @__PURE__ */ jsxs47("div", { children: [
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-medium text-muted-foreground tracking-wide mb-1", children: "Extension" }),
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-bold text-blue-600 dark:text-blue-400", children: ext })
      ] }),
      ((_c = file.metaData) == null ? void 0 : _c.pageCount) && /* @__PURE__ */ jsxs47("div", { children: [
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Page Count" }),
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-bold text-blue-600 dark:text-blue-400", children: file.metaData.pageCount })
      ] }),
      ((_d = file.metaData) == null ? void 0 : _d.author) && /* @__PURE__ */ jsxs47("div", { children: [
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1", children: "Author" }),
        /* @__PURE__ */ jsx70("p", { className: "text-xs font-bold text-blue-600 dark:text-blue-400", children: file.metaData.author })
      ] })
    ] }),
    /* @__PURE__ */ jsxs47("div", { className: "space-y-4 pt-4 border-t border-slate-200", children: [
      /* @__PURE__ */ jsx70("div", { className: "space-y-2", children: /* @__PURE__ */ jsxs47(Field, { className: "gap-0", children: [
        /* @__PURE__ */ jsx70(FieldLabel, { htmlFor: "fileName", children: "File name" }),
        /* @__PURE__ */ jsxs47(InputGroup, { children: [
          /* @__PURE__ */ jsx70(InputGroupInput, { id: "fileName", placeholder: "Enter file name", value: fileName.replace(file.ext || "", ""), onChange: (e) => setFileName(e.target.value) }),
          /* @__PURE__ */ jsx70(InputGroupAddon, { align: "inline-end", className: "pr-1", children: /* @__PURE__ */ jsx70(InputGroupText, { className: "font-bold bg-gray-200 dark:bg-zinc-700 rounded-lg py-1 px-3", children: file.ext }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs47("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx70(Label, { htmlFor: "description", children: "Description" }),
        /* @__PURE__ */ jsx70(
          Textarea,
          {
            id: "description",
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: "Add a description",
            rows: 3
          }
        )
      ] })
    ] })
  ] });
  const footer = /* @__PURE__ */ jsxs47("div", { className: "flex w-full justify-between items-center flex-col sm:flex-row gap-2 ", children: [
    /* @__PURE__ */ jsx70(Button, { className: "w-full md:w-auto", variant: "outline", onClick: onClose, radius: "full", disabled: isSaving, children: "Cancel" }),
    /* @__PURE__ */ jsxs47(Button, { className: "w-full md:w-auto", onClick: handleSave, radius: "full", disabled: isSaving, children: [
      isSaving && /* @__PURE__ */ jsx70(Loader2Icon, { className: "mr-2 h-4 w-4 animate-spin" }),
      "Save"
    ] })
  ] });
  return /* @__PURE__ */ jsx70(
    DetailsLayout,
    {
      title: "Details",
      open: true,
      onClose,
      previewSection,
      metadataSection,
      footer
    }
  );
}

// components/layout/overlays.tsx
import { jsx as jsx71, jsxs as jsxs48 } from "react/jsx-runtime";
function FileManagerOverlays({ className }) {
  const {
    fileDetailsModalFile,
    setFileDetailsModalFile,
    updateFileMetadata
  } = useFileManager();
  const handleClose = () => {
    setFileDetailsModalFile(null);
  };
  const handleSave = async (updates) => {
    if (fileDetailsModalFile) {
      await updateFileMetadata(fileDetailsModalFile.id, updates);
    }
  };
  const renderFileDetailsModal = () => {
    if (!fileDetailsModalFile) return null;
    const fileType = getFileTypeFromMime(
      fileDetailsModalFile.mime,
      fileDetailsModalFile.ext
    );
    switch (fileType) {
      case FILE_TYPE.IMAGE:
        return /* @__PURE__ */ jsx71(
          ImageModal,
          {
            file: fileDetailsModalFile,
            onClose: handleClose,
            onSave: handleSave
          }
        );
      case FILE_TYPE.VIDEO:
        return /* @__PURE__ */ jsx71(
          VideoModal,
          {
            file: fileDetailsModalFile,
            onClose: handleClose,
            onSave: handleSave
          }
        );
      case FILE_TYPE.AUDIO:
        return /* @__PURE__ */ jsx71(
          AudioModal,
          {
            file: fileDetailsModalFile,
            onClose: handleClose,
            onSave: handleSave
          }
        );
      case FILE_TYPE.FILE:
      default:
        return /* @__PURE__ */ jsx71(
          FileModal,
          {
            file: fileDetailsModalFile,
            onClose: handleClose,
            onSave: handleSave
          }
        );
    }
  };
  return /* @__PURE__ */ jsxs48("div", { className: cn("", className), children: [
    /* @__PURE__ */ jsx71(UploadModal, {}),
    /* @__PURE__ */ jsx71(CreateFolderModal, {}),
    /* @__PURE__ */ jsx71(MoveModal, {}),
    renderFileDetailsModal()
  ] });
}

// components/file-manager-root.tsx
import { jsx as jsx72 } from "react/jsx-runtime";
function FileManagerPageProvider(_a) {
  var _b = _a, {
    children
  } = _b, props = __objRest(_b, [
    "children"
  ]);
  return /* @__PURE__ */ jsx72(
    FileManagerProvider,
    __spreadProps(__spreadValues({
      mode: MODE.PAGE,
      selectionMode: SELECTION_MODE.MULTIPLE
    }, props), {
      children
    })
  );
}
function FileManagerModalProvider(_a) {
  var _b = _a, {
    children,
    fileSelectionMode = SELECTION_MODE.SINGLE,
    acceptedFileTypes,
    viewMode = "grid",
    onFilesSelected,
    onClose
  } = _b, props = __objRest(_b, [
    "children",
    "fileSelectionMode",
    "acceptedFileTypes",
    "viewMode",
    "onFilesSelected",
    "onClose"
  ]);
  return /* @__PURE__ */ jsx72(
    FileManagerProvider,
    __spreadProps(__spreadValues({
      mode: MODE.MODAL,
      selectionMode: fileSelectionMode,
      acceptedFileTypesForModal: acceptedFileTypes || props.allowedFileTypes,
      viewMode,
      onFilesSelected,
      onClose
    }, props), {
      children
    })
  );
}
var FileManagerComposition = {
  Page: FileManagerPageProvider,
  Modal: FileManagerModalProvider,
  Header: FileManagerHeader,
  Footer: FileManagerFooter,
  Overlays: FileManagerOverlays
};

// components/layout/bulk-actions-bar.tsx
import { jsx as jsx73, jsxs as jsxs49 } from "react/jsx-runtime";
function MoveButton() {
  const { setIsMoveFileModalOpen } = useFileManager();
  return /* @__PURE__ */ jsxs49(
    Button,
    {
      variant: "outline",
      size: "lg",
      radius: "full",
      onClick: () => setIsMoveFileModalOpen(true),
      className: "text-md font-medium border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm transition-all duration-200",
      children: [
        /* @__PURE__ */ jsx73(MoveIcon, { className: "size-5" }),
        /* @__PURE__ */ jsx73("span", { className: "hidden sm:inline", children: "Move" })
      ]
    }
  );
}
function DeleteButton() {
  const { bulkDelete } = useFileManager();
  return /* @__PURE__ */ jsxs49(
    Button,
    {
      variant: "outline",
      size: "lg",
      radius: "full",
      onClick: bulkDelete,
      className: "text-md font-medium border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 shadow-sm transition-all duration-200",
      children: [
        /* @__PURE__ */ jsx73(TrashIcon, { className: "size-5" }),
        /* @__PURE__ */ jsx73("span", { className: "hidden", children: "Delete" })
      ]
    }
  );
}
function ClearSelectionButton() {
  const { handleClearSelection } = useFileManager();
  return /* @__PURE__ */ jsxs49(
    Button,
    {
      variant: "outline",
      size: "lg",
      onClick: handleClearSelection,
      className: "rounded-full text-md font-medium border border-transparent text-blue-600 dark:text-blue-400  hover:text-blue-700 dark:hover:text-blue-300  hover:bg-blue-50 dark:hover:bg-blue-900/40  hover:border-blue-300 dark:hover:border-blue-700  hover:font-semibold transition-all duration-200",
      children: [
        /* @__PURE__ */ jsx73(CrossIcon, { className: "size-5 transition-colors" }),
        "Clear"
      ]
    }
  );
}
function BulkActionsStatic() {
  const {
    selectedFiles,
    selectedFolders
  } = useFileManager();
  const totalSelected = selectedFiles.length + selectedFolders.length;
  if (totalSelected === 0) return null;
  return /* @__PURE__ */ jsx73("div", { className: "w-full", children: /* @__PURE__ */ jsxs49("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3", children: [
    /* @__PURE__ */ jsxs49("div", { className: "flex items-center gap-2 flex-1 sm:flex-initial", children: [
      /* @__PURE__ */ jsx73(MoveButton, {}),
      /* @__PURE__ */ jsx73(DeleteButton, {})
    ] }),
    /* @__PURE__ */ jsx73(ClearSelectionButton, {})
  ] }) });
}
function BulkActionsFloating({ className }) {
  const {
    selectedFiles,
    selectedFolders
  } = useFileManager();
  const totalSelected = selectedFiles.length + selectedFolders.length;
  if (totalSelected === 0) return null;
  return /* @__PURE__ */ jsx73("div", { className: `fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-700 shadow-lg ${className || ""}`, children: /* @__PURE__ */ jsx73("div", { className: "px-4 sm:px-6 py-3 mx-auto", children: /* @__PURE__ */ jsxs49("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3", children: [
    /* @__PURE__ */ jsxs49("div", { className: "flex items-center gap-2 flex-1 sm:flex-initial", children: [
      /* @__PURE__ */ jsx73(MoveButton, {}),
      /* @__PURE__ */ jsx73(DeleteButton, {})
    ] }),
    /* @__PURE__ */ jsx73(ClearSelectionButton, {})
  ] }) }) });
}

// components/ui/skeleton.tsx
import { jsx as jsx74 } from "react/jsx-runtime";
function Skeleton(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx74("div", __spreadValues({ "data-slot": "skeleton", className: cn("animate-pulse rounded-md bg-accent", className) }, props));
}

// components/layout/header-navigation.tsx
import { Fragment, jsx as jsx75, jsxs as jsxs50 } from "react/jsx-runtime";
function HeaderNavigation() {
  const {
    currentFolder,
    handleFolderClick,
    isLoading
  } = useFileManager();
  const handleBackClick = () => {
    history.back();
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs50("div", { className: "flex item-center w-full", children: [
      /* @__PURE__ */ jsx75(Skeleton, { className: "rounded-full size-10 mr-2 shrink-0" }),
      /* @__PURE__ */ jsx75(Skeleton, { className: "min-w-32 rounded-md h-full" })
    ] });
  }
  return /* @__PURE__ */ jsx75(Fragment, { children: currentFolder ? /* @__PURE__ */ jsxs50("div", { className: "flex items-center flex-1 min-w-0 max-w-[calc(100%-40px)]", children: [
    /* @__PURE__ */ jsx75(
      Button,
      {
        variant: "outline",
        size: "icon",
        radius: "full",
        disabled: isLoading,
        className: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 mr-2",
        onClick: handleBackClick,
        children: /* @__PURE__ */ jsx75(ChevronLeftIcon, { className: "size-5 text-gray-900 dark:text-zinc-100", strokeWidth: "1.5" })
      }
    ),
    /* @__PURE__ */ jsx75("h1", { className: "text-lg flex-1 min-w-0 align-middle font-semibold", children: middleTruncate(currentFolder.name, 20) })
  ] }) : /* @__PURE__ */ jsxs50("div", { className: "flex items-center flex-1 min-w-0 max-w-[calc(100%-40px)]", children: [
    /* @__PURE__ */ jsx75(
      Button,
      {
        className: "mr-2 shrink-0",
        radius: "full",
        variant: "ghost",
        mode: "icon",
        size: "icon",
        onClick: () => handleFolderClick(null),
        children: /* @__PURE__ */ jsx75(HomeIcon, { className: "size-6 text-gray-900 dark:text-zinc-100" })
      }
    ),
    /* @__PURE__ */ jsx75("h1", { className: "text-lg flex-1 min-w-0 align-middle font-semibold", children: "Home" })
  ] }) });
}

// components/ui/dropdown-menu.tsx
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { jsx as jsx76, jsxs as jsxs51 } from "react/jsx-runtime";
function DropdownMenu(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx76(DropdownMenuPrimitive.Root, __spreadValues({ "data-slot": "dropdown-menu" }, props));
}
function DropdownMenuTrigger(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx76(DropdownMenuPrimitive.Trigger, __spreadValues({ className: "select-none", "data-slot": "dropdown-menu-trigger" }, props));
}
function DropdownMenuContent(_a) {
  var _b = _a, {
    className,
    sideOffset = 4
  } = _b, props = __objRest(_b, [
    "className",
    "sideOffset"
  ]);
  return /* @__PURE__ */ jsx76(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx76(
    DropdownMenuPrimitive.Content,
    __spreadValues({
      "data-slot": "dropdown-menu-content",
      sideOffset,
      className: cn(
        "space-y-0.5 z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )
    }, props)
  ) });
}
function DropdownMenuItem(_a) {
  var _b = _a, {
    className,
    inset,
    variant
  } = _b, props = __objRest(_b, [
    "className",
    "inset",
    "variant"
  ]);
  return /* @__PURE__ */ jsx76(
    DropdownMenuPrimitive.Item,
    __spreadValues({
      "data-slot": "dropdown-menu-item",
      className: cn(
        "text-foreground relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden transition-colors data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([role=img]):not([class*=text-])]:opacity-60 [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0",
        "focus:bg-accent focus:text-foreground",
        "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        inset && "ps-8",
        variant === "destructive" && "text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/5 focus:bg-destructive/5 data-[active=true]:bg-destructive/5",
        className
      )
    }, props)
  );
}
function DropdownMenuSeparator(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx76(
    DropdownMenuPrimitive.Separator,
    __spreadValues({
      "data-slot": "dropdown-menu-separator",
      className: cn("-mx-2 my-1.5 h-px bg-muted", className)
    }, props)
  );
}

// components/modals/search-modal.tsx
import { useCallback as useCallback6, useEffect as useEffect7, useState as useState16 } from "react";

// components/ui/command.tsx
import { Command as CommandPrimitive } from "cmdk";
import { jsx as jsx77, jsxs as jsxs52 } from "react/jsx-runtime";
function Command(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx77(
    CommandPrimitive,
    __spreadValues({
      className: cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )
    }, props)
  );
}
var CommandDialog = (_a) => {
  var _b = _a, { children, className, shouldFilter } = _b, props = __objRest(_b, ["children", "className", "shouldFilter"]);
  return /* @__PURE__ */ jsx77(Dialog, __spreadProps(__spreadValues({}, props), { children: /* @__PURE__ */ jsxs52(DialogContent, { className: cn("overflow-hidden p-0 shadow-lg", className), children: [
    /* @__PURE__ */ jsx77(DialogTitle, { className: "hidden" }),
    /* @__PURE__ */ jsx77(
      Command,
      {
        shouldFilter,
        className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
        children
      }
    )
  ] }) }));
};
function CommandInput(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsxs52("div", { className: "flex items-center border-border border-b px-3", "cmdk-input-wrapper": "", "data-slot": "command-input", children: [
    /* @__PURE__ */ jsx77(SearchIcon, { className: "me-2 h-4 w-4 shrink-0 opacity-50" }),
    /* @__PURE__ */ jsx77(
      CommandPrimitive.Input,
      __spreadValues({
        className: cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none! shadow-none! focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )
      }, props)
    )
  ] });
}
function CommandList(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx77(
    CommandPrimitive.List,
    __spreadValues({
      "data-slot": "command-list",
      className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)
    }, props)
  );
}
function CommandEmpty(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx77(CommandPrimitive.Empty, __spreadValues({ "data-slot": "command-empty", className: "py-6 text-center text-sm" }, props));
}
function CommandGroup(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx77(
    CommandPrimitive.Group,
    __spreadValues({
      "data-slot": "command-group",
      className: cn(
        "overflow-hidden p-1.5 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className
      )
    }, props)
  );
}
function CommandItem(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx77(
    CommandPrimitive.Item,
    __spreadValues({
      "data-slot": "command-item",
      className: cn(
        "relative flex text-foreground cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "[&_svg:not([role=img]):not([class*=text-])]:opacity-60",
        className
      )
    }, props)
  );
}

// hooks/use-debounced-value.ts
import { useEffect as useEffect6, useState as useState15 } from "react";
function useDebouncedValue(value, delay2 = 500) {
  const [debouncedValue, setDebouncedValue] = useState15(value);
  useEffect6(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay2);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay2]);
  return debouncedValue;
}

// components/modals/search-modal.tsx
import { toast as toast4 } from "sonner";
import { Fragment as Fragment2, jsx as jsx78, jsxs as jsxs53 } from "react/jsx-runtime";
function SearchDialog() {
  const [searchQuery, setSearchQuery] = useState16("");
  const [fileResults, setFileResults] = useState16([]);
  const [folderResults, setFolderResults] = useState16([]);
  const [loading, setLoading] = useState16(false);
  const { provider, handleFolderClick, handleClearSelection, isSearchModalOpen, setIsSearchModalOpen, setFileDetailsModalFile } = useFileManager();
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const doSearch = useCallback6(async (q) => {
    setLoading(true);
    try {
      const [files, folders] = await Promise.all([
        provider.findFiles(q),
        provider.findFolders(q)
      ]);
      setFileResults(files);
      setFolderResults(folders);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      toast4.error("Search Failed", {
        description: message
      });
      setFileResults([]);
      setFolderResults([]);
    } finally {
      setLoading(false);
    }
  }, [provider]);
  useEffect7(() => {
    if (isSearchModalOpen && debouncedSearchQuery.length > 0) {
      doSearch(debouncedSearchQuery);
    } else {
      setFileResults([]);
      setFolderResults([]);
    }
  }, [debouncedSearchQuery, isSearchModalOpen, doSearch]);
  const handleInputChange = (value) => {
    setSearchQuery(value);
  };
  const handleModalOpenChange = (open) => {
    setIsSearchModalOpen(open);
    if (!open) {
      setSearchQuery("");
      setFileResults([]);
      setFolderResults([]);
    }
  };
  return /* @__PURE__ */ jsxs53(Fragment2, { children: [
    /* @__PURE__ */ jsxs53(
      Button,
      {
        variant: "outline",
        size: "icon",
        radius: "full",
        className: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
        onClick: () => setIsSearchModalOpen(true),
        children: [
          /* @__PURE__ */ jsx78(SearchIcon, { className: "size-4 text-gray-700 dark:text-zinc-300" }),
          /* @__PURE__ */ jsx78("span", { className: "hidden", children: "Search" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs53(CommandDialog, { className: "max-w-4xl w-full", open: isSearchModalOpen, onOpenChange: handleModalOpenChange, shouldFilter: false, children: [
      /* @__PURE__ */ jsx78(
        CommandInput,
        {
          placeholder: "Type to search files or folders...",
          value: searchQuery,
          onValueChange: handleInputChange
        }
      ),
      /* @__PURE__ */ jsxs53(CommandList, { children: [
        loading && /* @__PURE__ */ jsx78(CommandEmpty, { children: "Searching..." }),
        !loading && fileResults.length === 0 && folderResults.length === 0 && !searchQuery && /* @__PURE__ */ jsx78(CommandEmpty, { children: /* @__PURE__ */ jsxs53("div", { className: "flex flex-col items-center justify-center py-8 px-4 text-center", children: [
          /* @__PURE__ */ jsx78(SearchIcon, { className: "size-12 text-gray-300 dark:text-zinc-600 mb-3" }),
          /* @__PURE__ */ jsx78("p", { className: "text-sm font-medium text-gray-900 dark:text-zinc-100 mb-1", children: "Search your files and folders" }),
          /* @__PURE__ */ jsx78("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: "Start typing to find what you're looking for" }),
          /* @__PURE__ */ jsx78("p", { className: "text-xs text-gray-500 dark:text-zinc-400 mt-2", children: /* @__PURE__ */ jsx78(KbdGroup, { children: /* @__PURE__ */ jsxs53(Kbd, { children: [
            /* @__PURE__ */ jsx78("span", { className: "text-lg", children: "\u2318" }),
            " + K"
          ] }) }) })
        ] }) }),
        !loading && fileResults.length === 0 && folderResults.length === 0 && searchQuery && /* @__PURE__ */ jsx78(CommandEmpty, { children: /* @__PURE__ */ jsxs53("div", { className: "flex flex-col items-center justify-center py-8 px-4 text-center", children: [
          /* @__PURE__ */ jsx78(SearchIcon, { className: "size-12 text-gray-300 dark:text-zinc-600 mb-3" }),
          /* @__PURE__ */ jsx78("p", { className: "text-sm font-medium text-gray-900 dark:text-zinc-100 mb-1", children: "No results found" }),
          /* @__PURE__ */ jsx78("p", { className: "text-xs text-gray-500 dark:text-zinc-400", children: "Try searching with different keywords" })
        ] }) }),
        folderResults.length > 0 && /* @__PURE__ */ jsx78(CommandGroup, { heading: "Folders", children: folderResults.map((folder) => /* @__PURE__ */ jsxs53(
          CommandItem,
          {
            onSelect: () => {
              handleClearSelection();
              setIsSearchModalOpen(false);
              handleFolderClick(folder);
            },
            children: [
              /* @__PURE__ */ jsx78(FolderIcon, { className: "size-4  mr-2 shrink-0", strokeWidth: 1.5 }),
              /* @__PURE__ */ jsx78("span", { children: middleTruncate(folder.name, 60) })
            ]
          },
          folder.id
        )) }),
        fileResults.length > 0 && /* @__PURE__ */ jsx78(CommandGroup, { heading: "Files", children: fileResults.map((file) => {
          const { component: FilePreviewComponent } = getFileComponents(file);
          return /* @__PURE__ */ jsxs53(
            CommandItem,
            {
              onSelect: () => {
                handleClearSelection();
                setFileDetailsModalFile(file);
              },
              children: [
                /* @__PURE__ */ jsx78("div", { className: "size-6 mr-2 shrink-0 flex items-center justify-center", children: /* @__PURE__ */ jsx78(FilePreviewComponent, { file, metaData: file.metaData }) }),
                /* @__PURE__ */ jsx78("span", { children: middleTruncate(file.name, 60) })
              ]
            },
            file.id
          );
        }) })
      ] })
    ] })
  ] });
}

// components/ui/checkbox.tsx
import { cva as cva9 } from "class-variance-authority";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { jsx as jsx79, jsxs as jsxs54 } from "react/jsx-runtime";
var checkboxVariants = cva9(
  `
    group peer bg-background shrink-0 rounded-md border border-input ring-offset-background focus-visible:outline-none 
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 
    aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20
    [[data-invalid=true]_&]:border-destructive/60 [[data-invalid=true]_&]:ring-destructive/10  dark:[[data-invalid=true]_&]:border-destructive dark:[[data-invalid=true]_&]:ring-destructive/20,
    data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground
    `,
  {
    variants: {
      size: {
        sm: "size-4.5 [&_svg]:size-3",
        md: "size-5 [&_svg]:size-3.5",
        lg: "size-5.5 [&_svg]:size-4"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
function Checkbox(_a) {
  var _b = _a, {
    className,
    size
  } = _b, props = __objRest(_b, [
    "className",
    "size"
  ]);
  return /* @__PURE__ */ jsx79(CheckboxPrimitive.Root, __spreadProps(__spreadValues({ "data-slot": "checkbox", className: cn(checkboxVariants({ size }), className) }, props), { children: /* @__PURE__ */ jsxs54(CheckboxPrimitive.Indicator, { className: cn("flex items-center justify-center text-current"), children: [
    /* @__PURE__ */ jsx79(CheckIcon, { className: "group-data-[state=indeterminate]:hidden" }),
    /* @__PURE__ */ jsx79(MinusIcon, { className: "hidden group-data-[state=indeterminate]:block" })
  ] }) }));
}

// components/layout/header-actions.tsx
import { jsx as jsx80, jsxs as jsxs55 } from "react/jsx-runtime";
function SearchAction() {
  return /* @__PURE__ */ jsx80(SearchDialog, {});
}
function UploadFileAction() {
  const { setIsUploadModalOpen } = useFileManager();
  return /* @__PURE__ */ jsxs55(
    Button,
    {
      variant: "outline",
      size: "md",
      radius: "full",
      className: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-md font-medium",
      onClick: () => setIsUploadModalOpen(true),
      children: [
        /* @__PURE__ */ jsx80(PlusIcon, { strokeWidth: 2, className: "size-5 text-gray-900 dark:text-zinc-100" }),
        /* @__PURE__ */ jsx80("span", { className: "hidden sm:inline", children: "Upload File" })
      ]
    }
  );
}
function CreateFolderAction() {
  const { setIsCreateFolderModalOpen } = useFileManager();
  return /* @__PURE__ */ jsxs55(
    Button,
    {
      variant: "outline",
      size: "icon",
      radius: "full",
      className: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
      onClick: () => setIsCreateFolderModalOpen(true),
      children: [
        /* @__PURE__ */ jsx80(UploadFolderIcon, { className: "size-5 text-gray-900 dark:text-zinc-100" }),
        /* @__PURE__ */ jsx80("span", { className: "hidden", children: "Create Folder" })
      ]
    }
  );
}

// components/layout/theme-toggle.tsx
import { useEffect as useEffect8, useState as useState17 } from "react";

// components/icons/theme.tsx
import { jsx as jsx81, jsxs as jsxs56 } from "react/jsx-runtime";
function SunIcon(props) {
  return /* @__PURE__ */ jsxs56(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: [
        /* @__PURE__ */ jsx81("circle", { cx: "12", cy: "12", r: "4" }),
        /* @__PURE__ */ jsx81("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" })
      ]
    })
  );
}
function MoonIcon(props) {
  return /* @__PURE__ */ jsx81(
    "svg",
    __spreadProps(__spreadValues({
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, props), {
      children: /* @__PURE__ */ jsx81("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })
    })
  );
}

// components/layout/theme-toggle.tsx
import { jsx as jsx82 } from "react/jsx-runtime";
function ThemeToggle() {
  const [isDark, setIsDark] = useState17(false);
  useEffect8(() => {
    const saved = localStorage.getItem("theme");
    const shouldBeDark = saved === "dark";
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return /* @__PURE__ */ jsx82(
    Button,
    {
      variant: "outline",
      size: "icon",
      radius: "full",
      onClick: toggle,
      className: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
      children: isDark ? /* @__PURE__ */ jsx82(SunIcon, { className: "size-4 text-yellow-500" }) : /* @__PURE__ */ jsx82(MoonIcon, { className: "size-4 text-gray-700 dark:text-zinc-300" })
    }
  );
}

// components/layout/header-actions-responsive.tsx
import { Fragment as Fragment3, jsx as jsx83, jsxs as jsxs57 } from "react/jsx-runtime";
function ResponsiveHeaderActions() {
  const { setIsUploadModalOpen, setIsCreateFolderModalOpen, setIsSearchModalOpen } = useFileManager();
  return /* @__PURE__ */ jsxs57(Fragment3, { children: [
    /* @__PURE__ */ jsxs57("div", { className: "hidden md:flex gap-2", children: [
      /* @__PURE__ */ jsx83(UploadFileAction, {}),
      /* @__PURE__ */ jsx83(CreateFolderAction, {}),
      /* @__PURE__ */ jsx83(SearchAction, {}),
      /* @__PURE__ */ jsx83(ThemeToggle, {})
    ] }),
    /* @__PURE__ */ jsx83("div", { className: "flex md:hidden", children: /* @__PURE__ */ jsxs57(DropdownMenu, { children: [
      /* @__PURE__ */ jsx83(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx83(
        Button,
        {
          variant: "outline",
          size: "icon",
          radius: "full",
          className: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
          children: /* @__PURE__ */ jsx83(MoveHorizontalIcon, { className: "size-5" })
        }
      ) }),
      /* @__PURE__ */ jsxs57(DropdownMenuContent, { align: "end", className: "w-56 rounded-2xl shadow-xl bg-white/50 dark:bg-zinc-900/80 backdrop-blur-2xl border-gray-200 dark:border-zinc-700", children: [
        /* @__PURE__ */ jsxs57(
          DropdownMenuItem,
          {
            onClick: () => setIsUploadModalOpen(true),
            className: "cursor-pointer",
            children: [
              /* @__PURE__ */ jsx83(PlusIcon, { className: "size-5 text-gray-900 dark:text-zinc-100" }),
              /* @__PURE__ */ jsx83("span", { className: "inline", children: "Upload File" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs57(
          DropdownMenuItem,
          {
            onClick: () => setIsCreateFolderModalOpen(true),
            className: "cursor-pointer",
            children: [
              /* @__PURE__ */ jsx83(UploadFolderIcon, { className: "size-5 text-gray-900 dark:text-zinc-100" }),
              /* @__PURE__ */ jsx83("span", { className: "inline", children: "Create Folder" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs57(
          DropdownMenuItem,
          {
            onClick: () => setIsSearchModalOpen(true),
            className: "cursor-pointer",
            children: [
              /* @__PURE__ */ jsx83(SearchIcon, { className: "size-5 text-gray-700 dark:text-zinc-300" }),
              /* @__PURE__ */ jsx83("span", { className: "inline", children: "Search" })
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function ModalResponsiveHeaderActions({ onSearchClick }) {
  const { setIsUploadModalOpen, setIsCreateFolderModalOpen } = useFileManager();
  return /* @__PURE__ */ jsxs57(Fragment3, { children: [
    /* @__PURE__ */ jsxs57("div", { className: "hidden md:flex gap-2", children: [
      /* @__PURE__ */ jsx83(UploadFileAction, {}),
      /* @__PURE__ */ jsx83(CreateFolderAction, {}),
      onSearchClick ? /* @__PURE__ */ jsxs57(
        Button,
        {
          variant: "outline",
          size: "icon",
          radius: "full",
          className: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
          onClick: onSearchClick,
          children: [
            /* @__PURE__ */ jsx83(SearchIcon, { className: "size-5 text-gray-900 dark:text-zinc-100" }),
            /* @__PURE__ */ jsx83("span", { className: "hidden", children: "Search" })
          ]
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsx83("div", { className: "flex md:hidden", children: /* @__PURE__ */ jsxs57(DropdownMenu, { children: [
      /* @__PURE__ */ jsx83(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx83(
        Button,
        {
          variant: "outline",
          size: "icon",
          radius: "full",
          className: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
          children: /* @__PURE__ */ jsx83(MoveHorizontalIcon, { className: "size-5" })
        }
      ) }),
      /* @__PURE__ */ jsxs57(DropdownMenuContent, { align: "end", className: "w-48", children: [
        /* @__PURE__ */ jsxs57(
          DropdownMenuItem,
          {
            onClick: () => setIsUploadModalOpen(true),
            className: "cursor-pointer",
            children: [
              /* @__PURE__ */ jsx83(PlusIcon, { className: "size-5 text-gray-900 dark:text-zinc-100" }),
              /* @__PURE__ */ jsx83("span", { className: "inline", children: "Upload File" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs57(
          DropdownMenuItem,
          {
            onClick: () => setIsCreateFolderModalOpen(true),
            className: "cursor-pointer",
            children: [
              /* @__PURE__ */ jsx83(UploadFolderIcon, { className: "size-5 text-gray-900 dark:text-zinc-100" }),
              /* @__PURE__ */ jsx83("span", { className: "inline", children: "Create Folder" })
            ]
          }
        ),
        onSearchClick ? /* @__PURE__ */ jsxs57(
          DropdownMenuItem,
          {
            onClick: onSearchClick,
            className: "cursor-pointer",
            children: [
              /* @__PURE__ */ jsx83(SearchIcon, { className: "size-5 text-gray-700 dark:text-zinc-300" }),
              /* @__PURE__ */ jsx83("span", { className: "inline", children: "Search" })
            ]
          }
        ) : null
      ] })
    ] }) })
  ] });
}

// components/cards/card-context-menu.tsx
import React from "react";

// components/ui/context-menu.tsx
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { jsx as jsx84, jsxs as jsxs58 } from "react/jsx-runtime";
function ContextMenu(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx84(ContextMenuPrimitive.Root, __spreadValues({ "data-slot": "context-menu" }, props));
}
function ContextMenuTrigger(_a) {
  var props = __objRest(_a, []);
  return /* @__PURE__ */ jsx84(ContextMenuPrimitive.Trigger, __spreadValues({ "data-slot": "context-menu-trigger" }, props));
}
function ContextMenuContent(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx84(ContextMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx84(
    ContextMenuPrimitive.Content,
    __spreadValues({
      "data-slot": "context-menu-content",
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        className
      )
    }, props)
  ) });
}
function ContextMenuItem(_a) {
  var _b = _a, {
    className,
    inset,
    variant = "default"
  } = _b, props = __objRest(_b, [
    "className",
    "inset",
    "variant"
  ]);
  return /* @__PURE__ */ jsx84(
    ContextMenuPrimitive.Item,
    __spreadValues({
      "data-slot": "context-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )
    }, props)
  );
}
function ContextMenuSeparator(_a) {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ jsx84(
    ContextMenuPrimitive.Separator,
    __spreadValues({
      "data-slot": "context-menu-separator",
      className: cn("bg-border -mx-1 my-1 h-px", className)
    }, props)
  );
}

// components/cards/card-context-menu.tsx
import { jsx as jsx85, jsxs as jsxs59 } from "react/jsx-runtime";
function CardContextMenu({
  children,
  menuItems,
  isInSelectionMode = false,
  mode
}) {
  const shouldShowMenu = !isInSelectionMode && mode !== "modal";
  const renderMenuItems = (isDropdown = false) => {
    return menuItems.map((item, index) => {
      const isLast = index === menuItems.length - 1;
      const isDestructive = item.variant === "destructive";
      const MenuItemComponent = isDropdown ? DropdownMenuItem : ContextMenuItem;
      const SeparatorComponent = isDropdown ? DropdownMenuSeparator : ContextMenuSeparator;
      const nextItemIsDestructive = index < menuItems.length - 1 && menuItems[index + 1].variant === "destructive";
      return /* @__PURE__ */ jsxs59(React.Fragment, { children: [
        /* @__PURE__ */ jsxs59(
          MenuItemComponent,
          {
            onClick: item.onClick,
            className: item.className || `text-sm font-medium ${isDestructive ? "text-red-600 focus:text-red-700 focus:bg-red-50" : ""} ${index === 0 ? "rounded-t-xl" : ""} ${isLast ? "rounded-b-xl" : ""}`,
            children: [
              item.icon,
              item.label
            ]
          }
        ),
        nextItemIsDestructive && !isLast && /* @__PURE__ */ jsx85(SeparatorComponent, { className: "bg-gray-200 dark:bg-zinc-700" })
      ] }, index);
    });
  };
  return /* @__PURE__ */ jsxs59(ContextMenu, { children: [
    /* @__PURE__ */ jsx85(ContextMenuTrigger, { children: /* @__PURE__ */ jsxs59("div", { className: "relative w-full h-full", children: [
      children,
      shouldShowMenu && /* @__PURE__ */ jsx85(
        "div",
        {
          className: "absolute top-0 right-0 z-10 md:hidden",
          onClick: (e) => e.stopPropagation(),
          children: /* @__PURE__ */ jsxs59(DropdownMenu, { children: [
            /* @__PURE__ */ jsx85(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx85(
              Button,
              {
                variant: "ghost",
                size: "icon",
                radius: "full",
                className: "focus-visible:ring-0 focus-visible:ring-offset-0",
                children: /* @__PURE__ */ jsx85(MoveVerticalIcon, { className: "size-4 text-gray-700 dark:text-zinc-300" })
              }
            ) }),
            /* @__PURE__ */ jsx85(DropdownMenuContent, { className: "w-56 rounded-2xl shadow-xl bg-white/50 dark:bg-zinc-900/80 backdrop-blur-2xl border-gray-200 dark:border-zinc-700", children: renderMenuItems(true) })
          ] })
        }
      )
    ] }) }),
    shouldShowMenu && /* @__PURE__ */ jsx85(ContextMenuContent, { className: "w-56 rounded-2xl shadow-xl bg-white/50 dark:bg-zinc-900/80 backdrop-blur-2xl border-gray-200 dark:border-zinc-700", children: renderMenuItems(false) })
  ] });
}

// components/cards/file-card.tsx
import { jsx as jsx86, jsxs as jsxs60 } from "react/jsx-runtime";
function FileCard({
  file,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  onMove,
  selectionMode,
  showCheckbox = false,
  mode = MODE.PAGE,
  isInSelectionMode = false
}) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onDelete(file.id);
    }
  };
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(file);
  };
  const handleSelectFile = (e) => {
    e.stopPropagation();
    onSelect(file, void 0, true);
  };
  const handleMove = (e) => {
    e.stopPropagation();
    onMove(file);
  };
  const handleClick = (e) => {
    onSelect(file, e, false);
  };
  const handleCheckboxChange = () => {
    onSelect(file, void 0, true);
  };
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };
  const { component: FilePreviewComponent, metadataComponent: FileMetadataComponent } = getFileComponents(
    file
  );
  const menuItems = [
    {
      label: "Edit",
      icon: /* @__PURE__ */ jsx86(EditIcon, { className: "size-6" }),
      onClick: handleEdit
    },
    {
      label: "Select File",
      icon: /* @__PURE__ */ jsx86(SelectIcon, { className: "size-6" }),
      onClick: handleSelectFile
    },
    {
      label: "Move to...",
      icon: /* @__PURE__ */ jsx86(MoveIcon, { className: "size-6" }),
      onClick: handleMove
    },
    {
      label: "Delete",
      icon: /* @__PURE__ */ jsx86(TrashIcon, { className: "size-6 text-red-600" }),
      onClick: handleDelete,
      variant: "destructive"
    }
  ];
  return /* @__PURE__ */ jsx86(
    CardContextMenu,
    {
      menuItems,
      isInSelectionMode,
      mode,
      children: /* @__PURE__ */ jsxs60(
        "div",
        {
          className: "group relative flex flex-col items-center justify-start transition-all duration-200 cursor-pointer w-full select-none",
          onDoubleClick: handleClick,
          onClick: handleClick,
          children: [
            /* @__PURE__ */ jsxs60("div", { className: `
              relative w-full aspect-square flex items-center justify-center mb-1 overflow-hidden rounded-2xl hover:bg-accent/60
              ${isSelected ? "bg-accent/60" : ""}
          `, children: [
              /* @__PURE__ */ jsx86("div", { className: "w-[75%] h-[75%] flex items-center justify-center", children: /* @__PURE__ */ jsx86(FilePreviewComponent, { file, metaData: file.metaData }) }),
              (selectionMode === SELECTION_MODE.MULTIPLE || showCheckbox) && /* @__PURE__ */ jsx86("div", { className: `absolute top-2 left-2 z-10 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-200`, onClick: handleCheckboxClick, children: /* @__PURE__ */ jsx86(
                Checkbox,
                {
                  checked: isSelected,
                  onCheckedChange: handleCheckboxChange,
                  className: "bg-background/90 border-border shadow-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs60("div", { className: "w-full text-center px-0.5 flex flex-col items-center", children: [
              /* @__PURE__ */ jsx86("span", { className: `
                  text-[13px] font-semibold leading-[1.3] tracking-tight line-clamp-2 px-2.5 py-[2px] rounded-[6px] transition-colors duration-100 wrap-break-word max-w-full
                  ${isSelected ? "bg-primary text-primary-foreground antialiased shadow-sm" : "text-foreground group-hover:text-foreground/80"}
              `, children: file.name }),
              /* @__PURE__ */ jsxs60("div", { className: `flex flex-col items-center justify-center gap-0.5 mt-1 transition-opacity duration-200 ${isSelected ? "opacity-60" : "opacity-100"}`, children: [
                /* @__PURE__ */ jsx86("span", { className: "text-[11px] text-primary font-medium tracking-tight", children: getFileSize(file.size) }),
                FileMetadataComponent ? /* @__PURE__ */ jsx86("div", { className: "text-[11px] text-muted-foreground flex items-center scale-95", children: /* @__PURE__ */ jsx86(FileMetadataComponent, { file }) }) : null
              ] })
            ] })
          ]
        }
      )
    }
  );
}

// components/cards/folder-card.tsx
import { jsx as jsx87, jsxs as jsxs61 } from "react/jsx-runtime";
function FolderCard({
  folder,
  isSelected,
  onSelect,
  onDelete,
  onRename,
  onMove,
  selectionMode,
  showCheckbox,
  mode,
  isInSelectionMode
}) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${folder.name}"?

\u26A0\uFE0F Warning: This will also delete all ${folder.fileCount} file(s) inside this folder.`)) {
      onDelete(folder.id);
    }
  };
  const handleRename = (e) => {
    e.stopPropagation();
    onRename(folder);
  };
  const handleMove = (e) => {
    e.stopPropagation();
    onMove(folder);
  };
  const handleSelectFolder = (e) => {
    e.stopPropagation();
    onSelect(folder, void 0, true);
  };
  const handleClick = (e) => {
    onSelect(folder, e, false);
  };
  const handleCheckboxChange = () => {
    onSelect(folder, void 0, true);
  };
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };
  const menuItems = [
    {
      label: "Rename",
      icon: /* @__PURE__ */ jsx87(EditIcon, { className: "size-6" }),
      onClick: handleRename
    },
    {
      label: "Select Folder",
      icon: /* @__PURE__ */ jsx87(SelectIcon, { className: "size-6" }),
      onClick: handleSelectFolder
    },
    {
      label: "Move to...",
      icon: /* @__PURE__ */ jsx87(MoveIcon, { className: "size-5 mr-1" }),
      onClick: handleMove
    },
    {
      label: "Delete",
      icon: /* @__PURE__ */ jsx87(TrashIcon, { className: "size-5 mr-1 text-red-600" }),
      onClick: handleDelete,
      variant: "destructive"
    }
  ];
  return /* @__PURE__ */ jsx87(
    CardContextMenu,
    {
      menuItems,
      isInSelectionMode,
      mode,
      children: /* @__PURE__ */ jsxs61(
        "div",
        {
          className: "group relative flex flex-col items-center justify-start transition-all duration-200 cursor-pointer w-full select-none",
          onDoubleClick: handleClick,
          onClick: handleClick,
          children: [
            /* @__PURE__ */ jsxs61("div", { className: `
              relative w-full aspect-square flex items-center justify-center mb-1 overflow-hidden rounded-2xl hover:bg-accent/60
              ${isSelected ? "bg-accent/60" : ""}
          `, children: [
              /* @__PURE__ */ jsx87("div", { className: "w-[75%] h-[75%] flex items-center justify-center transform dark:brightness-[2]", children: /* @__PURE__ */ jsx87(FolderIcon, { className: "w-full h-full text-blue-400 fill-blue-400/20 drop-shadow-sm", strokeWidth: 1.5 }) }),
              (selectionMode === SELECTION_MODE.MULTIPLE || showCheckbox) && /* @__PURE__ */ jsx87("div", { className: `absolute top-2 left-2 z-10 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-200`, onClick: handleCheckboxClick, children: /* @__PURE__ */ jsx87(
                Checkbox,
                {
                  checked: isSelected,
                  onCheckedChange: handleCheckboxChange,
                  className: "bg-background/90 border-border shadow-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs61("div", { className: "w-full text-center px-0.5 flex flex-col items-center", children: [
              /* @__PURE__ */ jsx87("span", { className: `
                  text-[13px] font-semibold leading-[1.3] tracking-tight line-clamp-2 px-2.5 pb-[2px] rounded-[6px] transition-colors duration-100 wrap-break-word max-w-full
                  ${isSelected ? "bg-primary text-primary-foreground antialiased shadow-sm" : "text-foreground group-hover:text-foreground/80"}
              `, children: folder.name }),
              /* @__PURE__ */ jsx87("div", { className: `flex items-center justify-center gap-1 mt-1 transition-opacity duration-200 ${isSelected ? "opacity-60" : "opacity-100"}`, children: /* @__PURE__ */ jsxs61("span", { className: "text-[11px] text-primary font-medium tracking-tight px-1.5 rounded-full", children: [
                folder.fileCount,
                " items"
              ] }) })
            ] })
          ]
        }
      )
    }
  );
}

// components/grid/unified-grid.tsx
import { jsx as jsx88, jsxs as jsxs62 } from "react/jsx-runtime";
function UnifiedGrid() {
  const {
    files,
    folders,
    isLoading,
    handleFileClick,
    handleFolderClick,
    bulkDelete,
    mode,
    selectionMode,
    isInSelectionMode,
    selectedFiles,
    selectedFolders,
    currentFolder,
    setSelectedFiles,
    setSelectedFolders,
    setIsRenameFolderModalOpen,
    setIsMoveFileModalOpen,
    setFileDetailsModalFile,
    setFolderToRename
  } = useFileManager();
  const getSkeletonCount = () => {
    if (!currentFolder) {
      return 18;
    }
    const expectedFolders = currentFolder.folderCount || 0;
    const expectedFiles = currentFolder.fileCount || 0;
    const totalItems = expectedFolders + expectedFiles;
    return totalItems > 0 ? totalItems : 18;
  };
  const skeletonCount = getSkeletonCount();
  if (isLoading) {
    return /* @__PURE__ */ jsx88("div", { className: "p-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 content-start", children: Array.from({ length: skeletonCount }).map((_, i) => {
      var _a;
      return /* @__PURE__ */ jsxs62("div", { className: "flex flex-col items-center justify-start w-full gap-2", children: [
        /* @__PURE__ */ jsx88("div", { className: "w-full aspect-square bg-muted rounded-2xl animate-pulse" }),
        /* @__PURE__ */ jsxs62("div", { className: "flex flex-col items-center gap-1 w-full", children: [
          /* @__PURE__ */ jsx88("div", { className: "h-4 w-20 bg-muted rounded animate-pulse" }),
          /* @__PURE__ */ jsx88("div", { className: "h-3 w-12 bg-muted rounded animate-pulse" })
        ] })
      ] }, `skeleton-${(_a = currentFolder == null ? void 0 : currentFolder.id) != null ? _a : "root"}-${i}`);
    }) });
  }
  return /* @__PURE__ */ jsxs62("div", { className: "p-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 content-start", children: [
    folders.map((folder) => /* @__PURE__ */ jsx88(
      FolderCard,
      {
        folder,
        isSelected: selectedFolders.some((f) => f.id === folder.id),
        onSelect: handleFolderClick,
        onDelete: () => bulkDelete(),
        onRename: (folder2) => {
          setFolderToRename(folder2);
          setIsRenameFolderModalOpen(true);
        },
        onMove: (folder2) => {
          setSelectedFolders([folder2]);
          setSelectedFiles([]);
          setIsMoveFileModalOpen(true);
        },
        selectionMode,
        mode,
        isInSelectionMode: isInSelectionMode()
      },
      folder.id
    )),
    files.map((file) => /* @__PURE__ */ jsx88(
      FileCard,
      {
        file,
        isSelected: selectedFiles.some((f) => f.id === file.id),
        onSelect: handleFileClick,
        onDelete: () => bulkDelete(),
        onEdit: (file2) => {
          setFileDetailsModalFile(file2);
        },
        onMove: (file2) => {
          setSelectedFiles([file2]);
          setSelectedFolders([]);
          setIsMoveFileModalOpen(true);
        },
        selectionMode,
        mode,
        isInSelectionMode: isInSelectionMode()
      },
      file.id
    ))
  ] });
}

// components/error-boundary.tsx
import { Component } from "react";
import { jsx as jsx89, jsxs as jsxs63 } from "react/jsx-runtime";
var FileManagerErrorBoundary = class extends Component {
  constructor(props) {
    super(props);
    this.handleReset = () => {
      globalThis.location.reload();
    };
    this.state = {
      hasError: false,
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("FileManager Error Boundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsx89("div", { className: "flex items-center justify-center min-h-[400px] p-8 w-full h-full bg-slate-50/50 rounded-lg border border-dashed border-slate-200", children: /* @__PURE__ */ jsxs63("div", { className: "text-center max-w-md flex flex-col items-center", children: [
        /* @__PURE__ */ jsx89("div", { className: "bg-red-100 p-3 rounded-full mb-4", children: /* @__PURE__ */ jsx89(AlertCircleIcon, { className: "size-8 text-red-600" }) }),
        /* @__PURE__ */ jsx89("h2", { className: "text-xl font-semibold text-slate-900 mb-2", children: "Something went wrong" }),
        /* @__PURE__ */ jsx89("p", { className: "text-sm text-slate-500 mb-6", children: "The file manager encountered an unexpected error. Refreshing the page usually resolves this issue." }),
        this.state.error && /* @__PURE__ */ jsxs63("details", { className: "mb-6 text-left w-full border border-slate-200 rounded-lg overflow-hidden flex-col group", children: [
          /* @__PURE__ */ jsx89("summary", { className: "cursor-pointer text-xs font-mono bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors", children: "View Technical Details" }),
          /* @__PURE__ */ jsx89("div", { className: "p-3 bg-white dark:bg-zinc-900", children: /* @__PURE__ */ jsx89("pre", { className: "text-[10px] text-slate-600 font-mono whitespace-pre-wrap word-break-all max-h-40 overflow-auto", children: this.state.error.toString() }) })
        ] }),
        /* @__PURE__ */ jsxs63(Button, { onClick: this.handleReset, radius: "full", className: "gap-2", children: [
          /* @__PURE__ */ jsx89(RefreshCwIcon, { className: "size-4" }),
          "Reload Application"
        ] })
      ] }) });
    }
    return this.props.children;
  }
};

// components/keyboard-shortcuts.tsx
import { useEffect as useEffect9 } from "react";
function KeyboardShortcuts() {
  const {
    handleSelectAllGlobal,
    handleClearSelection,
    getSelectionState,
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isSearchModalOpen,
    setIsSearchModalOpen
  } = useFileManager();
  useEffect9(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchModalOpen(!isSearchModalOpen);
      }
      if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const selectionState = getSelectionState();
        if (selectionState === true) {
          handleClearSelection();
        } else {
          handleSelectAllGlobal(true);
        }
      }
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCreateFolderModalOpen(!isCreateFolderModalOpen);
      }
      if (e.key === "u" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsUploadModalOpen(!isUploadModalOpen);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectAllGlobal, handleClearSelection, getSelectionState, isCreateFolderModalOpen, setIsCreateFolderModalOpen, isUploadModalOpen, setIsUploadModalOpen, isSearchModalOpen, setIsSearchModalOpen]);
  return null;
}

// components/file-manager.tsx
import { jsx as jsx90, jsxs as jsxs64 } from "react/jsx-runtime";
function FileManager(props) {
  return /* @__PURE__ */ jsx90(FileManagerErrorBoundary, { children: /* @__PURE__ */ jsxs64(FileManagerComposition.Page, __spreadProps(__spreadValues({}, props), { children: [
    /* @__PURE__ */ jsx90(KeyboardShortcuts, {}),
    /* @__PURE__ */ jsxs64("div", { className: "flex h-full relative pb-12 overflow-hidden bg-background text-foreground", children: [
      /* @__PURE__ */ jsxs64("div", { className: "flex-1 flex w-full flex-col overflow-y-auto", children: [
        /* @__PURE__ */ jsx90(FileManagerComposition.Header, { children: /* @__PURE__ */ jsxs64("div", { className: "flex w-full justify-between gap-2", children: [
          /* @__PURE__ */ jsx90(HeaderNavigation, {}),
          /* @__PURE__ */ jsx90(ResponsiveHeaderActions, {})
        ] }) }),
        /* @__PURE__ */ jsx90(BulkActionsFloating, { className: "-mb-1" }),
        /* @__PURE__ */ jsx90(UnifiedGrid, {}),
        /* @__PURE__ */ jsx90(FileManagerComposition.Footer, { className: "pt-6 pb-10" })
      ] }),
      /* @__PURE__ */ jsx90(FileManagerComposition.Overlays, {})
    ] })
  ] })) });
}

// components/file-manager-modal.tsx
import { useState as useState18, useRef as useRef5, useEffect as useEffect10 } from "react";
import { Fragment as Fragment4, jsx as jsx91, jsxs as jsxs65 } from "react/jsx-runtime";
function FileManagerModal(_a) {
  var _b = _a, {
    open,
    onClose
  } = _b, props = __objRest(_b, [
    "open",
    "onClose"
  ]);
  return /* @__PURE__ */ jsx91(FileManagerComposition.Modal, __spreadProps(__spreadValues({}, props), { onClose, children: /* @__PURE__ */ jsx91(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsx91(ModalContent, { onClose }) }) }));
}
function ModalContent({ onClose }) {
  const { updateSearchQuery } = useFileManager();
  const [isSearchActive, setIsSearchActive] = useState18(false);
  const [searchInput, setSearchInput] = useState18("");
  const searchInputRef = useRef5(null);
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  useEffect10(() => {
    updateSearchQuery(debouncedSearch);
  }, [debouncedSearch, updateSearchQuery]);
  useEffect10(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);
  return /* @__PURE__ */ jsxs65(DialogContent, { className: "p-0", variant: "fullscreen", showCloseButton: false, children: [
    /* @__PURE__ */ jsxs65(DialogHeader, { className: "pt-5 pb-3 m-0 border-b border-border", children: [
      /* @__PURE__ */ jsx91(DialogTitle, { className: "px-6 text-base", children: /* @__PURE__ */ jsx91("div", { className: "flex w-full justify-between gap-2", children: isSearchActive ? (
        /* Inline Search Mode */
        /* @__PURE__ */ jsxs65("div", { className: "flex items-center gap-4 flex-1", children: [
          /* @__PURE__ */ jsx91(SearchIcon, { className: "size-5 text-gray-500 shrink-0" }),
          /* @__PURE__ */ jsx91(
            Input,
            {
              ref: searchInputRef,
              type: "text",
              placeholder: "Search files and folders...",
              className: "border-none shadow-none focus-visible:ring-0 h-auto p-0 text-base font-semibold",
              value: searchInput,
              onChange: (e) => setSearchInput(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Escape") {
                  setSearchInput("");
                  updateSearchQuery("");
                  setIsSearchActive(false);
                }
              }
            }
          ),
          /* @__PURE__ */ jsx91(
            CloseButton,
            {
              onClick: () => {
                setSearchInput("");
                updateSearchQuery("");
                setIsSearchActive(false);
              },
              className: "shrink-0",
              label: "Cancel Search"
            }
          )
        ] })
      ) : (
        /* Normal Header Mode */
        /* @__PURE__ */ jsxs65(Fragment4, { children: [
          /* @__PURE__ */ jsx91(HeaderNavigation, {}),
          /* @__PURE__ */ jsx91(ModalResponsiveHeaderActions, { onSearchClick: () => setIsSearchActive(true) }),
          /* @__PURE__ */ jsx91(CloseButton, { onClick: onClose })
        ] })
      ) }) }),
      /* @__PURE__ */ jsx91(DialogDescription, { className: "sr-only", children: "Browse and select files from your media library" })
    ] }),
    /* @__PURE__ */ jsxs65("div", { className: "overflow-y-auto flex-1 pb-4", children: [
      /* @__PURE__ */ jsx91(UnifiedGrid, {}),
      /* @__PURE__ */ jsx91(FileManagerComposition.Footer, { className: "my-4" }),
      /* @__PURE__ */ jsx91(FileManagerComposition.Overlays, {})
    ] }),
    /* @__PURE__ */ jsx91(FileManagerModalFooter, { onClose })
  ] });
}
function FileManagerModalFooter({ onClose }) {
  const {
    selectedFiles,
    onFilesSelected,
    setSelectedFiles,
    setSelectedFolders,
    updateSearchQuery,
    handlePageChange
  } = useFileManager();
  const handleSelect = () => {
    if (onFilesSelected && selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
      setSelectedFolders([]);
      updateSearchQuery("");
      handlePageChange(1);
      onClose();
    }
  };
  return /* @__PURE__ */ jsxs65(DialogFooter, { className: "px-6 py-4 border-t border-border w-full sm:justify-between justify-center items-center flex-col sm:flex-row gap-2", children: [
    /* @__PURE__ */ jsx91(BulkActionsStatic, {}),
    /* @__PURE__ */ jsx91(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx91(Button, { type: "button", variant: "outline", onClick: onClose, radius: "full", className: "w-full md:w-auto mr-0", children: "Cancel" }) }),
    /* @__PURE__ */ jsxs65(
      Button,
      {
        type: "button",
        onClick: handleSelect,
        disabled: selectedFiles.length === 0,
        radius: "full",
        className: "w-full md:w-auto",
        children: [
          "Select ",
          selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""
        ]
      }
    )
  ] });
}

// data/data.ts
var mockFolders = [
  {
    id: 1,
    name: "Documents",
    pathId: 1,
    path: "/1",
    parentId: null,
    fileCount: 20,
    // Updated: now has 20 files
    folderCount: 0,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-01")
  },
  {
    id: 2,
    name: "Images",
    pathId: 2,
    path: "/2",
    parentId: null,
    fileCount: 10,
    // Updated: now has 10 image files
    folderCount: 3,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-01")
  },
  {
    id: 3,
    name: "Videos",
    pathId: 3,
    path: "/3",
    parentId: null,
    fileCount: 5,
    // Updated: now has 5 video files
    folderCount: 0,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-01")
  },
  {
    id: 4,
    name: "Music Some Long Name Streched also so long to fit in the card Music Some Long Name Streched also so long to fit in the card",
    pathId: 4,
    path: "/4",
    parentId: null,
    fileCount: 5,
    // Updated: now has 5 audio files
    folderCount: 0,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-01")
  },
  {
    id: 5,
    name: "Archives",
    pathId: 5,
    path: "/5",
    parentId: null,
    fileCount: 5,
    // Updated: now has 5 archive files
    folderCount: 0,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-01")
  },
  {
    id: 6,
    name: "Album 01",
    pathId: 6,
    path: "/2/6",
    parentId: 2,
    fileCount: 0,
    folderCount: 0,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-01")
  },
  {
    id: 7,
    name: "Album 02",
    pathId: 7,
    path: "/2/7",
    parentId: 2,
    fileCount: 0,
    folderCount: 0,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-01")
  },
  {
    id: 8,
    name: "Squirrels",
    pathId: 8,
    path: "/2/8",
    parentId: 2,
    fileCount: 1,
    folderCount: 0,
    createdAt: /* @__PURE__ */ new Date("2024-01-01"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-01")
  }
];
var mockTags = [
  { id: 1, name: "Important", color: "#ef4444" },
  { id: 2, name: "Work", color: "#3b82f6" },
  { id: 3, name: "Personal", color: "#10b981" },
  { id: 4, name: "Project", color: "#8b5cf6" },
  { id: 5, name: "Archive", color: "#6b7280" }
];
var mockFiles = [
  // Root level files (folderId: null)
  {
    id: 101,
    name: "welcome.pdf",
    url: "/placeholder.svg?height=400&width=300",
    size: 245e3,
    createdAt: /* @__PURE__ */ new Date("2024-05-15T10:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-15T10:00:00Z"),
    folderId: null,
    tags: ["important"],
    mime: "application/pdf",
    ext: ".pdf",
    metaData: { pageCount: 2, author: "Admin" }
  },
  {
    id: 102,
    name: "desktop_wallpaper.jpg",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926",
    size: 42e5,
    createdAt: /* @__PURE__ */ new Date("2024-05-14T15:30:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-14T15:30:00Z"),
    folderId: null,
    tags: ["personal"],
    mime: "image/jpeg",
    ext: ".jpg",
    width: 5e3,
    height: 3333,
    formats: {
      thumbnail: {
        ext: ".jpg",
        url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=156",
        hash: "thumbnail_desktop_wallpaper_abc123",
        mime: "image/jpeg",
        name: "thumbnail_desktop_wallpaper.jpg",
        path: null,
        size: 5.57,
        width: 156,
        height: 104
      },
      small: {
        ext: ".jpg",
        url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=500",
        hash: "small_desktop_wallpaper_abc123",
        mime: "image/jpeg",
        name: "small_desktop_wallpaper.jpg",
        path: null,
        size: 47.27,
        width: 500,
        height: 333
      },
      medium: {
        ext: ".jpg",
        url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=750",
        hash: "medium_desktop_wallpaper_abc123",
        mime: "image/jpeg",
        name: "medium_desktop_wallpaper.jpg",
        path: null,
        size: 97.89,
        width: 750,
        height: 500
      },
      large: {
        ext: ".jpg",
        url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1000",
        hash: "large_desktop_wallpaper_abc123",
        mime: "image/jpeg",
        name: "large_desktop_wallpaper.jpg",
        path: null,
        size: 159.48,
        width: 1e3,
        height: 667
      }
    },
    metaData: {}
  },
  {
    id: 103,
    name: "quick_notes.txt",
    url: "/placeholder.svg?height=400&width=300",
    size: 3500,
    createdAt: /* @__PURE__ */ new Date("2024-05-13T09:45:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-13T09:45:00Z"),
    folderId: null,
    tags: [],
    mime: "text/plain",
    ext: ".txt",
    metaData: {}
  },
  {
    id: 104,
    name: "intro_video.mp4",
    url: "https://docs.material-tailwind.com/demo.mp4",
    size: 12e6,
    createdAt: /* @__PURE__ */ new Date("2024-05-12T14:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-12T14:00:00Z"),
    folderId: null,
    tags: [],
    mime: "video/mp4",
    ext: ".mp4",
    width: 1920,
    height: 1080,
    metaData: { duration: 90, videoSource: "local" }
  },
  {
    id: 105,
    name: "profile_photo.png",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    size: 85e4,
    createdAt: /* @__PURE__ */ new Date("2024-05-11T11:20:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-11T11:20:00Z"),
    folderId: null,
    tags: ["personal"],
    mime: "image/png",
    ext: ".png",
    width: 2e3,
    height: 2e3,
    formats: {
      thumbnail: {
        ext: ".png",
        url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=156",
        hash: "thumbnail_profile_photo_def456",
        mime: "image/png",
        name: "thumbnail_profile_photo.png",
        path: null,
        size: 8.2,
        width: 156,
        height: 156
      },
      small: {
        ext: ".png",
        url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500",
        hash: "small_profile_photo_def456",
        mime: "image/png",
        name: "small_profile_photo.png",
        path: null,
        size: 52.3,
        width: 500,
        height: 500
      },
      medium: {
        ext: ".png",
        url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=750",
        hash: "medium_profile_photo_def456",
        mime: "image/png",
        name: "medium_profile_photo.png",
        path: null,
        size: 110.5,
        width: 750,
        height: 750
      },
      large: {
        ext: ".png",
        url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=1000",
        hash: "large_profile_photo_def456",
        mime: "image/png",
        name: "large_profile_photo.png",
        path: null,
        size: 185.7,
        width: 1e3,
        height: 1e3
      }
    },
    metaData: {}
  },
  {
    id: 106,
    name: "todo_list.md",
    url: "/placeholder.svg?height=400&width=300",
    size: 6200,
    createdAt: /* @__PURE__ */ new Date("2024-05-10T08:30:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-10T08:30:00Z"),
    folderId: null,
    tags: ["important"],
    mime: "text/markdown",
    ext: ".md",
    metaData: {}
  },
  {
    id: 107,
    name: "app_settings.json",
    url: "/placeholder.svg?height=400&width=300",
    size: 4800,
    createdAt: /* @__PURE__ */ new Date("2024-05-09T16:15:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-09T16:15:00Z"),
    folderId: null,
    tags: [],
    mime: "application/json",
    ext: ".json",
    metaData: {}
  },
  {
    id: 108,
    name: "mountain_landscape.webp",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    size: 12e5,
    createdAt: /* @__PURE__ */ new Date("2024-05-08T13:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-08T13:00:00Z"),
    folderId: null,
    tags: ["personal"],
    mime: "image/webp",
    ext: ".webp",
    width: 4e3,
    height: 2667,
    metaData: {}
  },
  // Files in folders
  {
    id: 1,
    name: "Key-Monastery-img.avif",
    url: "https://unciatrails.com/wp-content/uploads/2024/07/Key-Monastery-img.avif",
    size: 2621440,
    // 2.5 MB
    createdAt: /* @__PURE__ */ new Date("2023-10-26T10:30:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-10-26T10:30:00Z"),
    folderId: 8,
    tags: ["personal", "important"],
    mime: "image/avif",
    ext: ".avif",
    caption: "A cute squirrel in the park",
    alternativeText: "Gray squirrel sitting on wooden fence",
    width: 3024,
    height: 4032,
    metaData: {}
  },
  {
    id: 2,
    name: "project_proposal thoda sa.pdf",
    url: "/placeholder.svg?height=400&width=300",
    size: 1048576,
    // 1 MB
    createdAt: /* @__PURE__ */ new Date("2024-05-10T14:20:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-10T14:20:00Z"),
    folderId: 1,
    tags: ["work", "important"],
    mime: "application/pdf",
    ext: ".pdf",
    metaData: {
      pageCount: 15,
      author: "John Doe"
    }
  },
  {
    id: 3,
    name: "quarterly_report.xlsx",
    url: "/placeholder.svg?height=400&width=300",
    size: 524288,
    // 512 KB
    createdAt: /* @__PURE__ */ new Date("2024-05-08T09:15:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-08T09:15:00Z"),
    folderId: 1,
    tags: ["work"],
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ext: ".xlsx",
    metaData: {
      pageCount: 10
    }
  },
  {
    id: 4,
    name: "presentation.pptx",
    url: "/placeholder.svg?height=400&width=300",
    size: 2097152,
    // 2 MB
    createdAt: /* @__PURE__ */ new Date("2024-05-05T16:45:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-05T16:45:00Z"),
    folderId: 1,
    tags: ["work", "project"],
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ext: ".pptx",
    metaData: {
      pageCount: 20
    }
  },
  {
    id: 8,
    name: "documnet.doc",
    url: "/placeholder.svg?height=400&width=300",
    size: 2097152,
    // 2 MB
    createdAt: /* @__PURE__ */ new Date("2024-05-05T16:45:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-05T16:45:00Z"),
    folderId: 1,
    tags: ["work", "project"],
    mime: "application/msword",
    ext: ".doc",
    metaData: {
      pageCount: 20
    }
  },
  {
    id: 5,
    name: "demo_video.mp4",
    url: "https://docs.material-tailwind.com/demo.mp4",
    size: 10485760,
    // 10 MB
    createdAt: /* @__PURE__ */ new Date("2024-05-03T11:30:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-03T11:30:00Z"),
    folderId: 3,
    tags: ["project"],
    mime: "video/mp4",
    ext: ".mp4",
    width: 1920,
    height: 1080,
    metaData: {
      duration: 120,
      // 2 minutes
      videoSource: "remote"
    }
  },
  {
    id: 6,
    name: "podcast_episode.mp3",
    url: "/placeholder.svg?height=400&width=300",
    size: 5242880,
    // 5 MB
    createdAt: /* @__PURE__ */ new Date("2024-05-02T10:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-02T10:00:00Z"),
    folderId: 4,
    tags: ["personal"],
    mime: "audio/mpeg",
    ext: ".mp3",
    metaData: {
      duration: 3600
      // 1 hour
    }
  },
  {
    id: 7,
    name: "notes.txt",
    url: "/placeholder.svg?height=400&width=300",
    size: 1024,
    // 1 KB
    createdAt: /* @__PURE__ */ new Date("2024-05-01T09:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-05-01T09:00:00Z"),
    folderId: 1,
    tags: ["work"],
    mime: "text/plain",
    ext: ".txt",
    metaData: {}
  },
  {
    id: 9,
    name: "data.json",
    url: "/placeholder.svg?height=400&width=300",
    size: 2048,
    // 2 KB
    createdAt: /* @__PURE__ */ new Date("2024-04-30T15:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-04-30T15:00:00Z"),
    folderId: 1,
    tags: ["project"],
    mime: "application/json",
    ext: ".json",
    metaData: {}
  },
  {
    id: 10,
    name: "archive.zip",
    url: "/placeholder.svg?height=400&width=300",
    size: 104857600,
    // 100 MB
    createdAt: /* @__PURE__ */ new Date("2024-04-29T12:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-04-29T12:00:00Z"),
    folderId: 5,
    tags: ["archive"],
    mime: "application/zip",
    ext: ".zip",
    metaData: {
      description: "Project backup"
    }
  },
  {
    id: 11,
    name: "setup.exe",
    url: "/placeholder.svg?height=400&width=300",
    size: 52428800,
    // 50 MB
    createdAt: /* @__PURE__ */ new Date("2024-04-28T11:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-04-28T11:00:00Z"),
    folderId: 5,
    tags: ["software"],
    mime: "application/x-msdownload",
    ext: ".exe",
    metaData: {
      description: "Installer"
    }
  },
  {
    id: 12,
    name: "old_stuff.rar",
    url: "/placeholder.svg?height=400&width=300",
    size: 20971520,
    // 20 MB
    createdAt: /* @__PURE__ */ new Date("2024-04-27T10:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-04-27T10:00:00Z"),
    folderId: 5,
    tags: ["archive"],
    mime: "application/x-rar-compressed",
    ext: ".rar",
    metaData: {
      description: "Old files"
    }
  },
  // Additional files for pagination testing
  {
    id: 13,
    name: "meeting_notes_q1.pdf",
    url: "/placeholder.svg?height=400&width=300",
    size: 856e3,
    createdAt: /* @__PURE__ */ new Date("2024-03-15T09:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-03-15T09:00:00Z"),
    folderId: 1,
    tags: ["work"],
    mime: "application/pdf",
    ext: ".pdf",
    metaData: { pageCount: 8, author: "Sarah Johnson" }
  },
  {
    id: 14,
    name: "budget_2024.xlsx",
    url: "/placeholder.svg?height=400&width=300",
    size: 425e3,
    createdAt: /* @__PURE__ */ new Date("2024-03-10T14:30:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-03-10T14:30:00Z"),
    folderId: 1,
    tags: ["work", "important"],
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ext: ".xlsx",
    metaData: { pageCount: 5 }
  },
  {
    id: 15,
    name: "team_photo.jpg",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    size: 32e5,
    createdAt: /* @__PURE__ */ new Date("2024-02-28T11:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-02-28T11:00:00Z"),
    folderId: 2,
    tags: ["work"],
    mime: "image/jpeg",
    ext: ".jpg",
    width: 4e3,
    height: 3e3,
    metaData: {}
  },
  {
    id: 16,
    name: "logo_design.png",
    url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113",
    size: 15e5,
    createdAt: /* @__PURE__ */ new Date("2024-02-20T10:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-02-20T10:00:00Z"),
    folderId: 2,
    tags: ["project"],
    mime: "image/png",
    ext: ".png",
    width: 2e3,
    height: 2e3,
    metaData: {}
  },
  {
    id: 17,
    name: "product_demo.mp4",
    url: "https://docs.material-tailwind.com/demo.mp4",
    size: 15e6,
    createdAt: /* @__PURE__ */ new Date("2024-02-15T16:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-02-15T16:00:00Z"),
    folderId: 3,
    tags: ["project"],
    mime: "video/mp4",
    ext: ".mp4",
    width: 1920,
    height: 1080,
    metaData: { duration: 180, videoSource: "local" }
  },
  {
    id: 18,
    name: "training_video.mp4",
    url: "https://docs.material-tailwind.com/demo.mp4",
    size: 25e6,
    createdAt: /* @__PURE__ */ new Date("2024-02-10T09:30:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-02-10T09:30:00Z"),
    folderId: 3,
    tags: ["work"],
    mime: "video/mp4",
    ext: ".mp4",
    width: 1920,
    height: 1080,
    metaData: { duration: 300, videoSource: "local" }
  },
  {
    id: 19,
    name: "background_music.mp3",
    url: "/placeholder.svg?height=400&width=300",
    size: 45e5,
    createdAt: /* @__PURE__ */ new Date("2024-02-05T14:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-02-05T14:00:00Z"),
    folderId: 4,
    tags: ["personal"],
    mime: "audio/mpeg",
    ext: ".mp3",
    metaData: { duration: 240 }
  },
  {
    id: 20,
    name: "contract_template.docx",
    url: "/placeholder.svg?height=400&width=300",
    size: 65e4,
    createdAt: /* @__PURE__ */ new Date("2024-01-30T11:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-30T11:00:00Z"),
    folderId: 1,
    tags: ["work"],
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ext: ".docx",
    metaData: { pageCount: 12 }
  },
  {
    id: 21,
    name: "invoice_jan.pdf",
    url: "/placeholder.svg?height=400&width=300",
    size: 32e4,
    createdAt: /* @__PURE__ */ new Date("2024-01-25T10:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-25T10:00:00Z"),
    folderId: 1,
    tags: ["work", "important"],
    mime: "application/pdf",
    ext: ".pdf",
    metaData: { pageCount: 3 }
  },
  {
    id: 22,
    name: "vacation_photo1.jpg",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    size: 28e5,
    createdAt: /* @__PURE__ */ new Date("2024-01-20T15:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-20T15:00:00Z"),
    folderId: 2,
    tags: ["personal"],
    mime: "image/jpeg",
    ext: ".jpg",
    width: 3500,
    height: 2500,
    metaData: {}
  },
  {
    id: 23,
    name: "vacation_photo2.jpg",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    size: 31e5,
    createdAt: /* @__PURE__ */ new Date("2024-01-20T15:05:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-20T15:05:00Z"),
    folderId: 2,
    tags: ["personal"],
    mime: "image/jpeg",
    ext: ".jpg",
    width: 4e3,
    height: 2800,
    metaData: {}
  },
  {
    id: 24,
    name: "project_backup.zip",
    url: "/placeholder.svg?height=400&width=300",
    size: 85e6,
    createdAt: /* @__PURE__ */ new Date("2024-01-15T12:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-15T12:00:00Z"),
    folderId: 5,
    tags: ["archive", "project"],
    mime: "application/zip",
    ext: ".zip",
    metaData: { description: "Full project backup" }
  },
  {
    id: 25,
    name: "presentation_final.pptx",
    url: "/placeholder.svg?height=400&width=300",
    size: 35e5,
    createdAt: /* @__PURE__ */ new Date("2024-01-10T16:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-10T16:00:00Z"),
    folderId: 1,
    tags: ["work", "important"],
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ext: ".pptx",
    metaData: { pageCount: 35 }
  },
  {
    id: 26,
    name: "screenshot_001.png",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    size: 12e5,
    createdAt: /* @__PURE__ */ new Date("2024-01-05T09:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2024-01-05T09:00:00Z"),
    folderId: 2,
    tags: ["work"],
    mime: "image/png",
    ext: ".png",
    width: 1920,
    height: 1080,
    metaData: {}
  },
  {
    id: 27,
    name: "config.json",
    url: "/placeholder.svg?height=400&width=300",
    size: 5e3,
    createdAt: /* @__PURE__ */ new Date("2023-12-28T14:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-12-28T14:00:00Z"),
    folderId: 1,
    tags: ["project"],
    mime: "application/json",
    ext: ".json",
    metaData: {}
  },
  {
    id: 28,
    name: "readme.md",
    url: "/placeholder.svg?height=400&width=300",
    size: 8500,
    createdAt: /* @__PURE__ */ new Date("2023-12-20T10:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-12-20T10:00:00Z"),
    folderId: 1,
    tags: ["project"],
    mime: "text/markdown",
    ext: ".md",
    metaData: {}
  },
  {
    id: 29,
    name: "database_backup.sql",
    url: "/placeholder.svg?height=400&width=300",
    size: 12e6,
    createdAt: /* @__PURE__ */ new Date("2023-12-15T11:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-12-15T11:00:00Z"),
    folderId: 5,
    tags: ["archive", "important"],
    mime: "application/sql",
    ext: ".sql",
    metaData: { description: "Database backup" }
  },
  {
    id: 30,
    name: "tutorial_video.mp4",
    url: "https://docs.material-tailwind.com/demo.mp4",
    size: 18e6,
    createdAt: /* @__PURE__ */ new Date("2023-12-10T13:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-12-10T13:00:00Z"),
    folderId: 3,
    tags: ["personal"],
    mime: "video/mp4",
    ext: ".mp4",
    width: 1920,
    height: 1080,
    metaData: { duration: 420, videoSource: "local" }
  },
  {
    id: 31,
    name: "company_logo.svg",
    url: "/placeholder.svg?height=400&width=300",
    size: 45e3,
    createdAt: /* @__PURE__ */ new Date("2023-12-05T09:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-12-05T09:00:00Z"),
    folderId: 2,
    tags: ["work"],
    mime: "image/svg+xml",
    ext: ".svg",
    metaData: {}
  },
  {
    id: 32,
    name: "report_q4.pdf",
    url: "/placeholder.svg?height=400&width=300",
    size: 18e5,
    createdAt: /* @__PURE__ */ new Date("2023-12-01T15:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-12-01T15:00:00Z"),
    folderId: 1,
    tags: ["work", "important"],
    mime: "application/pdf",
    ext: ".pdf",
    metaData: { pageCount: 25, author: "Finance Team" }
  },
  {
    id: 33,
    name: "nature_photo.webp",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    size: 95e4,
    createdAt: /* @__PURE__ */ new Date("2023-11-25T12:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-11-25T12:00:00Z"),
    folderId: 2,
    tags: ["personal"],
    mime: "image/webp",
    ext: ".webp",
    width: 3e3,
    height: 2e3,
    metaData: {}
  },
  {
    id: 34,
    name: "podcast_intro.mp3",
    url: "/placeholder.svg?height=400&width=300",
    size: 25e5,
    createdAt: /* @__PURE__ */ new Date("2023-11-20T10:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-11-20T10:00:00Z"),
    folderId: 4,
    tags: ["personal"],
    mime: "audio/mpeg",
    ext: ".mp3",
    metaData: { duration: 180 }
  },
  {
    id: 35,
    name: "data_export.csv",
    url: "/placeholder.svg?height=400&width=300",
    size: 85e4,
    createdAt: /* @__PURE__ */ new Date("2023-11-15T14:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-11-15T14:00:00Z"),
    folderId: 1,
    tags: ["work"],
    mime: "text/csv",
    ext: ".csv",
    metaData: {}
  },
  {
    id: 36,
    name: "wireframes.pdf",
    url: "/placeholder.svg?height=400&width=300",
    size: 42e5,
    createdAt: /* @__PURE__ */ new Date("2023-11-10T11:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-11-10T11:00:00Z"),
    folderId: 1,
    tags: ["project"],
    mime: "application/pdf",
    ext: ".pdf",
    metaData: { pageCount: 45 }
  },
  {
    id: 37,
    name: "cityscape.jpg",
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    size: 38e5,
    createdAt: /* @__PURE__ */ new Date("2023-11-05T16:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-11-05T16:00:00Z"),
    folderId: 2,
    tags: ["personal"],
    mime: "image/jpeg",
    ext: ".jpg",
    width: 4500,
    height: 3e3,
    metaData: {}
  },
  {
    id: 38,
    name: "interview_recording.mp3",
    url: "/placeholder.svg?height=400&width=300",
    size: 85e5,
    createdAt: /* @__PURE__ */ new Date("2023-11-01T09:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-11-01T09:00:00Z"),
    folderId: 4,
    tags: ["work"],
    mime: "audio/mpeg",
    ext: ".mp3",
    metaData: { duration: 1800 }
  },
  {
    id: 39,
    name: "client_files.rar",
    url: "/placeholder.svg?height=400&width=300",
    size: 45e6,
    createdAt: /* @__PURE__ */ new Date("2023-10-25T13:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-10-25T13:00:00Z"),
    folderId: 5,
    tags: ["archive", "work"],
    mime: "application/x-rar-compressed",
    ext: ".rar",
    metaData: { description: "Client deliverables" }
  },
  {
    id: 40,
    name: "marketing_plan.docx",
    url: "/placeholder.svg?height=400&width=300",
    size: 12e5,
    createdAt: /* @__PURE__ */ new Date("2023-10-20T10:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-10-20T10:00:00Z"),
    folderId: 1,
    tags: ["work"],
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ext: ".docx",
    metaData: { pageCount: 18 }
  },
  {
    id: 41,
    name: "analytics_data.xlsx",
    url: "/placeholder.svg?height=400&width=300",
    size: 21e5,
    createdAt: /* @__PURE__ */ new Date("2023-10-15T15:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-10-15T15:00:00Z"),
    folderId: 1,
    tags: ["work"],
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ext: ".xlsx",
    metaData: { pageCount: 8 }
  },
  {
    id: 42,
    name: "sunset_beach.jpg",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    size: 32e5,
    createdAt: /* @__PURE__ */ new Date("2023-10-10T17:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-10-10T17:00:00Z"),
    folderId: 2,
    tags: ["personal"],
    mime: "image/jpeg",
    ext: ".jpg",
    width: 4e3,
    height: 2700,
    metaData: {}
  },
  {
    id: 43,
    name: "webinar_recording.mp4",
    url: "https://docs.material-tailwind.com/demo.mp4",
    size: 35e6,
    createdAt: /* @__PURE__ */ new Date("2023-10-05T14:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-10-05T14:00:00Z"),
    folderId: 3,
    tags: ["work"],
    mime: "video/mp4",
    ext: ".mp4",
    width: 1920,
    height: 1080,
    metaData: { duration: 600, videoSource: "local" }
  },
  {
    id: 44,
    name: "sound_effects.wav",
    url: "/placeholder.svg?height=400&width=300",
    size: 15e6,
    createdAt: /* @__PURE__ */ new Date("2023-10-01T11:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-10-01T11:00:00Z"),
    folderId: 4,
    tags: ["project"],
    mime: "audio/wav",
    ext: ".wav",
    metaData: { duration: 120 }
  },
  {
    id: 45,
    name: "legacy_system.zip",
    url: "/placeholder.svg?height=400&width=300",
    size: 125e6,
    createdAt: /* @__PURE__ */ new Date("2023-09-25T09:00:00Z"),
    updatedAt: /* @__PURE__ */ new Date("2023-09-25T09:00:00Z"),
    folderId: 5,
    tags: ["archive"],
    mime: "application/zip",
    ext: ".zip",
    metaData: { description: "Old system files" }
  }
];

// providers/mock-provider.ts
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var MockProvider = class {
  getFolder(folderId) {
    if (folderId === null) return Promise.resolve(null);
    const folder = mockFolders.find((f) => f.id === folderId);
    if (!folder) return Promise.resolve(null);
    const result = __spreadValues({}, folder);
    let current = result;
    while (current.parentId !== null) {
      const parent = mockFolders.find((f) => f.id === current.parentId);
      if (parent) {
        current.parent = __spreadValues({}, parent);
        current = current.parent;
      } else {
        break;
      }
    }
    return Promise.resolve(result);
  }
  async getFolders(folderId, page = 1, limit = 20, query = "") {
    await delay(300);
    const filteredFolders = folderId === null ? mockFolders.filter((folder) => folder.parentId === null) : mockFolders.filter((folder) => folder.parentId === folderId);
    let searchFiltered = filteredFolders;
    if (query == null ? void 0 : query.trim()) {
      const searchLower = query.toLowerCase().trim();
      searchFiltered = filteredFolders.filter(
        (folder) => folder.name.toLowerCase().includes(searchLower)
      );
    }
    const sortedFolders = searchFiltered.toSorted(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
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
  getTags() {
    return Promise.resolve(mockTags.map((tag) => tag.name));
  }
  async getFiles(folderId, fileTypes, page, limit, query) {
    await delay(500);
    let filteredFiles = [...mockFiles];
    if (folderId !== null) {
      filteredFiles = filteredFiles.filter(
        (file) => file.folderId === folderId
      );
    }
    if (fileTypes && fileTypes.length > 0) {
      filteredFiles = filteredFiles.filter((file) => {
        const fileType = getFileTypeFromMime(file.mime, file.ext);
        return fileTypes.includes(fileType);
      });
    }
    if (query) {
      const searchLower = query == null ? void 0 : query.toLowerCase();
      filteredFiles = filteredFiles.filter(
        (file) => file.name.toLowerCase().includes(searchLower)
      );
    }
    const sortedFiles = filteredFiles.toSorted(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const currentPage = page != null ? page : 1;
    const filesPerPage = limit != null ? limit : 10;
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
        filesPerPage
      }
    };
  }
  /**
   * Get files and folders separately (folders always come first)
   * Folders are not paginated (all folders in current directory are returned)
   * Files are paginated after folders
   */
  async getItems(folderId, fileTypes, page = 1, limit = 24, query = "") {
    await delay(300);
    let filteredFolders = folderId === null ? mockFolders.filter((folder) => folder.parentId === null) : mockFolders.filter((folder) => folder.parentId === folderId);
    let filteredFiles = folderId === null ? mockFiles.filter((file) => file.folderId === null) : mockFiles.filter((file) => file.folderId === folderId);
    if (fileTypes && fileTypes.length > 0) {
      filteredFiles = filteredFiles.filter((file) => {
        const fileType = getFileTypeFromMime(file.mime, file.ext);
        return fileTypes.includes(fileType);
      });
    }
    if (query == null ? void 0 : query.trim()) {
      const searchLower = query.toLowerCase().trim();
      filteredFolders = filteredFolders.filter(
        (folder) => folder.name.toLowerCase().includes(searchLower)
      );
      filteredFiles = filteredFiles.filter(
        (file) => {
          var _a, _b;
          return file.name.toLowerCase().includes(searchLower) || ((_b = (_a = file.ext) == null ? void 0 : _a.toLowerCase().includes(searchLower)) != null ? _b : false);
        }
      );
    }
    const sortedFolders = filteredFolders.toSorted(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const sortedFiles = filteredFiles.toSorted(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const totalItems = sortedFolders.length + sortedFiles.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const foldersToShow = sortedFolders.slice(
      Math.max(0, startIndex),
      Math.min(sortedFolders.length, endIndex)
    );
    const foldersTaken = foldersToShow.length;
    const fileSlots = limit - foldersTaken;
    const fileStartIndex = Math.max(0, startIndex - sortedFolders.length);
    const filesToShow = sortedFiles.slice(fileStartIndex, fileStartIndex + fileSlots);
    return {
      folders: foldersToShow,
      files: filesToShow,
      pagination: {
        currentPage: page,
        totalPages,
        totalFiles: totalItems,
        filesPerPage: limit
      }
    };
  }
  async createFolder(name, parentId) {
    await delay(300);
    const newFolder = {
      id: Date.now(),
      // simple unique id
      name,
      parentId: parentId != null ? parentId : null,
      pathId: typeof parentId === "number" ? parentId : 0,
      // Fallback logic
      path: "",
      fileCount: 0,
      folderCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    mockFolders.push(newFolder);
    return newFolder;
  }
  getMetaDataType(file, videoSource) {
    if (file.type.startsWith("image/")) {
      return {};
    } else if (file.type.startsWith("video/")) {
      return {
        duration: 0,
        // Mock
        videoSource: videoSource != null ? videoSource : VIDEO_SOURCE.LOCAL
      };
    } else if (file.type.startsWith("audio/")) {
      return {
        duration: 0
      };
    }
    return {
      description: ""
    };
  }
  getFileType(file) {
    var _a;
    const ext = "." + ((_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase());
    return getFileTypeFromMime(file.type, ext);
  }
  // Note: Static helper removed - use getFileTypeFromMime from lib/file-type-utils instead
  async uploadFiles(files, folderId) {
    var _a;
    await delay(500);
    const uploadedFiles = [];
    for (const { file, videoSource } of files) {
      const fileType = this.getFileType(file);
      const ext = "." + ((_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase());
      const newFile = {
        id: Date.now() + Math.random(),
        // Ensure unique IDs
        name: file.name,
        folderId: folderId != null ? folderId : null,
        size: file.size,
        url: URL.createObjectURL(file),
        // Mock URL
        // type field omitted - will be derived from mime/ext using getFileTypeFromMime
        mime: file.type || "application/octet-stream",
        ext,
        metaData: this.getMetaDataType(file, videoSource),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        tags: [],
        // Mock default dims for images if needed, or leave undefined
        width: fileType === FILE_TYPE.IMAGE ? 800 : void 0,
        height: fileType === FILE_TYPE.IMAGE ? 600 : void 0
      };
      mockFiles.push(newFile);
      uploadedFiles.push(newFile);
    }
    return uploadedFiles;
  }
  renameFolder(folderId, newName) {
    const folder = mockFolders.find((f) => f.id === folderId);
    if (!folder) {
      return Promise.reject(new Error("Folder not found"));
    }
    folder.name = newName;
    folder.updatedAt = /* @__PURE__ */ new Date();
    return Promise.resolve(folder);
  }
  updateFileMetaData(fileId, updates) {
    const file = mockFiles.find((f) => f.id === fileId);
    if (!file) {
      return Promise.reject(new Error("File not found"));
    }
    const _a = updates, { metaData } = _a, rootUpdates = __objRest(_a, ["metaData"]);
    Object.assign(file, rootUpdates);
    if (metaData) {
      file.metaData = __spreadValues(__spreadValues({}, file.metaData), metaData);
    }
    file.updatedAt = /* @__PURE__ */ new Date();
    return Promise.resolve(file);
  }
  deleteFiles(fileIds) {
    for (const fileId of fileIds) {
      const fileIndex = mockFiles.findIndex((f) => f.id === fileId);
      if (fileIndex !== -1) {
        mockFiles.splice(fileIndex, 1);
      }
    }
    return Promise.resolve();
  }
  deleteFolders(folderIds) {
    for (const folderId of folderIds) {
      const folderIndex = mockFolders.findIndex((f) => f.id === folderId);
      if (folderIndex !== -1) {
        mockFolders.splice(folderIndex, 1);
        for (let i = mockFiles.length - 1; i >= 0; i--) {
          if (mockFiles[i].folderId === folderId) {
            mockFiles.splice(i, 1);
          }
        }
      }
    }
    return Promise.resolve();
  }
  findFiles(searchQuery) {
    const query = searchQuery == null ? void 0 : searchQuery.toLowerCase();
    const foundFiles = mockFiles.filter(
      (file) => {
        var _a;
        return file.name.toLowerCase().includes(query) || ((_a = file.tags) == null ? void 0 : _a.some((tag) => tag.toLowerCase().includes(query)));
      }
    );
    return Promise.resolve(foundFiles);
  }
  findFolders(searchQuery) {
    const query = searchQuery == null ? void 0 : searchQuery.toLowerCase();
    const foundFolders = mockFolders.filter(
      (folder) => folder.name.toLowerCase().includes(query)
    );
    return Promise.resolve(foundFolders);
  }
  moveFiles(fileIds, newFolderId) {
    const movedFiles = [];
    for (const fileId of fileIds) {
      const file = mockFiles.find((f) => f.id === fileId);
      if (file) {
        file.folderId = newFolderId;
        file.updatedAt = /* @__PURE__ */ new Date();
        movedFiles.push(file);
      }
    }
    return Promise.resolve(movedFiles);
  }
  moveFolders(folderIds, newParentId) {
    const movedFolders = [];
    for (const folderId of folderIds) {
      const folder = mockFolders.find((f) => f.id === folderId);
      if (folder) {
        folder.parentId = newParentId;
        folder.updatedAt = /* @__PURE__ */ new Date();
        movedFolders.push(folder);
      }
    }
    return Promise.resolve(movedFolders);
  }
};
export {
  FILE_TYPE,
  FILE_TYPES,
  FileManager,
  FileManagerModal,
  FileManagerProvider,
  MODE,
  MODES,
  MockProvider,
  SELECTION_MODE,
  SELECTION_MODES,
  VIDEO_SOURCE,
  VIDEO_SOURCES,
  VIEW_MODE,
  VIEW_MODES,
  useFileManager
};
