export const evidenceMaxBytes = 10 * 1024 * 1024

export const evidenceMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
])

export function isEvidenceMimeType(value) {
  return evidenceMimeTypes.has(value)
}

export function createEvidenceFileMetadata({
  fileId,
  filename,
  contentType,
  size,
  uploadedBy,
  uploadedByEmail,
}) {
  return {
    fileId,
    filename,
    contentType,
    size,
    uploadedAt: new Date(),
    uploadedBy,
    uploadedByEmail,
  }
}
