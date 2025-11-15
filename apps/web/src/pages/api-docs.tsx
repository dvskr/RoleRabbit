/**
 * Swagger UI Page - Section 7.1
 *
 * Interactive API documentation hosted at /api-docs
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function APIDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load Swagger UI CSS and JS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui.min.css';
    document.head.appendChild(cssLink);

    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui-bundle.min.js';
    script1.async = true;
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.0/swagger-ui-standalone-preset.min.js';
      script2.async = true;
      script2.onload = initSwagger;
      document.body.appendChild(script2);
    };
    document.body.appendChild(script1);

    function initSwagger() {
      if (typeof window !== 'undefined' && (window as any).SwaggerUIBundle) {
        (window as any).ui = (window as any).SwaggerUIBundle({
          url: '/api-docs/openapi.yaml',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIStandalonePreset,
          ],
          plugins: [
            (window as any).SwaggerUIBundle.plugins.DownloadUrl,
          ],
          layout: 'StandaloneLayout',
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          docExpansion: 'list',
          filter: true,
          tryItOutEnabled: true,
          persistAuthorization: true,
        });
      }
    }

    return () => {
      // Cleanup
      if (cssLink.parentNode) {
        cssLink.parentNode.removeChild(cssLink);
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div>Loading API Documentation...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>RoleRabbit API Documentation</title>
        <meta name="description" content="RoleRabbit Portfolio API Documentation - Interactive Swagger UI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          padding: '20px 40px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
                RoleRabbit API Documentation
              </h1>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#a0a0a0' }}>
                Complete API reference for portfolio creation and management
              </p>
            </div>
            <nav style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
              <a
                href="/"
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Home
              </a>
              <a
                href="/api-docs/openapi.yaml"
                download
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  backgroundColor: '#60a5fa',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#60a5fa'}
              >
                Download OpenAPI Spec
              </a>
            </nav>
          </div>
        </header>

        {/* Quick Links */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px 40px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
              Quick Links
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
            }}>
              <QuickLinkCard
                title="Authentication"
                description="Get started with JWT-based authentication"
                icon="🔐"
              />
              <QuickLinkCard
                title="Portfolios"
                description="Create and manage portfolio projects"
                icon="📁"
              />
              <QuickLinkCard
                title="Analytics"
                description="Track portfolio views and engagement"
                icon="📊"
              />
              <QuickLinkCard
                title="Rate Limits"
                description="Understand API rate limiting"
                icon="⚡"
              />
            </div>
          </div>
        </div>

        {/* Swagger UI Container */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px 40px',
        }}>
          <div
            id="swagger-ui"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#1a1a1a',
          color: '#a0a0a0',
          padding: '40px',
          marginTop: '40px',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            textAlign: 'center',
            fontSize: '14px',
          }}>
            <p style={{ margin: 0 }}>
              © 2025 RoleRabbit. All rights reserved.
            </p>
            <p style={{ margin: '8px 0 0 0' }}>
              <a href="/privacy-policy" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                Privacy Policy
              </a>
              {' · '}
              <a href="/terms" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                Terms of Service
              </a>
              {' · '}
              <a href="mailto:api@rolerabbit.com" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                Contact Support
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

function QuickLinkCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div style={{
      padding: '16px',
      border: '1px solid #e5e5e5',
      borderRadius: '6px',
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = '#60a5fa';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(96, 165, 250, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = '#e5e5e5';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
        {description}
      </p>
    </div>
  );
}
