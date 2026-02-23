import { FileMetaData } from "@/types/file-manager";
import { Icons } from "@/lib/file-utils";

/** Props for the AudioCard component. */
interface AudioCardProps {
    /** The audio file metadata to display. */
    file: FileMetaData;
    /** Optional CSS class names to apply to the root SVG icon. */
    className?: string;
}

/**
 * A grid card item representing an audio file (e.g., MP3, WAV).
 * Renders a default musical note audio icon centered in the card placeholder.
 */
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

/**
 * Renders audio-specific metadata in the grid card footer.
 * Displays the formatted audio duration (MM:SS) if available.
 */
export function AudioCardMetadata({ file }: { file: FileMetaData }) {
    if (!file.metaData?.duration) return null;
    
    return (
        <p className="text-xs text-blue-600 mb-2">
            Duration: {Math.floor(file.metaData.duration / 60)}:
            {(file.metaData.duration % 60).toString().padStart(2, "0")}
        </p>
    );
}
