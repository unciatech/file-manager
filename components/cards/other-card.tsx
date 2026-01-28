import { FileMetaData, OtherMetaData } from "@/types/file-manager";
import { getFileTypeFromMime } from "@/lib/file-type-utils";
import { Icons } from "@/lib/icons";

interface OtherCardProps {
    file: FileMetaData;
    metaData: OtherMetaData | null;
}

export function OtherCard({ file }: OtherCardProps) {
    // Use file extension to determine icon, fallback to derived type
    const ext = file.ext?.replace(".", "") || "";
    const fallbackType = getFileTypeFromMime(file.mime, file.ext);
    return <Icons type={ext || fallbackType} />;
}
