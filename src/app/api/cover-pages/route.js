import { NextResponse } from 'next/server';
import { executeD1Query } from '@/lib/db';
import { uploadToR2, deleteFromR2, getSignedDownloadUrl } from '@/lib/r2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ALLOWED_IMG = new Set(['image/jpeg','image/jpg','image/png','image/webp','image/gif']);

export async function GET() {
  try {
    const cp = await executeD1Query('SELECT * FROM cover_pages ORDER BY created_at DESC', []);
    const rows = cp.results || [];
    // Get assignments for each cover page
    const withData = await Promise.all(rows.map(async row => {
      const asgn = await executeD1Query(
        'SELECT entity_type, entity_id FROM cover_page_assignments WHERE cover_page_id=?', [row.id]
      );
      let url = null;
      try { url = await getSignedDownloadUrl(row.r2_key, 3600); } catch(_){}
      return { ...row, url, assignments: asgn.results || [] };
    }));
    return NextResponse.json({ success: true, coverPages: withData });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const fd          = await request.formData();
    const file        = fd.get('file');
    const title       = fd.get('title')?.trim() || 'Untitled';
    const assignments = JSON.parse(fd.get('assignments') || '[]');
    if (!file || !ALLOWED_IMG.has(file.type))
      return NextResponse.json({ success: false, error: 'Image required' }, { status: 400 });
    const ext   = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const uid   = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const r2Key = `coverpages/${uid}.${ext}`;
    await uploadToR2(file, r2Key);
    const result = await executeD1Query(
      'INSERT INTO cover_pages (title, r2_key) VALUES (?,?)', [title, r2Key]
    );
    const cpId = result.meta.last_row_id;
    // Save assignments and update cover_key on entities
    for (const asgn of assignments) {
      await executeD1Query(
        'INSERT OR REPLACE INTO cover_page_assignments (cover_page_id, entity_type, entity_id) VALUES (?,?,?)',
        [cpId, asgn.type, asgn.id]
      );
      await _updateEntityCover(asgn.type, asgn.id, r2Key);
    }
    return NextResponse.json({ success: true, id: cpId });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const fd          = await request.formData();
    const id          = fd.get('id');
    const title       = fd.get('title')?.trim();
    const assignments = JSON.parse(fd.get('assignments') || '[]');
    const file        = fd.get('file');
    let r2Key = null;
    if (file && file.size > 0 && ALLOWED_IMG.has(file.type)) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      r2Key = `coverpages/${uid}.${ext}`;
      await uploadToR2(file, r2Key);
    }
    if (r2Key) await executeD1Query('UPDATE cover_pages SET title=?, r2_key=? WHERE id=?', [title, r2Key, id]);
    else        await executeD1Query('UPDATE cover_pages SET title=? WHERE id=?', [title, id]);
    // Get current r2_key if not changed
    if (!r2Key) {
      const row = await executeD1Query('SELECT r2_key FROM cover_pages WHERE id=?', [id]);
      r2Key = row.results[0]?.r2_key;
    }
    // Rebuild assignments
    await executeD1Query ('DELETE FROM cover_page_assignments WHERE cover_page_id=?', [id]);
    for (const asgn of assignments) {
      await executeD1Query(
        'INSERT OR REPLACE INTO cover_page_assignments (cover_page_id, entity_type, entity_id) VALUES (?,?,?)',
        [id, asgn.type, asgn.id]
      );
      await _updateEntityCover(asgn.type, asgn.id, r2Key);
    }
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
    const row = await executeD1Query('SELECT r2_key FROM cover_pages WHERE id=?', [id]);
    if (row.results?.[0]?.r2_key) try { await deleteFromR2(row.results[0].r2_key); } catch(_){}
    await executeD1Query('DELETE FROM cover_page_assignments WHERE cover_page_id=?', [id]);
    await executeD1Query('DELETE FROM cover_pages WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function _updateEntityCover(type, id, r2Key) {
  if (type === 'file')     await executeD1Query('UPDATE files SET cover_key=? WHERE id=?', [r2Key, id]);
  if (type === 'category') await executeD1Query('UPDATE categories SET cover_key=? WHERE id=?', [r2Key, id]);
}