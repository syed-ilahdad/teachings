import { NextResponse } from 'next/server';
import { executeD1Query } from '@/lib/db';
import { deleteFromR2 } from '@/lib/r2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const type     = sp.get('type');
    const category = sp.get('category');
    const featured = sp.get('featured');
    const latest   = sp.get('latest');
    const mustWatch= sp.get('must_watch');
    const search   = sp.get('search');
    const order    = sp.get('order') || 'date';
    const limit    = Math.min(parseInt(sp.get('limit') || '500'), 2000);

    let sql = `
      SELECT f.*, c.name AS category_name, c.slug AS category_slug
      FROM files f LEFT JOIN categories c ON f.category_id = c.id
      WHERE 1=1
    `;
    const p = [];

    if (type && type !== 'all')       { sql += ' AND f.file_type = ?';    p.push(type); }
    if (category && category !== 'all'){ sql += ' AND f.category_id = ?';  p.push(category); }
    if (featured === 'true')           { sql += ' AND f.is_featured = 1'; }
    if (latest   === 'true')           { sql += ' AND f.is_latest = 1'; }
    if (mustWatch === 'true')          { sql += ' AND f.is_must_watch = 1'; }

    if (search) {
      sql += ` AND (LOWER(f.original_name) LIKE ? OR LOWER(f.title) LIKE ? OR LOWER(f.tags) LIKE ?)`;
      const like = `%${search.toLowerCase()}%`;
      p.push(like, like, like);
    }

    sql += order === 'name'  ? ' ORDER BY f.original_name ASC'
         : order === 'oldest'? ' ORDER BY f.upload_date ASC'
         : ' ORDER BY f.upload_date DESC';
    sql += ' LIMIT ?';
    p.push(limit);

    const result = await executeD1Query(sql, p);
    return NextResponse.json({ success: true, files: result.results || [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const row = await executeD1Query('SELECT r2_key, cover_key FROM files WHERE id = ?', [id]);
    if (!row.results?.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    await deleteFromR2(row.results[0].r2_key);
    if (row.results[0].cover_key) try { await deleteFromR2(row.results[0].cover_key); } catch (_) {}
    await executeD1Query('DELETE FROM files WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const { id, original_name, title, description, author, tags, category_id, is_featured, is_latest, is_must_watch, date_label } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await executeD1Query(
      `UPDATE files SET original_name=?,title=?,description=?,author=?,tags=?,category_id=?,is_featured=?,is_latest=?,is_must_watch=?,date_label=? WHERE id=?`,
      [original_name, title||null, description||null, author||null,
       JSON.stringify(tags||[]), category_id||null,
       is_featured?1:0, is_latest?1:0, is_must_watch?1:0, date_label||null, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}