import React from "react";
import { FileMetaData } from "@/types/file-manager";
import { Icons } from "../utils/icons";

interface DefaultCardProps {
    file: FileMetaData;
}

export function DefaultCard({ file }: DefaultCardProps) {
    return <Icons type={file.type} />;
}
