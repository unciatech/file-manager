'use client';
import { FileMetaData } from "@/types/file-manager";
import ImageIcon from "../icons/image";
import { useState } from "react";

interface ImageCardProps {
    file: FileMetaData;
    // metaData prop is no longer needed/typed for images
}

export function ImageCard({ file }: ImageCardProps) {
    const [hasError, setHasError] = useState(false);

    if (file.url && !hasError) {
        return (
            <img
                src={file.url}
                alt={file?.name?.substring(0, 10) || "image"}
                className="w-full h-full object-contain rounded-md drop-shadow-md"
                onError={() => setHasError(true)}
            />
        );
    }
    return <ImageIcon />;
}

export function ImageCardMetadata({ file }: { file: FileMetaData }) {
    if (!file.caption) return null;
    return (
        <p className="text-xs text-blue-600 line-clamp-2 mb-2">
            {file.height} x {file.width}
        </p>
    );
}