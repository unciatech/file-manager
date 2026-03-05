import { FileMetaData } from "@/types/file-manager";
import { getIconType, Icons } from "@/lib/file-utils";
/** Props for the DocumentCard component. */
interface DocumentCardProps {
    /** The document file metadata to display. */
    file: FileMetaData;
    /** Optional CSS class names to apply to the root SVG icon. */
    className?: string;
}

/**
 * A grid card item representing a document file (e.g., PDF, Word, TXT).
 * Renders a specialized icon based on the document's extension and MIME type.
 * Acts as a visual placeholder when there's no available thumbnail preview.
 */
export function DocumentCard({ file, className }: DocumentCardProps) {
    // Use getIconType for proper icon mapping based on MIME type and extension
    const iconType = getIconType(file.mime, file.ext);
    
    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent relative">
            {file.previewUrl ? (
                <img 
                    src={file.previewUrl} 
                    alt={file.name} 
                    className="w-full h-full object-contain rounded-md drop-shadow-md"
                />
            ) : (
                <div className="text-center">
                    <div className="text-4xl">
                        <Icons type={iconType} className={className} />
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Renders document-specific metadata in the grid card footer.
 * Displays the total page count if available from the backend.
 */
export function DocumentCardMetadata({ file }: { file: FileMetaData }) {
    if (!file.metaData?.pageCount) return null;
    return (
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
            Pages: {file.metaData.pageCount}
        </p>
    );
}
