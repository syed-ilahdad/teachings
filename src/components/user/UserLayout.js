'use client';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import BackgroundLayer from './BackgroundLayer';

const USER_NAV = [
  { href:'/user',            icon:'🏠', label:'Home'             },
  { href:'/user/important',  icon:'⭐', label:'Important Updates' },
  { href:'/user/latest',     icon:'🆕', label:'Latest Releases'  },
  { href:'/user/must-watch', icon:'🎬', label:'Must Watch'       },
  { href:'/user/categories', icon:'🏷️', label:'Categories'       },
  { href:'/user/audios',     icon:'🎵', label:'Audio'            },
  { href:'/user/videos',     icon:'📹', label:'Video'            },
  { href:'/user/pdfs',       icon:'📄', label:'PDF'              },
  { href:'/user/search',     icon:'🔍', label:'Search'           },
];

export default function UserLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();

  return (
    // position:relative so BackgroundLayer fixed elements are behind content
    <div style={{ minHeight:'100vh', background:'var(--bg)', position:'relative' }}>
      {/* Background image layer — behind everything */}
      <BackgroundLayer />

      <Sidebar
        items={USER_NAV}
        active={pathname}
        onNavigate={href => router.push(href)}
        title="Library"
      />

      {/* Content sits above background (zIndex 2+) */}
      <main style={{
        padding:    'clamp(16px,3vw,32px)',
        paddingTop: 'clamp(70px,10vw,80px)',
        maxWidth:   1400,
        margin:     '0 auto',
        width:      '100%',
        position:   'relative',
        zIndex:      2,
      }}>
        {children}
      </main>
    </div>
  );
}