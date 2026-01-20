'use client';

import { signIn } from 'next-auth/react';
import { Github, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light mb-2">Welcome</h1>
          <p className="text-muted text-sm">
            Connect your GitHub account to get started
          </p>
        </div>

        <div className="card">
          <button
            onClick={() => signIn('github', { callbackUrl: '/launch' })}
            className="w-full btn-primary flex items-center justify-center gap-3"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="mt-6 text-center text-xs text-muted">
            <p>By continuing, you agree to our Terms of Service.</p>
            <p className="mt-2">
              We'll request access to verify repository ownership.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted">
            No GitHub account?{' '}
            <a
              href="https://github.com/join"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Create one →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
