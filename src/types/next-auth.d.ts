// Type declarations for NextAuth.js session extensions
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      githubId?: number;
      githubLogin?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    githubId?: number;
    githubLogin?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    githubId?: number;
    githubLogin?: string;
  }
}
