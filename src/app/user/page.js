'use client';
import { useState, useEffect, useMemo } from 'react';
import UserLayout from '@/components/user/UserLayout';
import SectionRenderer from '@/components/user/SectionRenderer';
import NewsPanel from '@/components/user/NewsPanel';

function Hero({ totalFiles, totalCats }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--bg2) 0%, var(--accent-dim) 100%)',
      border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
      padding: 'clamp(20px,5vw,44px) clamp(16px,4vw,36px)', marginBottom: 'clamp(24px,4vw,36px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,var(--accent-glow) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
        <span className="float-anim" style={{ fontSize:'clamp(40px,8vw,60px)' }}>📚</span>
        <div>
          <h1 className="neon" style={{ fontSize:'clamp(22px,5vw,40px)', fontWeight:900, lineHeight:1.15 }}>Teachings of IMAM MEHDI A.S</h1>
          <p style={{ color:'var(--text-2)', fontSize:'clamp(12px,2.5vw,15px)', marginTop:5 }}>Audio · Video · PDF — all in one place</p>
          <div style={{ display:'flex', gap:'clamp(16px,4vw,32px)', marginTop:12, flexWrap:'wrap' }}>
            {[['📁',totalFiles,'Files'],['🏷️',totalCats,'Categories']].map(([icon,val,label])=>(
              <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:'clamp(14px,3vw,20px)' }}>{icon}</span>
                <div><div className="neon" style={{ fontWeight:900, fontSize:'clamp(18px,4vw,26px)', lineHeight:1 }}>{val}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{label}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function page() {
  const [allFiles,   setAllFiles]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections,   setSections]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/files?limit=2000').then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json()),
      fetch('/api/sections').then(r=>r.json()),
    ]).then(([fd,cd,sd]) => {
      setAllFiles(fd.files||[]);
      setCategories(cd.categories||[]);
      setSections((sd.sections||[]).map(s=>({...s,config:typeof s.config==='string'?JSON.parse(s.config):(s.config||{})})));
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  if (loading) return (
    <UserLayout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16 }}>
        <span className="float-anim" style={{ fontSize:52 }}>📚</span>
        <div className="spin" style={{ width:28, height:28, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%' }} />
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading Teaching of MEHDI A.S…</p>
      </div>
    </UserLayout>
  );

  return (
    <UserLayout>
      {/* Two-column layout: 2/3 content + 1/3 news */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
        gap: 'clamp(16px,3vw,28px)',
        alignItems: 'start',
      }}
        /* Stack on mobile: news first, then content */
        className="home-grid">
        {/* LEFT: main content */}
        <div>
          <Hero totalFiles={allFiles.length} totalCats={categories.length} />
          {sections.length > 0
            ? sections.map(sec => <SectionRenderer key={sec.id} section={sec} allFiles={allFiles} categories={categories} />)
            : <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}><p style={{ fontSize:44, opacity:0.4, marginBottom:10 }}>🏗️</p><p>Admin hasn't published any sections yet.</p></div>}
        </div>

        {/* RIGHT: news panel */}
        <div style={{ position:'sticky', top:80 }}>
          <h2 style={{ fontSize:'clamp(16px,3vw,20px)', fontWeight:900, color:'var(--text)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            📰 DAILY UPDATES
            <span style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--accent),transparent)', opacity:0.3 }} />
          </h2>
          <NewsPanel />
        </div>
      </div>

      {/* Mobile: stack vertically (news first on mobile via CSS order) */}
      <style>{`
       @media (max-width: 768px) {
  .home-grid {
    grid-template-columns: 1fr !important;
  }

  /* Keep website header/content first */
  .home-grid > div:first-child {
    order: 1;
  }

  /* News below header/content */
  .home-grid > div:last-child {
    order: 2;
    position: static !important;
  }
}
      `}</style>
    </UserLayout>
  );
}