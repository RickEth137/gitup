'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
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
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
