import { FileMetaData } from "@/types/file-manager";
import { getFileTypeFromMime } from "@/lib/file-type-utils";
import { Icons } from "../utils/icons";

interface DefaultCardProps {
    file: FileMetaData;
}

export function DefaultCard({ file }: DefaultCardProps) {
    const type = file.type || getFileTypeFromMime(file.mime, file.ext);
    return <Icons type={type} />;
}
