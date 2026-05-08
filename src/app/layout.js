import './globals.css';
export const metadata = { title: 'Library', description: 'Teachings of Imam Mehdi' };
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{__html:`try{var t=localStorage.getItem('lib-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`}} />
      </head>
      <body>{children}</body>
    </html>
  );
}