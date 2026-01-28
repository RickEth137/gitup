import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GitLabProvider from 'next-auth/providers/gitlab';
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
    GitLabProvider({
      clientId: process.env.GITLAB_CLIENT_ID!,
      clientSecret: process.env.GITLAB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read_user read_api read_repository',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // GitHub sign in
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as {
          id: number;
          login: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          created_at: string;
        };
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

      // GitLab sign in - just allow it, no DB storage for now
      // (GitLab fields not in current schema)

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        
        if (account.provider === 'github') {
          token.githubId = (profile as { id?: number })?.id;
          token.githubLogin = (profile as { login?: string })?.login;
          
          // Get the database user ID
          try {
            const user = await prisma.user.findUnique({
              where: { githubId: String(token.githubId) },
              select: { id: true },
            });
            if (user) {
              token.userId = user.id;
            }
          } catch (error) {
            console.error('Error fetching user ID:', error);
          }
        }
        
        if (account.provider === 'gitlab') {
          token.gitlabId = (profile as { id?: number })?.id;
          token.gitlabLogin = (profile as { username?: string })?.username;
          // GitLab DB storage not implemented yet
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        provider: token.provider,
        user: {
          ...session.user,
          id: token.userId,
          githubId: token.githubId,
          githubLogin: token.githubLogin,
          gitlabId: token.gitlabId,
          gitlabLogin: token.gitlabLogin,
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
