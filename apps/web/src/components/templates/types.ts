// Types and interfaces for Templates component

export interface TemplatesProps {
  onAddToEditor?: (templateId: string) => void;
  addedTemplates?: string[];
  onRemoveTemplate?: (templateId: string) => void;
}

export type ViewMode = 'grid' | 'list';
export type TemplateViewMode = ViewMode;
export type SortOption = 'popular' | 'newest' | 'rating' | 'name';
export type TemplateSortBy = SortOption;
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TemplateDifficulty = DifficultyLevel;
export type TemplateLayout = 'single-column' | 'two-column' | 'hybrid';
export type TemplateColorScheme = 'monochrome' | 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'custom';
export type UploadSource = 'cloud' | 'system';

export interface DifficultyColor {
  text: string;
  bg: string;
  border: string;
}
