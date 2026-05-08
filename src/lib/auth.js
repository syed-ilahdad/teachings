import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { executeD1Query } from './db';

export const authOptions = {
  providers: [CredentialsProvider({
    name: 'Admin Login',
    credentials: { username: { label: 'Username', type: 'text' }, password: { label: 'Password', type: 'password' } },
    async authorize(creds) {
      if (!creds?.username || !creds?.password) return null;
      try {
        const r = await executeD1Query('SELECT * FROM admin_users WHERE username = ? LIMIT 1', [creds.username]);
        const u = r.results[0];
        if (!u) return null;
        return await bcrypt.compare(creds.password, u.password_hash) ? { id: String(u.id), name: u.username } : null;
      } catch { return null; }
    },
  })],
  pages: { signIn: '/admin' },
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = user.id; return token; },
    async session({ session, token }) { if (session.user) session.user.id = token.id; return session; },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};