'use client';
import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

const TILES = [
  { href:'/admin/upload',     icon:'⬆️', label:'Upload Files',  desc:'Add audio, video, or PDF files to the library' },
  { href:'/admin/files',      icon:'📁', label:'Manage Files',  desc:'Edit, delete, and organize uploaded files' },
  { href:'/admin/categories', icon:'🏷️', label:'Categories',    desc:'Create and manage file categories' },
  { href:'/admin/builder',    icon:'🧱', label:'Page Builder',  desc:'Customize the user homepage layout' },
  { href:'/admin/news',       icon:'📰', label:'News Manager',  desc:'Create and manage news cards for users' },
  { href:'/admin/cover-manager',     icon:'🖼️', label:'Cover Manager',      desc:'Manage cover images for files and categories' },
{ href:'/admin/background-images', icon:'🌄', label:'Background Images',   desc:'Upload images displayed behind the user page' },
];

function LoginForm() {
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');
  const [err,  setErr]  = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await signIn('credentials', { username:user, password:pass, redirect:false });
    setBusy(false);
    if (!res?.ok) setErr('Invalid username or password.');
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:16}}>
      <div style={{width:'100%',maxWidth:400,background:'var(--bg-card)',border:'1.5px solid var(--border2)',borderRadius:'var(--r-xl)',padding:'clamp(24px,6vw,40px)',boxShadow:'0 0 40px var(--accent-glow)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div className="float-anim" style={{fontSize:52,marginBottom:10}}>📚</div>
          <h1 className="neon" style={{fontSize:24,fontWeight:900}}>Library Admin</h1>
          <p style={{color:'var(--text-muted)',fontSize:13,marginTop:4}}>Sign in to manage your library</p>
        </div>
        <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:14}}>
          {[['Username','text',user,setUser,'admin','username'],['Password','password',pass,setPass,'Enter password','current-password']].map(([label,type,val,setter,ph,ac])=>(
            <div key={label}>
              <label style={{display:'block',marginBottom:5,fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>{label}</label>
              <input className="input-base" type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={ph} autoComplete={ac} required />
            </div>
          ))}
          {err && <div style={{background:'rgba(255,61,90,0.1)',border:'1px solid var(--danger)',borderRadius:8,padding:'10px 14px',color:'var(--danger)',fontSize:13,fontWeight:500}}>⚠️ {err}</div>}
          <button type="submit" disabled={busy} className="btn btn-primary" style={{width:'100%',padding:'12px',justifyContent:'center',marginTop:4}}>
            {busy ? <><span className="spin" style={{width:18,height:18,border:'2px solid var(--bg-sidebar)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block'}} /> Signing in…</> : '🔑 Sign In'}
          </button>
        </form>
        <p style={{textAlign:'center',color:'var(--text-muted)',fontSize:12,marginTop:20}}>
          Default: <code style={{color:'var(--accent)'}}>admin</code> / <code style={{color:'var(--accent)'}}>admin123</code>
        </p>
      </div>
    </div>
  );
}

export default function page() {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session) return <LoginForm />;
  return (
    <AdminLayout>
      <h1 style={{fontSize:'clamp(22px,4vw,30px)',fontWeight:900,color:'var(--text)',marginBottom:6}}>Dashboard</h1>
      <p style={{color:'var(--text-muted)',marginBottom:28,fontSize:14}}>Welcome back, <strong style={{color:'var(--accent)'}}>{session.user?.name}</strong></p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))',gap:18}}>
        {TILES.map(tile => (
          <button key={tile.href} onClick={() => router.push(tile.href)}
            style={{background:'var(--bg-card)',border:'1.5px solid var(--border)',borderRadius:'var(--r-lg)',padding:'clamp(20px,4vw,28px)',textAlign:'left',cursor:'pointer',transition:'border-color 0.15s,box-shadow 0.15s,transform 0.15s',display:'flex',flexDirection:'column',gap:10}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.boxShadow='0 8px 28px var(--shadow),0 0 0 1px var(--accent)';e.currentTarget.style.transform='translateY(-3px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
            <span style={{fontSize:36}}>{tile.icon}</span>
            <div>
              <div style={{fontWeight:800,fontSize:17,color:'var(--text)',marginBottom:4}}>{tile.label}</div>
              <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.5}}>{tile.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{marginTop:32,padding:20,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)'}}>
        <p style={{fontSize:13,color:'var(--text-muted)'}}>
          🔗 <a href="/user" target="_blank" rel="noreferrer" style={{color:'var(--accent)',fontWeight:700,textDecoration:'none'}}>Preview user page →</a>
        </p>
      </div>
    </AdminLayout>
  );
}