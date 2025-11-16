import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';
import { ServiceWorkerRegistration } from '../components/ServiceWorkerRegistration';

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
  const cookieStore = cookies();
  const cookieTheme = cookieStore.get('themeMode')?.value;
  const initialTheme = cookieTheme === 'light' || cookieTheme === 'dark' ? cookieTheme : 'dark';
  const initialBodyBackground = initialTheme === 'light' ? '#ffffff' : '#0f172a';

  return (
    <html
      lang="en"
      className={`${inter.variable} ${initialTheme}`.trim()}
      data-theme={initialTheme}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var match = document.cookie.match(/(?:^|;\\s*)themeMode=(light|dark)(?:;|$)/);
                  var theme = match ? match[1] : null;
                  if (!theme) {
                    theme = localStorage.getItem('themeMode');
                  }
                  if (!theme) {
                    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'dark' : 'light';
                  }
                  if (theme === 'light' || theme === 'dark') {
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(theme);
                    document.documentElement.setAttribute('data-theme', theme);
                    // Set body background immediately to prevent flash
                    document.body.style.backgroundColor = theme === 'light' ? '#ffffff' : '#0f172a';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        style={{ margin: 0, padding: 0, backgroundColor: initialBodyBackground }}
        suppressHydrationWarning
      >
        <ServiceWorkerRegistration />
        <GlobalErrorBoundary level="page">
          <ThemeProvider initialThemeMode={initialTheme}>
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
