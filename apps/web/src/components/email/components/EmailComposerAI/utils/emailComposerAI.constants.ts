export const STORAGE_KEYS = {
  EMAIL_TEMPLATES: 'emailTemplates',
} as const;

export const PLACEHOLDERS = {
  RECIPIENT_EMAIL: 'Recipient email',
  CC_EMAILS: 'cc1@example.com, cc2@example.com',
  BCC_EMAILS: 'bcc1@example.com, bcc2@example.com',
  EMAIL_SUBJECT: 'Email subject',
  EMAIL_BODY: 'Write your email... Click the sparkles icon for suggestions!',
  AI_PROMPT: "Describe what you want to write about... e.g., 'Follow up on my job application for the senior developer position'",
} as const;

export const TIPS = {
  EMAIL_BODY_TIP: '💡 Tip: Use buttons above for smart suggestions, improvement, and subject generation',
  NO_TEMPLATES_MESSAGE: 'No templates available',
  CREATE_TEMPLATES_MESSAGE: 'Create templates in the Templates tab',
} as const;

export const AI_GENERATION_DELAYS = {
  GENERATE_FROM_PROMPT: 2000,
  IMPROVE_EMAIL: 1500,
  GENERATE_SUBJECT: 800,
} as const;

export const MODAL_STYLES = {
  BACKDROP: 'rgba(0, 0, 0, 0.7)',
  BACKDROP_FILTER: 'blur(4px)',
} as const;

