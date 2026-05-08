'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PreviewModal({ file, url, coverUrl, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const typeColor = { audio: '#7c3aed', video: '#2563eb', pdf: '#dc2626' }[file.file_type];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860, maxHeight: '92vh',
          background: 'var(--bg-modal)', border: '1px solid var(--border2)',
          borderRadius: 'var(--r-xl)',
          boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: 'clamp(14px,3vw,20px)',
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          {coverUrl ? (
            <img src={coverUrl} alt="cover"
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 60, height: 60, borderRadius: 10, flexShrink: 0,
              background: 'var(--accent-dim)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>
              {{ audio: '🎵', video: '🎬', pdf: '📄' }[file.file_type]}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99, border: '1px solid',
                background: `${typeColor}18`, color: typeColor, borderColor: `${typeColor}44`,
              }}>
                {file.file_type.toUpperCase()}
              </span>
              {file.category_name && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                  background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border2)',
                }}>
                  {file.category_name}
                </span>
              )}
            </div>
            <h2 style={{
              fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, wordBreak: 'break-word',
              fontSize: 'clamp(14px,3vw,18px)',
            }}>
              {file.original_name}
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
              {(file.file_size / 1024 / 1024).toFixed(2)} MB · {new Date(file.upload_date).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 8,
              background: 'var(--accent-dim)', border: '1px solid var(--border)',
              color: 'var(--accent)', cursor: 'pointer', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,135,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
          >✕</button>
        </div>

        {/* Player */}
        <div style={{ flex: 1, overflow: 'auto', padding: 'clamp(12px,3vw,20px)' }}>
          {file.file_type === 'audio' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 20, paddingBottom: 20 }}>
              {coverUrl ? (
                <img src={coverUrl} alt="cover"
                  style={{
                    width: 'min(180px,50vw)', height: 'min(180px,50vw)',
                    objectFit: 'cover', borderRadius: 16,
                    boxShadow: '0 0 30px var(--accent-glow)', border: '1px solid var(--border)',
                  }} />
              ) : (
                <div className="float-anim" style={{
                  width: 'min(160px,50vw)', height: 'min(160px,50vw)',
                  borderRadius: 16, background: 'var(--accent-dim)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64,
                }}>🎵</div>
              )}
              <audio controls autoPlay src={url} style={{ width: '100%', maxWidth: 520, accentColor: 'var(--accent)' }} />
            </div>
          )}
          {file.file_type === 'video' && (
            <video controls autoPlay src={url} style={{
              width: '100%', maxHeight: 'min(480px,58vh)',
              background: '#000', borderRadius: 12,
            }} />
          )}
          {file.file_type === 'pdf' && (
            <iframe src={url} title={file.original_name} style={{
              width: '100%', height: 'max(380px,58vh)',
              border: 'none', borderRadius: 12,
            }} />
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, padding: '12px 20px',
          background: 'var(--bg2)', borderTop: '1px solid var(--border)',
          flexWrap: 'wrap', flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Press <kbd style={{
              padding: '1px 5px', borderRadius: 4, fontSize: 11,
              border: '1px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'monospace',
            }}>Esc</kbd> to close
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href={url} download={file.original_name} target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                background: 'var(--accent)', color: 'var(--bg-sidebar)',
                textDecoration: 'none', fontSize: 13, fontWeight: 700,
              }}
            >
              ⬇️ Download
            </a>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                border: '1px solid var(--border)', color: 'var(--text-muted)',
                background: 'transparent', fontSize: 13, fontWeight: 600,
                transition: 'background 0.14s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}