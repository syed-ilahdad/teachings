'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';

const SECTION_TYPES = [
  { type:'important',  icon:'⭐', label:'Important Updates', desc:'Admin-marked important files' },
  { type:'latest',     icon:'🆕', label:'Latest Releases',   desc:'Most recently uploaded files' },
  { type:'must_watch', icon:'🎬', label:'Must Watch',        desc:'Admin-marked must-watch files' },
  { type:'categories', icon:'🏷️', label:'Categories',        desc:'Category cards grid' },
  { type:'audio',      icon:'🎵', label:'All Audio',         desc:'All audio files' },
  { type:'video',      icon:'📹', label:'All Video',         desc:'All video files' },
  { type:'pdf',        icon:'📄', label:'All PDFs',          desc:'All PDF documents' },
  { type:'custom',     icon:'✨', label:'Custom',            desc:'Handpick specific files' },
];

const TYPE_COLOR = { important:'#7c3aed', latest:'#0284c7', must_watch:'#0369a1', categories:'#059669', audio:'#7c3aed', video:'#2563eb', pdf:'#dc2626', custom:'#d97706' };

let dragSrc = null;

function EditSectionModal({ section, onSave, onClose }) {
  const [title,  setTitle]  = useState(section.title);
  const [limit,  setLimit]  = useState(section.config?.limit || 12);
  const [desc,   setDesc]   = useState(section.config?.description || '');
  const [search, setSearch] = useState('');
  const [files,  setFiles]  = useState([]);
  const [picked, setPicked] = useState(new Set(section.config?.fileIds || []));
  const [cats,   setCats]   = useState([]);
  const [catSel, setCatSel] = useState(section.config?.categoryId || '');
  const [loading,setLoading]= useState(false);

  useEffect(() => {
    if (section.section_type === 'custom') {
      setLoading(true);
      fetch('/api/files?limit=2000').then(r=>r.json()).then(d=>{setFiles(d.files||[]);setLoading(false);});
    }
    fetch('/api/categories').then(r=>r.json()).then(d=>setCats(d.categories||[]));
  }, [section.section_type]);

  const filtered = files.filter(f => f.original_name.toLowerCase().includes(search.toLowerCase()) || (f.tags||'').toLowerCase().includes(search.toLowerCase()));
  const toggleFile = id => setPicked(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const save = () => onSave({ ...section, title, config: { ...section.config, limit, description:desc, fileIds:[...picked], categoryId:catSel||null } });

  const IS = { width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'8px 11px', outline:'none', fontFamily:'inherit' };
  const LB = { display:'block', marginBottom:5, fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:540, maxHeight:'92vh', background:'var(--bg-modal)', border:'1px solid var(--border2)', borderRadius:'var(--r-xl)', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 30px 70px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
          <h3 style={{ fontWeight:800, fontSize:16, color:'var(--text)' }}>✏️ Edit — {section.title}</h3>
          <button onClick={onClose} style={{ background:'var(--accent-dim)', border:'1px solid var(--border)', color:'var(--accent)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={LB}>Section Title</label><input style={IS} value={title} onChange={e=>setTitle(e.target.value)} /></div>
          <div><label style={LB}>Description (optional)</label><textarea style={{...IS,minHeight:60,resize:'vertical'}} value={desc} onChange={e=>setDesc(e.target.value)} /></div>
          <div><label style={LB}>Max Items</label><input type="number" min={1} max={200} style={{...IS,maxWidth:100}} value={limit} onChange={e=>setLimit(parseInt(e.target.value)||12)} /></div>
          {section.section_type === 'categories' && (
            <div><label style={LB}>Filter by Category (optional)</label>
              <select style={IS} value={catSel} onChange={e=>setCatSel(e.target.value)}>
                <option value="">All Categories</option>
                {cats.filter(c=>!c.parent_id).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {section.section_type === 'custom' && (
            <div>
              <label style={LB}>Pick Files ({picked.size} selected)</label>
              <div style={{ position:'relative', marginBottom:8 }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>🔍</span>
                <input style={{...IS, paddingLeft:30}} placeholder="Search by name or tag…" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
              {loading ? <div style={{ textAlign:'center', padding:20 }}><div className="spin" style={{ width:20, height:20, border:'2px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', margin:'0 auto' }} /></div>
                : <div style={{ maxHeight:240, overflowY:'auto', border:'1px solid var(--border)', borderRadius:8 }}>
                    {filtered.map(f => {
                      const p = picked.has(f.id);
                      return (
                        <div key={f.id} onClick={()=>toggleFile(f.id)}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', cursor:'pointer', background:p?'var(--accent-dim)':'transparent', borderBottom:'1px solid var(--border)', transition:'background 0.12s' }}>
                          <div style={{ width:18, height:18, borderRadius:4, flexShrink:0, background:p?'var(--accent)':'var(--bg-input)', border:`2px solid ${p?'var(--accent)':'var(--border2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--bg-sidebar)', fontWeight:900 }}>{p&&'✓'}</div>
                          <span style={{ fontSize:16, flexShrink:0 }}>{{ audio:'🎵', video:'🎬', pdf:'📄' }[f.file_type]}</span>
                          <span style={{ flex:1, fontSize:13, color:p?'var(--accent)':'var(--text)', fontWeight:p?700:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.original_name}</span>
                          <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>{(f.file_size/1024/1024).toFixed(1)} MB</span>
                        </div>
                      );
                    })}
                    {filtered.length===0 && <p style={{ padding:'20px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>No files match.</p>}
                  </div>}
            </div>
          )}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--bg2)', flexShrink:0 }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={save} className="btn btn-primary">💾 Save</button>
        </div>
      </div>
    </div>
  );
}

export default function page() {
  const [sections,   setSections]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [dragOver,   setDragOver]   = useState(null);

  useEffect(() => {
    fetch('/api/sections').then(r=>r.json()).then(d=>{
      setSections((d.sections||[]).map(s=>({...s, id:s.id??`n${Date.now()}${Math.random()}`, config:typeof s.config==='string'?JSON.parse(s.config):(s.config||{})})));
      setLoading(false);
    });
  }, []);

  const addSection = type => {
    const tmpl = SECTION_TYPES.find(t=>t.type===type);
    setSections(p=>[...p,{id:`new-${Date.now()}`,title:tmpl.label,section_type:type,order_index:p.length,config:{limit:12},is_active:true}]);
  };
  const remove  = i => setSections(p=>p.filter((_,j)=>j!==i));
  const toggle  = i => setSections(p=>p.map((s,j)=>j===i?{...s,is_active:!s.is_active}:s));
  const saveEdit = (updated) => { setSections(p=>p.map((s,i)=>i===editTarget?updated:s)); setEditTarget(null); };
  const move    = (i,dir) => { const t=i+dir; if(t<0||t>=sections.length)return; const n=[...sections]; [n[i],n[t]]=[n[t],n[i]]; setSections(n); };

  const publish = async () => {
    setSaving(true); setSaved(false);
    const res  = await fetch('/api/sections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sections})});
    const data = await res.json();
    setSaving(false);
    if(data.success){setSaved(true);setTimeout(()=>setSaved(false),3000);}
    else alert('Failed: '+data.error);
  };

  return (
    <AdminLayout>
      {editTarget!==null&&sections[editTarget]&&<EditSectionModal section={sections[editTarget]} onSave={saveEdit} onClose={()=>setEditTarget(null)} />}
      <PageHeader title="🧱 Page Builder" subtitle="Customize the left content area of the user homepage"
        action={<button onClick={publish} disabled={saving} className="btn btn-primary" style={{padding:'9px 22px'}}>{saving?'Saving…':saved?'✅ Published!':'🚀 Publish'}</button>} />
      {/* Palette */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:16, marginBottom:22 }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Add Section</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8 }}>
          {SECTION_TYPES.map(st => (
            <button key={st.type} onClick={()=>addSection(st.type)}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 8px', borderRadius:10, cursor:'pointer', background:'var(--bg-input)', border:'1px solid var(--border)', transition:'border-color 0.14s,background 0.14s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=TYPE_COLOR[st.type];e.currentTarget.style.background=`${TYPE_COLOR[st.type]}12`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-input)';}}>
              <span style={{fontSize:20}}>{st.icon}</span>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{st.label}</span>
              <span style={{fontSize:10,color:'var(--text-muted)',textAlign:'center'}}>{st.desc}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Section rows */}
      {loading ? <div style={{textAlign:'center',padding:40}}><div className="spin" style={{width:24,height:24,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',margin:'0 auto'}} /></div>
        : sections.length===0 ? <p style={{color:'var(--text-muted)',textAlign:'center',padding:'32px 0'}}>Add sections from the palette above.</p>
        : <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {sections.map((sec,i)=>{
              const tmpl=SECTION_TYPES.find(t=>t.type===sec.section_type)||SECTION_TYPES[0];
              const color=TYPE_COLOR[sec.section_type]||'#6b7280';
              return (
                <div key={sec.id??i} draggable onDragStart={()=>{dragSrc=i;}} onDragOver={e=>{e.preventDefault();setDragOver(i);}}
                  onDrop={e=>{e.preventDefault();if(dragSrc!==null&&dragSrc!==i){const n=[...sections];const[m]=n.splice(dragSrc,1);n.splice(i,0,m);setSections(n);}dragSrc=null;setDragOver(null);}}
                  onDragEnd={()=>{dragSrc=null;setDragOver(null);}}
                  style={{ display:'flex', alignItems:'center', gap:10, background:dragOver===i?'var(--accent-dim)':'var(--bg-card)', border:`1px solid ${dragOver===i?'var(--accent)':'var(--border)'}`, borderRadius:10, padding:'11px 14px', cursor:'grab', opacity:sec.is_active?1:0.48, transition:'background 0.12s,border-color 0.12s', userSelect:'none', flexWrap:'wrap' }}>
                  <span style={{fontSize:18,color:'var(--text-muted)',cursor:'grab',flexShrink:0}}>⠿</span>
                  <span style={{fontSize:20,flexShrink:0}}>{tmpl.icon}</span>
                  <div style={{flex:1,minWidth:80}}>
                    <p style={{fontWeight:700,fontSize:14,color:'var(--text)'}}>{sec.title}</p>
                    {sec.config?.description&&<p style={{fontSize:11,color:'var(--text-muted)',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sec.config.description}</p>}
                    {sec.section_type==='custom'&&sec.config?.fileIds?.length>0&&<p style={{fontSize:11,color:'var(--accent)',marginTop:1}}>{sec.config.fileIds.length} files pinned</p>}
                  </div>
                  <span style={{fontSize:11,color:'var(--text-muted)',flexShrink:0,whiteSpace:'nowrap'}}>max {sec.config?.limit||12}</span>
                  <div style={{display:'flex',flexDirection:'column',gap:1,flexShrink:0}}>
                    <button onClick={()=>move(i,-1)} disabled={i===0} style={{padding:'2px 5px',fontSize:10,background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:4,cursor:i===0?'not-allowed':'pointer',color:'var(--text-muted)'}}>▲</button>
                    <button onClick={()=>move(i,1)} disabled={i===sections.length-1} style={{padding:'2px 5px',fontSize:10,background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:4,cursor:i===sections.length-1?'not-allowed':'pointer',color:'var(--text-muted)'}}>▼</button>
                  </div>
                  <div onClick={()=>toggle(i)} style={{width:34,height:19,borderRadius:99,flexShrink:0,cursor:'pointer',background:sec.is_active?'var(--accent)':'var(--border2)',border:`1.5px solid ${sec.is_active?'var(--accent)':'var(--border)'}`,position:'relative',transition:'background 0.2s'}}>
                    <div style={{position:'absolute',top:1,left:sec.is_active?16:2,width:13,height:13,borderRadius:'50%',background:sec.is_active?'var(--bg-sidebar)':'var(--bg)',transition:'left 0.2s'}} />
                  </div>
                  <button onClick={()=>setEditTarget(i)} style={{padding:'5px 10px',borderRadius:7,background:`${color}15`,color,border:`1px solid ${color}44`,cursor:'pointer',fontSize:12,fontWeight:700,flexShrink:0}}>✏️ Edit</button>
                  <button onClick={()=>remove(i)} style={{padding:'5px 8px',borderRadius:7,background:'rgba(255,61,90,0.1)',color:'var(--danger)',border:'1px solid rgba(255,61,90,0.25)',cursor:'pointer',fontSize:12,fontWeight:700,flexShrink:0}}>✕</button>
                </div>
              );
            })}
          </div>}
      {sections.length>0&&<p style={{marginTop:16,fontSize:12,color:'var(--text-muted)',textAlign:'center'}}>💡 Drag rows to reorder · Click ✏️ Edit to add files · Click 🚀 Publish to make live</p>}
    </AdminLayout>
  );
}