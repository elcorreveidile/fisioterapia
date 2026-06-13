import NextAuth from 'next-auth';
import { authConfig } from './auth/auth.config';

export const proxy = NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api/|_next/static|_next/image|images/|favicon.ico|icon.png|apple-icon.png).*)'],
};
