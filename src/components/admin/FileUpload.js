'use client';
import { useState, useEffect, useRef } from 'react';

export default function FileUpload({ onUploadSuccess }) {
  const [file,       setFile]       = useState(null);
  const [cover,      setCover]      = useState(null);  // optional cover image
  const [catId,      setCatId]      = useState('');
  const [categories, setCategories] = useState([]);
  const [featured,   setFeatured]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [status,     setStatus]     = useState(null);
  const xhrRef = useRef(null);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  // Drag-over state
  const [dragOver, setDragOver] = useState(false);

  const typeIcon = (f) => {
    if (!f) return '📂';
    if (f.type.startsWith('audio/')) return '🎵';
    if (f.type.startsWith('video/')) return '🎬';
    return '📄';
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) { setStatus({ ok: false, msg: 'Please select a file.' }); return; }
    setUploading(true); setProgress(0); setStatus(null);

    const fd = new FormData();
    fd.append('file',        file);
    fd.append('categoryId',  catId);
    fd.append('isFeatured',  featured);
    if (cover) fd.append('cover', cover);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100));
    });

    xhr.addEventListener('load', () => {
      setUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setStatus({ ok: true, msg: '✅ Uploaded successfully!' });
          setFile(null); setCover(null); setCatId(''); setFeatured(false); setProgress(0);
          onUploadSuccess?.();
        } else {
          setStatus({ ok: false, msg: '❌ ' + (data.error || 'Upload failed.') });
        }
      } catch { setStatus({ ok: false, msg: '❌ Unexpected server response.' }); }
    });
    xhr.addEventListener('error', () => { setUploading(false); setStatus({ ok: false, msg: '❌ Network error.' }); });
    xhr.addEventListener('abort', () => { setUploading(false); setStatus({ ok: false, msg: '⚠️ Cancelled.' }); });

    xhr.open('POST', '/api/files/upload');
    xhr.send(fd);
  };

  return (
    <div style={{ maxWidth: 660 }}>
      {/* Format chips */}
      <div className="chip-row" style={{ marginBottom: 20 }}>
        {[['🎵','Audio','MP3 WAV AAC OGG FLAC'],['🎬','Video','MP4 WebM MOV AVI'],['📄','PDF','PDF']].map(([icon,label,ext]) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px', textAlign: 'center', minWidth: 100,
          }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)', marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ext}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Main file drop zone */}
        <div
          className={`drop-zone ${dragOver ? 'drag-active' : ''}`}
          onClick={() => !uploading && document.getElementById('fi-main').click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 38 }}>{typeIcon(file)}</span>
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{file.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={e => { e.stopPropagation(); setFile(null); }}
              >Remove</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 44, animation: 'float 3s ease infinite' }}>📂</span>
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>
                Click or drag & drop your file
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Audio · Video · PDF — up to 2 GB
              </span>
            </div>
          )}
          <input
            id="fi-main" type="file"
            accept="audio/*,video/*,application/pdf"
            style={{ display: 'none' }}
            onChange={e => setFile(e.target.files[0])}
            disabled={uploading}
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="label">Cover Image (optional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {cover ? (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={URL.createObjectURL(cover)}
                  alt="cover preview"
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
                <button
                  type="button"
                  onClick={() => setCover(null)}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--danger)', border: 'none', borderRadius: '50%',
                    width: 18, height: 18, cursor: 'pointer', color: '#fff', fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById('fi-cover').click()}
                style={{
                  width: 72, height: 72, border: '2px dashed var(--border2)', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 24, color: 'var(--text-muted)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                🖼️
              </div>
            )}
            <div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => document.getElementById('fi-cover').click()}
              >
                {cover ? 'Change Cover' : 'Upload Cover'}
              </button>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
                JPG, PNG, WebP. Shown as card thumbnail.
              </p>
            </div>
          </div>
          <input
            id="fi-cover" type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => setCover(e.target.files[0])}
          />
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <select className="select" value={catId} onChange={e => setCatId(e.target.value)} disabled={uploading}>
            <option value="">— No Category —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Important toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className={`toggle-track ${featured ? 'on' : ''}`}
            onClick={() => !uploading && setFeatured(f => !f)}
            style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
          >
            <div className="toggle-thumb" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Mark as Important ⭐</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Appears in the user's "Important" section</div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            disabled={uploading || !file}
            className="btn btn-primary btn-lg"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {uploading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Uploading {progress}%…</>
              : '⬆️ Upload File'}
          </button>
          {uploading && (
            <button type="button" className="btn btn-danger" onClick={() => xhrRef.current?.abort()}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Progress bar */}
      {uploading && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Uploading to Cloudflare R2…</span>
            <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Status */}
      {status && (
        <div style={{
          marginTop: 14, padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: status.ok ? 'rgba(0,255,163,0.08)' : 'rgba(255,68,102,0.08)',
          border: `1px solid ${status.ok ? 'var(--accent)' : 'var(--danger)'}`,
          color: status.ok ? 'var(--accent)' : 'var(--danger)',
          fontWeight: 500, fontSize: 14,
        }}>
          {status.msg}
        </div>
      )}
    </div>
  );
}