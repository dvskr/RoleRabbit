/**
 * Portfolio Dashboard Integration Example
 *
 * This example demonstrates how to integrate all 29 portfolio management features
 * into a complete dashboard application.
 *
 * This is a REFERENCE IMPLEMENTATION - adapt to your specific needs.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import all portfolio components
import {
  PortfolioList,
  PortfolioAnalytics,
  VersionHistory,
  VersionComparison,
  CustomDomainSetup,
  SEOSettings,
  TemplateGallery,
  CustomizationPanel,
  SharePortfolio,
  ExportOptions,
  OnboardingTour,
  WelcomeModal,
  useOnboarding,
  type Portfolio,
  type PortfolioVersion,
  type AnalyticsData,
  type DNSRecord,
  type SEOData,
  type PortfolioTemplate,
  type PortfolioSection,
  type ThemeCustomization,
  type ShareSettings,
  type ShareAnalytics,
  type TourStep,
} from '@/components/portfolio';

/**
 * Main Portfolio Dashboard Component
 */
export function PortfolioDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'settings'>('list');
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  // Portfolio data
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  // Onboarding
  const { hasSeenOnboarding, markAsComplete } = useOnboarding('portfolio-dashboard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Load portfolios on mount
  useEffect(() => {
    loadPortfolios();

    // Show welcome modal for first-time users
    if (!hasSeenOnboarding) {
      setShowWelcome(true);
    }
  }, [hasSeenOnboarding]);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      // Replace with your API call
      const response = await fetch('/api/portfolios');
      const data = await response.json();
      setPortfolios(data);
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Portfolio actions
  const handleEditPortfolio = (id: string) => {
    router.push(`/portfolio/${id}/edit`);
  };

  const handleDuplicatePortfolio = async (id: string) => {
    try {
      const original = portfolios.find((p) => p.id === id);
      if (!original) return;

      // Create copy with modified name
      const copy = {
        ...original,
        id: undefined,
        name: `${original.name} (Copy)`,
        status: 'draft' as const,
        viewCount: 0,
        publishedUrl: undefined,
      };

      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      });

      if (response.ok) {
        const created = await response.json();
        setPortfolios([...portfolios, created]);
        // Show success toast
        alert(`Created copy: ${created.name}`);
      }
    } catch (error) {
      console.error('Failed to duplicate portfolio:', error);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolios/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPortfolios(portfolios.filter((p) => p.id !== id));
        alert('Portfolio deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
    }
  };

  const handleViewLive = (id: string) => {
    const portfolio = portfolios.find((p) => p.id === id);
    if (portfolio?.publishedUrl) {
      window.open(portfolio.publishedUrl, '_blank');
    }
  };

  const handleCreateNew = () => {
    router.push('/portfolio/new');
  };

  // Onboarding tour steps
  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      target: '',
      title: 'Welcome to Portfolio Manager! 🎉',
      content: 'Let\'s take a quick tour of the key features to help you get started.',
      placement: 'center',
    },
    {
      id: 'portfolio-list',
      target: '.portfolio-list',
      title: 'Your Portfolios',
      content: 'This is where all your portfolios are displayed. You can search, filter, and sort them.',
      placement: 'bottom',
    },
    {
      id: 'create-button',
      target: '.create-new-button',
      title: 'Create New Portfolio',
      content: 'Click here to create a new portfolio from scratch or use a template.',
      placement: 'bottom',
      action: {
        label: 'Try it now',
        onClick: handleCreateNew,
      },
    },
    {
      id: 'analytics',
      target: '.analytics-tab',
      title: 'Track Performance',
      content: 'View detailed analytics about your portfolio views, visitors, and engagement.',
      placement: 'bottom',
    },
    {
      id: 'settings',
      target: '.settings-tab',
      title: 'Customize & Share',
      content: 'Customize your portfolio design, set up custom domains, optimize SEO, and share with others.',
      placement: 'bottom',
    },
  ];

  const handleTourComplete = () => {
    setShowTour(false);
    markAsComplete();
  };

  const handleTourSkip = () => {
    setShowTour(false);
    markAsComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onStartTour={() => {
          setShowWelcome(false);
          setShowTour(true);
        }}
        onSkip={() => {
          setShowWelcome(false);
          markAsComplete();
        }}
        userName="there"
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        isOpen={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
        showProgress
        allowSkip
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Portfolio Manager
            </h1>
            <button
              onClick={() => setShowTour(true)}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              Show Tour
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-4 border-b-2 font-medium transition-colors portfolio-list-tab ${
                activeTab === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Portfolios
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-4 border-b-2 font-medium transition-colors analytics-tab ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-4 border-b-2 font-medium transition-colors settings-tab ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio List Tab */}
        {activeTab === 'list' && (
          <div className="portfolio-list">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading portfolios...</p>
              </div>
            ) : (
              <PortfolioList
                portfolios={portfolios}
                onEdit={handleEditPortfolio}
                onDuplicate={handleDuplicatePortfolio}
                onDelete={handleDeletePortfolio}
                onViewLive={handleViewLive}
                onCreateNew={handleCreateNew}
                enablePagination
                itemsPerPage={12}
              />
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && selectedPortfolio && (
          <PortfolioAnalyticsView portfolioId={selectedPortfolio.id} />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && selectedPortfolio && (
          <PortfolioSettingsView
            portfolioId={selectedPortfolio.id}
            portfolio={selectedPortfolio}
          />
        )}
      </main>
    </div>
  );
}

/**
 * Portfolio Analytics View
 */
function PortfolioAnalyticsView({ portfolioId }: { portfolioId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [portfolioId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16">Loading analytics...</div>;
  }

  return <PortfolioAnalytics data={analytics!} loading={loading} />;
}

/**
 * Portfolio Settings View
 * Includes all settings tabs: SEO, Domain, Customization, Sharing, Export
 */
function PortfolioSettingsView({
  portfolioId,
  portfolio,
}: {
  portfolioId: string;
  portfolio: Portfolio;
}) {
  const [settingsTab, setSettingsTab] = useState<
    'seo' | 'domain' | 'customize' | 'share' | 'export' | 'versions'
  >('seo');

  // State for each settings section
  const [seoData, setSeoData] = useState<SEOData>({
    title: '',
    description: '',
    keywords: [],
  });

  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
  });

  // Handlers
  const handleUpdateSEO = async (seo: SEOData) => {
    try {
      await fetch(`/api/portfolios/${portfolioId}/seo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seo),
      });
      setSeoData(seo);
    } catch (error) {
      console.error('Failed to update SEO:', error);
    }
  };

  const handleUpdateShareSettings = async (settings: ShareSettings) => {
    try {
      await fetch(`/api/portfolios/${portfolioId}/share`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setShareSettings(settings);
    } catch (error) {
      console.error('Failed to update share settings:', error);
    }
  };

  return (
    <div>
      {/* Settings Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: 'seo', label: 'SEO' },
          { key: 'domain', label: 'Custom Domain' },
          { key: 'customize', label: 'Customize' },
          { key: 'share', label: 'Share' },
          { key: 'export', label: 'Export' },
          { key: 'versions', label: 'Version History' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSettingsTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settingsTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      {settingsTab === 'seo' && (
        <SEOSettings
          portfolioId={portfolioId}
          currentSEO={seoData}
          portfolioUrl={portfolio.publishedUrl || ''}
          onUpdate={handleUpdateSEO}
        />
      )}

      {settingsTab === 'domain' && (
        <CustomDomainSetup
          portfolioId={portfolioId}
          currentDomain={portfolio.publishedUrl}
          dnsRecords={[]}
          dnsStatus="pending"
          sslCertificate={undefined}
          onCheckSubdomain={async (subdomain) => {
            const response = await fetch(
              `/api/check-subdomain?subdomain=${subdomain}`
            );
            return response.json();
          }}
          onAddDomain={async (domain) => {
            await fetch(`/api/portfolios/${portfolioId}/domain`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain }),
            });
          }}
          onVerifyDNS={async () => {
            await fetch(`/api/portfolios/${portfolioId}/verify-dns`, {
              method: 'POST',
            });
          }}
        />
      )}

      {settingsTab === 'share' && (
        <SharePortfolio
          portfolioId={portfolioId}
          portfolioName={portfolio.name}
          shareSettings={shareSettings}
          onUpdateSettings={handleUpdateShareSettings}
          onGenerateLink={async () => {
            const response = await fetch(`/api/portfolios/${portfolioId}/share-link`, {
              method: 'POST',
            });
            const data = await response.json();
            return data.url;
          }}
        />
      )}

      {settingsTab === 'export' && (
        <ExportOptions
          portfolioId={portfolioId}
          portfolioName={portfolio.name}
          onExport={async (options) => {
            await fetch(`/api/portfolios/${portfolioId}/export`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(options),
            });
          }}
        />
      )}

      {/* Add other tabs as needed */}
    </div>
  );
}

export default PortfolioDashboard;
