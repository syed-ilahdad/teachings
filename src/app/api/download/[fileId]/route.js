import { NextResponse } from 'next/server';
import { getSignedDownloadUrl } from '@/lib/r2';
import { executeD1Query } from '@/lib/db';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request, context) {
  try {
    const { fileId } = await Promise.resolve(context.params);
    const id = parseInt(String(fileId).trim(), 10);
    if (!id || id <= 0 || isNaN(id))
      return NextResponse.json({ success: false, error: `Bad ID: ${fileId}` }, { status: 400, headers: CORS });

    const result = await executeD1Query(
      'SELECT id, original_name, file_type, mime_type, r2_key, cover_key FROM files WHERE id = ? LIMIT 1',
      [id]
    );
    if (!result?.results?.length)
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404, headers: CORS });

    const file = result.results[0];
    if (!file.r2_key)
      return NextResponse.json({ success: false, error: 'No storage key' }, { status: 500, headers: CORS });

    const url      = await getSignedDownloadUrl(file.r2_key, 3600);
    let   coverUrl = null;
    if (file.cover_key) {
      try { coverUrl = await getSignedDownloadUrl(file.cover_key, 3000); } catch (_) {}
    }

    return NextResponse.json(
      { success: true, url, coverUrl, filename: file.original_name, fileType: file.file_type, mimeType: file.mime_type },
      { headers: CORS }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS });
  }
}