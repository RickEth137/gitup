'use client';

import { Header } from '@/components/Header';
import { ProjectTracker } from '@/components/ProjectTracker';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-zinc-500">
            Monitor your launched tokens and claim creator fees
          </p>
        </div>

        {/* Project Tracker */}
        <ProjectTracker />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-zinc-600 text-sm">
          <p>gitup.fun — Tokenize GitHub repos on Solana</p>
        </div>
      </footer>
    </div>
  );
}
