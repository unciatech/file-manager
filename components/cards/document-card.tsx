import { DocumentMetaData, FileMetaData } from "@/types/file-manager";
import { getIconType, Icons } from "@/lib/file-utils";
interface DocumentCardProps {
    file: FileMetaData;
    className?: string;
}

export function DocumentCard({ file, className }: DocumentCardProps) {
    // Use getIconType for proper icon mapping based on MIME type and extension
    const iconType = getIconType(file.mime, file.ext);
    
    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent">
            <div className="text-center">
                <div className="text-4xl">
                    <Icons type={iconType} className={className} />
                </div>
            </div>
        </div>
    );
}

export function DocumentCardMetadata({ file }: { file: FileMetaData }) {
    const metaData = file.metaData as DocumentMetaData;
    if (!metaData?.pageCount) return null;
    return (
        <p className="text-xs text-blue-600 mb-2">
            Pages: {metaData.pageCount}
        </p>
    );
}
