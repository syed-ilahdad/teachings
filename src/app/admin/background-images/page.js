'use client';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';


function EditBgModal({ img, onSave, onClose }) {
  const [title, setTitle] = useState(img.title);
  const [theme, setTheme] = useState({
    dark:  img.theme === 'dark'  || img.theme === 'both' || !img.theme,
    light: img.theme === 'light' || img.theme === 'both' || !img.theme,
  });
  const [saving, setSaving] = useState(false);

  const themeValue = () => {
    if (theme.dark && theme.light) return 'both';
    if (theme.dark)  return 'dark';
    if (theme.light) return 'light';
    return 'both';
  };

  const handleSave = async () => {
    setSaving(true);
    const res  = await fetch('/api/background-images', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: img.id, title, theme: themeValue() }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) onSave();
    else alert('Save failed: ' + data.error);
  };

  const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'8px 11px', outline:'none', fontFamily:'inherit' };
  const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:420, background:'var(--bg-modal)', border:'1px solid var(--border2)', borderRadius:22, overflow:'hidden', boxShadow:'0 30px 70px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'var(--bg2)', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ fontWeight:800, fontSize:16, color:'var(--text)' }}>✏️ Edit Background Image</h3>
          <button onClick={onClose} style={{ background:'var(--accent-dim)', border:'1px solid var(--border)', color:'var(--accent)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>
          <div><label style={LB}>Title</label><input style={IS} value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div>
            <label style={LB}>Display in Theme</label>
            <div style={{ display:'flex', gap:20, marginTop:4 }}>
              {[['dark','🌙 Dark Mode'],['light','☀️ Light Mode']].map(([key, label]) => (
                <label key={key} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
                  <div
                    onClick={() => setTheme(t => ({ ...t, [key]: !t[key] }))}
                    style={{
                      width:18, height:18, borderRadius:4, flexShrink:0, cursor:'pointer',
                      background: theme[key] ? 'var(--accent)' : 'var(--bg-input)',
                      border: `2px solid ${theme[key] ? 'var(--accent)' : 'var(--border2)'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, color:'var(--bg-sidebar)', fontWeight:900,
                    }}
                  >{theme[key] && '✓'}</div>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Preview */}
          {img.url && <img src={img.url} alt={img.title} style={{ width:'100%', height:120, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }} />}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--bg2)' }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : '💾 Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function BackgroundImagesPage() {
  const [images,   setImages]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [file,     setFile]     = useState(null);
  const [title,    setTitle]    = useState('');
  const [uploading,setUploading]= useState(false);
  const [progress, setProgress] = useState(0);
  const [status,   setStatus]   = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [theme, setTheme] = useState({ dark: true, light: true });
  const xhrRef = useRef(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/background-images').then(x=>x.json());
    setImages(r.images || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Helper — converts checkbox state to DB value:
const themeValue = () => {
  if (theme.dark && theme.light) return 'both';
  if (theme.dark)  return 'dark';
  if (theme.light) return 'light';
  return 'both'; // neither checked = both (default)
};

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) { setStatus({ ok:false, msg:'Select an image first.' }); return; }
    setUploading(true); setProgress(0); setStatus(null);
    const fd = new FormData();
    fd.append('file', file);
fd.append('title', title.trim());
fd.append('theme', themeValue());
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.upload.addEventListener('progress', e => { if (e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100)); });
    xhr.addEventListener('load', () => {
      setUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) { setStatus({ ok:true, msg:'✅ Uploaded!' }); setFile(null); setTitle(''); setProgress(0); load(); }
        else setStatus({ ok:false, msg:'❌ ' + data.error });
      } catch { setStatus({ ok:false, msg:'❌ Unexpected error' }); }
    });
    xhr.addEventListener('error', () => { setUploading(false); setStatus({ ok:false, msg:'❌ Network error' }); });
    xhr.open('POST', '/api/background-images');
    xhr.send(fd);
  };

  const handleDelete = async (img) => {
    if (!confirm(`Delete "${img.title}"?`)) return;
    await fetch(`/api/background-images?id=${img.id}`, { method:'DELETE' });
    load();
  };

  const filtered = images.filter(img => img.title.toLowerCase().includes(search.toLowerCase()));

  const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:14, padding:'9px 12px', outline:'none', fontFamily:'inherit', transition:'border-color 0.18s' };
  const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };

  // {editing && <EditBgModal img={editing} onSave={() => { setEditing(null); load(); }} onClose={() => setEditing(null)} />}



  return (
    <AdminLayout>

      {editing && (
  <EditBgModal
    img={editing}
    onSave={() => {
      setEditing(null);
      load();
    }}
    onClose={() => setEditing(null)}
  />
)}
      {/* Preview modal */}
      
      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:900, width:'100%', borderRadius:16, overflow:'hidden' }}>
            <img src={preview.url} alt={preview.title} style={{ width:'100%', maxHeight:'85vh', objectFit:'contain', background:'#000' }} />
            <div style={{ background:'var(--bg2)', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'var(--text)', fontWeight:700 }}>{preview.title}</span>
              <button onClick={() => setPreview(null)} className="btn btn-ghost btn-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      <PageHeader title="🌄 Background Images" subtitle="Images displayed behind the user page" />

      {/* ── SECTION 1: Upload ─────────────────────────────────── */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'clamp(16px,3vw,28px)', marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Upload Background Image</h2>
        <form onSubmit={handleUpload} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div><label style={LB}>Title (for labeling only — not shown to users)</label>
            <input style={IS} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Dark Forest, Abstract Green" /></div>
          <div>
            <label style={LB}>Image File</label>
            <div
              onClick={() => !uploading && document.getElementById('bg-file').click()}
              style={{ border:`2px dashed ${file?'var(--accent)':'var(--border2)'}`, borderRadius:12, padding:'28px', textAlign:'center', cursor:'pointer', background:file?'var(--accent-dim)':'transparent', transition:'all 0.18s' }}
              onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)setFile(f);}}>
              {file ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <img src={URL.createObjectURL(file)} alt="preview" style={{ width:120, height:80, objectFit:'cover', borderRadius:8 }} />
                  <p style={{ fontWeight:700, color:'var(--text)', fontSize:14 }}>{file.name}</p>
                  <button type="button" onClick={e=>{e.stopPropagation();setFile(null);}} className="btn btn-ghost btn-sm">Remove</button>
                </div>
              ) : (
                <div><p style={{ fontSize:36, marginBottom:8 }}>🌄</p><p style={{ color:'var(--text)', fontWeight:700 }}>Click or drag image here</p><p style={{ color:'var(--text-muted)', fontSize:13 }}>JPG, PNG, WebP — recommended 1920×1080</p></div>
              )}
              <input id="bg-file" type="file" accept="image/*" style={{ display:'none' }} onChange={e=>setFile(e.target.files[0])} disabled={uploading} />
            </div>
            <div>
  <label style={LB}>Display in Theme</label>
  <div style={{ display:'flex', gap:20, marginTop:4 }}>
    {[['dark','🌙 Dark Mode'],['light','☀️ Light Mode']].map(([key, label]) => (
      <label key={key} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
        <div
          onClick={() => setTheme(t => ({ ...t, [key]: !t[key] }))}
          style={{
            width:18, height:18, borderRadius:4, flexShrink:0, cursor:'pointer',
            background: theme[key] ? 'var(--accent)' : 'var(--bg-input)',
            border: `2px solid ${theme[key] ? 'var(--accent)' : 'var(--border2)'}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, color:'var(--bg-sidebar)', fontWeight:900,
            transition:'background 0.15s,border-color 0.15s',
          }}
        >{theme[key] && '✓'}</div>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{label}</span>
      </label>
    ))}
  </div>
  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
    Neither checked = shown in both themes. Both checked = shown in both themes.
  </p>
</div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="submit" disabled={uploading||!file} className="btn btn-primary" style={{ flex:1, justifyContent:'center', padding:'11px' }}>
              {uploading ? <><span className="spin" style={{ width:16,height:16,border:'2px solid var(--bg-sidebar)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block' }} /> {progress}%…</> : '⬆️ Upload'}
            </button>
            {uploading && <button type="button" className="btn btn-danger" onClick={()=>xhrRef.current?.abort()}>Cancel</button>}
          </div>
          {uploading && (
            <div>
              <div className="progress-track"><div className="progress-fill" style={{ width:`${progress}%` }} /></div>
            </div>
          )}
          {status && <div style={{ padding:'10px 14px', borderRadius:8, background:status.ok?'rgba(0,255,135,0.08)':'rgba(255,61,90,0.08)', border:`1px solid ${status.ok?'var(--accent)':'var(--danger)'}`, color:status.ok?'var(--accent)':'var(--danger)', fontSize:13, fontWeight:500 }}>{status.msg}</div>}
        </form>
      </div>

      {/* ── SECTION 2: All Background Images ────────────────── */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)' }}>All Background Images ({images.length})</h2>
          <div style={{ position:'relative', minWidth:220 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>🔍</span>
            <input style={{ ...IS, paddingLeft:32, width:'100%' }} placeholder="Search by title…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div style={{ textAlign:'center', padding:40 }}><div className="spin" style={{ width:28,height:28,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',margin:'0 auto' }} /></div>
          : filtered.length===0 ? <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text-muted)' }}><p style={{ fontSize:40, opacity:0.4, marginBottom:10 }}>🌄</p><p>No background images yet.</p></div>
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:16 }}>
              {filtered.map(img => (
                <div key={img.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', transition:'border-color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                  <div style={{ position:'relative', aspectRatio:'16/9', overflow:'hidden', cursor:'pointer' }} onClick={()=>setPreview(img)}>
                    {img.url
                      ? <img src={img.url} alt={img.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>🌄</div>}
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.18s' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                      <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>👁️ Preview</span>
                    </div>
                  </div>
                  
<div
  style={{
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  }}
>
  <div
    style={{
      minWidth: 0,
      flex: 1,
    }}
  >
    <p
      style={{
        fontWeight: 700,
        fontSize: 14,
        color: 'var(--text)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: 4,
      }}
    >
      {img.title}
    </p>

    <p
      style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        lineHeight: 1.4,
      }}
    >
      {img.theme === 'dark'
        ? '🌙 Dark only'
        : img.theme === 'light'
        ? '☀️ Light only'
        : '🌙☀️ Both themes'}
      {' · '}
      {new Date(img.created_at).toLocaleDateString()}
    </p>
  </div>

  <div
    style={{
      display: 'flex',
      gap: 6,
      flexShrink: 0,
    }}
  >
    <button
      onClick={() => setEditing(img)}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: 'rgba(255,176,32,0.1)',
        color: 'var(--warning)',
        border: '1px solid rgba(255,176,32,0.28)',
        cursor: 'pointer',
      }}
    >
      ✏️
    </button>

    <button
      onClick={() => handleDelete(img)}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: 'rgba(255,61,90,0.1)',
        color: 'var(--danger)',
        border: '1px solid rgba(255,61,90,0.25)',
        cursor: 'pointer',
      }}
    >
      🗑️
    </button>
  </div>
</div>
                  </div>
              ))}
            </div>
          )}
      </div>
    </AdminLayout>
  );
}