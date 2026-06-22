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
        opacity:     0.7,
        // Force black/white tint over image per theme
        // The body bg color (semi-transparent) shows through
      }} />

      {/* Cursor reveal circle — 70% opacity via clip-path */}

    </>
  );
}
