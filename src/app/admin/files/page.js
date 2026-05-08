'use client';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import SortFilterBar from '@/components/shared/SortFilterBar';
import EmptyState from '@/components/shared/EmptyState';
import EditFileModal from '@/components/admin/EditFileModal';

const TYPE_COLOR = { audio:'#7c3aed', video:'#2563eb', pdf:'#dc2626' };
const TYPE_ICON  = { audio:'🎵', video:'🎬', pdf:'📄' };

export default function page() {
  const [files,      setFiles]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [sort,       setSort]       = useState('date');
  const [catFilter,  setCatFilter]  = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editFile,   setEditFile]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFile,setPreviewFile]= useState(null);
  const [fetchingId, setFetchingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit:'1000', order:sort });
    if (catFilter !== 'all') params.set('category', catFilter);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (search) params.set('search', search);
    const [fd, cd] = await Promise.all([
      fetch(`/api/files?${params}`).then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json()),
    ]);
    setFiles(fd.files || []);
    setCategories(cd.categories || []);
    setLoading(false);
  }, [search, sort, catFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (file) => {
    if (!confirm(`Delete "${file.original_name}" permanently?`)) return;
    setDeletingId(file.id);
    const res  = await fetch(`/api/files?id=${file.id}`, { method:'DELETE' });
    const data = await res.json();
    if (data.success) setFiles(p => p.filter(f => f.id !== file.id));
    else alert('Delete failed: ' + data.error);
    setDeletingId(null);
  };

  const handlePreview = async (file) => {
    setFetchingId(file.id);
    try {
      const res  = await fetch(`/api/download/${file.id}`);
      const data = await res.json();
      if (data.success) { setPreviewUrl(data.url); setPreviewFile(file); }
      else alert('Could not load: ' + data.error);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setFetchingId(null); }
  };

  const handleEditSave = (updated) => {
    setFiles(p => p.map(f => f.id === updated.id ? { ...f, ...updated } : f));
    setEditFile(null);
  };

  const tdS = { padding:'11px 12px', borderBottom:'1px solid var(--border)', verticalAlign:'middle', fontSize:13 };
  const thS = { ...tdS, background:'var(--bg2)', fontWeight:700, color:'var(--text-muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' };

  return (
    <AdminLayout>
      {editFile && (
        <EditFileModal
          file={editFile}
          categories={categories}
          onSave={handleEditSave}
          onClose={() => setEditFile(null)}
        />
      )}

      {/* Quick preview modal */}
      {previewUrl && previewFile && (
        <div className="modal-backdrop" onClick={() => { setPreviewUrl(null); setPreviewFile(null); }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:800, maxHeight:'88vh', background:'var(--bg-modal)', border:'1px solid var(--border2)', borderRadius:'var(--r-xl)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              <span style={{ fontWeight:700, color:'var(--text)', fontSize:15 }}>{previewFile.title || previewFile.original_name}</span>
              <button onClick={() => { setPreviewUrl(null); setPreviewFile(null); }} style={{ background:'var(--accent-dim)', border:'1px solid var(--border)', color:'var(--accent)', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ flex:1, overflow:'auto', padding:16 }}>
              {previewFile.file_type==='audio' && <audio controls autoPlay src={previewUrl} style={{ width:'100%', accentColor:'var(--accent)' }} />}
              {previewFile.file_type==='video' && <video controls autoPlay src={previewUrl} style={{ width:'100%', maxHeight:'60vh', background:'#000', borderRadius:8 }} />}
              {previewFile.file_type==='pdf' && <iframe src={previewUrl} title={previewFile.original_name} style={{ width:'100%', height:'60vh', border:'none', borderRadius:8 }} />}
            </div>
            <div style={{ padding:'12px 18px', background:'var(--bg2)', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              <a href={previewUrl} download={previewFile.original_name} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'var(--accent)', color:'var(--bg-sidebar)', textDecoration:'none', fontSize:13, fontWeight:700 }}>
                ⬇️ Download
              </a>
            </div>
          </div>
        </div>
      )}

      <PageHeader title="📁 Manage Files" subtitle={`${files.length} file${files.length!==1?'s':''} total`}
        action={
          <a href="/admin/upload" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, background:'var(--accent)', color:'var(--bg-sidebar)', textDecoration:'none', fontSize:13, fontWeight:700 }}>
            ⬆️ Upload New
          </a>
        }
      />

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
        <SortFilterBar
          onSearch={v => setSearch(v)}
          onSort={v => setSort(v)}
          onFilter={v => setCatFilter(v)}
          categories={categories}
        />
        <select
          className="input-base" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
          style={{ width:'auto', minWidth:120, background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'8px 11px', outline:'none' }}>
          <option value="all">All Types</option>
          <option value="audio">🎵 Audio</option>
          <option value="video">🎬 Video</option>
          <option value="pdf">📄 PDF</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spin" style={{ width:28, height:28, border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', margin:'0 auto' }} /></div>
      ) : files.length === 0 ? (
        <EmptyState icon="📂" message="No files found." />
      ) : (
        <div style={{ overflowX:'auto', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
            <thead>
              <tr>
                {['Cover','Type','Name / Title','Category','Size','Date','Flags','Actions'].map(h => (
                  <th key={h} style={thS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.map((file, i) => {
                const tc = TYPE_COLOR[file.file_type];
                return (
                  <tr key={file.id}
                    style={{ background: i%2===0 ? 'transparent' : 'var(--bg2)', transition:'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? 'transparent' : 'var(--bg2)'}>
                    {/* Cover */}
                    <td style={tdS}>
                      <div style={{ width:44, height:44, borderRadius:8, overflow:'hidden', background:`${tc}18`, border:`1px solid ${tc}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {file.cover_key
  ? <img src={file.cover_url || `/api/cover/file/${file.id}`} alt="cover" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <span style={{ fontSize:22 }}>{TYPE_ICON[file.file_type]}</span>}
                      </div>
                    </td>
                    {/* Type */}
                    <td style={tdS}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:99, background:`${tc}18`, color:tc, border:`1px solid ${tc}33` }}>
                        {file.file_type.toUpperCase()}
                      </span>
                    </td>
                    {/* Name */}
                    <td style={{ ...tdS, maxWidth:200, minWidth:120 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.title || file.original_name}</p>
                      {file.title && <p style={{ fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.original_name}</p>}
                    </td>
                    {/* Category */}
                    <td style={tdS}>
                      {file.category_name
                        ? <span style={{ fontSize:11, padding:'2px 7px', borderRadius:99, background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid var(--border2)' }}>{file.category_name}</span>
                        : <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>}
                    </td>
                    {/* Size */}
                    <td style={{ ...tdS, whiteSpace:'nowrap', color:'var(--text-muted)' }}>{(file.file_size/1024/1024).toFixed(1)} MB</td>
                    {/* Date */}
                    <td style={{ ...tdS, whiteSpace:'nowrap', color:'var(--text-muted)' }}>{new Date(file.upload_date).toLocaleDateString()}</td>
                    {/* Flags */}
                    <td style={tdS}>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {!!file.is_featured   && <span title="Important" style={{ fontSize:14 }}>⭐</span>}
                        {!!file.is_latest     && <span title="Latest"    style={{ fontSize:14 }}>🆕</span>}
                        {!!file.is_must_watch && <span title="Must Watch" style={{ fontSize:14 }}>🎬</span>}
                        {!file.is_featured && !file.is_latest && !file.is_must_watch && <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>}
                      </div>
                    </td>
                    {/* Actions */}
                    <td style={{ ...tdS, whiteSpace:'nowrap' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => handlePreview(file)} disabled={fetchingId===file.id}
                          style={{ padding:'5px 10px', borderRadius:7, background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid var(--border2)', cursor:'pointer', fontSize:12, fontWeight:700, opacity:fetchingId===file.id?0.6:1 }}>
                          {fetchingId===file.id ? '…' : '👁️'}
                        </button>
                        <button onClick={() => setEditFile(file)}
                          style={{ padding:'5px 10px', borderRadius:7, background:'rgba(255,176,32,0.12)', color:'var(--warning)', border:'1px solid rgba(255,176,32,0.3)', cursor:'pointer', fontSize:12, fontWeight:700 }}>
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(file)} disabled={deletingId===file.id}
                          style={{ padding:'5px 10px', borderRadius:7, background:'rgba(255,61,90,0.1)', color:'var(--danger)', border:'1px solid rgba(255,61,90,0.25)', cursor:'pointer', fontSize:12, fontWeight:700, opacity:deletingId===file.id?0.5:1 }}>
                          {deletingId===file.id ? '…' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}