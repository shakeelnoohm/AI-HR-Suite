import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI HR Suite — Smart Candidate Screening',
  description: 'Screen candidates, assess job fit, rank applicants, and generate interview prep — all powered by AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--card-border)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '20px'
              }}>
                H
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                AI HR<span className="text-gradient-accent">Suite</span>
              </h1>
            </div>
          </div>
        </header>
        <main style={{ flex: 1, padding: '4rem 0' }}>
          {children}
        </main>
        <footer style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid var(--card-border)' }}>
          <div className="container">
            <p style={{ fontSize: '0.875rem' }}>© {new Date().getFullYear()} AI HR Suite</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
