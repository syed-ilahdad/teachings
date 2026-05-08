import { NextResponse } from 'next/server';
import { executeD1Query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await executeD1Query(`CREATE TABLE IF NOT EXISTS page_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      section_type TEXT NOT NULL, order_index INTEGER NOT NULL DEFAULT 0,
      config TEXT NOT NULL DEFAULT '{}', is_active INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`, []);

    const r = await executeD1Query('SELECT * FROM page_sections WHERE is_active=1 ORDER BY order_index ASC', []);
    const rows = r.results || [];
    if (!rows.length) {
      const defaults = [
        {id:1,title:'Important Updates',section_type:'important',order_index:0,config:'{"limit":12}',is_active:1},
        {id:2,title:'Latest Releases',  section_type:'latest',   order_index:1,config:'{"limit":12}',is_active:1},
        {id:3,title:'Must Watch',       section_type:'must_watch',order_index:2,config:'{"limit":12}',is_active:1},
        {id:4,title:'Categories',       section_type:'categories',order_index:3,config:'{"limit":20}',is_active:1},
      ];
      return NextResponse.json({ success: true, sections: defaults });
    }
    return NextResponse.json({ success: true, sections: rows });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const { sections } = await request.json();
    if (!Array.isArray(sections)) return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    await executeD1Query('DELETE FROM page_sections', []);
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      await executeD1Query(
        'INSERT INTO page_sections (title,section_type,order_index,config,is_active) VALUES (?,?,?,?,?)',
        [s.title||'Section', s.section_type||'custom', i, JSON.stringify(s.config||{}), s.is_active?1:0]
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}