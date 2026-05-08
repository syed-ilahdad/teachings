'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
function Guard({ children }) {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => { if (status === 'unauthenticated') router.replace('/admin'); }, [status]);
  if (status === 'loading') return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div className="spin" style={{width:28,height:28,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%'}} />
    </div>
  );
  return children;
}
export default function layout({ children }) {
  return <ThemeProvider><SessionProvider><Guard>{children}</Guard></SessionProvider></ThemeProvider>;
}