import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLoginPage = nextUrl.pathname === '/admin/login';

      // Always allow access to login page
      if (isOnLoginPage) {
        return true;
      }

      // Protect admin routes
      if (isOnAdmin && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  providers: [],
};
