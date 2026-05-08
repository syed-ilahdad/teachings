'use client';
import { useState, useEffect } from 'react';
import UserLayout from '@/components/user/UserLayout';
import FileCard from '@/components/shared/FileCard';
import SortFilterBar from '@/components/shared/SortFilterBar';
import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/PageHeader';

export default function page() {
  const [files,   setFiles]   = useState([]);
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [sort,    setSort]    = useState('date');
  const [cat,     setCat]     = useState('all');

  useEffect(() => {
    Promise.all([
      fetch(`/api/files?featured=true&limit=500`).then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json()),
    ]).then(([fd,cd])=>{ setFiles(fd.files||[]); setCats(cd.categories||[]); setLoading(false); });
  }, []);

  const display = files
    .filter(f => {
      const s = !search || f.original_name.toLowerCase().includes(search.toLowerCase()) || (f.tags||'').toLowerCase().includes(search.toLowerCase());
      const c = cat==='all' || String(f.category_id)===cat;
      return s && c;
    })
    .sort((a,b) => sort==='name' ? a.original_name.localeCompare(b.original_name) : sort==='oldest' ? new Date(a.upload_date)-new Date(b.upload_date) : new Date(b.upload_date)-new Date(a.upload_date));

  return (
    <UserLayout>
      <PageHeader title="⭐ Important Updates" subtitle="Admin-curated important files" />
      <SortFilterBar onSearch={setSearch} onSort={setSort} onFilter={setCat} categories={cats} />
      {loading ? <div style={{textAlign:'center',padding:60}}><div className="spin" style={{width:28,height:28,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',margin:'0 auto'}} /></div>
        : display.length===0 ? <EmptyState icon="⭐" message="No important files yet." />
        : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,340px),1fr))',gap:'clamp(14px,2vw,24px)'}}>
            {display.map((f,i)=><FileCard key={f.id} file={f} index={i} />)}
          </div>}
    </UserLayout>
  );
}