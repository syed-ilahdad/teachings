import { NextResponse } from 'next/server';
import { executeD1Query } from '@/lib/db';
import { uploadToR2, deleteFromR2, getSignedDownloadUrl } from '@/lib/r2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ALLOWED_IMG = new Set(['image/jpeg','image/jpg','image/png','image/webp','image/gif']);

export async function GET() {
  try {
    const r = await executeD1Query('SELECT * FROM background_images WHERE is_active=1 ORDER BY created_at DESC', []);
    const rows = r.results || [];
    // Attach signed URLs
    const withUrls = await Promise.all(rows.map(async row => {
      try { return { ...row, url: await getSignedDownloadUrl(row.r2_key, 3600) }; }
      catch { return { ...row, url: null }; }
    }));
    return NextResponse.json({ success: true, images: withUrls });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const fd    = await request.formData();
    const file  = fd.get('file');
      const theme = fd.get('theme') || 'both';   // 'dark' | 'light' | 'both'
    let title = fd.get('title')?.trim();

    if (!title) {
  const countResult = await executeD1Query(
    'SELECT COUNT(*) as total FROM background_images',
    []
  );

  const nextNumber =
    (countResult.results?.[0]?.total || 0) + 1;

  title = `bg-${nextNumber}`;
}


    if (!file || !ALLOWED_IMG.has(file.type))
      return NextResponse.json({ success: false, error: 'Image file required' }, { status: 400 });
    const ext   = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const uid   = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const r2Key = `backgrounds/${uid}.${ext}`;
    await uploadToR2(file, r2Key);
const result = await executeD1Query(
  'INSERT INTO background_images (title, r2_key, theme) VALUES (?,?,?)',
  [title || 'Untitled', r2Key, theme]
);  
    return NextResponse.json({ success: true, id: result.meta.last_row_id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body  = await request.json();
    const { id, title, theme } = body;
    await executeD1Query(
      'UPDATE background_images SET title=?, theme=? WHERE id=?',
      [title, theme || 'both', id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const id  = new URL(request.url).searchParams.get('id');
    const row = await executeD1Query('SELECT r2_key FROM background_images WHERE id=?', [id]);
    if (row.results?.[0]?.r2_key) try { await deleteFromR2(row.results[0].r2_key); } catch(_){}
    await executeD1Query('DELETE FROM background_images WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}