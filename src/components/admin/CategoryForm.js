'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:14, padding:'9px 12px', outline:'none', fontFamily:'inherit', transition:'border-color 0.18s,box-shadow 0.18s' };
const focus = e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-dim)'; };
const blur  = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };
const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };


export default function CategoryForm({ categories, onCreated }) {
  const [name,     setName]     = useState('');
  const [desc,     setDesc]     = useState('');
  const [author,   setAuthor]   = useState('');
  const [tags,     setTags]     = useState('');
  const [parentId, setParentId] = useState('');
  const [cover,    setCover]    = useState(null);
  const [busy,     setBusy]     = useState(false);
  const [msg,      setMsg]      = useState(null);

  const [coverPageImg,   setCoverPageImg]   = useState(null);
const [coverPageTitle, setCoverPageTitle] = useState('');

  const topLevel = categories.filter(c => !c.parent_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setMsg({ ok:false, text:'Name is required.' }); return; }
    setBusy(true); setMsg(null);
    const fd = new FormData();
    fd.append('name', name.trim()); fd.append('description', desc); fd.append('author', author);
    fd.append('tags', JSON.stringify(tags.split(',').map(t=>t.trim()).filter(Boolean)));
    if (parentId) fd.append('parentId', parentId);
   if (coverPageImg) {
  fd.append('coverPageImg',   coverPageImg);
  fd.append('coverPageTitle', coverPageTitle || name);
}
    const res  = await fetch('/api/categories', { method:'POST', body:fd });
    const data = await res.json();
    setBusy(false);
    if (data.success) { setMsg({ ok:true, text:`"${name}" created!` }); setName(''); setDesc(''); setAuthor(''); setTags(''); setParentId(''); setCover(null); onCreated(); }
    else setMsg({ ok:false, text: data.error || 'Failed.' });
  };

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'clamp(16px,3vw,24px)', marginBottom:28 }}>
      <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginBottom:18 }}>➕ Create Category / Subcategory</h3>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
          <div><label style={LB}>Name *</label><input style={IS} className="input-base" value={name} onChange={e=>setName(e.target.value)} placeholder="Category name" onFocus={focus} onBlur={blur} /></div>
          <div><label style={LB}>Author</label><input style={IS} className="input-base" value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Optional" onFocus={focus} onBlur={blur} /></div>
        </div>
        <div><label style={LB}>Description</label><textarea style={{...IS,minHeight:68,resize:'vertical'}} className="input-base" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Optional description" onFocus={focus} onBlur={blur} /></div>
        <div><label style={LB}>Tags (comma-separated)</label><input style={IS} className="input-base" value={tags} onChange={e=>setTags(e.target.value)} placeholder="e.g. science, lectures" onFocus={focus} onBlur={blur} /></div>
        <div><label style={LB}>Parent Category (leave blank for top-level)</label>
          <select style={IS} className="input-base" value={parentId} onChange={e=>setParentId(e.target.value)} onFocus={focus} onBlur={blur}>
            <option value="">— Top-level Category —</option>
            {topLevel.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>


      <div>
  <label style={LB}>Cover Page (optional)</label>
  <input
    style={IS}
    className="input-base"
    placeholder="Cover page title (for labeling)"
    value={coverPageTitle}
    onChange={e => setCoverPageTitle(e.target.value)}
    // style={{ ...IS, marginBottom: 8 }}
  />
  <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:8 }}>
    {coverPageImg ? (
      <div style={{ position:'relative', flexShrink:0 }}>
        <img src={URL.createObjectURL(coverPageImg)} alt="preview"
          style={{ width:60, height:60, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }} />
        <button type="button" onClick={() => setCoverPageImg(null)}
          style={{ position:'absolute', top:-6, right:-6, background:'var(--danger)', border:'none', borderRadius:'50%', width:16, height:16, cursor:'pointer', color:'#fff', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
      </div>
    ) : (
      <div onClick={() => document.getElementById('cat-cover-img').click()}
        style={{ width:60, height:60, border:'2px dashed var(--border2)', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, transition:'border-color 0.15s,background 0.15s' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='var(--accent-dim)';}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.background='transparent';}}>🖼️</div>
    )}
    <div>
      <button type="button" onClick={() => document.getElementById('cat-cover-img').click()} className="btn btn-ghost btn-sm">
        {coverPageImg ? 'Change Image' : 'Upload Cover Image'}
      </button>
      <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>Creates a Cover Page record assigned to this category.</p>
    </div>
    <input id="cat-cover-img" type="file" accept="image/*" style={{ display:'none' }} onChange={e => setCoverPageImg(e.target.files[0])} />
  </div>
</div>





        <button type="submit" disabled={busy} className="btn btn-primary" style={{ alignSelf:'flex-start', padding:'9px 22px' }}>
          {busy ? <><span className="spin" style={{ width:14, height:14, border:'2px solid var(--bg-sidebar)', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block' }} /> Creating…</> : '➕ Create'}
        </button>
        {msg && <p style={{ fontSize:13, fontWeight:600, color:msg.ok?'var(--success)':'var(--danger)' }}>{msg.text}</p>}
      </form>
    </div>
  );
}