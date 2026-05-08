import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const key = params.key;

  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  const token = process.env.CF_D1_API_TOKEN;

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return new NextResponse('File not found', { status: 404 });
  }

  return new NextResponse(response.body, {
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
    },
  });
}