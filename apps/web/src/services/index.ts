/**
 * Service Layer Exports
 * Section 2.11: Service Layer Implementation
 *
 * Central export point for all service classes
 */

// Portfolio Service
export { PortfolioService } from './portfolio.service';
export type {
  Portfolio,
  PortfolioData,
  CreatePortfolioInput,
  UpdatePortfolioInput,
} from './portfolio.service';

// Template Service
export { TemplateService } from './template.service';
export type {
  Template,
  TemplateSectionConfig,
} from './template.service';

// Build Service
export { BuildService } from './build.service';
export type {
  BuildResult,
  BuildAsset,
  ImageOptimizationOptions,
} from './build.service';

// Deployment Service
export { DeploymentService } from './deployment.service';
export type {
  CustomDomain,
  DNSInstructions,
  DeploymentResult,
} from './deployment.service';

// Analytics Service
export { AnalyticsService } from './analytics.service';
export type {
  PortfolioAnalytics,
  ViewTrackingData,
  AnalyticsAggregation,
} from './analytics.service';

// Version Service
export { VersionService } from './version.service';
export type {
  PortfolioVersion,
} from './version.service';

// Export Service
export { ExportService } from './export.service';
export type {
  ExportFormat,
  PDFExportOptions,
  ZIPExportResult,
} from './export.service';

// Import Service
export { ImportService } from './import.service';
export type {
  UserProfile,
  AIGenerationOptions,
  AIGenerationResult,
} from './import.service';
