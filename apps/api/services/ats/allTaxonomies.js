// MASTER TAXONOMY COMBINER
// Uses comprehensive taxonomy with 1600+ technologies

// Import comprehensive taxonomy (contains all technologies)
const { COMPREHENSIVE_TECH_TAXONOMY } = require('./comprehensiveTaxonomy');

// Use comprehensive taxonomy directly (all technologies already included)
const ALL_TECHNOLOGIES = {
  ...COMPREHENSIVE_TECH_TAXONOMY  // ~1600+ technologies
};

// Statistics
const TAXONOMY_STATS = {
  totalTechnologies: Object.keys(ALL_TECHNOLOGIES).length,
  categories: {
    language: 0,
    frontend: 0,
    backend: 0,
    database: 0,
    cloud: 0,
    devops: 0,
    mobile: 0,
    'data-science': 0,
    'machine-learning': 0,
    security: 0,
    testing: 0,
    design: 0,
    embedded: 0,
    blockchain: 0,
    industry: 0
  },
  byLevel: {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0
  },
  byPopularity: {
    'very-high': 0,
    high: 0,
    medium: 0,
    low: 0
  }
};

// Calculate statistics
Object.entries(ALL_TECHNOLOGIES).forEach(([name, tech]) => {
  if (tech.category && TAXONOMY_STATS.categories[tech.category] !== undefined) {
    TAXONOMY_STATS.categories[tech.category]++;
  }
  if (tech.level && TAXONOMY_STATS.byLevel[tech.level] !== undefined) {
    TAXONOMY_STATS.byLevel[tech.level]++;
  }
  if (tech.popularity && TAXONOMY_STATS.byPopularity[tech.popularity] !== undefined) {
    TAXONOMY_STATS.byPopularity[tech.popularity]++;
  }
});

// Category-level concept mappings (from original taxonomy)
const CATEGORY_CONCEPTS = {
  'frontend': ['ui development', 'user interface', 'web interface', 'client side', 'browser'],
  'backend': ['server side', 'api development', 'server programming', 'backend services'],
  'fullstack': ['full stack', 'full-stack', 'end to end development'],
  'devops': ['infrastructure', 'deployment', 'automation', 'operations', 'ci cd', 'continuous integration'],
  'mobile': ['mobile development', 'mobile apps', 'ios development', 'android development', 'app development'],
  'data-science': ['data analysis', 'data analytics', 'statistical analysis', 'data manipulation'],
  'machine-learning': ['ml', 'ai', 'artificial intelligence', 'deep learning', 'neural networks', 'predictive modeling'],
  'database': ['data storage', 'database management', 'data persistence', 'sql', 'nosql'],
  'cloud': ['cloud computing', 'cloud infrastructure', 'cloud services', 'aws', 'azure', 'gcp'],
  'testing': ['quality assurance', 'qa', 'test automation', 'software testing', 'unit testing', 'e2e testing'],
  'security': ['cybersecurity', 'information security', 'application security', 'infosec', 'authentication', 'encryption'],
  'design': ['ui design', 'ux design', 'graphic design', 'visual design', 'prototyping'],
  'embedded': ['embedded systems', 'iot', 'internet of things', 'hardware programming', 'microcontrollers'],
  'blockchain': ['blockchain', 'web3', 'cryptocurrency', 'smart contracts', 'decentralized', 'defi'],
  'industry-healthcare': ['healthcare', 'medical', 'hipaa', 'ehr', 'health tech', 'clinical'],
  'industry-fintech': ['fintech', 'financial', 'banking', 'payment', 'trading', 'pci dss'],
  'industry-ecommerce': ['ecommerce', 'e-commerce', 'online store', 'retail', 'shopping'],
  'industry-gaming': ['game development', 'gaming', 'game engine', 'multiplayer'],
  'industry-education': ['edtech', 'education', 'learning', 'elearning', 'lms']
};

// Helper function to search taxonomy
function findTechnology(searchTerm) {
  const normalized = searchTerm.toLowerCase().trim();
  
  // Check canonical names
  if (ALL_TECHNOLOGIES[normalized]) {
    return { name: normalized, ...ALL_TECHNOLOGIES[normalized] };
  }
  
  // Check synonyms
  for (const [name, tech] of Object.entries(ALL_TECHNOLOGIES)) {
    if (tech.synonyms && tech.synonyms.some(syn => syn.toLowerCase() === normalized)) {
      return { name, ...tech };
    }
  }
  
  return null;
}

// Helper function to get all technologies in a category
function getTechnologiesByCategory(category) {
  return Object.entries(ALL_TECHNOLOGIES)
    .filter(([_, tech]) => tech.category === category)
    .map(([name, tech]) => ({ name, ...tech }));
}

// Helper function to get statistics
function getStatistics() {
  return {
    ...TAXONOMY_STATS,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  };
}

module.exports = {
  ALL_TECHNOLOGIES,
  CATEGORY_CONCEPTS,
  TAXONOMY_STATS,
  findTechnology,
  getTechnologiesByCategory,
  getStatistics
};
