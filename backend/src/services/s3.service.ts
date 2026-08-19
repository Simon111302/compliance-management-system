import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { awsRegion, evidenceBucket } from '../config/env.js'

const client = new S3Client({ region: awsRegion })

export async function uploadEvidenceObject(
  key: string,
  content: Buffer,
  contentType: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: evidenceBucket,
      Key: key,
      Body: content,
      ContentType: contentType,
    }),
  )
}

export async function downloadEvidenceObject(key: string): Promise<Buffer> {
  const result = await client.send(
    new GetObjectCommand({ Bucket: evidenceBucket, Key: key }),
  )
  if (!result.Body) throw new Error('Evidence object has no content')

  return Buffer.from(await result.Body.transformToByteArray())
}

export async function deleteEvidenceObject(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({ Bucket: evidenceBucket, Key: key }),
  )
}
