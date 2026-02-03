import { FileMetaData } from "@/types/file-manager";
import { getIconType } from "@/lib/get-icon-type";
import { Icons } from "@/lib/icons";

interface DefaultCardProps {
    file: FileMetaData;
}

export function DefaultCard({ file }: DefaultCardProps) {
    const iconType = getIconType(file.mime, file.ext);
    return <Icons type={iconType} />;
}
