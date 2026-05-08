'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DarkToggle from '../DarkToggle';

const NAV_ITEMS = [
  { id: 'home',       icon: '🏠', label: 'Home'       },
  { id: 'important',  icon: '⭐', label: 'Important'  },
  { id: 'latest',     icon: '🆕', label: 'Latest'     },
  { id: 'mustwatch',  icon: '🎬', label: 'Must Watch' },
  { id: 'categories', icon: '🏷️', label: 'Categories' },
  { id: 'audio',      icon: '🎵', label: 'Audio'      },
  { id: 'video',      icon: '📹', label: 'Video'      },
  { id: 'pdf',        icon: '📄', label: 'PDF'        },
  { id: 'search',     icon: '🔍', label: 'Search'     },
];

export default function Navbar({ active, onSelect, counts = {} }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(() => {
    // Passive scroll listener — no layout thrash
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (!e.target.closest('[data-navbar]')) setMenuOpen(false); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [menuOpen]);

  const handleSelect = (id) => { onSelect(id); setMenuOpen(false); };

  return (
    <motion.header
      data-navbar
      className="fixed top-0 left-0 right-0 z-[100]"
      animate={{
        backgroundColor: scrolled ? 'var(--bg-sidebar)' : 'transparent',
        borderBottomColor: scrolled ? 'var(--border)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ borderBottom: '1px solid transparent' }}
    >
      {/* ── Desktop nav ──────────────────────────────────────────── */}
      <div className="hidden md:flex items-center px-4 h-[58px] max-w-[1600px] mx-auto gap-1">
        {/* Logo */}
        <button
          onClick={() => handleSelect('home')}
          className="flex items-center gap-2 mr-5 flex-shrink-0 hover:opacity-80 transition-opacity active:scale-95"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="text-xl float">📚</span>
          <span className="neon font-black text-sm">Library</span>
        </button>

        {/* Nav items with CSS icon animation */}
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto navbar-nav-group"
          style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id;
            const count    = counts[item.id];
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSelect(item.id)}
                className={[
                  'nav-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium',
                  'border-none cursor-pointer whitespace-nowrap flex-shrink-0 relative',
                  'transition-colors duration-150',
                ].join(' ')}
                style={{
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  color:      isActive ? 'var(--accent)' : 'var(--text-sidebar)',
                  fontWeight: isActive ? 700 : 500,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,255,163,0.07)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="nav-icon" style={{ fontSize: isActive ? 16 : 14 }}>{item.icon}</span>
                <span>{item.label}</span>
                {count > 0 && (
                  <span className="bg-[var(--accent)] text-[var(--bg-sidebar)] rounded-full text-[9px] font-black px-1.5 min-w-[18px] text-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
                {/* Active underline — Motion layout animation */}
                {isActive && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: 'var(--accent)', boxShadow: '0 0 5px var(--accent)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="ml-3 flex-shrink-0"><DarkToggle compact /></div>
      </div>

      {/* ── Mobile nav ───────────────────────────────────────────── */}
      <div className="md:hidden flex items-center gap-3 px-4 h-[52px]">
        <span className="neon font-black text-sm flex-1 truncate">📚 Library</span>
        <DarkToggle compact />
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setMenuOpen(o => !o)}
          className="text-[var(--accent)] text-2xl"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Menu"
        >
          <motion.span animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {menuOpen ? '✕' : '☰'}
          </motion.span>
        </motion.button>
      </div>

      {/* ── Mobile dropdown ─────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-[var(--border)]"
            style={{ background: 'var(--bg-sidebar)' }}
          >
            {NAV_ITEMS.map((item, i) => {
              const isActive = active === item.id;
              const count    = counts[item.id];
              return (
                <motion.button
                  key={item.id}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.18 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(item.id)}
                  className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-left border-none cursor-pointer border-l-4"
                  style={{
                    background:   isActive ? 'var(--accent-dim)' : 'transparent',
                    borderLeftColor: isActive ? 'var(--accent)' : 'transparent',
                    color:        isActive ? 'var(--accent)' : 'var(--text-sidebar)',
                    fontWeight:   isActive ? 700 : 500,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,255,163,0.06)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {count > 0 && (
                    <span className="bg-[var(--accent)] text-[var(--bg-sidebar)] rounded-full text-[10px] font-black px-2">
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}