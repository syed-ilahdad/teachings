'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';

/* ── View Modal ──────────────────────────────────────────────────── */
function ViewModal({ file, url, coverUrl, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              {file.original_name}
            </h3>
            <div className="chip-row">
              <span className={`tag tag-${file.file_type}`}>{file.file_type.toUpperCase()}</span>
              {file.category_name && <span className="tag tag-green">{file.category_name}</span>}
              {file.is_featured   && <span className="tag tag-warn">⭐ Important</span>}
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {(file.file_size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Cover art if available */}
        {coverUrl && (
          <img
            src={coverUrl} alt="cover"
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 14 }}
          />
        )}

        {file.file_type === 'audio' && (
          <audio controls src={url} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
        )}
        {file.file_type === 'video' && (
          <video controls src={url} style={{ width: '100%', maxHeight: 420, borderRadius: 8 }} />
        )}
        {file.file_type === 'pdf' && (
          <iframe src={url} title={file.original_name}
            style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }} />
        )}
      </div>
    </div>
  );
}

/* ── Edit Modal ──────────────────────────────────────────────────── */
function EditModal({ file, categories, onSave, onClose }) {
  const [name,   setName]   = useState(file.original_name);
  const [catId,  setCatId]  = useState(file.category_id || '');
  const [feat,   setFeat]   = useState(!!file.is_featured);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const save = async () => {
    if (!name.trim()) { setErr('Name is required.'); return; }
    setSaving(true); setErr('');
    try {
      const res  = await fetch('/api/files', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: file.id, original_name: name.trim(), category_id: catId || null, is_featured: feat }),
      });
      const data = await res.json();
      if (data.success) onSave({ ...file, original_name: name.trim(), category_id: catId || null, is_featured: feat });
      else setErr(data.error || 'Save failed.');
    } catch { setErr('Network error.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>✏️ Edit File</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">File Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="select" value={catId} onChange={e => setCatId(e.target.value)}>
              <option value="">— No Category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setFeat(f => !f)}>
            <div className={`toggle-track ${feat ? 'on' : ''}`}><div className="toggle-thumb" /></div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Mark as Important ⭐</span>
          </div>
        </div>

        {err && <p style={{ color: 'var(--danger)', marginTop: 12, fontSize: 13 }}>⚠️ {err}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : '💾 Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main File List ───────────────────────────────────────────────── */
export default function FileList() {
  const [files,      setFiles]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [urlCache,   setUrlCache]   = useState({});
  const [fetchingId, setFetchingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [fd, cd] = await Promise.all([
      fetch('/api/files?limit=1000&order=date').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]);
    setFiles(fd.files || []);
    setCategories(cd.categories || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const display = useMemo(() => files.filter(f => {
    const s = f.original_name.toLowerCase().includes(search.toLowerCase());
    const t = typeFilter === 'all' || f.file_type === typeFilter;
    return s && t;
  }), [files, search, typeFilter]);

  // Inside FileList component — replace getUrl and handleView with these:

const getUrl = async (file) => {
  // Return from cache if already fetched
  if (urlCache[file.id]) return urlCache[file.id];

  setFetchingId(file.id);
  try {
    const res  = await fetch(`/api/download/${file.id}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to get URL');

    const entry = { url: data.url, coverUrl: data.coverUrl || null };
    setUrlCache(prev => ({ ...prev, [file.id]: entry }));
    return entry;
  } catch (e) {
    alert('Could not fetch file URL: ' + e.message);
    return null;
  } finally {
    setFetchingId(null);
  }
};

const handleView = async (file) => {
  const entry = await getUrl(file);
  if (entry) setViewTarget({ file, url: entry.url, coverUrl: entry.coverUrl });
};

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this file?')) return;
    setDeletingId(id);
    const res  = await fetch(`/api/files?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) setFiles(p => p.filter(f => f.id !== id));
    else alert('Delete failed: ' + data.error);
    setDeletingId(null);
  };

  const handleEditSave = (updated) => {
    setFiles(p => p.map(f => f.id === updated.id ? updated : f));
    setEditTarget(null);
  };

  if (loading) return (
    <div className="empty-state">
      <div className="spinner" style={{ margin: '0 auto', width: 32, height: 32 }} />
      <p style={{ marginTop: 16 }}>Loading files…</p>
    </div>
  );

  const tdS = { padding: '11px 13px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 13 };
  const thS = { ...tdS, background: 'var(--bg2)', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div>
      {viewTarget && (
        <ViewModal
          file={viewTarget.file}
          url={viewTarget.url}
          coverUrl={viewTarget.coverUrl}
          onClose={() => setViewTarget(null)}
        />
      )}
      {editTarget && (
        <EditModal
          file={editTarget}
          categories={categories}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input
            className="input"
            placeholder="Search by file name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        <select
          className="select" value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 130 }}
        >
          <option value="all">All Types</option>
          <option value="audio">🎵 Audio</option>
          <option value="video">🎬 Video</option>
          <option value="pdf">📄 PDF</option>
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
          {display.length} / {files.length} files
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thS}>Cover</th>
              <th style={thS}>Type</th>
              <th style={{ ...thS, minWidth: 200 }}>Name</th>
              <th style={thS}>Category</th>
              <th style={thS}>Size</th>
              <th style={thS}>Date</th>
              <th style={thS}>⭐</th>
              <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {display.map((file, i) => (
              <tr
                key={file.id}
                style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg2)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg2)'}
              >
                <td style={tdS}>
                  {file.cover_key ? (
                    <div style={{
                      width: 40, height: 40, borderRadius: 6,
                      background: 'var(--bg2)',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>🖼️</div>
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: 6,
                      background: 'var(--accent-dim)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {file.file_type === 'audio' ? '🎵' : file.file_type === 'video' ? '🎬' : '📄'}
                    </div>
                  )}
                </td>
                <td style={tdS}>
                  <span className={`tag tag-${file.file_type}`}>{file.file_type.toUpperCase()}</span>
                </td>
                <td style={{ ...tdS, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text)' }}>
                  {file.original_name}
                </td>
                <td style={tdS}>
                  {file.category_name
                    ? <span className="tag tag-green">{file.category_name}</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ ...tdS, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {(file.file_size / 1024 / 1024).toFixed(1)} MB
                </td>
                <td style={{ ...tdS, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(file.upload_date).toLocaleDateString()}
                </td>
                <td style={{ ...tdS, textAlign: 'center' }}>
                  {file.is_featured ? '⭐' : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ ...tdS, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleView(file)}
                      disabled={fetchingId === file.id}
                    >
                      {fetchingId === file.id
                        ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        : '👁️'}
                    </button>
                    <button className="btn btn-warning btn-sm" onClick={() => setEditTarget(file)}>✏️</button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(file.id)}
                      disabled={deletingId === file.id}
                    >
                      {deletingId === file.id
                        ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {display.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>{search ? `No files matching "${search}"` : 'No files uploaded yet.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}