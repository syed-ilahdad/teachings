'use client';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Sidebar from '@/components/shared/Sidebar';

const ADMIN_NAV = [
  { href:'/admin',                    icon:'🏠', label:'Dashboard'           },
  { href:'/admin/upload',             icon:'⬆️', label:'Upload Files'        },
  { href:'/admin/files',              icon:'📁', label:'Manage Files'        },
  { href:'/admin/categories',         icon:'🏷️', label:'Categories'          },
  { href:'/admin/builder',            icon:'🧱', label:'Page Builder'        },
  { href:'/admin/news',               icon:'📰', label:'News Manager'        },
  { href:'/admin/cover-manager',      icon:'🖼️', label:'Cover Manager'       }, // NEW
  { href:'/admin/background-images',  icon:'🌄', label:'Background Images'   }, // NEW
];

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const logoutBtn = (
    <button onClick={() => signOut({ redirect:false }).then(() => router.push('/admin'))}
      style={{display:'flex',alignItems:'center',gap:10,padding:'10px',marginTop:4,borderRadius:10,cursor:'pointer',background:'transparent',border:'none',width:'100%',transition:'background 0.14s'}}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,61,90,0.1)'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <span style={{fontSize:18,width:26,textAlign:'center'}}>🚪</span>
      <span style={{fontSize:13.5,fontWeight:600,color:'var(--danger)'}}>Logout</span>
    </button>
  );

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <Sidebar items={ADMIN_NAV} active={pathname} onNavigate={href => router.push(href)} title="Admin Panel" footer={logoutBtn} />
      <main style={{padding:'clamp(16px,3vw,32px)',paddingTop:'clamp(70px,10vw,80px)',maxWidth:1200,margin:'0 auto',width:'100%'}}>
        {children}
      </main>
    </div>
  );
}