export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      marginBottom:24, paddingBottom:16, borderBottom:'1px solid var(--border)',
      flexWrap:'wrap', gap:12 }}>
      <div>
        <h1 style={{fontSize:'clamp(20px,4vw,28px)',fontWeight:900,color:'var(--text)'}}>{title}</h1>
        {subtitle && <p style={{color:'var(--text-muted)',fontSize:13,marginTop:3}}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}