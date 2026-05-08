'use client';
import { useState, useEffect } from 'react';

export default function EditFileModal({ file, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    original_name: file.original_name || '',
    title:         file.title         || '',
    description:   file.description   || '',
    author:        file.author        || '',
    tags:          (() => { try { return JSON.parse(file.tags||'[]').join(', '); } catch { return file.tags||''; } })(),
    date_label:    file.date_label    || '',
    category_id:   file.category_id   || '',
    is_featured:   !!file.is_featured,
    is_latest:     !!file.is_latest,
    is_must_watch: !!file.is_must_watch,
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'8px 11px', outline:'none', fontFamily:'inherit', transition:'border-color 0.18s,box-shadow 0.18s' };
  const focus = e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-dim)'; };
  const blur  = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };
  const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };

  const handleSave = async () => {
    if (!form.original_name.trim()) { setErr('File name is required.'); return; }
    setSaving(true); setErr('');
    try {
      const tags = form.tags.split(',').map(t=>t.trim()).filter(Boolean);
      const res = await fetch('/api/files', {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id:file.id, ...form, tags, category_id: form.category_id||null }),
      });
      const data = await res.json();
      if (data.success) onSave({ ...file, ...form, tags:JSON.stringify(tags) });
      else setErr(data.error || 'Save failed.');
    } catch (e) { setErr('Network error.'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ field, label }) => (
    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
      <div onClick={() => setForm(f=>({...f,[field]:!f[field]}))}
        style={{ width:34, height:19, borderRadius:99, position:'relative', cursor:'pointer', flexShrink:0,
          background:form[field]?'var(--accent)':'var(--border2)',
          border:`1.5px solid ${form[field]?'var(--accent)':'var(--border)'}`,
          transition:'background 0.2s' }}>
        <div style={{ position:'absolute', top:1, left:form[field]?16:2, width:13, height:13, borderRadius:'50%', background:form[field]?'var(--bg-sidebar)':'var(--bg)', transition:'left 0.2s' }} />
      </div>
      <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{label}</span>
    </label>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{ width:'100%', maxWidth:540, maxHeight:'92vh', background:'var(--bg-modal)', border:'1px solid var(--border2)', borderRadius:'var(--r-xl)', display:'flex', flexDirection:'column', boxShadow:'0 30px 70px rgba(0,0,0,0.5)', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <h3 style={{ fontWeight:800, fontSize:17, color:'var(--text)' }}>✏️ Edit File</h3>
          <button onClick={onClose} style={{ background:'var(--accent-dim)', border:'1px solid var(--border)', color:'var(--accent)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={LB}>File Name (original) *</label>
            <input style={IS} value={form.original_name} onChange={e=>setForm(f=>({...f,original_name:e.target.value}))} onFocus={focus} onBlur={blur} />
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>This is the filename users see and download.</p>
          </div>
          <div><label style={LB}>Display Title</label>
            <input style={IS} placeholder="Optional display title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onFocus={focus} onBlur={blur} /></div>
          <div><label style={LB}>Description</label>
            <textarea style={{...IS,minHeight:72,resize:'vertical'}} placeholder="Optional description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} onFocus={focus} onBlur={blur} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={LB}>Author</label>
              <input style={IS} placeholder="Author name" value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} onFocus={focus} onBlur={blur} /></div>
            <div><label style={LB}>Date Label</label>
              <input style={IS} placeholder="e.g. Jan 2025" value={form.date_label} onChange={e=>setForm(f=>({...f,date_label:e.target.value}))} onFocus={focus} onBlur={blur} /></div>
          </div>
          <div><label style={LB}>Tags (comma-separated)</label>
            <input style={IS} placeholder="lecture, science, 2024" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} onFocus={focus} onBlur={blur} /></div>
          <div><label style={LB}>Category</label>
            <select style={IS} value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))} onFocus={focus} onBlur={blur}>
              <option value="">— No Category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.parent_id?`  ↳ ${c.name}`:c.name}</option>)}
            </select>
          </div>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            <Toggle field="is_featured"   label="⭐ Important" />
            <Toggle field="is_latest"     label="🆕 Latest" />
            <Toggle field="is_must_watch" label="🎬 Must Watch" />
          </div>
          {err && <div style={{ background:'rgba(255,61,90,0.08)', border:'1px solid var(--danger)', borderRadius:8, padding:'8px 12px', color:'var(--danger)', fontSize:13 }}>⚠️ {err}</div>}
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--bg2)', flexShrink:0 }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? <><span className="spin" style={{ width:14, height:14, border:'2px solid var(--bg-sidebar)', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block' }} /> Saving…</> : '💾 Save'}
          </button>
        </div>
      </div>
    </div>
  );
}