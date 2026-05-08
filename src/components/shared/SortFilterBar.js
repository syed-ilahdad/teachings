'use client';
import { useState } from 'react';

export default function SortFilterBar({ onSearch, onSort, onFilter, categories = [], showSearch = true }) {
  const [q, setQ] = useState('');

  const IS = { // input style
    background:'var(--bg-input)', border:'1.5px solid var(--border)', borderRadius:8,
    color:'var(--text)', fontSize:13, padding:'8px 11px', outline:'none',
    fontFamily:'inherit', transition:'border-color 0.18s, box-shadow 0.18s',
  };

  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:20 }}>
      {showSearch && (
        <div style={{ flex:1, minWidth:160, position:'relative' }}>
          <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',fontSize:14}}>🔍</span>
          <input
            className="input-base" placeholder="Search by name, tags…" value={q}
            style={{...IS, paddingLeft:34, width:'100%'}}
            onChange={e => { setQ(e.target.value); onSearch?.(e.target.value); }}
            onFocus={e=>{e.target.style.borderColor='var(--accent)';e.target.style.boxShadow='0 0 0 3px var(--accent-dim)';}}
            onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}}
          />
        </div>
      )}
      {onFilter && (
        <select className="input-base" style={{...IS, width:'auto', minWidth:140}}
          onChange={e => onFilter(e.target.value)} defaultValue="all"
          onFocus={e=>{e.target.style.borderColor='var(--accent)';e.target.style.boxShadow='0 0 0 3px var(--accent-dim)';}}
          onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}}>
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.parent_id ? `  ↳ ${c.name}` : c.name}</option>
          ))}
        </select>
      )}
      {onSort && (
        <select className="input-base" style={{...IS, width:'auto', minWidth:130}}
          onChange={e => onSort(e.target.value)} defaultValue="date"
          onFocus={e=>{e.target.style.borderColor='var(--accent)';e.target.style.boxShadow='0 0 0 3px var(--accent-dim)';}}
          onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none';}}>
          <option value="date">Latest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">A → Z</option>
        </select>
      )}
    </div>
  );
}