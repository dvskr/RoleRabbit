import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RoleReady - Your Complete Career Platform',
  description: 'Build resumes, track jobs, prepare for interviews, and land your dream role. One platform for your entire job search.',
  keywords: ['resume', 'CV', 'job search', 'career', 'job tracking', 'interview prep', 'ATS', 'job application'],
  authors: [{ name: 'RoleReady Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ margin: 0, padding: 0 }}>
        <GlobalErrorBoundary level="page">
          <ThemeProvider>
            <AuthProvider>
              <ProfileProvider>
                <div id="root">
                  {children}
                </div>
                <div id="modal-root" />
                <div id="toast-root" />
              </ProfileProvider>
            </AuthProvider>
          </ThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
