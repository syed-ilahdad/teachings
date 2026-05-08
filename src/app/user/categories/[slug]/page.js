'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UserLayout from '@/components/user/UserLayout';
import CategoryCard from '@/components/user/CategoryCard';
import FileCard from '@/components/shared/FileCard';
import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/PageHeader';

export default function page() {
  const { slug }  = useParams();
  const [cat,     setCat]     = useState(null);
  const [subs,    setSubs]    = useState([]);
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch('/api/categories').then(r=>r.json()),
      fetch('/api/files?limit=1000').then(r=>r.json()),
    ]).then(([cd, fd]) => {
      const allCats = cd.categories || [];
      const found   = allCats.find(c => c.slug === slug);
      if (!found) { setLoading(false); return; }
      setCat(found);
      setSubs(allCats.filter(c => c.parent_id === found.id));
      setFiles((fd.files||[]).filter(f => f.category_id === found.id));
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <UserLayout><div style={{textAlign:'center',padding:60}}><div className="spin" style={{width:28,height:28,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',margin:'0 auto'}} /></div></UserLayout>;
  if (!cat)    return <UserLayout><EmptyState icon="🏷️" message="Category not found." /></UserLayout>;

  return (
    <UserLayout>
      {/* Category header with cover */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28, flexWrap:'wrap' }}>
        <div style={{ width:72, height:72, borderRadius:14, overflow:'hidden', background:'var(--accent-dim)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, flexShrink:0 }}>
          {cat.cover_key ? <img src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${cat.cover_key}`} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🏷️'}
        </div>
        <div>
          <h1 style={{ fontSize:'clamp(20px,4vw,28px)', fontWeight:900, color:'var(--text)' }}>{cat.name}</h1>
          {cat.description && <p style={{ color:'var(--text-muted)', fontSize:14, marginTop:4 }}>{cat.description}</p>}
        </div>
      </div>

      {/* Subcategories */}
      {subs.length > 0 && (
        <section style={{ marginBottom:36 }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
            Subcategories
            <span style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.3 }} />
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,160px),1fr))', gap:'clamp(10px,2vw,16px)' }}>
            {subs.map((sub,i) => <CategoryCard key={sub.id} cat={sub} index={i} />)}
          </div>
        </section>
      )}

      {/* Files in this category */}
      <section>
        <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          Files ({files.length})
          <span style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.3 }} />
        </h2>
        {files.length===0 ? <EmptyState icon="📂" message="No files in this category yet." />
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))',gap:'clamp(16px,2vw,24px)' }}>
              {files.map((f,i) => <FileCard key={f.id} file={f} index={i} />)}
            </div>}
      </section>
    </UserLayout>
  );
}