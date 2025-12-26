import { FileMetaData, Folder, Tag } from "@/types/file-manager";

// Mock data
export const mockFolders: Folder[] = [
  {
    id: 1,
    name: "Documents",
    parentId: null,
    fileCount: 24,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    name: "Images",
    parentId: null,
    fileCount: 156,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 3,
    name: "Videos",
    parentId: null,
    fileCount: 8,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 4,
    name: "Music Some Long Name Streched also so long to fit in the card Music Some Long Name Streched also so long to fit in the card",
    parentId: null,
    fileCount: 32,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 5,
    name: "Archives",
    parentId: null,
    fileCount: 5,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 6,
    name: "Album 01",
    parentId: 2,
    fileCount: 12,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 7,
    name: "Album 02",
    parentId: 2,
    fileCount: 8,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 8,
    name: "Squirrels",
    parentId: 2,
    fileCount: 15,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export const mockTags: Tag[] = [
  { id: 1, name: "Important", color: "#ef4444" },
  { id: 2, name: "Work", color: "#3b82f6" },
  { id: 3, name: "Personal", color: "#10b981" },
  { id: 4, name: "Project", color: "#8b5cf6" },
  { id: 5, name: "Archive", color: "#6b7280" },
];

export const mockFiles: FileMetaData[] = [
  {
    id: 1,
    name: "Key-Monastery-img.avif",
    type: "image",
    url: "https://unciatrails.com/wp-content/uploads/2024/07/Key-Monastery-img.avif",
    size: 2621440, // 2.5 MB
    createdAt: new Date("2023-10-26T10:30:00Z"),
    updatedAt: new Date("2023-10-26T10:30:00Z"),
    folderId: 8,
    tags: ["personal", "important"],
    metaData: {
      caption: "A cute squirrel in the park",
      altText: "Gray squirrel sitting on wooden fence",
      dimensions: { width: 3024, height: 4032 },
      format: "avif",
    },
  },
  {
    id: 2,
    name: "project_proposal thoda sa.pdf",
    type: "document",
    url: "/placeholder.svg?height=400&width=300",
    size: 1048576, // 1 MB
    createdAt: new Date("2024-05-10T14:20:00Z"),
    updatedAt: new Date("2024-05-10T14:20:00Z"),
    folderId: 1,
    tags: ["work", "important"],
    metaData: {
      pageCount: 15,
      author: "John Doe",
      format: "pdf",
    },
  },
  {
    id: 3,
    name: "quarterly_report.xlsx",
    type: "document",
    url: "/placeholder.svg?height=400&width=300",
    size: 524288, // 512 KB
    createdAt: new Date("2024-05-08T09:15:00Z"),
    updatedAt: new Date("2024-05-08T09:15:00Z"),
    folderId: 1,
    tags: ["work"],
    metaData: {
      pageCount: 10,
      format: "xlsx",
    },
  },
  {
    id: 4,
    name: "presentation.pptx",
    type: "document",
    url: "/placeholder.svg?height=400&width=300",
    size: 2097152, // 2 MB
    createdAt: new Date("2024-05-05T16:45:00Z"),
    updatedAt: new Date("2024-05-05T16:45:00Z"),
    folderId: 1,
    tags: ["work", "project"],
    metaData: {
      pageCount: 20,
      format: "pptx",
    },
  },
  {
    id: 8,
    name: "documnet.doc",
    type: "document",
    url: "/placeholder.svg?height=400&width=300",
    size: 2097152, // 2 MB
    createdAt: new Date("2024-05-05T16:45:00Z"),
    updatedAt: new Date("2024-05-05T16:45:00Z"),
    folderId: 1,
    tags: ["work", "project"],
    metaData: {
      pageCount: 20,
      format: "docx",
    },
  },
  {
    id: 5,
    name: "demo_video.mp4",
    type: "video",
    url: "https://docs.material-tailwind.com/demo.mp4",
    size: 10485760, // 10 MB
    createdAt: new Date("2024-05-03T11:30:00Z"),
    updatedAt: new Date("2024-05-03T11:30:00Z"),
    folderId: 3,
    tags: ["project"],
    metaData: {
      duration: 120, // 2 minutes
      dimensions: { width: 1920, height: 1080 },
      format: "mp4",
      videoSource: "remote",
    },
  },
];