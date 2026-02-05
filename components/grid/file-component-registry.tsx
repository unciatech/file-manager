import React from "react";
import { FileMetaData } from "@/types/file-manager";
import { getFileTypeFromMime } from "@/lib/file-utils";
import { ImageCard, ImageCardMetadata } from "../cards/image-card";
import { VideoCard, VideoCardMetadata } from "../cards/video-card";
import { AudioCard, AudioCardMetadata } from "../cards/audio-card";
import { DocumentCard, DocumentCardMetadata } from "../cards/document-card";
import { DefaultCard } from "../cards/default-card";

// Define the interface for the registry values
interface FileComponentConfig {
    component: React.ComponentType<{ file: FileMetaData; metaData: any }>;
    metadataComponent?: React.ComponentType<{ file: FileMetaData }>;
}

// The Registry Object
export const FILE_COMPONENT_REGISTRY: Record<string, FileComponentConfig> = {
    images: {
        component: ImageCard,
        metadataComponent: ImageCardMetadata,
    },
    videos: {
        component: VideoCard,
        metadataComponent: VideoCardMetadata,
    },
    files: {
        component: DocumentCard,
        metadataComponent: DocumentCardMetadata,
    },
    audios: {
        component: AudioCard,
        metadataComponent: AudioCardMetadata,
    },
    default: {
        component: DefaultCard,
    },
};

// Helper to get component safely
export function getFileComponents(file: FileMetaData) {
    // Derive type from MIME and extension if not explicitly set
    const type = getFileTypeFromMime(file.mime, file.ext);
    return FILE_COMPONENT_REGISTRY[type] || FILE_COMPONENT_REGISTRY.default;
}
