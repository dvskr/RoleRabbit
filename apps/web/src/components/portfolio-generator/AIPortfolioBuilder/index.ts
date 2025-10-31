// Main component export
export { default } from '../AIPortfolioBuilder';

// Types
export type * from './types/aiPortfolioBuilder';

// Components (optional exports for external use)
export { Header } from './components/Header';
export { Tabs } from './components/Tabs';
export { ChatPanel } from './components/ChatPanel';
export { StylePanel } from './components/StylePanel';
export { SectionsPanel } from './components/SectionsPanel';
export { PreviewPanel } from './components/PreviewPanel';
export { ChatMessage } from './components/ChatMessage';
export { QuickActionButton } from './components/QuickActionButton';
export { SectionItem } from './components/SectionItem';
export { ProgressSteps } from './components/ProgressSteps';
export { DesignStyleOption } from './components/DesignStyleOption';

// Hooks
export { useAIPortfolioBuilder } from './hooks/useAIPortfolioBuilder';

// Constants
export {
  DEFAULT_SECTIONS,
  STEPS,
  THEME_COLORS,
  FONTS,
  DESIGN_STYLES,
  WELCOME_MESSAGE,
  DEFAULT_AI_RESPONSE
} from './constants/aiPortfolioBuilder';

// Utils
export { generateTimestamp, createNewSection } from './utils/aiPortfolioBuilderHelpers';

