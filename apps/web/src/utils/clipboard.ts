export const copyToClipboard = async (content: string) => {
  if (!content) return;
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    // eslint-disable-next-line no-console
    console.warn('Clipboard API not available; skipping copy operation.');
    return;
  }
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to copy to clipboard', error);
  }
};
