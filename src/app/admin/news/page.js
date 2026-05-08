'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

export default function page() {
  const [items,   setItems]   = useState([]);
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = new
  const [showForm,setShowForm]= useState(false);
  const [form,    setForm]    = useState({ title:'', description:'', file_id:'', author:'', is_active:true });
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);
  let dragSrc2 = null;

  const load = async () => {
    setLoading(true);
    const [nd, fd] = await Promise.all([
      fetch('/api/news').then(r=>r.json()),
      fetch('/api/files?limit=1000').then(r=>r.json()),
    ]);
    setItems(nd.news||[]); setFiles(fd.files||[]); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew  = () => { setEditing(null); setForm({ title:'', description:'', file_id:'', author:'', is_active:true }); setShowForm(true); };
  const startEdit = (item) => { setEditing(item); setForm({ title:item.title, description:item.description||'', file_id:item.file_id||'', author:item.author||'', is_active:!!item.is_active }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { setMsg({ ok:false, text:'Title is required.' }); return; }
    setSaving(true); setMsg(null);
    const body = { ...form, file_id: form.file_id||null };
    let res;
    if (editing) res = await fetch('/api/news', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:editing.id,...body}) });
    else          res = await fetch('/api/news', { method:'POST',  headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setShowForm(false); load(); }
    else setMsg({ ok:false, text:data.error||'Failed.' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this news item?')) return;
    await fetch(`/api/news?id=${id}`, { method:'DELETE' });
    load();
  };

  const handleReorder = async (from, to) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    // Save new order
    for (let i=0; i<next.length; i++) {
      await fetch('/api/news', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:next[i].id, ...next[i], order_index:i }) });
    }
  };

  const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'8px 11px', outline:'none', fontFamily:'inherit' };
  const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <AdminLayout>
      {showForm && (
        <div className="modal-backdrop" onClick={()=>setShowForm(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:500, maxHeight:'90vh', background:'var(--bg-modal)', border:'1px solid var(--border2)', borderRadius:'var(--r-xl)', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 30px 70px rgba(0,0,0,0.5)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              <h3 style={{ fontWeight:800, fontSize:16, color:'var(--text)' }}>{editing?'✏️ Edit':'➕ New'} News Item</h3>
              <button onClick={()=>setShowForm(false)} style={{ background:'var(--accent-dim)', border:'1px solid var(--border)', color:'var(--accent)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={LB}>Title *</label><input style={IS} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="News headline" /></div>
              <div><label style={LB}>Description</label><textarea style={{...IS,minHeight:80,resize:'vertical'}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Full news content…" /></div>
              <div><label style={LB}>Author</label><input style={IS} value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} placeholder="Author name" /></div>
              <div><label style={LB}>Attach File (optional — users click Read More to view)</label>
                <select style={IS} value={form.file_id} onChange={e=>setForm(f=>({...f,file_id:e.target.value}))}>
                  <option value="">— No file attached —</option>
                  {files.map(f=><option key={f.id} value={f.id}>{f.original_name}</option>)}
                </select>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                <div onClick={()=>setForm(f=>({...f,is_active:!f.is_active}))} style={{ width:34, height:19, borderRadius:99, position:'relative', cursor:'pointer', flexShrink:0, background:form.is_active?'var(--accent)':'var(--border2)', border:`1.5px solid ${form.is_active?'var(--accent)':'var(--border)'}`, transition:'background 0.2s' }}>
                  <div style={{ position:'absolute', top:1, left:form.is_active?16:2, width:13, height:13, borderRadius:'50%', background:form.is_active?'var(--bg-sidebar)':'var(--bg)', transition:'left 0.2s' }} />
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>Active (visible to users)</span>
              </label>
              {msg&&<div style={{background:msg.ok?'rgba(0,255,135,0.08)':'rgba(255,61,90,0.08)',border:`1px solid ${msg.ok?'var(--accent)':'var(--danger)'}`,borderRadius:8,padding:'8px 12px',color:msg.ok?'var(--accent)':'var(--danger)',fontSize:13}}>{msg.text}</div>}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--bg2)', flexShrink:0 }}>
              <button onClick={()=>setShowForm(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving?'Saving…':'💾 Save'}</button>
            </div>
          </div>
        </div>
      )}

      <PageHeader title="📰 News Manager" subtitle="Manage the news panel shown to users"
        action={<button onClick={startNew} className="btn btn-primary">➕ New Item</button>} />

      {loading ? <div style={{textAlign:'center',padding:40}}><div className="spin" style={{width:24,height:24,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',margin:'0 auto'}} /></div>
        : items.length===0 ? <EmptyState icon="📰" message="No news items yet. Click ➕ New Item to start." />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>Drag rows to reorder. Top = shown first to users.</p>
            {items.map((item, i) => (
              <div key={item.id} draggable
                onDragStart={()=>{dragSrc2=i;}}
                onDrop={e=>{e.preventDefault();if(dragSrc2!==null&&dragSrc2!==i)handleReorder(dragSrc2,i);dragSrc2=null;}}
                onDragOver={e=>e.preventDefault()} onDragEnd={()=>{dragSrc2=null;}}
                style={{ display:'flex', alignItems:'flex-start', gap:12, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px', cursor:'grab', transition:'border-color 0.15s', opacity:item.is_active?1:0.55 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <span style={{fontSize:18,color:'var(--text-muted)',cursor:'grab',flexShrink:0,marginTop:2}}>⠿</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize:15 }}>{item.title}</p>
                    {!item.is_active && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:99, background:'var(--border)', color:'var(--text-muted)', fontWeight:700 }}>HIDDEN</span>}
                  </div>
                  {item.description && <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.5, marginBottom:4 }}>{item.description.slice(0,120)}{item.description.length>120?'…':''}</p>}
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                    {item.author && <span>{item.author} · </span>}
                    {new Date(item.created_at).toLocaleDateString()}
                    {item.file_name && <span> · 📎 {item.file_name}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={()=>startEdit(item)} style={{ padding:'5px 10px', borderRadius:7, background:'rgba(255,176,32,0.1)', color:'var(--warning)', border:'1px solid rgba(255,176,32,0.28)', cursor:'pointer', fontSize:12, fontWeight:700 }}>✏️</button>
                  <button onClick={()=>handleDelete(item.id)} style={{ padding:'5px 10px', borderRadius:7, background:'rgba(255,61,90,0.1)', color:'var(--danger)', border:'1px solid rgba(255,61,90,0.25)', cursor:'pointer', fontSize:12, fontWeight:700 }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </AdminLayout>
  );
}