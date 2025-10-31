/**
 * Generate timestamp for messages
 */
export const generateTimestamp = (): string => {
  return new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
  });
};

/**
 * Create a new section with unique ID
 */
export const createNewSection = (name: string = 'New Section') => {
  return {
    id: `section-${Date.now()}`,
    name,
    visible: true
  };
};

