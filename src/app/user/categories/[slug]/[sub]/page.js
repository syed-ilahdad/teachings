'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserLayout from '@/components/user/UserLayout';
import FileCard from '@/components/shared/FileCard';
import SortFilterBar from '@/components/shared/SortFilterBar';
import EmptyState from '@/components/shared/EmptyState';

export default function page() {
  const { slug, sub } = useParams();
  const router        = useRouter();
  const [cat,     setCat]     = useState(null);
  const [parent,  setParent]  = useState(null);
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [sort,    setSort]    = useState('name');

  useEffect(() => {
    if (!sub) return;
    Promise.all([
      fetch('/api/categories').then(r=>r.json()),
      fetch('/api/files?limit=1000').then(r=>r.json()),
    ]).then(([cd, fd]) => {
      const allCats = cd.categories||[];
      const found   = allCats.find(c => c.slug===sub);
      if (!found) { setLoading(false); return; }
      setCat(found);
      setParent(allCats.find(c => c.id===found.parent_id)||null);
      setFiles((fd.files||[]).filter(f => f.category_id===found.id));
      setLoading(false);
    });
  }, [sub]);

  const display = files
    .filter(f => !search || f.original_name.toLowerCase().includes(search.toLowerCase()) || (f.tags||'').toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sort==='name' ? a.original_name.localeCompare(b.original_name) : sort==='oldest' ? new Date(a.upload_date)-new Date(b.upload_date) : new Date(b.upload_date)-new Date(a.upload_date));

  if (loading) return <UserLayout><div style={{textAlign:'center',padding:60}}><div className="spin" style={{width:28,height:28,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',margin:'0 auto'}} /></div></UserLayout>;
  if (!cat)    return <UserLayout><EmptyState icon="📂" message="Subcategory not found." /></UserLayout>;

  return (
    <UserLayout>
      {/* Breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, fontSize:13, color:'var(--text-muted)', flexWrap:'wrap' }}>
        <button onClick={()=>router.push('/user/categories')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontWeight:700, padding:0 }}>Categories</button>
        {parent && <><span>›</span><button onClick={()=>router.push(`/user/categories/${parent.slug}`)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontWeight:700, padding:0 }}>{parent.name}</button></>}
        <span>›</span>
        <span style={{ color:'var(--text)', fontWeight:700 }}>{cat.name}</span>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <div style={{ width:60, height:60, borderRadius:12, overflow:'hidden', background:'var(--accent-dim)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
          {cat.cover_key ? <img src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${cat.cover_key}`} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📂'}
        </div>
        <div>
          <h1 style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:900, color:'var(--text)' }}>{cat.name}</h1>
          {cat.description && <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:3 }}>{cat.description}</p>}
        </div>
      </div>

      <SortFilterBar onSearch={setSearch} onSort={setSort} />

      {display.length===0 ? <EmptyState icon="📂" message="No files in this subcategory." />
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,340px),1fr))',gap:'clamp(14px,2vw,24px)' }}>
            {display.map((f,i) => <FileCard key={f.id} file={f} index={i} />)}
          </div>}
    </UserLayout>
  );
}