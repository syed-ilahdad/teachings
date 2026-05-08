'use client';
import { useState, useEffect, useCallback } from 'react';

const SECTION_TYPES = [
  { type: 'important',  icon: '⭐', label: 'Important',  desc: 'Admin-featured files' },
  { type: 'latest',     icon: '🆕', label: 'Latest',     desc: 'Recently uploaded' },
  { type: 'must_watch', icon: '🎬', label: 'Must Watch', desc: 'Featured videos' },
  { type: 'categories', icon: '🏷️', label: 'Categories', desc: 'Category cards' },
  { type: 'audio',      icon: '🎵', label: 'Audio',      desc: 'All audio' },
  { type: 'video',      icon: '📹', label: 'Video',      desc: 'All video' },
  { type: 'pdf',        icon: '📄', label: 'PDF',        desc: 'All PDFs' },
  { type: 'custom',     icon: '✨', label: 'Custom',     desc: 'Handpick files' },
];

const TYPE_COLOR = {
  important: '#7c3aed', latest: '#0284c7', must_watch: '#0369a1',
  categories: '#059669', audio: '#7c3aed', video: '#2563eb',
  pdf: '#dc2626', custom: '#d97706',
};

/* ── Edit Section Modal ────────────────────────────────────── */
function EditSectionModal({ section, onSave, onClose }) {
  const [title,        setTitle]        = useState(section.title);
  const [limit,        setLimit]        = useState(section.config?.limit || 12);
  const [description,  setDescription]  = useState(section.config?.description || '');
  const [searchQ,      setSearchQ]      = useState('');
  const [allFiles,     setAllFiles]     = useState([]);
  const [pickedIds,    setPickedIds]    = useState(new Set(section.config?.fileIds || []));
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (section.section_type === 'custom') {
      setLoadingFiles(true);
      fetch('/api/files?limit=2000').then(r => r.json()).then(d => {
        setAllFiles(d.files || []);
        setLoadingFiles(false);
      });
    }
  }, [section.section_type]);

  const filteredFiles = allFiles.filter(f =>
    f.original_name.toLowerCase().includes(searchQ.toLowerCase())
  );

  const toggleFile = (id) => {
    setPickedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    onSave({
      ...section,
      title,
      config: {
        ...section.config,
        limit,
        description,
        ...(section.section_type === 'custom' ? { fileIds: [...pickedIds] } : {}),
      },
    });
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg-input)', border: '1.5px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 11px',
    outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, maxHeight: '90vh',
          background: 'var(--bg-modal)', border: '1px solid var(--border2)',
          borderRadius: 'var(--r-xl)', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg2)', flexShrink: 0,
        }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>
            ✏️ Edit Section — {SECTION_TYPES.find(t => t.type === section.section_type)?.label}
          </h3>
          <button onClick={onClose} style={{
            background: 'var(--accent-dim)', border: '1px solid var(--border)', color: 'var(--accent)',
            width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Section Title
              </label>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Section heading shown to users" />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Description (optional)
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Short description shown below the section title"
              />
            </div>

            {/* Limit */}
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Max Items to Show
              </label>
              <input
                type="number" min={1} max={200} style={{ ...inputStyle, maxWidth: 100 }}
                value={limit} onChange={e => setLimit(parseInt(e.target.value) || 12)}
              />
            </div>

            {/* Custom section: file picker with search */}
            {section.section_type === 'custom' && (
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pick Files ({pickedIds.size} selected)
                </label>

                {/* Search bar */}
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 14 }}>🔍</span>
                  <input
                    style={{ ...inputStyle, paddingLeft: 32 }}
                    placeholder="Search files by name…"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                  />
                </div>

                {/* File list */}
                {loadingFiles ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    <span className="spin" style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
                  </div>
                ) : (
                  <div style={{
                    maxHeight: 260, overflowY: 'auto',
                    border: '1px solid var(--border)', borderRadius: 8,
                  }}>
                    {filteredFiles.length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        {searchQ ? `No files match "${searchQ}"` : 'No files found.'}
                      </div>
                    )}
                    {filteredFiles.map(f => {
                      const picked = pickedIds.has(f.id);
                      return (
                        <div
                          key={f.id}
                          onClick={() => toggleFile(f.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px', cursor: 'pointer',
                            background: picked ? 'var(--accent-dim)' : 'transparent',
                            borderBottom: '1px solid var(--border)',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => { if (!picked) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                          onMouseLeave={e => { if (!picked) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                            background: picked ? 'var(--accent)' : 'var(--bg-input)',
                            border: `2px solid ${picked ? 'var(--accent)' : 'var(--border2)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, color: 'var(--bg-sidebar)', fontWeight: 900,
                            transition: 'background 0.15s, border-color 0.15s',
                          }}>
                            {picked && '✓'}
                          </div>

                          {/* Type icon */}
                          <span style={{ fontSize: 16, flexShrink: 0 }}>
                            {{ audio: '🎵', video: '🎬', pdf: '📄' }[f.file_type]}
                          </span>

                          {/* Name */}
                          <span style={{
                            flex: 1, fontSize: 13, color: picked ? 'var(--accent)' : 'var(--text)',
                            fontWeight: picked ? 700 : 400,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {f.original_name}
                          </span>

                          {/* Size */}
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                            {(f.file_size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {pickedIds.size > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>
                    ✅ {pickedIds.size} file{pickedIds.size !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 20px', borderTop: '1px solid var(--border)',
          background: 'var(--bg2)', flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
            border: '1px solid var(--border)', color: 'var(--text-muted)',
            background: 'transparent', fontSize: 13, fontWeight: 600,
          }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{
            padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--accent)', color: 'var(--bg-sidebar)',
            border: 'none', fontSize: 13, fontWeight: 700,
            boxShadow: '0 0 10px var(--accent-glow)',
          }}>
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page Builder ────────────────────────────────────── */
let dragSrc = null;

export default function PageBuilder() {
  const [sections,   setSections]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [editTarget, setEditTarget] = useState(null); // index
  const [dragOver,   setDragOver]   = useState(null);

  useEffect(() => {
    fetch('/api/sections').then(r => r.json()).then(d => {
      setSections((d.sections || []).map(s => ({
        ...s,
        id:     s.id ?? `s${Date.now()}${Math.random()}`,
        config: typeof s.config === 'string' ? JSON.parse(s.config) : (s.config || {}),
      })));
      setLoading(false);
    });
  }, []);

  const addSection = (type) => {
    const tmpl = SECTION_TYPES.find(t => t.type === type);
    setSections(p => [...p, {
      id:           `new-${Date.now()}`,
      title:        tmpl.label,
      section_type: type,
      order_index:  p.length,
      config:       { limit: 12 },
      is_active:    true,
    }]);
  };

  const remove    = (i) => { setSections(p => p.filter((_, j) => j !== i)); };
  const toggle    = (i) => setSections(p => p.map((s, j) => j === i ? { ...s, is_active: !s.is_active } : s));
  const saveEdit  = (updated) => { setSections(p => p.map((s, i) => i === editTarget ? updated : s)); setEditTarget(null); };

  const handleDragStart = (i) => { dragSrc = i; };
  const handleDragOver  = (e, i) => { e.preventDefault(); setDragOver(i); };
  const handleDrop      = (e, i) => {
    e.preventDefault();
    if (dragSrc === null || dragSrc === i) { setDragOver(null); return; }
    const next = [...sections];
    const [moved] = next.splice(dragSrc, 1);
    next.splice(i, 0, moved);
    setSections(next);
    dragSrc = null; setDragOver(null);
  };
  const handleDragEnd = () => { dragSrc = null; setDragOver(null); };

  const move = (i, dir) => {
    const t = i + dir;
    if (t < 0 || t >= sections.length) return;
    const next = [...sections];
    [next[i], next[t]] = [next[t], next[i]];
    setSections(next);
  };

  const publish = async () => {
    setSaving(true); setSaved(false);
    try {
      const res  = await fetch('/api/sections', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else alert('Failed: ' + data.error);
    } catch (e) { alert('Network error: ' + e.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 }}>
      <div className="spin" style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading layout…</span>
    </div>
  );

  const rowStyle = (i) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    background: dragOver === i ? 'var(--accent-dim)' : 'var(--bg-card)',
    border: `1px solid ${dragOver === i ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 10, padding: '11px 14px',
    cursor: 'grab', transition: 'background 0.12s, border-color 0.12s',
    userSelect: 'none', flexWrap: 'wrap', gap: 8,
  });

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Edit modal */}
      {editTarget !== null && sections[editTarget] && (
        <EditSectionModal
          section={sections[editTarget]}
          onSave={saveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>🧱 Page Builder</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>
            Drag rows to reorder · Edit to add files · Publish to go live
          </p>
        </div>
        <button onClick={publish} disabled={saving} style={{
          padding: '9px 22px', background: saved ? '#166534' : 'var(--accent)',
          color: 'var(--bg-sidebar)', border: 'none', borderRadius: 10,
          fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          boxShadow: '0 0 12px var(--accent-glow)',
        }}>
          {saving ? (
            <><span className="spin" style={{ width: 16, height: 16, border: '2px solid var(--bg-sidebar)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Saving…</>
          ) : saved ? '✅ Published!' : '🚀 Publish Layout'}
        </button>
      </div>

      {/* Add section palette */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 22,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Add Section
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 8 }}>
          {SECTION_TYPES.map(st => (
            <button
              key={st.type}
              onClick={() => addSection(st.type)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                transition: 'border-color 0.14s, background 0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = TYPE_COLOR[st.type] || 'var(--border2)'; e.currentTarget.style.background = `${TYPE_COLOR[st.type] || '#6b7280'}12`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
            >
              <span style={{ fontSize: 20 }}>{st.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{st.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{st.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 36, opacity: 0.4, marginBottom: 8 }}>🧱</p>
            <p>Add sections from the palette above.</p>
          </div>
        )}

        {sections.map((sec, i) => {
          const tmpl  = SECTION_TYPES.find(t => t.type === sec.section_type);
          const color = TYPE_COLOR[sec.section_type] || '#6b7280';
          return (
            <div
              key={sec.id ?? i}
              style={{ ...rowStyle(i), opacity: sec.is_active ? 1 : 0.48 }}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag handle */}
              <span style={{ fontSize: 18, color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }}>⠿</span>

              {/* Icon */}
              <span style={{ fontSize: 20, flexShrink: 0 }}>{tmpl?.icon}</span>

              {/* Title + description */}
              <div style={{ flex: 1, minWidth: 80 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{sec.title}</div>
                {sec.config?.description && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sec.config.description}
                  </div>
                )}
                {sec.section_type === 'custom' && sec.config?.fileIds?.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 1 }}>
                    {sec.config.fileIds.length} files pinned
                  </div>
                )}
              </div>

              {/* Move arrows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  style={{ padding: '2px 6px', fontSize: 11, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, cursor: i === 0 ? 'not-allowed' : 'pointer', color: 'var(--text-muted)' }}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === sections.length - 1}
                  style={{ padding: '2px 6px', fontSize: 11, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 4, cursor: i === sections.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--text-muted)' }}>▼</button>
              </div>

              {/* Limit badge */}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                max {sec.config?.limit || 12}
              </span>

              {/* Active toggle */}
              <div
                onClick={() => toggle(i)}
                style={{
                  width: 34, height: 19, borderRadius: 99, flexShrink: 0, cursor: 'pointer',
                  background: sec.is_active ? 'var(--accent)' : 'var(--border2)',
                  border: `1.5px solid ${sec.is_active ? 'var(--accent)' : 'var(--border)'}`,
                  position: 'relative', transition: 'background 0.2s',
                }}
                title={sec.is_active ? 'Active — click to hide' : 'Hidden — click to show'}
              >
                <div style={{
                  position: 'absolute', top: 2,
                  left: sec.is_active ? 16 : 2,
                  width: 13, height: 13, borderRadius: '50%',
                  background: sec.is_active ? 'var(--bg-sidebar)' : 'var(--bg)',
                  transition: 'left 0.2s',
                }} />
              </div>

              {/* Edit */}
              <button onClick={() => setEditTarget(i)} style={{
                padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
                background: `${color}15`, color, border: `1px solid ${color}44`,
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>
                ✏️ Edit
              </button>

              {/* Remove */}
              <button onClick={() => remove(i)} style={{
                padding: '5px 8px', borderRadius: 7, cursor: 'pointer',
                background: 'rgba(255,61,90,0.1)', color: 'var(--danger)',
                border: '1px solid rgba(255,61,90,0.25)', fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>✕</button>
            </div>
          );
        })}
      </div>

      {sections.length > 0 && (
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          💡 Click <strong>✏️ Edit</strong> on any section to set its title, description, and pick specific files · Then click <strong>🚀 Publish</strong>
        </p>
      )}
    </div>
  );
}