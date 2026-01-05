import React from "react";
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
    
    const meta = file.metaData as DocumentMetaData;
    const format = meta?.format;

    // Map format to Icon type if Icons supports it, otherwise generic 'document'
    // Icons component supports: pdf, excel/xlsx, powerpoint/pptx, doc/docx, txt, json
    const iconType = format || "document";
    
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

export function DocumentCardMetadata({ metaData }: { metaData: DocumentMetaData | null }) {
    if (!metaData?.pageCount) return null;
    return (
        <p className="text-xs text-gray-600 mb-2">
            Pages: {metaData.pageCount}
        </p>
    );
}
