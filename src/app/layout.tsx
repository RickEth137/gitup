import type { Metadata } from 'next';
import { Providers } from '@/providers';
import { Header } from '@/components';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'git.fun - Tokenize Your GitHub Repos',
  description:
    'Turn your open-source code into tradable assets on Solana via pump.fun. Tokenize your GitHub repositories in under 60 seconds.',
  keywords: [
    'GitHub',
    'Solana',
    'pump.fun',
    'token',
    'cryptocurrency',
    'open source',
    'developer',
  ],
  openGraph: {
    title: 'git.fun - Tokenize Your GitHub Repos',
    description:
      'Turn your open-source code into tradable assets on Solana via pump.fun.',
    type: 'website',
    url: 'https://git.fun',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'git.fun - Tokenize Your GitHub Repos',
    description:
      'Turn your open-source code into tradable assets on Solana via pump.fun.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Hand-drawn font for annotations + Comic font for docs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Caveat:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-pump-dark text-white">
        {/* Noise texture overlay */}
        <div className="noise-overlay" />
        <Providers>
          <Header />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
