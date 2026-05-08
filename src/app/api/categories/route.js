import { NextResponse } from 'next/server';
import { executeD1Query } from '@/lib/db';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


const ALLOWED_IMG = new Set(['image/jpeg','image/jpg','image/png','image/webp','image/gif']);

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').slice(0,80);
}

export async function GET() {
  try {
    // Ensure slug exists for all rows before returning
    await executeD1Query(
      `UPDATE categories SET slug = LOWER(REPLACE(REPLACE(name,' ','-'),'/','')) WHERE slug IS NULL OR slug = ''`,
      []
    );
    const r = await executeD1Query('SELECT * FROM categories ORDER BY name ASC', []);
    return NextResponse.json({ success: true, categories: r.results || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const fd           = await request.formData();
    const name         = fd.get('name')?.trim();
    const description  = fd.get('description') || null;
    const parentId     = fd.get('parentId')    || null;
    const author       = fd.get('author')      || null;
    const tagsRaw      = fd.get('tags')        || '[]';
    // Cover page fields
    const coverPageImg   = fd.get('coverPageImg');
    const coverPageTitle = fd.get('coverPageTitle') || null;

    if (!name) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 });

    let tags = [];
    try { tags = JSON.parse(tagsRaw); } catch { tags = tagsRaw.split(',').map(t=>t.trim()).filter(Boolean); }

    const slug = name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').slice(0,80);

    // Insert category without cover_key first
    const r = await executeD1Query(
      'INSERT INTO categories (name,slug,description,cover_key,parent_id,author,tags) VALUES (?,?,?,NULL,?,?,?)',
      [name, slug, description, parentId, author, JSON.stringify(tags)]
    );
    const catId = r.meta.last_row_id;

    // Handle cover page creation and assignment
    if (coverPageImg && coverPageImg.size > 0 && ALLOWED_IMG.has(coverPageImg.type)) {
      const cpExt = (coverPageImg.name.split('.').pop() || 'jpg').toLowerCase();
      const cpUid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const cpKey = `coverpages/${cpUid}.${cpExt}`;
      await uploadToR2(coverPageImg, cpKey);

      const cpResult = await executeD1Query(
        'INSERT INTO cover_pages (title, r2_key) VALUES (?,?)',
        [coverPageTitle || name, cpKey]
      );
      const cpId = cpResult.meta.last_row_id;

      await executeD1Query(
        'INSERT OR REPLACE INTO cover_page_assignments (cover_page_id, entity_type, entity_id) VALUES (?,?,?)',
        [cpId, 'category', catId]
      );
      await executeD1Query('UPDATE categories SET cover_key=? WHERE id=?', [cpKey, catId]);
    }

    return NextResponse.json({ success: true, categoryId: catId });
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
    const name        = fd.get('name')?.trim();
    const description = fd.get('description') || null;
    const author      = fd.get('author')      || null;
    const tagsRaw     = fd.get('tags')        || '[]';
    let tags = [];
    try { tags = JSON.parse(tagsRaw); } catch { tags = tagsRaw.split(',').map(t=>t.trim()).filter(Boolean); }

    if (!id || !name) return NextResponse.json({ success: false, error: 'id and name required' }, { status: 400 });

    const cover = fd.get('cover');
    let coverKey = undefined;
    if (cover && cover.size > 0 && ALLOWED_IMG.has(cover.type)) {
      const ext = (cover.name.split('.').pop()||'jpg').toLowerCase();
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      coverKey = `covers/cat-${uid}.${ext}`;
      await uploadToR2(cover, coverKey);
    }

    if (coverKey !== undefined) {
      await executeD1Query(
        'UPDATE categories SET name=?,slug=?,description=?,cover_key=?,author=?,tags=? WHERE id=?',
        [name, slugify(name), description, coverKey, author, JSON.stringify(tags), id]
      );
    } else {
      await executeD1Query(
        'UPDATE categories SET name=?,slug=?,description=?,author=?,tags=? WHERE id=?',
        [name, slugify(name), description, author, JSON.stringify(tags), id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
  try {
    const row = await executeD1Query('SELECT cover_key FROM categories WHERE id=?', [id]);
    if (row.results?.[0]?.cover_key) try { await deleteFromR2(row.results[0].cover_key); } catch(_){}
    await executeD1Query('UPDATE categories SET parent_id=NULL WHERE parent_id=?', [id]);
    await executeD1Query('DELETE FROM categories WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}