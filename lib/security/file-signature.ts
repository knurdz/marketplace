export const DETECTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type DetectedImageMime = (typeof DETECTED_IMAGE_MIME_TYPES)[number];

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function matches(bytes: Uint8Array, offset: number, signature: number[]) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

export function detectImageMimeType(
  bytes: Uint8Array,
): DetectedImageMime | null {
  if (
    bytes.length >= PNG_SIGNATURE.length &&
    matches(bytes, 0, PNG_SIGNATURE)
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    matches(bytes, 0, [0x52, 0x49, 0x46, 0x46]) &&
    matches(bytes, 8, [0x57, 0x45, 0x42, 0x50])
  ) {
    return "image/webp";
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  return null;
}

export async function detectImageFileMime(
  file: Blob,
): Promise<DetectedImageMime | null> {
  const header = await file.slice(0, 12).arrayBuffer();
  return detectImageMimeType(new Uint8Array(header));
}
