'use client';
import { useState, useEffect, useMemo } from 'react';
import UserLayout from '@/components/user/UserLayout';
import FileCard from '@/components/shared/FileCard';
import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/PageHeader';

export default function page() {
  const [allFiles, setAllFiles] = useState([]);
  const [cats,     setCats]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState('name');
  const [cat,      setCat]      = useState('all');
  const [type,     setType]     = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/files?limit=2000').then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json()),
    ]).then(([fd,cd])=>{ setAllFiles(fd.files||[]); setCats(cd.categories||[]); setLoading(false); });
  }, []);

  const display = useMemo(() => {
    return allFiles
      .filter(f => {
        const q = search.toLowerCase();
        const s = !q || f.original_name.toLowerCase().includes(q) || (f.tags||'').toLowerCase().includes(q) || (f.title||'').toLowerCase().includes(q) || (f.author||'').toLowerCase().includes(q);
        const c = cat==='all' || String(f.category_id)===cat;
        const t = type==='all' || f.file_type===type;
        return s && c && t;
      })
      .sort((a,b) => {
        if (sort==='name')   return a.original_name.localeCompare(b.original_name);
        if (sort==='oldest') return new Date(a.upload_date)-new Date(b.upload_date);
        return new Date(b.upload_date)-new Date(a.upload_date);
      });
  }, [allFiles, search, sort, cat, type]);

  const IS = { background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'8px 11px', outline:'none', fontFamily:'inherit', transition:'border-color 0.18s' };
  const foc = e => e.target.style.borderColor='var(--accent)';
  const blr = e => e.target.style.borderColor='var(--border)';

  return (
    <UserLayout>
      <PageHeader title="🔍 Search" subtitle="Search all files by name, tags, author" />

      {/* Search + filters */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <div style={{ flex:1, minWidth:180, position:'relative' }}>
          <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:15 }}>🔍</span>
          <input style={{...IS, paddingLeft:34, width:'100%', fontSize:'clamp(13px,3vw,15px)'}}
            placeholder="Search by name, tags, author…" value={search}
            onChange={e=>setSearch(e.target.value)} onFocus={foc} onBlur={blr} autoFocus />
        </div>
        <select style={{...IS, width:'auto', minWidth:130}} value={type} onChange={e=>setType(e.target.value)} onFocus={foc} onBlur={blr}>
          <option value="all">All Types</option>
          <option value="audio">🎵 Audio</option>
          <option value="video">🎬 Video</option>
          <option value="pdf">📄 PDF</option>
        </select>
        <select style={{...IS, width:'auto', minWidth:140}} value={cat} onChange={e=>setCat(e.target.value)} onFocus={foc} onBlur={blr}>
          <option value="all">All Categories</option>
          {cats.map(c=><option key={c.id} value={c.id}>{c.parent_id?`  ↳ ${c.name}`:c.name}</option>)}
        </select>
        <select style={{...IS, width:'auto', minWidth:130}} value={sort} onChange={e=>setSort(e.target.value)} onFocus={foc} onBlur={blr}>
          <option value="name">A → Z</option>
          <option value="date">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {search && <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:14 }}>{display.length} result{display.length!==1?'s':''} for "{search}"</p>}

      {loading ? <div style={{textAlign:'center',padding:60}}><div className="spin" style={{width:28,height:28,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',margin:'0 auto'}} /></div>
        : !search ? (
          <div>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:16 }}>Showing all {display.length} files (A–Z)</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,340px),1fr))',gap:'clamp(14px,2vw,24px)'}}>
              {display.map((f,i)=><FileCard key={f.id} file={f} index={i} />)}
            </div>
          </div>
        ) : display.length===0 ? <EmptyState icon="🔍" message={`No files match "${search}"`} />
        : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,340px),1fr))',gap:'clamp(14px,2vw,24px)'}}>
            {display.map((f,i)=><FileCard key={f.id} file={f} index={i} />)}
          </div>}
    </UserLayout>
  );
}