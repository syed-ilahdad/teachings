import { NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';
import { executeD1Query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ALLOWED = new Set([
  'audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/aac','audio/flac','audio/m4a','audio/x-m4a',
  'video/mp4','video/webm','video/ogg','video/quicktime','video/x-msvideo',
  'application/pdf',
]);
const ALLOWED_IMG = new Set(['image/jpeg','image/jpg','image/png','image/webp','image/gif']);

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const fd = await request.formData();
    const file          = fd.get('file');
    const categoryId    = fd.get('categoryId')    || null;
    const title         = fd.get('title')         || null;
    const description   = fd.get('description')   || null;
    const author        = fd.get('author')        || null;
    const tagsRaw       = fd.get('tags')          || '[]';
    const isFeatured    = fd.get('isFeatured')    === 'true';
    const isLatest      = fd.get('isLatest')      === 'true';
    const isMustWatch   = fd.get('isMustWatch')   === 'true';
    const dateLabel     = fd.get('dateLabel')     || null;   // now YYYY-MM-DD string
    // Cover page fields
    const coverPageImg  = fd.get('coverPageImg');   // the actual image file
    const coverPageTitle= fd.get('coverPageTitle')  || null; // title for cover_pages table

    if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ success: false, error: 'File type not allowed' }, { status: 400 });
    if (file.size > 2 * 1024 ** 3) return NextResponse.json({ success: false, error: 'File > 2 GB' }, { status: 400 });

    const fileType = file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'pdf';
    const ext      = (file.name.split('.').pop() || 'bin').toLowerCase();
    const uid      = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const r2Key    = `${fileType}/${uid}.${ext}`;

    await uploadToR2(file, r2Key);

    let tags = [];
    try { tags = JSON.parse(tagsRaw); } catch { tags = tagsRaw.split(',').map(t=>t.trim()).filter(Boolean); }

    // Insert file row first (no cover_key yet)
const result = await executeD1Query(
  `INSERT INTO files (
    filename,
    original_name,
    title,
    description,
    author,
    tags,
    file_type,
    file_size,
    category_id,
    r2_key,
    cover_key,
    mime_type,
    is_featured,
    is_latest,
    is_must_watch,
    date_label
  )
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  [
    `${uid}.${ext}`,
    file.name,
    title,
    description,
    author,
    JSON.stringify(tags),
    fileType,
    file.size,
    categoryId,
    r2Key,
    null,          // cover_key
    file.type,     // mime_type
    isFeatured ? 1 : 0,
    isLatest ? 1 : 0,
    isMustWatch ? 1 : 0,
    dateLabel
  ]
);
    const fileId = result.meta.last_row_id;

    // If a cover image was provided, create a cover_page record and assign it
    if (coverPageImg && coverPageImg.size > 0 && ALLOWED_IMG.has(coverPageImg.type)) {
      const cpExt  = (coverPageImg.name.split('.').pop() || 'jpg').toLowerCase();
      const cpUid  = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const cpKey  = `coverpages/${cpUid}.${cpExt}`;
      await uploadToR2(coverPageImg, cpKey);

      const cpResult = await executeD1Query(
        'INSERT INTO cover_pages (title, r2_key) VALUES (?,?)',
        [coverPageTitle || file.name, cpKey]
      );
      const cpId = cpResult.meta.last_row_id;

      // Create assignment
      await executeD1Query(
        'INSERT OR REPLACE INTO cover_page_assignments (cover_page_id, entity_type, entity_id) VALUES (?,?,?)',
        [cpId, 'file', fileId]
      );
      // Update cover_key on the file
      await executeD1Query('UPDATE files SET cover_key=? WHERE id=?', [cpKey, fileId]);
    }

    return NextResponse.json({ success: true, fileId });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}