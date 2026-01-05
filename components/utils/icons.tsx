import { 
  Image as ImageIcon, 
  Video, 
  FileArchive,  
  LucideProps 
} from "lucide-react";
import PdfIcon from "../icons/pdf";
import ExcelIcon from "../icons/excel";
import PptIcon from "../icons/ppt";
import DocIcon from "../icons/doc";
import TextDocIcon from "../icons/text";
import FileIcon from "../icons/file";
import ZipIcon from "../icons/zip";
import JsonIcon from "../icons/json";
import MusicIcon from "../icons/music";
import RarIcon from "../icons/rar";
import ExeIcon from "../icons/exe";

export const Icons = ({ type, className, ...props }: { type: string } & LucideProps) => {
  switch (type) {
    case "image":
      return <ImageIcon className={className} {...props} />;
    case "video":
      return <Video className={className} {...props} />;
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
