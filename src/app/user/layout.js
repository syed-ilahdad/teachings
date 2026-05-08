'use client';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
export default function layout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}