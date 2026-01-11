import { DocumentMetaData, FileMetaData } from "@/types/file-manager";
import { Icons } from "../utils/icons";

interface DocumentCardProps {
    file: FileMetaData;
    className?: string;
}

export function DocumentCard({ file, className }: DocumentCardProps) {

    
    // If the previous code had specific icons for pdf, excel etc, they are likely available in generic Icons component.
    // I will try to support them if I can map them.
    // In types, DocumentFormat = pdf, docx, xlsx, pptx, txt.
    // So I can check `(file.metaData as DocumentMetaData)?.format`
    
    // Use file extension to determine icon
    // remove leading dot
    const ext = file.ext?.replace(".", "") || "";
    
    const iconType = ext || "file";
    
    // Note: I am assuming Icons component handles these strings. 
    
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
