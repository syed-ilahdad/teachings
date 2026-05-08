'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_ICON  = { audio:'🎵', video:'🎬', pdf:'📄' };
const TYPE_COLOR = { audio:'#7c3aed', video:'#2563eb', pdf:'#dc2626' };

function PreviewModal({ file, url, coverUrl, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const tc = TYPE_COLOR[file.file_type];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{scale:0.88,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}}
        exit={{scale:0.92,opacity:0,y:12}}
        transition={{type:'spring',stiffness:320,damping:28}}
        onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:860, maxHeight:'92vh',
          background:'var(--bg-modal)', border:'1px solid var(--border2)',
          borderRadius:'var(--r-xl)', boxShadow:'0 40px 90px rgba(0,0,0,0.55)',
          display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',gap:14,padding:'clamp(14px,3vw,20px)',
          background:'var(--bg2)',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          {coverUrl
            ? <img src={coverUrl} alt="cover" style={{width:60,height:60,objectFit:'cover',borderRadius:10,border:'1px solid var(--border)',flexShrink:0}} />
            : <div style={{width:60,height:60,borderRadius:10,flexShrink:0,background:'var(--accent-dim)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>
                {TYPE_ICON[file.file_type]}
              </div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
              <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:99,border:'1px solid',background:`${tc}18`,color:tc,borderColor:`${tc}44`}}>
                {file.file_type.toUpperCase()}</span>
              {file.category_name && <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:99,background:'var(--accent-dim)',color:'var(--accent)',border:'1px solid var(--border2)'}}>{file.category_name}</span>}
            </div>
            <h2 style={{fontWeight:800,color:'var(--text)',lineHeight:1.3,wordBreak:'break-word',fontSize:'clamp(14px,3vw,18px)'}}>
              {file.title || file.original_name}
            </h2>
            {file.description && <p style={{fontSize:13,color:'var(--text-2)',marginTop:5,lineHeight:1.5}}>{file.description}</p>}
            <p style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>
              {file.author && `${file.author} · `}
              {(file.file_size/1024/1024).toFixed(2)} MB · {file.date_label
  ? new Date(file.date_label).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' })
  : new Date(file.upload_date).toLocaleDateString()
}
            </p>
          </div>
          <button onClick={onClose}
            style={{flexShrink:0,width:34,height:34,borderRadius:8,background:'var(--accent-dim)',border:'1px solid var(--border)',color:'var(--accent)',cursor:'pointer',fontSize:16,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.14s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,135,0.18)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--accent-dim)'}>✕</button>
        </div>
        {/* Player */}
        <div style={{flex:1,overflow:'auto',padding:'clamp(12px,3vw,20px)'}}>
          {file.file_type==='audio' && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:24,paddingBlock:20}}>
              {coverUrl
                ? <img src={coverUrl} alt="cover" style={{width:'min(180px,50vw)',height:'min(180px,50vw)',objectFit:'cover',borderRadius:16,boxShadow:'0 0 30px var(--accent-glow)',border:'1px solid var(--border)'}} />
                : <div className="float-anim" style={{width:'min(160px,50vw)',height:'min(160px,50vw)',borderRadius:16,background:'var(--accent-dim)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:64}}>🎵</div>}
              <audio controls autoPlay src={url} style={{width:'100%',maxWidth:520,accentColor:'var(--accent)'}} />
            </div>
          )}
          {file.file_type==='video' && <video controls autoPlay src={url} style={{width:'100%',maxHeight:'min(480px,58vh)',background:'#000',borderRadius:12}} />}
          {file.file_type==='pdf' && <iframe src={url} title={file.original_name} style={{width:'100%',height:'max(380px,58vh)',border:'none',borderRadius:12}} />}
        </div>
        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'12px 20px',background:'var(--bg2)',borderTop:'1px solid var(--border)',flexWrap:'wrap',flexShrink:0}}>
          <span style={{fontSize:12,color:'var(--text-muted)'}}>Press <kbd style={{padding:'1px 5px',borderRadius:4,fontSize:11,border:'1px solid var(--border)',background:'var(--bg-card)',fontFamily:'monospace'}}>Esc</kbd> to close</span>
          <div style={{display:'flex',gap:10}}>
            <a href={url} download={file.original_name} target="_blank" rel="noreferrer"
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:10,background:'var(--accent)',color:'var(--bg-sidebar)',textDecoration:'none',fontSize:13,fontWeight:700}}>
              ⬇️ Download
            </a>
            <button onClick={onClose}
              style={{padding:'8px 16px',borderRadius:10,cursor:'pointer',border:'1px solid var(--border)',color:'var(--text-muted)',background:'transparent',fontSize:13,fontWeight:600,transition:'background 0.14s'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--accent-dim)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>Close</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main FileCard ────────────────────────────────────────────
export default function FileCard({ file, index = 0, showDescription = true }) {
  const [signedUrl,   setSignedUrl]   = useState(null);
  const [coverUrl,    setCoverUrl]    = useState(null);
  const [fetching,    setFetching]    = useState(false);
  const [fetchErr,    setFetchErr]    = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [expanded,    setExpanded]    = useState(false);
  const didMount = useRef(false);

  // Auto-load cover on mount
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    if (file.cover_key) fetchUrls();
  }, []); // eslint-disable-line

  const fetchUrls = async () => {
    if (signedUrl) return { url: signedUrl, coverUrl };
    setFetching(true); setFetchErr('');
    try {
      const res  = await fetch(`/api/download/${file.id}`);
      let data;
      try { data = await res.json(); } catch { throw new Error(`Server error (${res.status})`); }
      if (!data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setSignedUrl(data.url);
      setCoverUrl(data.coverUrl || null);
      return { url: data.url, coverUrl: data.coverUrl || null };
    } catch (e) { setFetchErr(e.message); return null; }
    finally { setFetching(false); }
  };

  const handlePreview = async () => {
    if (signedUrl) { setShowPreview(true); return; }
    const r = await fetchUrls();
    if (r) setShowPreview(true);
  };

  // Download via <a> tag — no fetch() CORS issues
  const handleDownload = async () => {
    let url = signedUrl;
    if (!url) {
      setDownloading(true);
      const r = await fetchUrls();
      setDownloading(false);
      if (!r) return;
      url = r.url;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = file.original_name; // preserves original filename
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const tc       = TYPE_COLOR[file.file_type];
  const hasCover = !!file.cover_key;
  const desc     = file.description || '';
  const descShort = desc.length > 120;

  return (
    <>
      <AnimatePresence>
        {showPreview && signedUrl && (
          <PreviewModal key="modal" file={file} url={signedUrl} coverUrl={coverUrl} onClose={() => setShowPreview(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
        transition={{delay:Math.min(index*0.04,0.28),duration:0.24,ease:'easeOut'}}
        className="card-hover"
        style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--r-lg)', overflow:'hidden',
          display:'flex', flexDirection:'column', minWidth:0, width:'100%' }}>

        {/* Thumbnail — 16:9, cover or icon */}
        <div onClick={handlePreview}
          style={{ aspectRatio:'16/9', position:'relative', overflow:'hidden',
            flexShrink:0, cursor:'pointer',
            background:hasCover&&coverUrl?'var(--bg2)':`linear-gradient(135deg,var(--bg2) 0%,${tc}22 100%)` }}>
          {coverUrl && (
            <img src={coverUrl} alt={file.original_name}
              style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.35s ease'}}
              onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
              onMouseLeave={e=>e.target.style.transform='scale(1)'} />
          )}
          {!coverUrl && (
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:'clamp(28px,6vw,44px)'}}>{TYPE_ICON[file.file_type]}</span>
            </div>
          )}
          {/* Hover play overlay */}
          <div className="play-overlay"
            style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.38)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0,transition:'opacity 0.18s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity=1}
            onMouseLeave={e=>e.currentTarget.style.opacity=0}>
            {fetching
              ? <div className="spin" style={{width:36,height:36,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%'}} />
              : <div style={{width:'clamp(38px,8vw,50px)',height:'clamp(38px,8vw,50px)',borderRadius:'50%',background:'var(--accent)',color:'var(--bg-sidebar)',fontWeight:900,fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 20px var(--accent-glow)'}}>
                  {file.file_type==='pdf'?'👁️':'▶'}
                </div>}
          </div>
          {/* Badges */}
          <div style={{position:'absolute',top:8,left:8}}>
            <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:99,border:'1px solid',background:`${tc}28`,color:tc,borderColor:`${tc}44`}}>
              {file.file_type.toUpperCase()}</span>
          </div>
          {!!file.is_featured && <div style={{position:'absolute',top:8,right:8,fontSize:14}}>⭐</div>}
        </div>

        {/* Body */}
        <div style={{padding:'clamp(10px,2vw,14px)',display:'flex',flexDirection:'column',gap:7,flex:1}}>
          {file.category_name && (
            <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:99,alignSelf:'flex-start',background:'var(--accent-dim)',color:'var(--accent)',border:'1px solid var(--border2)'}}>
              {file.category_name}</span>
          )}
          {/* Title */}
          <p style={{fontWeight:700,fontSize:'clamp(15px,2.5vw,18px)',color:'var(--text)',lineHeight:1.35,wordBreak:'break-word'}}>
            {file.title || file.original_name}
          </p>
          {/* Description with Read More */}
          {showDescription && desc && (
            <div>
              <p style={{fontSize:16,color:'var(--text-2)',lineHeight:1.8,wordBreak:'break-word'}}>
                {expanded || !descShort ? desc : desc.slice(0,120) + '…'}
              </p>
              {descShort && (
                <button onClick={() => setExpanded(x => !x)}
                  style={{fontSize:11,color:'var(--accent)',background:'none',border:'none',cursor:'pointer',padding:'2px 0',fontWeight:700}}>
                  {expanded ? 'Show less ▲' : 'Read more ▼'}
                </button>
              )}
            </div>
          )}
          {/* Meta */}
          <p style={{fontSize:11,color:'var(--text-muted)'}}>
            {file.author && `${file.author} · `}
            {(file.file_size/1024/1024).toFixed(2)} MB · {file.date_label
  ? new Date(file.date_label).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' })
  : new Date(file.upload_date).toLocaleDateString()
}
          </p>
          {fetchErr && (
            <div style={{fontSize:11,padding:'6px 9px',borderRadius:8,wordBreak:'break-word',background:'rgba(255,61,90,0.08)',border:'1px solid var(--danger)',color:'var(--danger)'}}>
              ⚠️ {fetchErr}
            </div>
          )}
          {/* Actions */}
          <div style={{display:'flex',gap:7,marginTop:'auto',paddingTop:9,borderTop:'1px solid var(--border)',flexWrap:'wrap'}}>
            <button onClick={handlePreview} disabled={fetching}
              style={{flex:1,minWidth:60,padding:'7px 4px',background:'var(--accent)',color:'var(--bg-sidebar)',border:'none',borderRadius:10,cursor:fetching?'not-allowed':'pointer',fontSize:12,fontWeight:700,opacity:fetching?0.6:1,display:'flex',alignItems:'center',justifyContent:'center',gap:4,transition:'background 0.14s'}}
              onMouseEnter={e=>{if(!fetching)e.currentTarget.style.background='var(--accent2)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--accent)';}}>
              {fetching ? <span className="spin" style={{width:12,height:12,border:'2px solid var(--bg-sidebar)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block'}} />
                : <>{file.file_type==='pdf'?'👁️':'▶'} {file.file_type==='pdf'?'Preview':'Play'}</>}
            </button>
            <button onClick={handleDownload} disabled={fetching||downloading}
              style={{flex:1,minWidth:60,padding:'7px 4px',background:downloading?'var(--border2)':'#166534',color:'#fff',border:'none',borderRadius:10,cursor:(fetching||downloading)?'not-allowed':'pointer',fontSize:12,fontWeight:700,opacity:(fetching||downloading)?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:4,transition:'background 0.14s'}}
              onMouseEnter={e=>{if(!fetching&&!downloading)e.currentTarget.style.background='#14532d';}}
              onMouseLeave={e=>{if(!fetching&&!downloading)e.currentTarget.style.background='#166534';}}>
              {downloading ? <span className="spin" style={{width:12,height:12,border:'2px solid #fff',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block'}} /> : '⬇️ Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}