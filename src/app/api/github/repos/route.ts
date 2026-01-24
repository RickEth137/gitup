import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  private: boolean;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  owner: {
    login: string;
    avatar_url: string;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch repos from GitHub API
    const response = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator',
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter to only repos where user has admin permissions (ownership proof)
    const adminRepos = repos.filter(
      (repo) => repo.permissions?.admin === true && !repo.private
    );

    // Transform to match GitHub API format (same as search results)
    const formattedRepos = adminRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      language: repo.language,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
    }));

    return NextResponse.json({ repos: formattedRepos });
  } catch (error) {
    console.error('Error fetching repos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
