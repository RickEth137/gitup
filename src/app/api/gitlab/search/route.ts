import { NextResponse } from 'next/server';

interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  description: string | null;
  web_url: string;
  star_count: number;
  forks_count: number;
  namespace: {
    name: string;
    path: string;
    avatar_url: string | null;
  };
  avatar_url: string | null;
  visibility: string;
  readme_url?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ repos: [] });
  }

  try {
    // Search GitLab public projects
    const response = await fetch(
      `https://gitlab.com/api/v4/projects?search=${encodeURIComponent(query)}&per_page=20&order_by=stars&visibility=public`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status}`);
    }

    const projects: GitLabProject[] = await response.json();

    // Transform to match the format expected by the frontend
    const formattedRepos = projects.map((project) => ({
      id: project.id,
      name: project.name,
      full_name: project.path_with_namespace,
      description: project.description || '',
      html_url: project.web_url,
      stargazers_count: project.star_count,
      forks_count: project.forks_count,
      language: null, // GitLab doesn't return this in search
      owner: {
        login: project.namespace.path,
        avatar_url: project.avatar_url || project.namespace.avatar_url || '',
      },
      platform: 'gitlab',
    }));

    return NextResponse.json({ repos: formattedRepos });
  } catch (error) {
    console.error('GitLab search error:', error);
    return NextResponse.json(
      { error: 'Failed to search GitLab' },
      { status: 500 }
    );
  }
}
