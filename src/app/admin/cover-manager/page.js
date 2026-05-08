'use client';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';

function EntityPicker({ files, categories, selected, onChange }) {
  const [search, setSearch] = useState('');
  const entities = [
    ...files.map(f => ({ type:'file', id:f.id, label:f.original_name, icon:'📄' })),
    ...categories.filter(c=>!c.parent_id).map(c => ({ type:'category', id:c.id, label:c.name, icon:'🏷️' })),
    ...categories.filter(c=>c.parent_id).map(c => ({ type:'category', id:c.id, label:`↳ ${c.name}`, icon:'📂' })),
  ];
  const filtered = entities.filter(e => e.label.toLowerCase().includes(search.toLowerCase()));
  const isSelected = (e) => selected.some(s => s.type===e.type && s.id===e.id);
  const toggle = (e) => {
    if (isSelected(e)) onChange(selected.filter(s => !(s.type===e.type && s.id===e.id)));
    else onChange([...selected, { type:e.type, id:e.id }]);
  };
  const remove = (e) => onChange(selected.filter(s => !(s.type===e.type && s.id===e.id)));

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
          {selected.map(s => {
            const en = entities.find(e=>e.type===s.type&&e.id===s.id);
            return en ? (
              <span key={`${s.type}-${s.id}`} style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid var(--border2)', borderRadius:99, fontSize:12, fontWeight:700 }}>
                {en.icon} {en.label}
                <button onClick={()=>remove(s)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:14, padding:0, lineHeight:1 }}>×</button>
              </span>
            ) : null;
          })}
        </div>
      )}
      {/* Search */}
      <div style={{ position:'relative', marginBottom:8 }}>
        <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>🔍</span>
        <input style={{ width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'8px 11px 8px 32px', outline:'none', fontFamily:'inherit' }}
          placeholder="Search files, categories, subcategories…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {/* Multi-select list */}
      <div style={{ maxHeight:220, overflowY:'auto', border:'1px solid var(--border)', borderRadius:8 }}>
        {filtered.length === 0
          ? <p style={{ padding:16, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No results.</p>
          : filtered.map(e => (
            <div key={`${e.type}-${e.id}`} onClick={()=>toggle(e)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', cursor:'pointer', background:isSelected(e)?'var(--accent-dim)':'transparent', borderBottom:'1px solid var(--border)', transition:'background 0.12s' }}
              onMouseEnter={ev=>{if(!isSelected(e))ev.currentTarget.style.background='var(--bg-hover)';}}
              onMouseLeave={ev=>{if(!isSelected(e))ev.currentTarget.style.background='transparent';}}>
              <div style={{ width:18, height:18, borderRadius:4, flexShrink:0, background:isSelected(e)?'var(--accent)':'var(--bg-input)', border:`2px solid ${isSelected(e)?'var(--accent)':'var(--border2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--bg-sidebar)', fontWeight:900 }}>
                {isSelected(e)&&'✓'}
              </div>
              <span style={{ fontSize:15, flexShrink:0 }}>{e.icon}</span>
              <span style={{ flex:1, fontSize:13, color:isSelected(e)?'var(--accent)':'var(--text)', fontWeight:isSelected(e)?700:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.label}</span>
            </div>
          ))}
      </div>
      <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:5 }}>{selected.length} selected</p>
    </div>
  );
}

function EditModal({ cp, files, categories, onSave, onClose }) {
  const [title,    setTitle]    = useState(cp.title);
  const [selected, setSelected] = useState(cp.assignments?.map(a=>({type:a.entity_type,id:a.entity_id}))||[]);
  const [newFile,  setNewFile]  = useState(null);
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('id', cp.id); fd.append('title', title); fd.append('assignments', JSON.stringify(selected));
    if (newFile) fd.append('file', newFile);
    const res = await fetch('/api/cover-pages', { method:'PATCH', body:fd });
    const data = await res.json();
    setSaving(false);
    if (data.success) onSave();
    else alert('Save failed: ' + data.error);
  };

  const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'8px 11px', outline:'none', fontFamily:'inherit' };
  const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:560, maxHeight:'90vh', background:'var(--bg-modal)', border:'1px solid var(--border2)', borderRadius:22, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 30px 70px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <h3 style={{ fontWeight:800, fontSize:16, color:'var(--text)' }}>✏️ Edit Cover Page</h3>
          <button onClick={onClose} style={{ background:'var(--accent-dim)', border:'1px solid var(--border)', color:'var(--accent)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:16 }}>
          <div><label style={LB}>Title</label><input style={IS} value={title} onChange={e=>setTitle(e.target.value)} /></div>
          <div>
            <label style={LB}>Replace Image (optional)</label>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <img src={cp.url} alt={cp.title} style={{ width:80, height:54, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)', flexShrink:0 }} />
              <div>
                <button type="button" onClick={()=>document.getElementById('cp-edit-file').click()} className="btn btn-ghost btn-sm">{newFile?'Change Again':'Replace Image'}</button>
                {newFile && <p style={{ fontSize:11, color:'var(--accent)', marginTop:4 }}>✓ {newFile.name}</p>}
                <input id="cp-edit-file" type="file" accept="image/*" style={{ display:'none' }} onChange={e=>setNewFile(e.target.files[0])} />
              </div>
            </div>
          </div>
          <div><label style={LB}>Assigned To (files / categories / subcategories)</label>
            <EntityPicker files={files} categories={categories} selected={selected} onChange={setSelected} /></div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--bg2)', flexShrink:0 }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving?'Saving…':'💾 Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function CoverManagerPage() {
  const [coverPages, setCoverPages] = useState([]);
  const [files,      setFiles]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [cpFile,     setCpFile]     = useState(null);
  const [cpTitle,    setCpTitle]    = useState('');
  const [selected,   setSelected]   = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [status,     setStatus]     = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [editing,    setEditing]    = useState(null);
  const xhrRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const [cpd, fd, cd] = await Promise.all([
      fetch('/api/cover-pages').then(r=>r.json()),
      fetch('/api/files?limit=2000').then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json()),
    ]);
    setCoverPages(cpd.coverPages||[]); setFiles(fd.files||[]); setCategories(cd.categories||[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!cpFile) { setStatus({ ok:false, msg:'Select an image.' }); return; }
    setUploading(true); setProgress(0); setStatus(null);
    const fd = new FormData();
    fd.append('file', cpFile); fd.append('title', cpTitle||cpFile.name);
    fd.append('assignments', JSON.stringify(selected));
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.upload.addEventListener('progress', e => { if (e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100)); });
    xhr.addEventListener('load', () => {
      setUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) { setStatus({ ok:true, msg:'✅ Cover page uploaded!' }); setCpFile(null); setCpTitle(''); setSelected([]); setProgress(0); load(); }
        else setStatus({ ok:false, msg:'❌ '+data.error });
      } catch { setStatus({ ok:false, msg:'❌ Unexpected error' }); }
    });
    xhr.addEventListener('error', () => { setUploading(false); setStatus({ ok:false, msg:'❌ Network error' }); });
    xhr.open('POST', '/api/cover-pages'); xhr.send(fd);
  };

  const handleDelete = async (cp) => {
    if (!confirm(`Delete cover page "${cp.title}"? This will also remove it from assigned items.`)) return;
    await fetch(`/api/cover-pages?id=${cp.id}`, { method:'DELETE' });
    load();
  };

  const filtered = coverPages.filter(cp => cp.title.toLowerCase().includes(search.toLowerCase()));

  const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:14, padding:'9px 12px', outline:'none', fontFamily:'inherit' };
  const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <AdminLayout>
      {preview && (
        <div className="modal-backdrop" onClick={()=>setPreview(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:900, width:'100%', borderRadius:16, overflow:'hidden' }}>
            <img src={preview.url} alt={preview.title} style={{ width:'100%', maxHeight:'85vh', objectFit:'contain', background:'#000' }} />
            <div style={{ background:'var(--bg2)', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div><p style={{ color:'var(--text)', fontWeight:700 }}>{preview.title}</p><p style={{ color:'var(--text-muted)', fontSize:12 }}>{preview.assignments?.length||0} assignments</p></div>
              <button onClick={()=>setPreview(null)} className="btn btn-ghost btn-sm">Close</button>
            </div>
          </div>
        </div>
      )}
      {editing && <EditModal cp={editing} files={files} categories={categories} onSave={()=>{setEditing(null);load();}} onClose={()=>setEditing(null)} />}

      <PageHeader title="🖼️ Cover Page Manager" subtitle="Manage cover images for files, categories, and subcategories" />

      {/* ── SECTION 1: Upload ─────────────────────────────────── */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'clamp(16px,3vw,28px)', marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)', marginBottom:20 }}>Upload Cover Page</h2>
        <form onSubmit={handleUpload} style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div><label style={LB}>Cover Page Title (for labeling only)</label>
            <input style={IS} value={cpTitle} onChange={e=>setCpTitle(e.target.value)} placeholder="e.g. Science Series Cover" /></div>
          <div>
            <label style={LB}>Cover Image</label>
            <div onClick={()=>!uploading&&document.getElementById('cp-main').click()}
              style={{ border:`2px dashed ${cpFile?'var(--accent)':'var(--border2)'}`, borderRadius:12, padding:'28px', textAlign:'center', cursor:'pointer', background:cpFile?'var(--accent-dim)':'transparent', transition:'all 0.18s' }}
              onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)setCpFile(f);}}>
              {cpFile ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <img src={URL.createObjectURL(cpFile)} alt="preview" style={{ width:140, height:90, objectFit:'cover', borderRadius:8 }} />
                  <p style={{ fontWeight:700, color:'var(--text)', fontSize:14 }}>{cpFile.name}</p>
                  <button type="button" onClick={e=>{e.stopPropagation();setCpFile(null);}} className="btn btn-ghost btn-sm">Remove</button>
                </div>
              ) : <div><p style={{ fontSize:36, marginBottom:8 }}>🖼️</p><p style={{ color:'var(--text)', fontWeight:700 }}>Click or drag image here</p><p style={{ color:'var(--text-muted)', fontSize:13 }}>JPG, PNG, WebP</p></div>}
              <input id="cp-main" type="file" accept="image/*" style={{ display:'none' }} onChange={e=>setCpFile(e.target.files[0])} disabled={uploading} />
            </div>
          </div>
          <div>
            <label style={LB}>Assign To (files, categories, subcategories — multi-select)</label>
            <EntityPicker files={files} categories={categories} selected={selected} onChange={setSelected} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="submit" disabled={uploading||!cpFile} className="btn btn-primary" style={{ flex:1, justifyContent:'center', padding:'11px' }}>
              {uploading ? <><span className="spin" style={{ width:16,height:16,border:'2px solid var(--bg-sidebar)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block' }} /> {progress}%…</> : '⬆️ Upload Cover Page'}
            </button>
            {uploading && <button type="button" className="btn btn-danger" onClick={()=>xhrRef.current?.abort()}>Cancel</button>}
          </div>
          {uploading && <div className="progress-track"><div className="progress-fill" style={{ width:`${progress}%` }} /></div>}
          {status && <div style={{ padding:'10px 14px', borderRadius:8, background:status.ok?'rgba(0,255,135,0.08)':'rgba(255,61,90,0.08)', border:`1px solid ${status.ok?'var(--accent)':'var(--danger)'}`, color:status.ok?'var(--accent)':'var(--danger)', fontSize:13, fontWeight:500 }}>{status.msg}</div>}
        </form>
      </div>

      {/* ── SECTION 2: All Cover Pages ───────────────────────── */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:'var(--text)' }}>All Cover Pages ({coverPages.length})</h2>
          <div style={{ position:'relative', minWidth:220 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>🔍</span>
            <input style={{ ...IS, paddingLeft:32, width:'100%' }} placeholder="Search by title…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div style={{ textAlign:'center', padding:40 }}><div className="spin" style={{ width:28,height:28,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',margin:'0 auto' }} /></div>
          : filtered.length===0 ? <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text-muted)' }}><p style={{ fontSize:40, opacity:0.4, marginBottom:10 }}>🖼️</p><p>No cover pages yet.</p></div>
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:16 }}>
              {filtered.map(cp => (
                <div key={cp.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', transition:'border-color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                  <div style={{ position:'relative', aspectRatio:'16/9', overflow:'hidden', cursor:'pointer' }} onClick={()=>setPreview(cp)}>
                    {cp.url ? <img src={cp.url} alt={cp.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>🖼️</div>}
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.18s' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                      <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>👁️ Preview</span>
                    </div>
                  </div>
                  <div style={{ padding:'12px 14px' }}>
                    <p style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cp.title}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>{cp.assignments?.length||0} assignments · {new Date(cp.created_at).toLocaleDateString()}</p>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>setPreview(cp)} style={{ flex:1, padding:'5px', borderRadius:7, background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid var(--border2)', cursor:'pointer', fontSize:12, fontWeight:700 }}>👁️ Preview</button>
                      <button onClick={()=>setEditing(cp)} style={{ flex:1, padding:'5px', borderRadius:7, background:'rgba(255,176,32,0.1)', color:'var(--warning)', border:'1px solid rgba(255,176,32,0.28)', cursor:'pointer', fontSize:12, fontWeight:700 }}>✏️ Edit</button>
                      <button onClick={()=>handleDelete(cp)} style={{ padding:'5px 10px', borderRadius:7, background:'rgba(255,61,90,0.1)', color:'var(--danger)', border:'1px solid rgba(255,61,90,0.25)', cursor:'pointer', fontSize:12, fontWeight:700 }}>🗑️</button>
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