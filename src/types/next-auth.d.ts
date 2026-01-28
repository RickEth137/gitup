// Type declarations for NextAuth.js session extensions
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      githubId?: number;
      githubLogin?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id?: string;
    githubId?: number;
    githubLogin?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    userId?: string;
    githubId?: number;
    githubLogin?: string;
  }
}
