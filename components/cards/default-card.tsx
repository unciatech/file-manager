import { FileMetaData } from "@/types/file-manager";
import { getIconType, Icons } from "@/lib/file-utils";

interface DefaultCardProps {
    file: FileMetaData;
}

export function DefaultCard({ file }: DefaultCardProps) {
    const iconType = getIconType(file.mime, file.ext);
    return <Icons type={iconType} />;
}
