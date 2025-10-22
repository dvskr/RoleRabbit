import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RoleReady - AI-Powered Resume Builder',
  description: 'Build professional resumes with AI assistance. Get ATS-optimized resumes that land you interviews.',
  keywords: ['resume', 'CV', 'AI', 'ATS', 'job application', 'career'],
  authors: [{ name: 'RoleReady Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <div id="root">
            {children}
          </div>
          <div id="modal-root" />
          <div id="toast-root" />
        </AuthProvider>
      </body>
    </html>
  );
}
