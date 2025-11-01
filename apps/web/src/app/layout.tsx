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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('themeMode');
                  if (!theme) {
                    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'dark' : 'light';
                  }
                  if (theme === 'light' || theme === 'dark') {
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(theme);
                    document.documentElement.setAttribute('data-theme', theme);
                    // Set body background immediately to prevent flash
                    if (theme === 'light') {
                      document.body.style.backgroundColor = '#ffffff';
                    } else {
                      document.body.style.backgroundColor = '#0f172a';
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a' }} suppressHydrationWarning>
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
