'use client';
import { FileMetaData } from "@/types/file-manager";
import ImageIcon from "../icons/image";
import { useState } from "react";

/** Props for the ImageCard component. */
interface ImageCardProps {
    /** The image file metadata to display. */
    file: FileMetaData;
}

/**
 * A grid card item tailored for optimal image display.
 * Falls back to an SVG icon if the image URL or previewUrl fails to load.
 */
export function ImageCard({ file }: ImageCardProps) {
    const [hasError, setHasError] = useState(false);

    const imageSrc = file.previewUrl || file.url;

    if (imageSrc && !hasError) {
        return (
            <img
                src={imageSrc}
                alt={file?.name?.substring(0, 10) || "image"}
                className="w-full h-full object-contain rounded-md drop-shadow-md"
                onError={() => setHasError(true)}
            />
        );
    }
    return <ImageIcon />;
}

/**
 * Renders image-specific metadata in the grid card footer.
 * Displays the intrinsic dimensions (WxH) of the image.
 */
export function ImageCardMetadata({ file }: { file: FileMetaData }) {
    if (!file.caption) return null;
    return (
        <p className="text-xs text-primary line-clamp-2 mb-2">
            {file.height} x {file.width}
        </p>
    );
}