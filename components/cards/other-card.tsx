import { FileMetaData } from "@/types/file-manager";
import { getFileTypeFromMime, Icons } from "@/lib/file-utils";

/** Props for the generic OtherCard component. */
interface OtherCardProps {
    /** The fallback or unknown file metadata to display. */
    file: FileMetaData;
    /** Legacy pass-through metadata prop. */
    metaData: FileMetaData['metaData'] | null;
}

/**
 * A fallback grid card item for unrecognized or generic files.
 * Attempts to render an icon based strictly on the raw file extension or MIME string.
 */
export function OtherCard({ file }: OtherCardProps) {
    // Use file extension to determine icon, fallback to derived type
    const ext = file.ext?.replace(".", "") || "";
    const fallbackType = getFileTypeFromMime(file.mime, file.ext);
    return <Icons type={ext || fallbackType} />;
}
