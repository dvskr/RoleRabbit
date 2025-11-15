/**
 * Portfolio Management Components
 * Central export point for all portfolio-related components
 */

// Portfolio Management (#1-4)
export { PortfolioList } from './PortfolioList';
export { PortfolioCard } from './PortfolioCard';
export type { Portfolio } from './PortfolioCard';
export { DeleteConfirmationModal } from './DeleteConfirmationModal';

// Version History (#5-6)
export { VersionHistory } from './VersionHistory';
export type { PortfolioVersion } from './VersionHistory';
export { VersionComparison } from './VersionComparison';

// Analytics (#7-8)
export { PortfolioAnalytics } from './PortfolioAnalytics';
export type { AnalyticsData } from './PortfolioAnalytics';

// Custom Domain (#9-12)
export { CustomDomainSetup } from './CustomDomainSetup';
export type { DNSRecord, DNSStatus, SSLCertificate } from './CustomDomainSetup';

// SEO Management (#13-15)
export { SEOSettings } from './SEOSettings';
export type { SEOData } from './SEOSettings';

// Template Gallery (#16-19)
export { TemplateGallery } from './TemplateGallery';
export type { PortfolioTemplate } from './TemplateGallery';

// Customization (#20-22)
export { CustomizationPanel } from './CustomizationPanel';
export type { PortfolioSection, ThemeCustomization } from './CustomizationPanel';

// Sharing & Export (#23-26)
export { SharePortfolio } from './SharePortfolio';
export type { ShareSettings, ShareAnalytics } from './SharePortfolio';
export { ExportOptions } from './ExportOptions';
export type { ExportFormat, ExportOptions as ExportOptionsType, ExportHistoryItem } from './ExportOptions';

// Onboarding & Help (#27-29)
export {
  OnboardingTour,
  ContextualTooltip,
  HelpButton,
  WelcomeModal,
  useOnboarding,
} from './OnboardingTour';
export type { TourStep, OnboardingTourProps } from './OnboardingTour';
