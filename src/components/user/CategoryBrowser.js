'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileCard from '../shared/FileCard';

export default function CategoryBrowser({ categories, allFiles }) {
  const [openCat, setOpenCat] = useState(null);

  if (!categories.length) return (
    <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
      <p className="text-4xl mb-3 float opacity-40">🏷️</p><p>No categories yet.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Category grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,160px),1fr))' }}>
        {categories.map((cat, i) => {
          const filesInCat = allFiles.filter(f => f.category_id === cat.id);
          const isOpen     = openCat === cat.id;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.24 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setOpenCat(isOpen ? null : cat.id)}
              className="overflow-hidden cursor-pointer"
              style={{
                background:   'var(--bg-card)',
                border:       `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 16,
                boxShadow:    isOpen ? '0 0 0 1px var(--accent), 0 0 20px var(--accent-glow)' : undefined,
                transition:   'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Cover */}
              <div className="relative overflow-hidden flex items-center justify-center text-4xl"
                style={{
                  aspectRatio: '4/3',
                  background: 'linear-gradient(135deg, var(--bg2) 0%, var(--accent-dim) 100%)',
                }}>
                {cat.cover_key
                  ? <img src={`/api/cover/${cat.id}`} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                  : '🏷️'}
                {/* File count overlay */}
                <div className="absolute inset-0 flex items-end p-2 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }}>
                  <span className="text-white text-xs font-bold">{filesInCat.length} files</span>
                </div>
              </div>
              <div className="p-3">
                <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{cat.name}</div>
                {cat.description && (
                  <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{cat.description}</div>
                )}
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{filesInCat.length} items</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm"
                    style={{ color: 'var(--accent)' }}
                  >▶</motion.span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded files — AnimatePresence for mount/unmount */}
      <AnimatePresence>
        {openCat && (() => {
          const cat   = categories.find(c => c.id === openCat);
          const files = allFiles
            .filter(f => f.category_id === openCat)
            .sort((a, b) => a.original_name.localeCompare(b.original_name));
          return (
            <motion.div
              key={`cat-${openCat}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border p-4 mt-1"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border2)' }}>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <h3 className="font-black text-lg" style={{ color: 'var(--text)' }}>
                    🏷️ {cat?.name}
                    <span className="ml-2 text-sm font-normal neon">({files.length})</span>
                  </h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpenCat(null)}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    ✕ Close
                  </motion.button>
                </div>
                {files.length === 0 ? (
                  <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No files in this category.</p>
                ) : (
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))' }}>
                    {files.map((f, i) => <FileCard key={f.id} file={f} index={i} />)}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}