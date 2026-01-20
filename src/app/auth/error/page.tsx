'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const days = searchParams.get('days');

  const getErrorMessage = () => {
    switch (error) {
      case 'AccountTooNew':
        return {
          title: 'Account Too New',
          description: `Your GitHub account is only ${days} days old. Accounts must be at least 30 days old.`,
          suggestion: 'Come back later or contact us if this is a mistake.',
        };
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Not Linked',
          description: 'This email is already associated with another account.',
          suggestion: 'Try signing in with a different account.',
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'Access to your GitHub account was denied.',
          suggestion: 'Please try again and grant the necessary permissions.',
        };
      default:
        return {
          title: 'Error',
          description: 'An error occurred during authentication.',
          suggestion: 'Please try again.',
        };
    }
  };

  const { title, description, suggestion } = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-12 h-12 mx-auto border border-border rounded-full flex items-center justify-center mb-6">
          <span className="text-xl">×</span>
        </div>

        <h1 className="text-xl font-medium mb-2">{title}</h1>
        <p className="text-muted text-sm mb-2">{description}</p>
        <p className="text-xs text-muted mb-8">{suggestion}</p>

        <Link
          href="/"
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
