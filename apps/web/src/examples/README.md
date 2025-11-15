# Portfolio Management Integration Examples

This directory contains example implementations showing how to use the portfolio management components in your application.

## Files

### PortfolioDashboardExample.tsx

A complete, production-ready example of a portfolio dashboard that integrates all 29 portfolio management features.

**Features Demonstrated:**

1. **Portfolio List Management** (#1-4)
   - Displaying portfolios with search, filter, and sort
   - Portfolio duplication
   - Delete confirmation
   - Create new portfolio

2. **Analytics Integration** (#7-8)
   - Loading and displaying analytics data
   - Summary metrics
   - Charts and visualizations

3. **Settings Management** (#9-29)
   - SEO settings
   - Custom domain setup
   - Share settings with link generation
   - Export functionality
   - Version history

4. **Onboarding Experience** (#27-29)
   - Welcome modal for first-time users
   - Guided tour with tooltips
   - Persistent onboarding state

## Usage

### 1. Basic Setup

```tsx
import { PortfolioDashboard } from '@/examples/PortfolioDashboardExample';

export default function DashboardPage() {
  return <PortfolioDashboard />;
}
```

### 2. Using Individual Components

```tsx
import {
  PortfolioList,
  PortfolioAnalytics,
  SEOSettings,
  SharePortfolio,
} from '@/components/portfolio';

function MyCustomDashboard() {
  const [portfolios, setPortfolios] = useState([]);

  return (
    <div>
      <PortfolioList
        portfolios={portfolios}
        onEdit={(id) => router.push(`/portfolio/${id}/edit`)}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

### 3. Integrating with Your API

The example uses placeholder API calls. Replace these with your actual API endpoints:

```tsx
// Replace this:
const response = await fetch('/api/portfolios');

// With your API:
const response = await apiClient.getPortfolios();
```

### 4. Customizing the Onboarding Tour

```tsx
const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '',
    title: 'Welcome!',
    content: 'Your custom welcome message',
    placement: 'center',
  },
  {
    id: 'feature-1',
    target: '.my-feature',
    title: 'Feature Name',
    content: 'Feature description',
    placement: 'bottom',
    action: {
      label: 'Try it now',
      onClick: () => handleAction(),
    },
  },
];
```

## Component Overview

### Portfolio Management
- `PortfolioList` - Grid/list view with search, filter, sort, pagination
- `PortfolioCard` - Individual portfolio card with actions
- `DeleteConfirmationModal` - Confirmation before deletion

### Version Control
- `VersionHistory` - Timeline of portfolio versions
- `VersionComparison` - Side-by-side diff viewer

### Analytics
- `PortfolioAnalytics` - Charts and metrics dashboard

### Domain & SEO
- `CustomDomainSetup` - Domain configuration with DNS verification
- `SEOSettings` - Meta tags, social previews, SEO score

### Templates & Customization
- `TemplateGallery` - Browse and select templates
- `CustomizationPanel` - Customize colors, fonts, layout

### Sharing & Export
- `SharePortfolio` - Generate public links, password protection
- `ExportOptions` - Export as PDF/ZIP/JSON

### Onboarding
- `OnboardingTour` - Step-by-step guided tour
- `WelcomeModal` - First-time user welcome
- `ContextualTooltip` - Help tooltips
- `useOnboarding` - Hook for managing onboarding state

## API Requirements

Your backend API should implement these endpoints:

### Portfolios
- `GET /api/portfolios` - List all portfolios
- `POST /api/portfolios` - Create new portfolio
- `GET /api/portfolios/:id` - Get single portfolio
- `PUT /api/portfolios/:id` - Update portfolio
- `DELETE /api/portfolios/:id` - Delete portfolio

### Analytics
- `GET /api/portfolios/:id/analytics` - Get analytics data

### SEO
- `PUT /api/portfolios/:id/seo` - Update SEO settings

### Domain
- `GET /api/check-subdomain?subdomain=...` - Check availability
- `POST /api/portfolios/:id/domain` - Add custom domain
- `POST /api/portfolios/:id/verify-dns` - Verify DNS records

### Sharing
- `PUT /api/portfolios/:id/share` - Update share settings
- `POST /api/portfolios/:id/share-link` - Generate public link
- `DELETE /api/portfolios/:id/share-link` - Revoke link

### Export
- `POST /api/portfolios/:id/export` - Export portfolio

### Versions
- `GET /api/portfolios/:id/versions` - List versions
- `POST /api/portfolios/:id/restore/:versionId` - Restore version

## TypeScript Types

All components are fully typed. Import types as needed:

```tsx
import type {
  Portfolio,
  PortfolioVersion,
  AnalyticsData,
  SEOData,
  ShareSettings,
  TourStep,
} from '@/components/portfolio';
```

## Styling

All components use Tailwind CSS classes and support dark mode out of the box. Ensure your project has:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ... other config
};
```

## Accessibility

All components include:
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

## Performance

Components use:
- React.memo for optimization
- Debounced inputs (300ms for text, 500ms for subdomain check)
- Pagination for large lists
- Lazy loading for images

## Need Help?

- Check component props in TypeScript definitions
- Review the example implementation in `PortfolioDashboardExample.tsx`
- All components include JSDoc comments with usage examples
