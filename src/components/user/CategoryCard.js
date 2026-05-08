'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CategoryCard({ cat, index = 0 }) {
  const router  = useRouter();
  const [hov, setHov] = useState(false);

  const handleClick = () => {
    const slug = cat.slug || String(cat.id);
    router.push(`/user/categories/${slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.24 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:    'var(--bg-card)',
        border:        `2px solid ${hov ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius:  20,
        overflow:      'hidden',
        cursor:        'pointer',
        boxShadow:     hov ? '0 12px 32px var(--shadow), 0 0 0 1px var(--accent)' : 'none',
        transition:    'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Cover — loads immediately via /api/cover/category/[id] */}
      <div style={{
        width: '100%', aspectRatio: '4/3', position: 'relative',
        background: 'linear-gradient(135deg, var(--bg2) 0%, var(--accent-dim) 100%)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 52,
      }}>
        {cat.cover_key ? (
          <img
  src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${cat.cover_key}`}
  alt={cat.name}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transform: hov ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform 0.35s ease',
            }}
          />
        ) : (
          <span>🏷️</span>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)',
          opacity: hov ? 1 : 0, transition: 'opacity 0.22s',
          display: 'flex', alignItems: 'flex-end', padding: 14,
        }}>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>Browse →</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px' }}>
        <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>
          {cat.name}
        </p>
        {cat.description && (
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
            {cat.description}
          </p>
        )}
        {cat.author && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>by {cat.author}</p>
        )}
      </div>
    </motion.div>
  );
}