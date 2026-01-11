# File Type Utility - Usage Guide

## Overview

The `getFileTypeFromMime()` utility function automatically determines the file type (`FileType`) from MIME type and file extension. This eliminates the need to store the `type` field explicitly in your file data.

## Function Signature

```typescript
getFileTypeFromMime(mime: string, extension?: string): FileType
```

## How It Works

1. **MIME Type Priority**: First checks the MIME type prefix (e.g., `image/*`, `video/*`, `audio/*`)
2. **Extension Fallback**: For generic MIME types like `application/*`, it checks the file extension
3. **Pattern Matching**: Matches common document patterns in MIME types
4. **Default**: Returns `FILE_TYPE.FILE` for unknown types

## Usage Examples

### Example 1: Basic Usage

```typescript
import { getFileTypeFromMime } from '@/lib/file-type-utils';

// Image file
const imageType = getFileTypeFromMime('image/jpeg', '.jpg');
// Returns: FILE_TYPE.IMAGE

// Video file
const videoType = getFileTypeFromMime('video/mp4', '.mp4');
// Returns: FILE_TYPE.VIDEO

// Audio file
const audioType = getFileTypeFromMime('audio/mpeg', '.mp3');
// Returns: FILE_TYPE.AUDIO

// Document file
const docType = getFileTypeFromMime('application/pdf', '.pdf');
// Returns: FILE_TYPE.FILE
```

### Example 2: In Components

```typescript
import { FileMetaData } from '@/types/file-manager';
import { getFileTypeFromMime } from '@/lib/file-type-utils';

function MyComponent({ file }: { file: FileMetaData }) {
  // Derive type dynamically
  const fileType = file.type || getFileTypeFromMime(file.mime, file.ext);
  
  // Use the type
  if (fileType === FILE_TYPE.IMAGE) {
    return <ImagePreview file={file} />;
  }
  // ... other cases
}
```

### Example 3: Filtering Files

```typescript
import { getFileTypeFromMime } from '@/lib/file-type-utils';

function filterImageFiles(files: FileMetaData[]) {
  return files.filter(file => {
    const type = file.type || getFileTypeFromMime(file.mime, file.ext);
    return type === FILE_TYPE.IMAGE;
  });
}
```

## Supported File Types

### Images
- MIME: `image/*` (jpeg, png, gif, webp, avif, etc.)

### Videos
- MIME: `video/*` (mp4, webm, avi, mov, etc.)

### Audio
- MIME: `audio/*` (mp3, wav, ogg, etc.)

### Documents/Files
- **PDF**: `application/pdf`, `.pdf`
- **Word**: `application/msword`, `.doc`, `.docx`
- **Excel**: `application/vnd.ms-excel`, `.xls`, `.xlsx`
- **PowerPoint**: `application/vnd.ms-powerpoint`, `.ppt`, `.pptx`
- **Text**: `text/plain`, `.txt`
- **Archives**: `application/zip`, `.zip`, `.rar`, `.7z`
- **Code**: `.json`, `.xml`, `.html`, `.css`, `.js`, `.ts`

## Migration Guide

### Before (with explicit type field)

```typescript
const file: FileMetaData = {
  id: 1,
  name: "photo.jpg",
  type: FILE_TYPE.IMAGE, // ❌ Manually specified
  mime: "image/jpeg",
  ext: ".jpg",
  // ... other fields
};
```

### After (type derived automatically)

```typescript
const file: FileMetaData = {
  id: 1,
  name: "photo.jpg",
  // type field is optional now! ✅
  mime: "image/jpeg",
  ext: ".jpg",
  // ... other fields
};

// Use the utility to get the type when needed
const fileType = getFileTypeFromMime(file.mime, file.ext);
// Returns: FILE_TYPE.IMAGE
```

## Benefits

1. **Less Redundancy**: No need to store type when it can be derived from MIME
2. **Consistency**: Type is always correct based on MIME/extension
3. **Flexibility**: Can still override by setting `type` explicitly if needed
4. **Smaller Data**: Reduces payload size when fetching files from API

## Notes

- The `type` field in `FileMetaData` is now **optional**
- If `type` is provided, it will be used; otherwise, it's derived from MIME/extension
- The utility is already integrated into the file card components
- Extension parameter is optional but helps with accuracy for generic MIME types
