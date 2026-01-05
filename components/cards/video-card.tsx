import React from "react";
import { FileMetaData, VideoMetaData } from "@/types/file-manager";
import { Play } from "lucide-react";

interface VideoCardProps {
    file: FileMetaData;
    metaData: VideoMetaData | null;
}

export function VideoCard({ file, metaData }: VideoCardProps) {
    if (!metaData) return null;

    // Simplified inline implementation of a Video Card UI
    return (
        <div className="relative flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 rounded-sm overflow-hidden group">
            {/* If we had a thumbnail, we would show it here. For now, show a play icon. */}
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-black/70 transition-colors">
                    <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                 </div>
            </div>
             <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium">
                {Math.floor(metaData.duration / 60)}:{(metaData.duration % 60).toString().padStart(2, "0")}
            </div>
        </div>
    );
}

export function VideoCardMetadata({ metaData }: { metaData: VideoMetaData | null }) {
    if (!metaData?.duration) return null;
    
    return (
        <p className="text-xs text-gray-600 mb-2">
            Duration: {Math.floor(metaData.duration / 60)}:
            {(metaData.duration % 60).toString().padStart(2, "0")}
        </p>
    );
}
