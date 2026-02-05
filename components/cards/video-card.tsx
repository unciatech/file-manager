import { FileMetaData, VideoMetaData } from "@/types/file-manager";
import { Icons } from "@/lib/file-utils";
import { Play } from "lucide-react";
import { useState } from "react";

interface VideoCardProps {
    file: FileMetaData;
    className?: string;
}

export function VideoCard({ file, className }: VideoCardProps) {
    const [hasError, setHasError] = useState(false);

    // If we have a URL and no error, show video preview
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
                        <Play className="size-5 text-white fill-white" />
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

export function VideoCardMetadata({ file }: { file: FileMetaData }) {
    const metaData = file.metaData as VideoMetaData;
    if (!metaData?.duration) return null;
    
    return (
        <p className="text-xs text-blue-600 mb-2">
            Duration: {Math.floor(metaData.duration / 60)}:
            {(metaData.duration % 60).toString().padStart(2, "0")}
        </p>
    );
}
