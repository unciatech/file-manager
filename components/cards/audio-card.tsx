import { FileMetaData, AudioMetaData } from "@/types/file-manager";
import { Icons } from "../utils/icons";

interface AudioCardProps {
    file: FileMetaData;
    className?: string;
}

export function AudioCard({ file, className }: AudioCardProps) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent">
            <div className="text-center">
                <div className="text-4xl">
                    <Icons type="audio" className={className} />
                </div>
            </div>
        </div>
    );
}

export function AudioCardMetadata({ file }: { file: FileMetaData }) {
    const metaData = file.metaData as AudioMetaData;
    if (!metaData?.duration) return null;
    
    return (
        <p className="text-xs text-blue-600 mb-2">
            Duration: {Math.floor(metaData.duration / 60)}:
            {(metaData.duration % 60).toString().padStart(2, "0")}
        </p>
    );
}
