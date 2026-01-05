export function splitAndTruncate(filename: string, maxLength: number = 28): string {
  if (filename.length <= maxLength) return filename;

  const lastDot = filename.lastIndexOf('.');
  const ext = lastDot !== -1 ? filename.slice(lastDot) : '';
  const name = lastDot !== -1 ? filename.slice(0, lastDot) : filename;

  const ellipsis = '...';
  const lineLength = Math.floor(maxLength / 2);

  // First line: start of the name
  const firstLine = name.slice(0, lineLength);

  // Second line: [endChunk1] + ... + [endChunk2] + ext
  const endAvailable = lineLength;
  const chunkLength = Math.floor((endAvailable - ellipsis.length) / 2);
  const endChunk1 = name.slice(-endAvailable, -chunkLength);
  const endChunk2 = name.slice(-chunkLength);
  const wasTruncated = name.length > lineLength + endAvailable;
  const secondLine = endChunk1 + (wasTruncated ? ellipsis : '') + endChunk2 + ext;

  return `${firstLine}\n${secondLine}`;
}

export function middleTruncate(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  const start = text.slice(0, Math.ceil(maxLength / 2));
  const end = text.slice(-Math.floor(maxLength / 2));
  return `${start}...${end}`;
}
