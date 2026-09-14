import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'qr-pdf';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

/**
 * Upload a PDF file to Cloudflare R2
 */
export async function uploadPdfToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string = 'application/pdf'
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

/**
 * Delete a PDF file from Cloudflare R2
 */
export async function deletePdfFromR2(key: string): Promise<void> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (err) {
    console.error(`Failed to delete object from R2 (${key}):`, err);
  }
}

/**
 * Generate a secure, time-limited presigned URL to view or download the PDF from Cloudflare R2
 */
export async function getR2SignedUrl(
  key: string,
  expiresInSeconds: number = 3600,
  downloadFilename?: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    ResponseContentDisposition: downloadFilename
      ? `attachment; filename="${encodeURIComponent(downloadFilename)}"`
      : 'inline',
    ResponseContentType: 'application/pdf',
  });

  return await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}
