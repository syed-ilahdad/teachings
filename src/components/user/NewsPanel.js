'use client';
import { useState, useEffect } from 'react';

function NewsCard({ item, files }) {
  const [expanded, setExpanded] = useState(false);
  const [fileUrl,  setFileUrl]  = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleReadMore = async () => {
    setExpanded(true);
    if (item.file_id && !fileUrl) {
      setLoading(true);
      try {
        const res  = await fetch(`/api/download/${item.file_id}`);
        const data = await res.json();
        if (data.success) setFileUrl(data.url);
      } catch (_) {}
      finally { setLoading(false); }
    }
  };

  const shortDesc =
  (item.description || '').length > 120
    ? (item.description || '').slice(0, 120)
    : item.description || '';
  const hasMore   = (item.description || '').length > 100;

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '14px 16px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = '0 4px 16px var(--shadow)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.boxShadow = 'none'; }}
    >
     <h3
  style={{
    fontWeight: 800,
    fontSize: 30,
    color: 'var(--text)',
    lineHeight: 1.4,
    marginBottom: 6,

    // FIX overflow
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  }}
>
  {item.title}
</h3>
      {item.description && (
        <p
  style={{
    fontSize: 16,
    color: 'var(--text-2)',
    lineHeight: 1.6,
    marginBottom: 8,

    // FIX overflow safety
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  }}
>
  {expanded ? item.description : shortDesc}
  {!expanded && hasMore && '…'}
</p>
      )}

      {/* Expanded: show attached file */}
      {expanded && item.file_id && (
        <div style={{ marginBottom: 10 }}>
          {loading && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading file…</p>}
          {fileUrl && (() => {
            const ft = item.file_type;
            return ft === 'audio' ? <audio controls src={fileUrl} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                 : ft === 'video' ? <video controls src={fileUrl} style={{ width: '100%', maxHeight: 200, borderRadius: 8 }} />
                 : ft === 'pdf'   ? <iframe src={fileUrl} title={item.title} style={{ width: '100%', height: 200, border: 'none', borderRadius: 8 }} />
                 : null;
          })()}
          {fileUrl && (
            <a href={fileUrl} download={item.file_name} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12, color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              ⬇️ Download {item.file_name}
            </a>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {item.author && <span>{item.author} · </span>}
          {new Date(item.created_at).toLocaleDateString()}
          {item.file_name && !expanded && <span> · 📎</span>}
        </div>
        {(hasMore || item.file_id) && !expanded && (
          <button onClick={handleReadMore}
            style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
            Read More ▼
          </button>
        )}
        {expanded && (
          <button onClick={() => setExpanded(false)}
            style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
            Show Less ▲
          </button>
        )}
      </div>
    </div>
  );
}

export default function NewsPanel() {
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(d => {
      setNews(d.news || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div className="spin" style={{ width: 22, height: 22, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
    </div>
  );

  if (!news.length) return (
    <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)', fontSize: 13 }}>
      <p style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>📰</p>
      <p>No news yet.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {news.map(item => <NewsCard key={item.id} item={item} />)}
    </div>
  );
}