/**
 * Search Utilities
 * Provides search functionality across different resources
 */

/**
 * Search in text content
 */
function searchInText(query, text) {
  if (!query || !text) return false;
  
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  return lowerText.includes(lowerQuery);
}

/**
 * Search in array of objects
 */
function searchInObjects(query, objects, fields = []) {
  if (!query || !objects || objects.length === 0) return objects;
  
  const lowerQuery = query.toLowerCase();
  
  return objects.filter(obj => {
    if (fields.length === 0) {
      // Search in all string fields
      return Object.values(obj).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Search in specified fields
    return fields.some(field => 
      obj[field] && 
      typeof obj[field] === 'string' && 
      obj[field].toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Highlight search terms in text
 */
function highlightSearchTerms(query, text) {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Extract keywords from text
 */
function extractKeywords(text, maxKeywords = 10) {
  if (!text) return [];
  
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCount = {};
  
  words.forEach(word => {
    if (word.length > 3) { // Ignore short words
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

module.exports = {
  searchInText,
  searchInObjects,
  highlightSearchTerms,
  extractKeywords
};

