'use client';
import FileCard from '@/components/shared/FileCard';
import CategoryCard from './CategoryCard';

export default function SectionRenderer({ section, allFiles, categories }) {
  const limit  = section.config?.limit || 12;
  const type   = section.section_type;
  let   files  = [];

  if (type === 'important')  files = allFiles.filter(f => f.is_featured).slice(0, limit);
  if (type === 'latest')     files = [...allFiles].sort((a,b) => new Date(b.upload_date)-new Date(a.upload_date)).slice(0, limit);
  if (type === 'must_watch') files = allFiles.filter(f => f.is_must_watch).slice(0, limit);
  if (type === 'audio')      files = allFiles.filter(f => f.file_type==='audio').slice(0, limit);
  if (type === 'video')      files = allFiles.filter(f => f.file_type==='video').slice(0, limit);
  if (type === 'pdf')        files = allFiles.filter(f => f.file_type==='pdf').slice(0, limit);
  if (type === 'custom') {
    const ids = section.config?.fileIds || [];
    files = ids.length > 0
      ? ids.map(id => allFiles.find(f => f.id === id)).filter(Boolean)
      : allFiles.slice(0, limit);
  }

  if (type === 'categories') {
    const catId   = section.config?.categoryId;
    const showCats = catId
      ? categories.filter(c => c.parent_id === parseInt(catId))
      : categories.filter(c => !c.parent_id).slice(0, limit);

    return (
      <Section title={section.title} desc={section.config?.description}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,340px),1fr))',  gap:'clamp(14px,2vw,24px)' }}>
          {showCats.map((cat, i) => <CategoryCard key={cat.id} cat={cat} index={i} />)}
        </div>
        {showCats.length === 0 && <p style={{ color:'var(--text-muted)', fontSize:14 }}>No categories yet.</p>}
      </Section>
    );
  }

  if (!files.length) return null;

  return (
    <Section title={section.title} desc={section.config?.description}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,340px),1fr))', gap:'clamp(14px,2vw,24px)'  }}>
        {files.map((f, i) => <FileCard key={f.id} file={f} index={i} />)}
      </div>
    </Section>
  );
}

function Section({ title, desc, children }) {
  return (
    <section style={{ marginBottom:'clamp(28px,5vw,48px)' }}>
      <h2 style={{ fontSize:'clamp(17px,4vw,22px)', fontWeight:900, color:'var(--text)', marginBottom:desc?6:16, display:'flex', alignItems:'center', gap:10 }}>
        {title}
        <span style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.3, minWidth:20 }} />
      </h2>
      {desc && <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:16 }}>{desc}</p>}
      {children}
    </section>
  );
}