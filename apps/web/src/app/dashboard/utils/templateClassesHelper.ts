/**
 * Helper function for getting template-specific CSS classes
 */

import { resumeTemplates } from '../../../data/templates';

export interface TemplateClasses {
  container: string;
  header: string;
  nameColor: string;
  titleColor: string;
  sectionColor: string;
  accentColor: string;
}

/**
 * Get template-specific CSS classes based on template ID
 */
export function getTemplateClasses(templateId: string | null): TemplateClasses {
  const template = resumeTemplates.find(t => t.id === templateId);
  
  if (!template) {
    return {
      container: 'bg-white border-gray-300',
      header: 'border-b border-gray-300',
      nameColor: 'text-gray-900',
      titleColor: 'text-gray-700',
      sectionColor: 'text-gray-900',
      accentColor: 'text-gray-700'
    };
  }

  // Apply template styles
  const colorScheme = template.colorScheme;
  const layout = template.layout;

  let containerClass = '';
  let headerClass = '';
  let nameColor = 'text-gray-900';
  let titleColor = 'text-gray-700';
  let sectionColor = 'text-gray-900';
  let accentColor = 'text-gray-700';

  // Apply color scheme
  switch (colorScheme) {
    case 'blue':
      containerClass = 'bg-white';
      headerClass = 'border-b-2 border-blue-500';
      nameColor = 'text-gray-900';
      titleColor = 'text-blue-600';
      sectionColor = 'text-blue-600';
      accentColor = 'text-blue-600';
      break;
    case 'green':
      containerClass = 'bg-white';
      headerClass = 'border-b-2 border-green-500';
      nameColor = 'text-gray-900';
      titleColor = 'text-green-600';
      sectionColor = 'text-green-600';
      accentColor = 'text-green-600';
      break;
    case 'purple':
      containerClass = 'bg-white';
      headerClass = 'border-b-2 border-purple-500';
      nameColor = 'text-gray-900';
      titleColor = 'text-purple-600';
      sectionColor = 'text-purple-600';
      accentColor = 'text-purple-600';
      break;
    case 'red':
      containerClass = 'bg-white';
      headerClass = 'border-b-2 border-red-500';
      nameColor = 'text-gray-900';
      titleColor = 'text-red-600';
      sectionColor = 'text-red-600';
      accentColor = 'text-red-600';
      break;
    case 'orange':
      containerClass = 'bg-white';
      headerClass = 'border-b-2 border-orange-500';
      nameColor = 'text-gray-900';
      titleColor = 'text-orange-600';
      sectionColor = 'text-orange-600';
      accentColor = 'text-orange-600';
      break;
    case 'custom':
      // Custom color scheme with teal/cyan colors for visual distinction
      containerClass = 'bg-white';
      headerClass = 'border-b-2 border-teal-500';
      nameColor = 'text-gray-900';
      titleColor = 'text-teal-600';
      sectionColor = 'text-teal-600';
      accentColor = 'text-cyan-600';
      break;
    case 'monochrome':
    default:
      // Monochrome - grayscale only
      containerClass = 'bg-white';
      headerClass = 'border-b border-gray-300';
      nameColor = 'text-gray-900';
      titleColor = 'text-gray-700';
      sectionColor = 'text-gray-900';
      accentColor = 'text-gray-700';
      break;
  }

  // Apply layout (could affect padding, margins, etc.)
  if (layout === 'two-column') {
    containerClass += ' p-12';
  }

  return {
    container: containerClass,
    header: headerClass,
    nameColor,
    titleColor,
    sectionColor,
    accentColor
  };
}

