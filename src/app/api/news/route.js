import { NextResponse } from 'next/server';
import { executeD1Query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Ensure table exists
async function ensureTable() {
  await executeD1Query(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
    description TEXT, file_id INTEGER, author TEXT,
    is_active INTEGER DEFAULT 1, order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`, []);
}

export async function GET() {
  try {
    await ensureTable();
    const r = await executeD1Query(
      `SELECT n.*, f.original_name AS file_name, f.file_type, f.r2_key
       FROM news n LEFT JOIN files f ON n.file_id = f.id
       WHERE n.is_active=1 ORDER BY n.order_index ASC, n.created_at DESC`,
      []
    );
    return NextResponse.json({ success: true, news: r.results || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    await ensureTable();
    const body = await request.json();
    const { title, description, file_id, author, is_active } = body;
    if (!title) return NextResponse.json({ success: false, error: 'Title required' }, { status: 400 });
    const r = await executeD1Query(
      'INSERT INTO news (title,description,file_id,author,is_active) VALUES (?,?,?,?,?)',
      [title, description||null, file_id||null, author||null, is_active!==false?1:0]
    );
    return NextResponse.json({ success: true, id: r.meta.last_row_id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const { id, title, description, file_id, author, is_active, order_index } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    await executeD1Query(
      'UPDATE news SET title=?,description=?,file_id=?,author=?,is_active=?,order_index=? WHERE id=?',
      [title, description||null, file_id||null, author||null, is_active?1:0, order_index||0, id]
    );
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
    await executeD1Query('DELETE FROM news WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}