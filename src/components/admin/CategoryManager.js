'use client';
import { useState, useEffect } from 'react';

export default function CategoryManager() {
  const [cats,      setCats]      = useState([]);
  const [name,      setName]      = useState('');
  const [desc,      setDesc]      = useState('');
  const [parentId,  setParentId]  = useState('');
  const [cover,     setCover]     = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [msg,       setMsg]       = useState(null);

  const load = () =>
    fetch('/api/categories').then(r => r.json()).then(d => setCats(d.categories || []));

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setMsg({ ok: false, text: 'Name is required.' }); return; }
    setBusy(true); setMsg(null);

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('description', desc.trim());
    if (parentId) fd.append('parentId', parentId);
    if (cover)    fd.append('cover', cover);

    const res  = await fetch('/api/categories', { method: 'POST', body: fd });
    const data = await res.json();
    setBusy(false);

    if (data.success) {
      setMsg({ ok: true, text: `"${name}" created!` });
      setName(''); setDesc(''); setParentId(''); setCover(null);
      load();
    } else {
      setMsg({ ok: false, text: data.error || 'Failed.' });
    }
  };

  const remove = async (id, catName) => {
    if (!confirm(`Delete "${catName}"? Files will become uncategorized.`)) return;
    const res  = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) load();
    else alert('Delete failed.');
  };

  // Top-level categories only (for parent selector)
  const topLevel = cats.filter(c => !c.parent_id);

  const inputStyle = {
    width: '100%', minWidth: 0,
    background: 'var(--bg-input)', border: '1.5px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 14,
    padding: '9px 12px', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  };

  const labelStyle = {
    display: 'block', marginBottom: 5,
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Create form */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: 'clamp(16px,3vw,24px)', marginBottom: 28,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 18 }}>
          ➕ Create Category
        </h3>
        <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input
                style={inputStyle}
                className="input-base"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Lectures"
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input
                style={inputStyle}
                className="input-base"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Subcategory: parent selector */}
          <div>
            <label style={labelStyle}>Parent Category (optional — creates a subcategory)</label>
            <select
              className="input-base"
              style={inputStyle}
              value={parentId}
              onChange={e => setParentId(e.target.value)}
            >
              <option value="">— No parent (top-level category) —</option>
              {topLevel.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Cover image */}
          <div>
            <label style={labelStyle}>Cover Image (optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {cover ? (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={URL.createObjectURL(cover)} alt="preview"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                  <button type="button" onClick={() => setCover(null)} style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--danger)', border: 'none', borderRadius: '50%',
                    width: 16, height: 16, cursor: 'pointer', color: '#fff',
                    fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('cat-cover').click()}
                  style={{
                    width: 60, height: 60, border: '2px dashed var(--border2)',
                    borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'transparent'; }}
                >🖼️</div>
              )}
              <button type="button" onClick={() => document.getElementById('cat-cover').click()}
                style={{
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                  background: 'var(--accent-dim)', color: 'var(--accent)',
                  border: '1px solid var(--border2)', fontSize: 13, fontWeight: 600,
                }}>
                {cover ? 'Change' : 'Upload Cover'}
              </button>
              <input id="cat-cover" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => setCover(e.target.files[0])} />
            </div>
          </div>

          <button type="submit" disabled={busy} style={{
            alignSelf: 'flex-start', padding: '9px 20px',
            background: busy ? 'var(--border2)' : 'var(--accent)',
            color: 'var(--bg-sidebar)', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {busy ? (
              <><span className="spin" style={{ width: 14, height: 14, border: '2px solid var(--bg-sidebar)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Creating…</>
            ) : '➕ Create'}
          </button>
        </form>

        {msg && (
          <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: msg.ok ? 'var(--success)' : 'var(--danger)' }}>
            {msg.text}
          </p>
        )}
      </div>

      {/* Categories list — grouped with subcategories */}
      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>
        All Categories ({cats.length})
      </h3>

      {cats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 36, opacity: 0.4, marginBottom: 8 }}>🏷️</p>
          <p>No categories yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topLevel.map(cat => {
            const subs = cats.filter(c => c.parent_id === cat.id);
            return (
              <div key={cat.id}>
                {/* Top-level category row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '11px 14px',
                  transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                    background: 'var(--accent-dim)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {cat.cover_key ? '🖼️' : '🏷️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{cat.name}</div>
                    {cat.description && (
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.description}
                      </div>
                    )}
                    {subs.length > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>
                        {subs.length} subcategor{subs.length === 1 ? 'y' : 'ies'}
                      </div>
                    )}
                  </div>
                  <button onClick={() => remove(cat.id, cat.name)} style={{
                    padding: '5px 10px', background: 'rgba(255,61,90,0.1)',
                    color: 'var(--danger)', border: '1px solid rgba(255,61,90,0.25)',
                    borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    🗑️
                  </button>
                </div>

                {/* Subcategories — indented */}
                {subs.map(sub => (
                  <div key={sub.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '9px 14px 9px 42px',
                    marginTop: 3,
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: -4 }}>↳</span>
                    <div style={{
                      width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                      background: 'var(--accent-dim)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {sub.cover_key ? '🖼️' : '📂'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{sub.name}</div>
                      {sub.description && (
                        <div style={{ color: 'var(--text-muted)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.description}
                        </div>
                      )}
                    </div>
                    <button onClick={() => remove(sub.id, sub.name)} style={{
                      padding: '4px 8px', background: 'rgba(255,61,90,0.08)',
                      color: 'var(--danger)', border: '1px solid rgba(255,61,90,0.2)',
                      borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}