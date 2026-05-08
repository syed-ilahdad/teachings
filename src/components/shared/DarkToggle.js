'use client';
import { useTheme } from './ThemeProvider';
export default function DarkToggle({ compact = false }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button onClick={toggle} title={dark?'Switch to Light':'Switch to Dark'}
      style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer',
        background:'transparent', border:'none', padding: compact?'4px':'5px 8px',
        borderRadius:8, width:compact?'auto':'100%', transition:'background 0.15s' }}
      onMouseEnter={e=>e.currentTarget.style.background='var(--accent-dim)'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <span style={{fontSize:15,flexShrink:0}}>{dark?'🌙':'☀️'}</span>
      <div style={{ width:36, height:20, borderRadius:99, position:'relative', flexShrink:0,
        background:dark?'var(--accent)':'var(--border2)', border:'1.5px solid var(--border2)',
        transition:'background 0.28s', boxShadow:dark?'0 0 8px var(--accent-glow)':'none' }}>
        <div style={{ position:'absolute', top:1, borderRadius:'50%', width:14, height:14,
          background:dark?'var(--bg-sidebar)':'var(--bg)', left:dark?18:2,
          transition:'left 0.28s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }} />
      </div>
      {!compact && <span style={{fontSize:12,fontWeight:600,color:'var(--text-sidebar)',whiteSpace:'nowrap'}}>{dark?'Dark':'Light'}</span>}
    </button>
  );
}