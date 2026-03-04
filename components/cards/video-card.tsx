import { FileMetaData } from "@/types/file-manager";
import { Icons } from "@/lib/file-utils";
import { PlayIcon } from '../icons';
import { useState } from "react";

/** Props for the VideoCard component. */
interface VideoCardProps {
    /** The video file metadata to display. */
    file: FileMetaData;
    /** Optional CSS class names to apply to the root SVG icon. */
    className?: string;
}

/**
 * A grid card item representing a playable video file.
 * Prioritizes rendering a lightweight image thumbnail (`previewUrl`), falling back 
 * to mounting a muted `<video>` tag for preview if no thumbnail was generated.
 * Provides a play icon overlay to differentiate from static images.
 */
export function VideoCard({ file, className }: VideoCardProps) {
    const [hasError, setHasError] = useState(false);

    // If we have a previewUrl, prefer it for the thumbnail
    if (file.previewUrl && !hasError) {
        return (
            <div className="relative w-full h-full">
                <img
                    src={file.previewUrl}
                    className="w-full h-full object-contain rounded-md"
                    alt={file.name}
                    onError={() => setHasError(true)}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 rounded-full p-2 backdrop-blur-xs">
                        <PlayIcon className="size-5 text-white fill-white" />
                    </div>
                </div>
            </div>
        );
    }

    // If we have a video URL and no error, show video preview (fallback if no previewUrl)
    if (file.url && !hasError) {
        return (
            <div className="relative w-full h-full">
                {/* Video element for thumbnail */}
                <video
                    src={file.url}
                    className="w-full h-full object-contain rounded-md"
                    preload="metadata"
                    onError={() => setHasError(true)}
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 rounded-full p-2 backdrop-blur-xs">
                        <PlayIcon className="size-5 text-white fill-white" />
                    </div>
                </div>
            </div>
        );
    }

    // Fallback to icon if no URL or error
    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent">
            <div className="text-center">
                <div className="text-4xl">
                    <Icons type="video" className={className} />
                </div>
            </div>
        </div>
    );
}

/**
 * Renders video-specific metadata in the grid card footer.
 * Displays the formatted video duration (MM:SS) if available.
 */
export function VideoCardMetadata({ file }: { file: FileMetaData }) {
    if (!file.metaData?.duration) return null;
    
    return (
        <p className="text-xs text-blue-600 mb-2">
            Duration: {Math.floor(file.metaData.duration / 60)}:
            {(file.metaData.duration % 60).toString().padStart(2, "0")}
        </p>
    );
}
