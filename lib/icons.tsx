import {
  PdfIcon,
  ExcelIcon,
  PptIcon,
  DocIcon,
  TextDocIcon,
  FileIcon,
  ZipIcon,
  JsonIcon,
  MusicIcon,
  RarIcon,
  ExeIcon,
  ImageIcon,
  VideoIcon,
  FolderWithFilesIcon,
  EmptyFolderIcon,
} from "@/components/icons";


export const Icons = ({ type, className, ...props }: { type: string, className?: string }) => {
  switch (type) {
    case "folder-with-files":
      return <FolderWithFilesIcon className={className} {...props} />;
    case "folder":
      return <EmptyFolderIcon className={className} {...props} />;
    case "image":
      return <ImageIcon className={className} {...props} />;
    case "video":
      return <VideoIcon className={className} {...props} />;
    case "audio":
      return <MusicIcon className={className} {...props} />;
    case "pdf":
      return <PdfIcon className={className} {...props} />; // Using FileText for PDF
    case "excel":
    case "xlsx":
      return <ExcelIcon className={className} {...props} />;
    case "powerpoint":
    case "pptx":
      return <PptIcon className={className} {...props} />;
    case "document":
    case "docx":
    case "doc":
      return <DocIcon className={className} {...props} />;
    case "txt":
      return <TextDocIcon className={className} {...props} />;
    case "json":
      return <JsonIcon className={className} {...props} />;
    case "zip":
      return <ZipIcon className={className} {...props} />;
    case "rar":
      return <RarIcon className={className} {...props} />;
    case "exe":
      return <ExeIcon className={className} {...props} />;
    default:
      return <FileIcon className={className} {...props} />;
  }
};
