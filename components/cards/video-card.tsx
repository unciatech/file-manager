import { FileMetaData, VideoMetaData } from "@/types/file-manager";
import { Icons } from "@/lib/icons";

interface VideoCardProps {
    file: FileMetaData;
    className?: string;
}

export function VideoCard({ file, className }: VideoCardProps) {
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
