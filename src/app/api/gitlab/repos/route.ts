import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

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
  owner?: {
    username: string;
    avatar_url: string;
  };
  avatar_url: string | null;
  visibility: string;
  permissions?: {
    project_access?: {
      access_level: number;
    };
    group_access?: {
      access_level: number;
    };
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken || session.provider !== 'gitlab') {
      return NextResponse.json({ error: 'Unauthorized - GitLab login required' }, { status: 401 });
    }

    // Fetch projects from GitLab API
    const response = await fetch(
      'https://gitlab.com/api/v4/projects?membership=true&per_page=100&order_by=updated_at&owned=true',
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitLab API error:', response.status, errorText);
      throw new Error(`GitLab API error: ${response.status}`);
    }

    const projects: GitLabProject[] = await response.json();

    // Filter to only public projects
    const publicProjects = projects.filter(
      (project) => project.visibility === 'public'
    );

    // Transform to match the format expected by the frontend
    const formattedRepos = publicProjects.map((project) => ({
      id: project.id,
      name: project.name,
      full_name: project.path_with_namespace,
      description: project.description || '',
      html_url: project.web_url,
      stargazers_count: project.star_count,
      forks_count: project.forks_count,
      language: null, // GitLab doesn't return this in the list endpoint
      owner: {
        login: project.namespace.path,
        avatar_url: project.avatar_url || project.namespace.avatar_url || '',
      },
      platform: 'gitlab',
    }));

    return NextResponse.json({ repos: formattedRepos });
  } catch (error) {
    console.error('Error fetching GitLab repos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitLab repositories' },
      { status: 500 }
    );
  }
}
