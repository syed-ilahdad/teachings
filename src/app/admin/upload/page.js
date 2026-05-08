'use client';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';

export default function page() {
  const [file,        setFile]        = useState(null);
  const [cover,       setCover]       = useState(null);
  const [categories,  setCategories]  = useState([]);
  const [catSearch,   setCatSearch]   = useState('');
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [author,      setAuthor]      = useState('');
  const [tags,        setTags]        = useState('');
  const [dateLabel,   setDateLabel]   = useState('');
  const [catId,       setCatId]       = useState('');
  const [isFeatured,  setIsFeatured]  = useState(false);
  const [isLatest,    setIsLatest]    = useState(false);
  const [isMustWatch, setIsMustWatch] = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [status,      setStatus]      = useState(null);
  const [dragOver,    setDragOver]    = useState(false);
  // ── ADD these state variables at the top of the component ──
const [coverPageImg,   setCoverPageImg]   = useState(null);
const [coverPageTitle, setCoverPageTitle] = useState('');
  const xhrRef = useRef(null);

  useEffect(() => { fetch('/api/categories').then(r=>r.json()).then(d=>setCategories(d.categories||[])); }, []);

  const filteredCats = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  const typeIcon = f => !f ? '📂' : f.type.startsWith('audio/') ? '🎵' : f.type.startsWith('video/') ? '🎬' : '📄';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) { setStatus({ ok:false, msg:'Please select a file.' }); return; }
    setUploading(true); setProgress(0); setStatus(null);

    const fd = new FormData();
    fd.append('file',        file);
    fd.append('title',       title);
    fd.append('description', description);
    fd.append('author',      author);
    fd.append('tags',        JSON.stringify(tags.split(',').map(t=>t.trim()).filter(Boolean)));
    fd.append('dateLabel',   dateLabel);
    fd.append('categoryId',  catId);
    fd.append('isFeatured',  isFeatured);
    fd.append('isLatest',    isLatest);
    fd.append('isMustWatch', isMustWatch);
    // if (cover) fd.append('cover', cover);

    if (coverPageImg) {
  fd.append('coverPageImg',   coverPageImg);
  fd.append('coverPageTitle', coverPageTitle || title || file.name);
}

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.upload.addEventListener('progress', e => { if (e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100)); });
    xhr.addEventListener('load', () => {
      setUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setStatus({ ok:true, msg:`✅ "${file.name}" uploaded successfully!` });
          setFile(null); setCover(null); setTitle(''); setDescription(''); setAuthor(''); setTags(''); setDateLabel(''); setCatId(''); setIsFeatured(false); setIsLatest(false); setIsMustWatch(false); setProgress(0);
        } else {
          setStatus({ ok:false, msg:'❌ ' + (data.error||'Upload failed.') });
        }
      } catch { setStatus({ ok:false, msg:'❌ Unexpected response.' }); }
    });
    xhr.addEventListener('error', () => { setUploading(false); setStatus({ ok:false, msg:'❌ Network error.' }); });
    xhr.addEventListener('abort', () => { setUploading(false); setStatus({ ok:false, msg:'⚠️ Cancelled.' }); });
    xhr.open('POST', '/api/files/upload');
    xhr.send(fd);
  };

  const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:14, padding:'9px 12px', outline:'none', fontFamily:'inherit', transition:'border-color 0.18s,box-shadow 0.18s' };
  const focus = e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-dim)'; };
  const blur  = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };
  const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <AdminLayout>
      <PageHeader title="⬆️ Upload Files" subtitle="Add audio, video, or PDF files to the library" />
      <div style={{maxWidth:720}}>

        {/* File drop zone */}
        <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)setFile(f);}}
          onClick={()=>!uploading&&document.getElementById('fu-main').click()}
          style={{border:`2px dashed ${dragOver?'var(--accent)':'var(--border2)'}`,borderRadius:'var(--r-lg)',padding:'clamp(24px,5vw,40px)',textAlign:'center',cursor:'pointer',background:dragOver?'var(--accent-dim)':'transparent',transition:'all 0.18s',marginBottom:24}}>
          {file ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
              <span style={{fontSize:40}}>{typeIcon(file)}</span>
              <p style={{fontWeight:700,color:'var(--text)',fontSize:15}}>{file.name}</p>
              <p style={{color:'var(--text-muted)',fontSize:13}}>{(file.size/1024/1024).toFixed(2)} MB</p>
              <button type="button" onClick={e=>{e.stopPropagation();setFile(null);}} className="btn btn-ghost btn-sm">Remove</button>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
              <span className="float-anim" style={{fontSize:44}}>📂</span>
              <p style={{fontWeight:700,color:'var(--text)',fontSize:15}}>Click or drag &amp; drop</p>
              <p style={{color:'var(--text-muted)',fontSize:13}}>Audio · Video · PDF — up to 2 GB</p>
            </div>
          )}
          <input id="fu-main" type="file" accept="audio/*,video/*,application/pdf" style={{display:'none'}} onChange={e=>setFile(e.target.files[0])} disabled={uploading} />
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
          {/* Title */}
          <div><label style={LB}>Title (optional)</label>
            <input style={IS} className="input-base" placeholder="Display title for this file" value={title} onChange={e=>setTitle(e.target.value)} onFocus={focus} onBlur={blur} /></div>

          {/* Description */}
          <div><label style={LB}>Description (optional)</label>
            <textarea style={{...IS,minHeight:80,resize:'vertical'}} className="input-base" placeholder="Short description shown on the card…" value={description} onChange={e=>setDescription(e.target.value)} onFocus={focus} onBlur={blur} /></div>

          {/* Author + Date side by side */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
            <div><label style={LB}>Author (optional)</label>
              <input style={IS} className="input-base" placeholder="Author name" value={author} onChange={e=>setAuthor(e.target.value)} onFocus={focus} onBlur={blur} /></div>
            <div><label style={LB}>Date Label (optional)</label>
              <input style={IS} type='date' className="input-base" placeholder="e.g. Jan 2025" value={dateLabel} onChange={e=>setDateLabel(e.target.value)} onFocus={focus} onBlur={blur} /></div>
          </div>

          {/* Tags */}
          <div><label style={LB}>Tags (optional — comma-separated)</label>
            <input style={IS} className="input-base" placeholder="e.g. lecture, science, 2024" value={tags} onChange={e=>setTags(e.target.value)} onFocus={focus} onBlur={blur} /></div>

          {/* Category with search */}
          <div>
            <label style={LB}>Category (optional)</label>
            <div style={{position:'relative',marginBottom:6}}>
              <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',fontSize:14}}>🔍</span>
              <input style={{...IS,paddingLeft:34}} className="input-base" placeholder="Search categories…" value={catSearch} onChange={e=>setCatSearch(e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
            <select style={{...IS,height:catSearch?'auto':undefined}} className="input-base" value={catId} onChange={e=>setCatId(e.target.value)} onFocus={focus} onBlur={blur} size={Math.min(filteredCats.length+1,6)}>
              <option value="">— No Category —</option>
              {filteredCats.map(c => (
                <option key={c.id} value={c.id}>{c.parent_id ? `  ↳ ${c.name}` : c.name}</option>
              ))}
            </select>
          </div>



{/* Cover Page */}
<div>
  <label style={LB}>Cover Page (optional)</label>
  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
    {/* Cover Page Title */}
    <input
      style={IS}
      placeholder="Cover page title (e.g. Science Series Cover)"
      value={coverPageTitle}
      onChange={e => setCoverPageTitle(e.target.value)}
    />

        {/* Cover image picker */}
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      {coverPageImg ? (
        <div style={{ position:'relative', flexShrink:0 }}>
          <img
            src={URL.createObjectURL(coverPageImg)}
            alt="cover preview"
            style={{ width:80, height:54, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }}
          />
          <button
            type="button"
            onClick={() => setCoverPageImg(null)}
            style={{ position:'absolute', top:-6, right:-6, background:'var(--danger)', border:'none', borderRadius:'50%', width:16, height:16, cursor:'pointer', color:'#fff', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center' }}
          >✕</button>
        </div>
      ) : (
        <div
          onClick={() => document.getElementById('fu-cover-img').click()}
          style={{ width:80, height:54, border:'2px dashed var(--border2)', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, transition:'border-color 0.15s,background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--accent-dim)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='transparent'; }}
        >🖼️</div>
      )}
      <div>
        <button type="button" onClick={() => document.getElementById('fu-cover-img').click()} className="btn btn-ghost btn-sm">
          {coverPageImg ? 'Change Image' : 'Upload Cover Image'}
        </button>
        <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>
          This creates a Cover Page record and assigns it to this file.
        </p>
      </div>
      <input id="fu-cover-img" type="file" accept="image/*" style={{ display:'none' }} onChange={e => setCoverPageImg(e.target.files[0])} />
    </div>
  </div>
</div>



          {/* Flags */}
          <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
            {[['isFeatured',isFeatured,setIsFeatured,'⭐ Important'],['isLatest',isLatest,setIsLatest,'🆕 Latest'],['isMustWatch',isMustWatch,setIsMustWatch,'🎬 Must Watch']].map(([key,val,setter,label])=>(
              <label key={key} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',userSelect:'none'}}>
                <div onClick={()=>setter(v=>!v)} style={{width:34,height:19,borderRadius:99,position:'relative',cursor:'pointer',background:val?'var(--accent)':'var(--border2)',border:`1.5px solid ${val?'var(--accent)':'var(--border)'}`,transition:'background 0.2s',flexShrink:0}}>
                  <div style={{position:'absolute',top:1,left:val?16:2,width:13,height:13,borderRadius:'50%',background:val?'var(--bg-sidebar)':'var(--bg)',transition:'left 0.2s'}} />
                </div>
                <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{label}</span>
              </label>
            ))}
          </div>

          {/* Submit */}
          <div style={{display:'flex',gap:10}}>
            <button type="submit" disabled={uploading||!file} className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:'12px'}}>
              {uploading ? <><span className="spin" style={{width:16,height:16,border:'2px solid var(--bg-sidebar)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block'}} /> Uploading {progress}%…</> : '⬆️ Upload File'}
            </button>
            {uploading && <button type="button" className="btn btn-danger" onClick={()=>xhrRef.current?.abort()}>Cancel</button>}
          </div>

          {/* Progress bar */}
          {uploading && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-muted)',marginBottom:5}}>
                <span>Uploading to Cloudflare R2…</span>
                <span style={{fontWeight:800,color:'var(--accent)'}}>{progress}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
            </div>
          )}

          {status && (
            <div style={{padding:'12px 16px',borderRadius:'var(--r-md)',background:status.ok?'rgba(0,255,135,0.08)':'rgba(255,61,90,0.08)',border:`1px solid ${status.ok?'var(--accent)':'var(--danger)'}`,color:status.ok?'var(--accent)':'var(--danger)',fontWeight:500,fontSize:14}}>
              {status.msg}
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  );
}