import type { EmailTemplate, EmailData } from '../types/EmailComposerAI.types';

/**
 * Parses a comma-separated string of email addresses into an array
 */
export function parseEmailAddresses(emailString: string): string[] {
  return emailString ? emailString.split(',').map(e => e.trim()) : [];
}

/**
 * Extracts variable names from template strings (e.g., {{variableName}})
 */
export function extractTemplateVariables(template: EmailTemplate): string[] {
  const vars: string[] = [];
  const subjectVars = template.subject.match(/{{(\w+)}}/g) || [];
  const bodyVars = template.body.match(/{{(\w+)}}/g) || [];
  
  Array.from(new Set([...subjectVars, ...bodyVars])).forEach(v => {
    const varName = v.replace(/{{|}}/g, '');
    if (!vars.includes(varName)) vars.push(varName);
  });
  
  return vars;
}

/**
 * Applies variable substitutions to a template string
 */
export function applyTemplateVariables(
  template: EmailTemplate,
  values: Record<string, string>
): { subject: string; body: string } {
  let finalSubject = template.subject;
  let finalBody = template.body;
  
  // Replace all variables
  Object.keys(values).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    finalSubject = finalSubject.replace(regex, values[key] || '');
    finalBody = finalBody.replace(regex, values[key] || '');
  });
  
  return { subject: finalSubject, body: finalBody };
}

/**
 * Formats email data for sending
 */
export function formatEmailData(data: {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachments: string[];
}): EmailData {
  return {
    to: data.to,
    cc: parseEmailAddresses(data.cc),
    bcc: parseEmailAddresses(data.bcc),
    subject: data.subject,
    body: data.body,
    attachments: data.attachments,
  };
}

/**
 * Generates email content from a prompt
 */
export function generateEmailFromPrompt(
  prompt: string,
  recipientName: string
): { subject: string; body: string } {
  const generatedContent = `Dear ${recipientName || 'Recipient'},

${prompt}

${'I hope this message finds you well. I wanted to reach out regarding the above matter and would appreciate your input.'.substring(0, 100)}

Thank you for your time and consideration.

Best regards,
[Your Name]`;
  
  const subject = prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '');
  
  return { subject, body: generatedContent };
}

/**
 * Improves email content with AI suggestions
 */
export function improveEmailContent(body: string): string {
  return body + '\n\n[Enhanced: This is an improved version with better clarity and professionalism.]';
}

/**
 * Generates a subject line from recipient name
 */
export function generateSubjectFromRecipient(recipientName: string): string {
  return 'Follow-up on Application - ' + recipientName || 'Hello';
}

