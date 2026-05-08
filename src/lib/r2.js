import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _client = null;
function client() {
  if (!_client) _client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  },
});
  return _client;
}

export async function uploadToR2(file, key) {
  const buf = Buffer.from(await file.arrayBuffer());
  await client().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: buf, ContentType: file.type }));
  return key;
}
export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }), { expiresIn });
}
export async function deleteFromR2(key) {
  await client().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
}