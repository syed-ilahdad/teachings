'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import CategoryForm from '@/components/admin/CategoryForm';

const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:14, padding:'9px 12px', outline:'none', fontFamily:'inherit', transition:'border-color 0.18s,box-shadow 0.18s' };
const focus = e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-dim)'; };
const blur  = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };
const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };


export default function page() {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); const r = await fetch('/api/categories').then(x=>x.json()); setCats(r.categories||[]); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? Subcategories will become top-level.`)) return;
    const res = await fetch(`/api/categories?id=${id}`, { method:'DELETE' });
    if ((await res.json()).success) load();
    else alert('Delete failed.');
  };

  const startEdit = (cat) => {
    setEditCat(cat);
    setEditForm({ name:cat.name, description:cat.description||'', author:cat.author||'', tags: (() => { try { return JSON.parse(cat.tags||'[]').join(', '); } catch { return cat.tags||''; } })() });
  };

  const handleEditSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('id', editCat.id); fd.append('name', editForm.name); fd.append('description', editForm.description||''); fd.append('author', editForm.author||'');
    fd.append('tags', JSON.stringify(editForm.tags.split(',').map(t=>t.trim()).filter(Boolean)));
    const res = await fetch('/api/categories', { method:'PATCH', body:fd });
    if ((await res.json()).success) { setEditCat(null); load(); }
    setSaving(false);
  };

 const topLevel = cats
  .filter(c => !c.parent_id)
  .filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Edit modal */}
      {editCat && (
        <div className="modal-backdrop" onClick={() => setEditCat(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:480, background:'var(--bg-modal)', border:'1px solid var(--border2)', borderRadius:'var(--r-xl)', overflow:'hidden', boxShadow:'0 30px 70px rgba(0,0,0,0.5)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'var(--bg2)', borderBottom:'1px solid var(--border)' }}>
              <h3 style={{ fontWeight:800, fontSize:16, color:'var(--text)' }}>✏️ Edit Category</h3>
              <button onClick={()=>setEditCat(null)} style={{ background:'var(--accent-dim)', border:'1px solid var(--border)', color:'var(--accent)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
              {[['name','Name *'],['description','Description'],['author','Author'],['tags','Tags (comma-separated)']].map(([f,l])=>(
                <div key={f}><label style={LB}>{l}</label>
                  {f==='description' ? <textarea style={{...IS,minHeight:64,resize:'vertical'}} value={editForm[f]||''} onChange={e=>setEditForm(x=>({...x,[f]:e.target.value}))} onFocus={focus} onBlur={blur} />
                    : <input style={IS} value={editForm[f]||''} onChange={e=>setEditForm(x=>({...x,[f]:e.target.value}))} onFocus={focus} onBlur={blur} />}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--bg2)' }}>
              <button onClick={()=>setEditCat(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleEditSave} disabled={saving} className="btn btn-primary">{saving?'Saving…':'💾 Save'}</button>
            </div>
          </div>
        </div>
      )}

      <PageHeader title="🏷️ Categories" subtitle={`${cats.length} categories total`} />

      <CategoryForm categories={cats} onCreated={load} />
            <div style={{ margin: '12px 0' }}>
  <input
    type="text"
    placeholder="Search categories..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: '100%',
      padding: '10px 12px',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--bg-input)',
      color: 'var(--text)',
      outline: 'none'
    }}
  />
</div>
      

      {loading ? <div style={{ textAlign:'center', padding:40 }}><div className="spin" style={{ width:24, height:24, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', margin:'0 auto' }} /></div>
        : topLevel.length === 0 ? <EmptyState icon="🏷️" message="No categories yet." />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {topLevel.map(cat => {
              const subs = cats.filter(c => c.parent_id === cat.id);
              return (
                <div key={cat.id}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px', transition:'border-color 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <div style={{ width:44, height:44, borderRadius:8, flexShrink:0, background:'var(--accent-dim)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, overflow:'hidden' }}>
                     {cat.cover_key ? (
  <img
    src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${cat.cover_key}`}
    alt={cat.name}
    style={{ width:'100%', height:'100%', objectFit:'cover' }}
  />
) : '🏷️'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, color:'var(--text)', fontSize:15 }}>{cat.name}</p>
                      {cat.description && <p style={{ color:'var(--text-muted)', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cat.description}</p>}
                      {subs.length > 0 && <p style={{ fontSize:11, color:'var(--accent)', marginTop:2 }}>{subs.length} subcategor{subs.length===1?'y':'ies'}</p>}
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <button onClick={() => startEdit(cat)} style={{ padding:'5px 10px', borderRadius:7, background:'rgba(255,176,32,0.1)', color:'var(--warning)', border:'1px solid rgba(255,176,32,0.28)', cursor:'pointer', fontSize:12, fontWeight:700 }}>✏️</button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} style={{ padding:'5px 10px', borderRadius:7, background:'rgba(255,61,90,0.1)', color:'var(--danger)', border:'1px solid rgba(255,61,90,0.25)', cursor:'pointer', fontSize:12, fontWeight:700 }}>🗑️</button>
                    </div>
                  </div>
                  {subs.map(sub => (
                    <div key={sub.id} style={{ display:'flex', alignItems:'center', gap:12, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 16px 10px 42px', marginTop:3 }}>
                      <span style={{ fontSize:12, color:'var(--text-muted)', marginRight:-4 }}>↳</span>
                      <div style={{ width:36, height:36, borderRadius:6, flexShrink:0, background:'var(--accent-dim)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, overflow:'hidden' }}>
                       {sub.cover_key ? (
  <img
    src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${sub.cover_key}`}
    alt={sub.name}
    style={{ width:'100%', height:'100%', objectFit:'cover' }}
  />
) : '📂'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, color:'var(--text)', fontSize:13 }}>{sub.name}</p>
                        {sub.description && <p style={{ color:'var(--text-muted)', fontSize:11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub.description}</p>}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => startEdit(sub)} style={{ padding:'4px 8px', borderRadius:6, background:'rgba(255,176,32,0.1)', color:'var(--warning)', border:'1px solid rgba(255,176,32,0.28)', cursor:'pointer', fontSize:11, fontWeight:700 }}>✏️</button>
                        <button onClick={() => handleDelete(sub.id, sub.name)} style={{ padding:'4px 8px', borderRadius:6, background:'rgba(255,61,90,0.1)', color:'var(--danger)', border:'1px solid rgba(255,61,90,0.25)', cursor:'pointer', fontSize:11, fontWeight:700 }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
    </AdminLayout>
  );
}