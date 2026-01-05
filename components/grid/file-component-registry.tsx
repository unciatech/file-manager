import React from "react";
import { FileMetaData, FileType } from "@/types/file-manager";
import { ImageCard, ImageCardMetadata } from "../cards/image-card";
import { VideoCard, VideoCardMetadata } from "../cards/video-card";
import { DocumentCard, DocumentCardMetadata } from "../cards/document-card";
import { OtherCard } from "../cards/other-card";
import { DefaultCard } from "../cards/default-card";

// Define the interface for the registry values
interface FileComponentConfig {
    component: React.ComponentType<{ file: FileMetaData; metaData: any }>;
    metadataComponent?: React.ComponentType<{ metaData: any }>;
}

// The Registry Object
export const FILE_COMPONENT_REGISTRY: Record<string, FileComponentConfig> = {
    image: {
        component: ImageCard,
        metadataComponent: ImageCardMetadata,
    },
    video: {
        component: VideoCard,
        metadataComponent: VideoCardMetadata,
    },
    document: {
        component: DocumentCard,
        metadataComponent: DocumentCardMetadata,
    },
    other: {
        component: OtherCard,
        // OtherCard doesn't have specific metadata component yet, or we can add one later
    },
    default: {
        component: DefaultCard,
    },
};

// Helper to get component safely
export function getFileComponents(type: FileType) {
    return FILE_COMPONENT_REGISTRY[type] || FILE_COMPONENT_REGISTRY.default;
}
