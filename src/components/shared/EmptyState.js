export default function EmptyState({ icon = '📭', message = 'Nothing here yet.' }) {
  return (
    <div style={{ textAlign:'center', padding:'clamp(40px,8vw,72px) 20px', color:'var(--text-muted)' }}>
      <p className="float-anim" style={{fontSize:'clamp(36px,8vw,52px)',marginBottom:12,opacity:0.4}}>{icon}</p>
      <p style={{fontSize:15}}>{message}</p>
    </div>
  );
}