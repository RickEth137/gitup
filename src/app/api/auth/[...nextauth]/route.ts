import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import prisma from '@/lib/prisma';

// Minimum account age in days to prevent spam
const MIN_ACCOUNT_AGE_DAYS = 30;

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email public_repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as any;
        const accountCreatedAt = new Date(githubProfile.created_at);
        const accountAgeDays = Math.floor(
          (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if account is old enough
        if (accountAgeDays < MIN_ACCOUNT_AGE_DAYS) {
          console.log(`Account too new: ${accountAgeDays} days old`);
          return `/auth/error?error=AccountTooNew&days=${accountAgeDays}`;
        }

        // Upsert user in database
        try {
          await prisma.user.upsert({
            where: { githubId: String(githubProfile.id) },
            update: {
              githubLogin: githubProfile.login,
              email: githubProfile.email,
              name: githubProfile.name,
              avatarUrl: githubProfile.avatar_url,
              accessToken: account.access_token,
            },
            create: {
              githubId: String(githubProfile.id),
              githubLogin: githubProfile.login,
              email: githubProfile.email,
              name: githubProfile.name,
              avatarUrl: githubProfile.avatar_url,
              accessToken: account.access_token,
              accountAge: accountCreatedAt,
            },
          });
        } catch (error) {
          console.error('Error saving user:', error);
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = (profile as any)?.id;
        token.githubLogin = (profile as any)?.login;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          githubId: token.githubId,
          githubLogin: token.githubLogin,
        },
      };
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
