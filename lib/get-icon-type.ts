import mime from 'mime';

/**
 * Determines the specific icon type to display based on MIME type and file extension
 * This is different from getFileTypeFromMime which returns broad categories (images, videos, etc.)
 * This function returns specific types for icon rendering (pdf, excel, zip, etc.)
 * 
 * Uses the 'mime' library for accurate MIME type detection from extensions
 */
export function getIconType(mimeType: string, extension?: string): string {
  let effectiveMime = mimeType;
  
  // If extension is provided, use mime library to get accurate MIME type
  if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, '');
    const detectedMime = mime.getType(ext);
    if (detectedMime) {
      effectiveMime = detectedMime;
    }
  }
  
  // Media types (broad categories)
  if (effectiveMime.startsWith('image/')) {
    return 'image';
  }
  
  if (effectiveMime.startsWith('video/')) {
    return 'video';
  }
  
  if (effectiveMime.startsWith('audio/')) {
    return 'audio';
  }
  
  // Specific document types
  switch (effectiveMime) {
    case 'application/pdf':
      return 'pdf';
    
    case 'application/json':
      return 'json';
    
    // Archives
    case 'application/zip':
    case 'application/x-zip-compressed':
      return 'zip';
    
    case 'application/x-rar-compressed':
    case 'application/vnd.rar':
      return 'rar';
    
    // Executables
    case 'application/x-msdownload':
    case 'application/x-executable':
      return 'exe';
    
    // Microsoft Office - Excel
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return 'excel';
    
    // Microsoft Office - PowerPoint
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
      return 'powerpoint';
    
    // Microsoft Office - Word
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return 'document';
  }
  
  // Text files
  if (effectiveMime.startsWith('text/')) {
    return 'txt';
  }
  
  // Default fallback
  return 'file';
}
