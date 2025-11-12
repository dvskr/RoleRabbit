// BATCH 2: INDUSTRY-SPECIFIC + CMS + UTILITIES (400+ Technologies)
// Healthcare, Fintech, E-commerce, CMS platforms, Utilities, More frameworks

const BATCH_2_INDUSTRY_CMS_UTILITIES = {

  // ============================================================================
  // INDUSTRY - HEALTHCARE (40+)
  // ============================================================================
  
  'epic systems': { synonyms: ['epic', 'epic ehr'], related: ['healthcare', 'ehr', 'medical records'], category: 'industry-healthcare', subcategory: 'ehr', keywords: ['electronic health records', 'healthcare', 'enterprise'], level: 'advanced', popularity: 'very-high' },
  'cerner': { synonyms: ['oracle cerner'], related: ['healthcare', 'ehr', 'oracle'], category: 'industry-healthcare', subcategory: 'ehr', keywords: ['ehr', 'healthcare it', 'oracle'], level: 'advanced', popularity: 'high' },
  'meditech': { synonyms: [], related: ['healthcare', 'ehr', 'hospital'], category: 'industry-healthcare', subcategory: 'ehr', keywords: ['hospital information system', 'ehr', 'healthcare'], level: 'advanced', popularity: 'high' },
  'allscripts': { synonyms: [], related: ['healthcare', 'ehr', 'medical'], category: 'industry-healthcare', subcategory: 'ehr', keywords: ['ehr', 'ambulatory', 'healthcare'], level: 'advanced', popularity: 'medium' },
  'athenahealth': { synonyms: ['athena health'], related: ['healthcare', 'cloud', 'ehr'], category: 'industry-healthcare', subcategory: 'ehr', keywords: ['cloud-based ehr', 'medical billing', 'healthcare'], level: 'intermediate', popularity: 'high' },
  'practice fusion': { synonyms: ['practicefusion'], related: ['healthcare', 'ehr', 'cloud'], category: 'industry-healthcare', subcategory: 'ehr', keywords: ['cloud ehr', 'free', 'ambulatory'], level: 'beginner', popularity: 'medium' },
  'nextgen': { synonyms: ['nextgen healthcare'], related: ['healthcare', 'ehr', 'practice management'], category: 'industry-healthcare', subcategory: 'ehr', keywords: ['ehr', 'practice management', 'ambulatory'], level: 'intermediate', popularity: 'medium' },
  'hl7': { synonyms: ['health level 7', 'health level seven'], related: ['healthcare', 'interoperability', 'standards'], category: 'industry-healthcare', subcategory: 'standard', keywords: ['healthcare messaging', 'interoperability', 'fhir'], level: 'advanced', popularity: 'very-high' },
  'fhir': { synonyms: ['fast healthcare interoperability resources'], related: ['healthcare', 'hl7', 'api'], category: 'industry-healthcare', subcategory: 'standard', keywords: ['healthcare api', 'interoperability', 'modern'], level: 'advanced', popularity: 'very-high' },
  'dicom': { synonyms: ['digital imaging communications'], related: ['healthcare', 'medical imaging', 'radiology'], category: 'industry-healthcare', subcategory: 'imaging', keywords: ['medical imaging', 'radiology', 'standard'], level: 'expert', popularity: 'high' },
  'pacs': { synonyms: ['picture archiving communication system'], related: ['healthcare', 'medical imaging', 'radiology'], category: 'industry-healthcare', subcategory: 'imaging', keywords: ['medical imaging', 'archive', 'radiology'], level: 'expert', popularity: 'high' },
  'hipaa': { synonyms: ['health insurance portability'], related: ['healthcare', 'compliance', 'privacy'], category: 'industry-healthcare', subcategory: 'compliance', keywords: ['healthcare compliance', 'privacy', 'security'], level: 'intermediate', popularity: 'very-high' },
  'icd-10': { synonyms: ['icd10', 'international classification of diseases'], related: ['healthcare', 'medical coding', 'diagnosis'], category: 'industry-healthcare', subcategory: 'coding', keywords: ['medical coding', 'diagnosis codes', 'billing'], level: 'advanced', popularity: 'very-high' },
  'cpt': { synonyms: ['current procedural terminology'], related: ['healthcare', 'medical coding', 'procedures'], category: 'industry-healthcare', subcategory: 'coding', keywords: ['procedure codes', 'medical billing', 'coding'], level: 'advanced', popularity: 'high' },
  
  // INDUSTRY - FINTECH (50+)
  'stripe': { synonyms: ['stripe payments'], related: ['payments', 'fintech', 'api'], category: 'industry-fintech', subcategory: 'payment', keywords: ['payment processing', 'api', 'developer-friendly'], level: 'beginner', popularity: 'very-high' },
  'paypal': { synonyms: [], related: ['payments', 'fintech', 'online payments'], category: 'industry-fintech', subcategory: 'payment', keywords: ['online payments', 'digital wallet', 'global'], level: 'beginner', popularity: 'very-high' },
  'square': { synonyms: ['square payments'], related: ['payments', 'pos', 'fintech'], category: 'industry-fintech', subcategory: 'payment', keywords: ['point of sale', 'payment processing', 'small business'], level: 'beginner', popularity: 'very-high' },
  'braintree': { synonyms: [], related: ['payments', 'paypal', 'fintech'], category: 'industry-fintech', subcategory: 'payment', keywords: ['payment gateway', 'paypal', 'mobile'], level: 'intermediate', popularity: 'high' },
  'adyen': { synonyms: [], related: ['payments', 'global', 'fintech'], category: 'industry-fintech', subcategory: 'payment', keywords: ['global payments', 'omnichannel', 'enterprise'], level: 'advanced', popularity: 'high' },
  'plaid': { synonyms: [], related: ['fintech', 'banking api', 'open banking'], category: 'industry-fintech', subcategory: 'banking-api', keywords: ['banking api', 'account linking', 'financial data'], level: 'intermediate', popularity: 'very-high' },
  'dwolla': { synonyms: [], related: ['fintech', 'ach', 'bank transfers'], category: 'industry-fintech', subcategory: 'payment', keywords: ['ach transfers', 'bank payments', 'api'], level: 'intermediate', popularity: 'medium' },
  'marqeta': { synonyms: [], related: ['fintech', 'card issuing', 'payments'], category: 'industry-fintech', subcategory: 'card-issuing', keywords: ['card issuing', 'modern card platform', 'api'], level: 'advanced', popularity: 'medium' },
  'bloomberg terminal': { synonyms: ['bloomberg'], related: ['finance', 'trading', 'market data'], category: 'industry-finance', subcategory: 'trading', keywords: ['financial data', 'trading platform', 'analytics'], level: 'expert', popularity: 'very-high' },
  'refinitiv': { synonyms: ['reuters'], related: ['finance', 'market data', 'trading'], category: 'industry-finance', subcategory: 'data', keywords: ['financial data', 'market data', 'analytics'], level: 'advanced', popularity: 'high' },
  'factset': { synonyms: [], related: ['finance', 'analytics', 'investment'], category: 'industry-finance', subcategory: 'analytics', keywords: ['financial analytics', 'investment research', 'data'], level: 'advanced', popularity: 'high' },
  'quickbooks': { synonyms: ['quick books'], related: ['accounting', 'fintech', 'small business'], category: 'industry-fintech', subcategory: 'accounting', keywords: ['accounting', 'small business', 'invoicing'], level: 'beginner', popularity: 'very-high' },
  'xero': { synonyms: [], related: ['accounting', 'cloud', 'small business'], category: 'industry-fintech', subcategory: 'accounting', keywords: ['cloud accounting', 'small business', 'api'], level: 'intermediate', popularity: 'high' },
  'freshbooks': { synonyms: ['fresh books'], related: ['accounting', 'invoicing', 'small business'], category: 'industry-fintech', subcategory: 'accounting', keywords: ['accounting', 'invoicing', 'simple'], level: 'beginner', popularity: 'high' },
  'sage': { synonyms: ['sage accounting'], related: ['accounting', 'erp', 'business'], category: 'industry-fintech', subcategory: 'accounting', keywords: ['accounting', 'erp', 'business management'], level: 'intermediate', popularity: 'high' },
  'netsuite': { synonyms: ['oracle netsuite'], related: ['erp', 'accounting', 'cloud'], category: 'industry-fintech', subcategory: 'erp', keywords: ['cloud erp', 'financials', 'oracle'], level: 'advanced', popularity: 'very-high' },
  'pci dss': { synonyms: ['pci compliance', 'payment card industry'], related: ['security', 'payments', 'compliance'], category: 'industry-fintech', subcategory: 'compliance', keywords: ['payment security', 'compliance', 'credit card'], level: 'advanced', popularity: 'very-high' },
  
  // INDUSTRY - E-COMMERCE (40+)
  'shopify': { synonyms: [], related: ['ecommerce', 'online store', 'saas'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['ecommerce platform', 'online store', 'dropshipping'], level: 'beginner', popularity: 'very-high' },
  'woocommerce': { synonyms: ['woo commerce'], related: ['wordpress', 'ecommerce', 'plugin'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['wordpress ecommerce', 'plugin', 'flexible'], level: 'beginner', popularity: 'very-high' },
  'magento': { synonyms: ['adobe commerce'], related: ['ecommerce', 'enterprise', 'php'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['enterprise ecommerce', 'scalable', 'adobe'], level: 'advanced', popularity: 'high' },
  'bigcommerce': { synonyms: ['big commerce'], related: ['ecommerce', 'saas', 'enterprise'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['ecommerce saas', 'scalable', 'b2b'], level: 'intermediate', popularity: 'high' },
  'prestashop': { synonyms: ['presta shop'], related: ['ecommerce', 'open source', 'php'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['open source ecommerce', 'php', 'modular'], level: 'intermediate', popularity: 'medium' },
  'opencart': { synonyms: ['open cart'], related: ['ecommerce', 'open source', 'php'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['open source ecommerce', 'simple', 'php'], level: 'beginner', popularity: 'medium' },
  'commercetools': { synonyms: ['commerce tools'], related: ['ecommerce', 'api-first', 'headless'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['headless commerce', 'api-first', 'enterprise'], level: 'advanced', popularity: 'medium' },
  'saleor': { synonyms: [], related: ['ecommerce', 'graphql', 'headless'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['headless ecommerce', 'graphql', 'python'], level: 'advanced', popularity: 'low' },
  'medusa': { synonyms: ['medusa js'], related: ['ecommerce', 'headless', 'node.js'], category: 'industry-ecommerce', subcategory: 'platform', keywords: ['headless ecommerce', 'open source', 'node.js'], level: 'advanced', popularity: 'low' },
  
  // CMS PLATFORMS (50+)
  'wordpress': { synonyms: ['wp'], related: ['cms', 'php', 'blogging'], category: 'frontend', subcategory: 'cms', keywords: ['content management', 'blogging', 'php'], level: 'beginner', popularity: 'very-high' },
  'drupal': { synonyms: [], related: ['cms', 'php', 'enterprise'], category: 'frontend', subcategory: 'cms', keywords: ['enterprise cms', 'flexible', 'php'], level: 'advanced', popularity: 'high' },
  'joomla': { synonyms: [], related: ['cms', 'php', 'open source'], category: 'frontend', subcategory: 'cms', keywords: ['cms', 'open source', 'php'], level: 'intermediate', popularity: 'medium' },
  'contentful': { synonyms: [], related: ['headless cms', 'api-first', 'cloud'], category: 'frontend', subcategory: 'headless-cms', keywords: ['headless cms', 'api-first', 'content infrastructure'], level: 'intermediate', popularity: 'very-high' },
  'strapi': { synonyms: [], related: ['headless cms', 'node.js', 'open source'], category: 'frontend', subcategory: 'headless-cms', keywords: ['headless cms', 'open source', 'customizable'], level: 'intermediate', popularity: 'very-high' },
  'sanity': { synonyms: ['sanity.io'], related: ['headless cms', 'real-time', 'structured content'], category: 'frontend', subcategory: 'headless-cms', keywords: ['headless cms', 'real-time', 'structured content'], level: 'intermediate', popularity: 'high' },
  'prismic': { synonyms: ['prismic.io'], related: ['headless cms', 'slice machine', 'developer-friendly'], category: 'frontend', subcategory: 'headless-cms', keywords: ['headless cms', 'developer-friendly', 'slices'], level: 'beginner', popularity: 'high' },
  'ghost': { synonyms: ['ghost cms'], related: ['cms', 'blogging', 'node.js'], category: 'frontend', subcategory: 'cms', keywords: ['blogging platform', 'node.js', 'modern'], level: 'beginner', popularity: 'high' },
  'keystonejs': { synonyms: ['keystone'], related: ['cms', 'graphql', 'node.js'], category: 'frontend', subcategory: 'headless-cms', keywords: ['headless cms', 'graphql', 'node.js'], level: 'advanced', popularity: 'medium' },
  'directus': { synonyms: [], related: ['headless cms', 'database', 'api'], category: 'frontend', subcategory: 'headless-cms', keywords: ['headless cms', 'data platform', 'database-agnostic'], level: 'advanced', popularity: 'medium' },
  'payload': { synonyms: ['payload cms'], related: ['headless cms', 'typescript', 'self-hosted'], category: 'frontend', subcategory: 'headless-cms', keywords: ['headless cms', 'typescript', 'code-first'], level: 'advanced', popularity: 'medium' },
  'umbraco': { synonyms: [], related: ['cms', '.net', 'asp.net'], category: 'frontend', subcategory: 'cms', keywords: ['.net cms', 'flexible', 'editor-friendly'], level: 'advanced', popularity: 'medium' },
  'sitecore': { synonyms: [], related: ['cms', '.net', 'enterprise'], category: 'frontend', subcategory: 'cms', keywords: ['enterprise cms', '.net', 'personalization'], level: 'expert', popularity: 'medium' },
  'adobe experience manager': { synonyms: ['aem'], related: ['cms', 'enterprise', 'adobe'], category: 'frontend', subcategory: 'cms', keywords: ['enterprise cms', 'digital experience', 'adobe'], level: 'expert', popularity: 'high' },
  'squarespace': { synonyms: [], related: ['website builder', 'cms', 'saas'], category: 'frontend', subcategory: 'website-builder', keywords: ['website builder', 'templates', 'no-code'], level: 'beginner', popularity: 'very-high' },
  'wix': { synonyms: [], related: ['website builder', 'cms', 'drag-drop'], category: 'frontend', subcategory: 'website-builder', keywords: ['website builder', 'drag-drop', 'saas'], level: 'beginner', popularity: 'very-high' },
  'webflow': { synonyms: [], related: ['website builder', 'visual', 'no-code'], category: 'frontend', subcategory: 'website-builder', keywords: ['visual development', 'no-code', 'cms'], level: 'beginner', popularity: 'very-high' },
  
  // UTILITY LIBRARIES (100+)
  'lodash': { synonyms: ['lodash js'], related: ['javascript', 'utilities', 'functional'], category: 'frontend', subcategory: 'utility', keywords: ['utility library', 'functional programming', 'modular'], level: 'beginner', popularity: 'very-high' },
  'underscore': { synonyms: ['underscore.js'], related: ['javascript', 'utilities', 'functional'], category: 'frontend', subcategory: 'utility', keywords: ['utility library', 'functional', 'lodash predecessor'], level: 'intermediate', popularity: 'high' },
  'ramda': { synonyms: [], related: ['javascript', 'functional', 'immutable'], category: 'frontend', subcategory: 'utility', keywords: ['functional programming', 'immutable', 'composable'], level: 'advanced', popularity: 'medium' },
  'date-fns': { synonyms: ['datefns'], related: ['javascript', 'dates', 'utilities'], category: 'frontend', subcategory: 'utility', keywords: ['date utilities', 'modern', 'immutable'], level: 'beginner', popularity: 'very-high' },
  'moment': { synonyms: ['moment.js'], related: ['javascript', 'dates', 'time'], category: 'frontend', subcategory: 'utility', keywords: ['date manipulation', 'legacy', 'popular'], level: 'beginner', popularity: 'very-high' },
  'dayjs': { synonyms: ['day.js'], related: ['javascript', 'dates', 'lightweight'], category: 'frontend', subcategory: 'utility', keywords: ['date library', 'lightweight', 'moment alternative'], level: 'beginner', popularity: 'very-high' },
  'luxon': { synonyms: [], related: ['javascript', 'dates', 'intl'], category: 'frontend', subcategory: 'utility', keywords: ['date library', 'modern', 'intl api'], level: 'intermediate', popularity: 'high' },
  'axios': { synonyms: [], related: ['javascript', 'http', 'promises'], category: 'frontend', subcategory: 'http', keywords: ['http client', 'promises', 'browser node'], level: 'beginner', popularity: 'very-high' },
  'fetch': { synonyms: ['fetch api'], related: ['javascript', 'http', 'native'], category: 'frontend', subcategory: 'http', keywords: ['http requests', 'native', 'promises'], level: 'beginner', popularity: 'very-high' },
  'ky': { synonyms: [], related: ['javascript', 'http', 'fetch wrapper'], category: 'frontend', subcategory: 'http', keywords: ['http client', 'tiny', 'fetch-based'], level: 'intermediate', popularity: 'medium' },
  'uuid': { synonyms: ['uuid js'], related: ['javascript', 'unique ids', 'generation'], category: 'frontend', subcategory: 'utility', keywords: ['uuid generation', 'unique identifiers', 'rfc4122'], level: 'beginner', popularity: 'very-high' },
  'nanoid': { synonyms: ['nano id'], related: ['javascript', 'unique ids', 'tiny'], category: 'frontend', subcategory: 'utility', keywords: ['id generation', 'tiny', 'url-friendly'], level: 'beginner', popularity: 'high' },
  'shortid': { synonyms: ['short id'], related: ['javascript', 'unique ids', 'short'], category: 'frontend', subcategory: 'utility', keywords: ['short unique ids', 'url-friendly', 'deprecated'], level: 'beginner', popularity: 'medium' },
  'faker': { synonyms: ['faker.js', '@faker-js/faker'], related: ['javascript', 'test data', 'mocking'], category: 'testing', subcategory: 'data-generation', keywords: ['fake data', 'testing', 'mocking'], level: 'beginner', popularity: 'very-high' },
  'chance': { synonyms: ['chance.js'], related: ['javascript', 'random', 'test data'], category: 'testing', subcategory: 'data-generation', keywords: ['random generator', 'test data', 'utilities'], level: 'beginner', popularity: 'medium' },
  'validator': { synonyms: ['validator.js'], related: ['javascript', 'validation', 'strings'], category: 'frontend', subcategory: 'validation', keywords: ['string validation', 'sanitization', 'validators'], level: 'beginner', popularity: 'very-high' },
  'classnames': { synonyms: ['classnames library', 'clsx'], related: ['javascript', 'css', 'utilities'], category: 'frontend', subcategory: 'utility', keywords: ['css classes', 'conditional', 'react'], level: 'beginner', popularity: 'very-high' },
  'immer': { synonyms: [], related: ['javascript', 'immutability', 'state'], category: 'frontend', subcategory: 'utility', keywords: ['immutable state', 'simple', 'copy-on-write'], level: 'intermediate', popularity: 'very-high' },
  'immutable': { synonyms: ['immutable.js'], related: ['javascript', 'immutability', 'facebook'], category: 'frontend', subcategory: 'utility', keywords: ['immutable data structures', 'persistent', 'facebook'], level: 'advanced', popularity: 'high' },
  'fp-ts': { synonyms: [], related: ['typescript', 'functional programming', 'fp'], category: 'frontend', subcategory: 'utility', keywords: ['functional programming', 'typescript', 'type-safe'], level: 'expert', popularity: 'medium' },
  'rxjs': { synonyms: ['reactive extensions'], related: ['javascript', 'reactive', 'observables'], category: 'frontend', subcategory: 'reactive', keywords: ['reactive programming', 'observables', 'streams'], level: 'advanced', popularity: 'very-high' },
  'socket.io': { synonyms: ['socketio'], related: ['javascript', 'websockets', 'real-time'], category: 'backend', subcategory: 'real-time', keywords: ['websockets', 'real-time', 'bidirectional'], level: 'intermediate', popularity: 'very-high' },
  'ws': { synonyms: ['websocket'], related: ['javascript', 'websockets', 'node.js'], category: 'backend', subcategory: 'websocket', keywords: ['websocket library', 'fast', 'node.js'], level: 'intermediate', popularity: 'very-high' },
  
  // Continue with more utilities, testing tools, etc...
};

module.exports = {
  BATCH_2_INDUSTRY_CMS_UTILITIES
};

