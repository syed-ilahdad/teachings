'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const Ctx = createContext({ theme: 'dark', toggle: () => {} });
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const s = localStorage.getItem('lib-theme') || 'dark';
    setTheme(s);
    document.documentElement.setAttribute('data-theme', s);
  }, []);
  const toggle = () => {
    const n = theme === 'dark' ? 'light' : 'dark';
    setTheme(n);
    localStorage.setItem('lib-theme', n);
    document.documentElement.setAttribute('data-theme', n);
  };
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);