'use client'
import { FileManagerProvider } from "@/context/file-manager-context";
import { FileManagerHeader } from "./layout/header";
import { FileManagerFooter } from "./layout/footer";
import { FileManagerContent } from "./layout/content";
import { FileManagerOverlays } from "./layout/overlays";

export const FileManagerComposition = {
    Root: FileManagerProvider,
    Header: FileManagerHeader,
    Footer: FileManagerFooter,
    Content: FileManagerContent,
    Overlays: FileManagerOverlays,
}