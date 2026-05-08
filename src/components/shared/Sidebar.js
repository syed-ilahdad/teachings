'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DarkToggle from './DarkToggle';

export default function Sidebar({ items = [], active, onNavigate, title = 'Library', footer }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  return (
    <>
      {/* Hamburger */}
      <button onClick={() => setOpen(o => !o)} aria-label="Open menu"
        style={{ position:'fixed', top:12, left:12, zIndex:300, width:42, height:42,
          background:'var(--bg-sidebar)', border:'1.5px solid var(--border2)', borderRadius:10,
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          color:'var(--accent)', fontSize:20, boxShadow:'0 2px 12px var(--shadow)', transition:'transform 0.15s' }}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        {open ? '✕' : '☰'}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div key="sb-bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            transition={{duration:0.18}} onClick={() => setOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:198, backdropFilter:'blur(2px)' }} />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside key="sb-drawer" initial={{x:-260}} animate={{x:0}} exit={{x:-260}}
            transition={{type:'spring', stiffness:340, damping:34}}
            style={{ position:'fixed', top:0, left:0, width:248, height:'100vh',
              background:'var(--bg-sidebar)', backgroundImage:'linear-gradient(180deg,rgba(0,255,135,0.04) 0%,transparent 55%)',
              borderRight:'1.5px solid var(--border2)', zIndex:299,
              display:'flex', flexDirection:'column',
              boxShadow:'4px 0 32px rgba(0,0,0,0.4)', overflowY:'auto', overflowX:'hidden' }}>

            {/* Header */}
            <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--border)',
              display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{fontSize:26,flexShrink:0}}>📚</span>
              <span className="neon" style={{fontWeight:900,fontSize:15,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</span>
              {/* <button onClick={() => setOpen(false)}
                style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:18,padding:2}}>✕</button> */}
            </div>

            {/* Nav */}
            <nav className="sidebar-nav-group" style={{flex:1,padding:'10px 8px',display:'flex',flexDirection:'column',gap:2,overflowY:'auto'}}>
              {items.map(item => {
                const isActive = active === item.href;
                return (
                  <button key={item.href} onClick={() => { onNavigate(item.href); setOpen(false); }}
                    className={`nav-btn${isActive?' is-active':''}`}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px',
                      borderRadius:10, cursor:'pointer',
                      background:isActive?'var(--accent-dim)':'transparent',
                      borderLeft:`3px solid ${isActive?'var(--accent)':'transparent'}`,
                      border:'none', width:'100%', textAlign:'left', transition:'background 0.14s' }}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background='var(--bg-hover)';}}
                    onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background='transparent';}}>
                    <span className="nav-icon" style={{fontSize:18,width:26,textAlign:'center'}}>{item.icon}</span>
                    <span style={{fontSize:13.5,fontWeight:isActive?700:500,
                      color:isActive?'var(--accent)':'var(--text-sidebar)',
                      flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.label}</span>
                    {item.badge != null && <span style={{background:'var(--accent)',color:'var(--bg-sidebar)',borderRadius:99,fontSize:10,fontWeight:800,padding:'1px 6px',flexShrink:0}}>{item.badge>99?'99+':item.badge}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div style={{padding:'10px 8px 20px',borderTop:'1px solid var(--border)',flexShrink:0}}>
              <DarkToggle />
              {footer}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}