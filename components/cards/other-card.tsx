import React from "react";
import { FileMetaData, OtherMetaData } from "@/types/file-manager";
import { Icons } from "../utils/icons";

interface OtherCardProps {
    file: FileMetaData;
    metaData: OtherMetaData | null;
}

export function OtherCard({ file }: OtherCardProps) {
    const meta = file.metaData as OtherMetaData;
    return <Icons type={meta?.format || file.type} />;
}
