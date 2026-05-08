'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/shared/ThemeProvider';


export default function BackgroundLayer() {
  const [bgUrl, setBgUrl] = useState(null);
  const { theme } = useTheme();
  const circleRef               = useRef(null);
  const posRef                  = useRef({ x: -200, y: -200 });
  const rafRef                  = useRef(null);

  // Pick a random active background image on mount
useEffect(() => {
  fetch('/api/background-images')
    .then(r => r.json())
    .then(d => {
      const allImages = (d.images || []).filter(i => i.url);

      const filteredImages = allImages.filter(img => {
        if (img.theme === 'both' || !img.theme) return true;
        return img.theme === theme;
      });

      if (!filteredImages.length) {
        setBgUrl(null);
        return;
      }

      const pick =
        filteredImages[
          Math.floor(Math.random() * filteredImages.length)
        ];

      setBgUrl(pick.url);
    })
    .catch(() => {});
}, [theme]);

  // Smooth cursor-following circle via rAF (no React state = zero re-renders)
useEffect(() => {
  if (!bgUrl) return;

  let target = { x: -300, y: -300 };
  let current = { x: -300, y: -300 };

  const SIZE = 90;

  const onMove = (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  };

  window.addEventListener('pointermove', onMove, {
    passive: true,
  });

  const tick = () => {
    current.x += (target.x - current.x) * 0.12;
    current.y += (target.y - current.y) * 0.12;

    if (circleRef.current) {
      // Move circle
      circleRef.current.style.transform = `
        translate(${current.x - SIZE / 2}px,
        ${current.y - SIZE / 2}px)
      `;

      // Align image with full-screen background
      circleRef.current.style.backgroundPosition = `
        calc(50% - ${current.x - window.innerWidth / 2}px)
        calc(50% - ${current.y - window.innerHeight / 2}px)
      `;
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  rafRef.current = requestAnimationFrame(tick);

  return () => {
    window.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(rafRef.current);
  };
}, [bgUrl]);

  if (!bgUrl) return null;

  return (
    <>
      {/* Base background — 30% opacity */}
      <div style={{
        position:   'fixed',
        inset:       0,
        zIndex:      0,
        pointerEvents: 'none',
        backgroundImage:    `url(${bgUrl})`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundRepeat:   'no-repeat',
        opacity:     0.1,
        // Force black/white tint over image per theme
        // The body bg color (semi-transparent) shows through
      }} />

      {/* Cursor reveal circle — 70% opacity via clip-path */}
      <div
        ref={circleRef}
        style={{
          position:    'fixed',
          top:          0,
          left:         0,
          width:        90,
          height:       90,
          borderRadius: '50%',
          zIndex:        1,
          pointerEvents: 'none',
          
          // Show image at 70% inside circle
          backgroundImage:    `url(${bgUrl})`,
          backgroundSize:     '100vw 100vh',
          backgroundAttachment: 'fixed',
          backgroundPosition:   'center',
          opacity:      1,
          // Soft edge
          // boxShadow:   'inset 0 0 20px 10px var(--bg)',
//           maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 35%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.1) 100%)',
// WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 35%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.1) 100%)',

maskImage:
  'radial-gradient(circle, rgba(0,0,0,1) 5%, rgba(0,0,0,0.7) 28%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.02) 100%)',

WebkitMaskImage:
  'radial-gradient(circle, rgba(0,0,0,1) 8%, rgba(0,0,0,0.7) 28%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.02) 100%)',          
willChange:  'transform',

        }}
      />
    </>
  );
}