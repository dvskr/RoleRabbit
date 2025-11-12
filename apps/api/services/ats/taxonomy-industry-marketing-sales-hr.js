// INDUSTRY: MARKETING, SALES & HR (200+ Technologies)
// CRM, Marketing Automation, Analytics, HR Systems, Payroll, Recruiting

const INDUSTRY_MARKETING_SALES_HR = {

  // ============================================================================
  // CRM & SALES (50+)
  // ============================================================================
  
  'salesforce': { synonyms: ['sfdc', 'sales force'], related: ['crm', 'cloud', 'sales automation'], category: 'industry-sales', subcategory: 'crm', keywords: ['crm', 'sales cloud', 'customer relationship'], level: 'intermediate', popularity: 'very-high' },
  'hubspot': { synonyms: ['hub spot'], related: ['crm', 'inbound', 'marketing'], category: 'industry-sales', subcategory: 'crm', keywords: ['inbound marketing', 'crm', 'sales'], level: 'beginner', popularity: 'very-high' },
  'zoho crm': { synonyms: ['zoho'], related: ['crm', 'cloud', 'affordable'], category: 'industry-sales', subcategory: 'crm', keywords: ['crm', 'affordable', 'cloud'], level: 'beginner', popularity: 'high' },
  'pipedrive': { synonyms: ['pipe drive'], related: ['crm', 'pipeline', 'sales'], category: 'industry-sales', subcategory: 'crm', keywords: ['pipeline management', 'crm', 'visual'], level: 'beginner', popularity: 'high' },
  'microsoft dynamics 365': { synonyms: ['dynamics', 'dynamics crm'], related: ['crm', 'erp', 'microsoft'], category: 'industry-sales', subcategory: 'crm', keywords: ['enterprise crm', 'erp', 'microsoft'], level: 'advanced', popularity: 'very-high' },
  'oracle siebel': { synonyms: ['siebel'], related: ['crm', 'enterprise', 'oracle'], category: 'industry-sales', subcategory: 'crm', keywords: ['enterprise crm', 'oracle', 'legacy'], level: 'expert', popularity: 'medium' },
  'sap crm': { synonyms: ['sap customer experience'], related: ['crm', 'sap', 'enterprise'], category: 'industry-sales', subcategory: 'crm', keywords: ['enterprise crm', 'sap', 'integrated'], level: 'expert', popularity: 'high' },
  'copper': { synonyms: ['copper crm', 'prosperworks'], related: ['crm', 'google workspace', 'sales'], category: 'industry-sales', subcategory: 'crm', keywords: ['google workspace crm', 'sales', 'simple'], level: 'beginner', popularity: 'medium' },
  'close': { synonyms: ['close crm', 'close.com'], related: ['crm', 'inside sales', 'sme'], category: 'industry-sales', subcategory: 'crm', keywords: ['inside sales crm', 'sme', 'calling'], level: 'beginner', popularity: 'medium' },
  'insightly': { synonyms: [], related: ['crm', 'project management', 'small business'], category: 'industry-sales', subcategory: 'crm', keywords: ['crm', 'project management', 'small business'], level: 'beginner', popularity: 'medium' },
  
  // MARKETING AUTOMATION (30+)
  'marketo': { synonyms: ['adobe marketo'], related: ['marketing automation', 'adobe', 'b2b'], category: 'industry-marketing', subcategory: 'automation', keywords: ['marketing automation', 'b2b', 'engagement'], level: 'advanced', popularity: 'very-high' },
  'pardot': { synonyms: ['salesforce pardot'], related: ['marketing automation', 'b2b', 'salesforce'], category: 'industry-marketing', subcategory: 'automation', keywords: ['b2b marketing automation', 'salesforce', 'lead generation'], level: 'advanced', popularity: 'high' },
  'eloqua': { synonyms: ['oracle eloqua'], related: ['marketing automation', 'enterprise', 'oracle'], category: 'industry-marketing', subcategory: 'automation', keywords: ['enterprise marketing automation', 'oracle', 'b2b'], level: 'expert', popularity: 'high' },
  'activecampaign': { synonyms: ['active campaign'], related: ['marketing automation', 'email', 'sme'], category: 'industry-marketing', subcategory: 'automation', keywords: ['marketing automation', 'email', 'affordable'], level: 'intermediate', popularity: 'high' },
  'mailchimp': { synonyms: ['mail chimp'], related: ['email marketing', 'automation', 'small business'], category: 'industry-marketing', subcategory: 'email', keywords: ['email marketing', 'small business', 'easy'], level: 'beginner', popularity: 'very-high' },
  'constant contact': { synonyms: [], related: ['email marketing', 'small business'], category: 'industry-marketing', subcategory: 'email', keywords: ['email marketing', 'small business', 'simple'], level: 'beginner', popularity: 'high' },
  'sendgrid': { synonyms: ['send grid', 'twilio sendgrid'], related: ['email', 'transactional', 'api'], category: 'industry-marketing', subcategory: 'email', keywords: ['transactional email', 'api', 'deliverability'], level: 'intermediate', popularity: 'very-high' },
  'campaign monitor': { synonyms: [], related: ['email marketing', 'templates', 'design'], category: 'industry-marketing', subcategory: 'email', keywords: ['email marketing', 'beautiful templates', 'design'], level: 'beginner', popularity: 'medium' },
  'klaviyo': { synonyms: [], related: ['email marketing', 'ecommerce', 'automation'], category: 'industry-marketing', subcategory: 'email', keywords: ['ecommerce email', 'sms', 'automation'], level: 'intermediate', popularity: 'very-high' },
  'drip': { synonyms: [], related: ['email marketing', 'ecommerce', 'automation'], category: 'industry-marketing', subcategory: 'email', keywords: ['ecommerce crm', 'email automation', 'personalization'], level: 'intermediate', popularity: 'medium' },
  
  // ANALYTICS & SEO (40+)
  'google analytics': { synonyms: ['ga', 'ga4', 'universal analytics'], related: ['analytics', 'web', 'google'], category: 'industry-marketing', subcategory: 'analytics', keywords: ['web analytics', 'google', 'traffic analysis'], level: 'intermediate', popularity: 'very-high' },
  'google tag manager': { synonyms: ['gtm'], related: ['analytics', 'tag management', 'google'], category: 'industry-marketing', subcategory: 'analytics', keywords: ['tag management', 'tracking', 'google'], level: 'intermediate', popularity: 'very-high' },
  'adobe analytics': { synonyms: ['omniture'], related: ['analytics', 'enterprise', 'adobe'], category: 'industry-marketing', subcategory: 'analytics', keywords: ['enterprise analytics', 'adobe', 'digital'], level: 'expert', popularity: 'high' },
  'mixpanel': { synonyms: [], related: ['product analytics', 'events', 'cohorts'], category: 'industry-marketing', subcategory: 'analytics', keywords: ['product analytics', 'event tracking', 'funnels'], level: 'intermediate', popularity: 'very-high' },
  'amplitude': { synonyms: [], related: ['product analytics', 'behavioral', 'retention'], category: 'industry-marketing', subcategory: 'analytics', keywords: ['product analytics', 'behavioral', 'growth'], level: 'intermediate', popularity: 'very-high' },
  'heap': { synonyms: ['heap analytics'], related: ['product analytics', 'automatic', 'retroactive'], category: 'industry-marketing', subcategory: 'analytics', keywords: ['autocapture', 'retroactive analysis', 'product'], level: 'intermediate', popularity: 'high' },
  'segment': { synonyms: ['segment cdp'], related: ['cdp', 'data', 'integration'], category: 'industry-marketing', subcategory: 'cdp', keywords: ['customer data platform', 'integration', 'data pipeline'], level: 'advanced', popularity: 'very-high' },
  'mparticle': { synonyms: ['m particle'], related: ['cdp', 'data', 'mobile'], category: 'industry-marketing', subcategory: 'cdp', keywords: ['customer data', 'mobile', 'real-time'], level: 'advanced', popularity: 'medium' },
  'semrush': { synonyms: ['sem rush'], related: ['seo', 'competitor analysis', 'keywords'], category: 'industry-marketing', subcategory: 'seo', keywords: ['seo tools', 'competitor research', 'keywords'], level: 'intermediate', popularity: 'very-high' },
  'ahrefs': { synonyms: [], related: ['seo', 'backlinks', 'research'], category: 'industry-marketing', subcategory: 'seo', keywords: ['seo', 'backlink analysis', 'research'], level: 'intermediate', popularity: 'very-high' },
  'moz': { synonyms: ['moz pro'], related: ['seo', 'domain authority', 'tools'], category: 'industry-marketing', subcategory: 'seo', keywords: ['seo tools', 'domain authority', 'ranking'], level: 'intermediate', popularity: 'high' },
  'screaming frog': { synonyms: ['screaming frog seo spider'], related: ['seo', 'crawler', 'technical'], category: 'industry-marketing', subcategory: 'seo', keywords: ['seo crawler', 'technical seo', 'audit'], level: 'advanced', popularity: 'high' },
  'google search console': { synonyms: ['gsc', 'webmaster tools'], related: ['seo', 'google', 'search'], category: 'industry-marketing', subcategory: 'seo', keywords: ['search performance', 'google', 'indexing'], level: 'beginner', popularity: 'very-high' },
  
  // SOCIAL MEDIA (15+)
  'hootsuite': { synonyms: [], related: ['social media', 'scheduling', 'management'], category: 'industry-marketing', subcategory: 'social', keywords: ['social media management', 'scheduling', 'analytics'], level: 'beginner', popularity: 'very-high' },
  'buffer': { synonyms: [], related: ['social media', 'scheduling', 'simple'], category: 'industry-marketing', subcategory: 'social', keywords: ['social media scheduling', 'simple', 'analytics'], level: 'beginner', popularity: 'high' },
  'sprout social': { synonyms: [], related: ['social media', 'enterprise', 'analytics'], category: 'industry-marketing', subcategory: 'social', keywords: ['enterprise social', 'analytics', 'engagement'], level: 'intermediate', popularity: 'high' },
  'later': { synonyms: [], related: ['instagram', 'scheduling', 'visual'], category: 'industry-marketing', subcategory: 'social', keywords: ['instagram scheduling', 'visual planner', 'social'], level: 'beginner', popularity: 'high' },
  'meta business suite': { synonyms: ['facebook business', 'creator studio'], related: ['facebook', 'instagram', 'ads'], category: 'industry-marketing', subcategory: 'social', keywords: ['facebook instagram', 'business tools', 'meta'], level: 'beginner', popularity: 'very-high' },
  
  // AD PLATFORMS (15+)
  'google ads': { synonyms: ['google adwords', 'adwords'], related: ['ppc', 'search ads', 'google'], category: 'industry-marketing', subcategory: 'advertising', keywords: ['ppc', 'search advertising', 'google'], level: 'intermediate', popularity: 'very-high' },
  'facebook ads manager': { synonyms: ['meta ads', 'facebook ads'], related: ['social ads', 'facebook', 'meta'], category: 'industry-marketing', subcategory: 'advertising', keywords: ['social advertising', 'facebook', 'targeting'], level: 'intermediate', popularity: 'very-high' },
  'linkedin campaign manager': { synonyms: ['linkedin ads'], related: ['b2b ads', 'linkedin', 'professional'], category: 'industry-marketing', subcategory: 'advertising', keywords: ['b2b advertising', 'linkedin', 'professional'], level: 'intermediate', popularity: 'high' },
  'twitter ads': { synonyms: ['x ads'], related: ['social ads', 'twitter', 'promoted'], category: 'industry-marketing', subcategory: 'advertising', keywords: ['twitter advertising', 'promoted tweets', 'social'], level: 'beginner', popularity: 'medium' },
  'tiktok ads': { synonyms: ['tiktok for business'], related: ['social ads', 'video', 'tiktok'], category: 'industry-marketing', subcategory: 'advertising', keywords: ['tiktok advertising', 'video ads', 'social'], level: 'intermediate', popularity: 'very-high' },
  
  // ============================================================================
  // HUMAN RESOURCES (70+)
  // ============================================================================
  
  // ATS & RECRUITING (25+)
  'greenhouse': { synonyms: [], related: ['ats', 'recruiting', 'hiring'], category: 'industry-hr', subcategory: 'ats', keywords: ['applicant tracking', 'recruiting', 'hiring'], level: 'intermediate', popularity: 'very-high' },
  'lever': { synonyms: [], related: ['ats', 'recruiting', 'crm'], category: 'industry-hr', subcategory: 'ats', keywords: ['ats', 'recruiting crm', 'talent'], level: 'intermediate', popularity: 'very-high' },
  'workday recruiting': { synonyms: [], related: ['ats', 'workday', 'enterprise'], category: 'industry-hr', subcategory: 'ats', keywords: ['enterprise ats', 'workday', 'recruiting'], level: 'advanced', popularity: 'very-high' },
  'icims': { synonyms: ['i cims'], related: ['ats', 'talent cloud', 'recruiting'], category: 'industry-hr', subcategory: 'ats', keywords: ['talent acquisition', 'ats', 'enterprise'], level: 'advanced', popularity: 'high' },
  'taleo': { synonyms: ['oracle taleo'], related: ['ats', 'oracle', 'enterprise'], category: 'industry-hr', subcategory: 'ats', keywords: ['enterprise ats', 'oracle', 'recruiting'], level: 'advanced', popularity: 'high' },
  'jobvite': { synonyms: [], related: ['ats', 'recruiting', 'social'], category: 'industry-hr', subcategory: 'ats', keywords: ['social recruiting', 'ats', 'talent acquisition'], level: 'intermediate', popularity: 'high' },
  'smartrecruiters': { synonyms: ['smart recruiters'], related: ['ats', 'recruiting', 'marketplace'], category: 'industry-hr', subcategory: 'ats', keywords: ['talent acquisition', 'marketplace', 'ats'], level: 'intermediate', popularity: 'high' },
  'ashby': { synonyms: [], related: ['ats', 'analytics', 'modern'], category: 'industry-hr', subcategory: 'ats', keywords: ['modern ats', 'analytics-first', 'recruiting'], level: 'intermediate', popularity: 'medium' },
  'breezy hr': { synonyms: ['breezy'], related: ['ats', 'sme', 'affordable'], category: 'industry-hr', subcategory: 'ats', keywords: ['affordable ats', 'sme', 'recruiting'], level: 'beginner', popularity: 'medium' },
  'recruitee': { synonyms: [], related: ['ats', 'collaborative', 'europe'], category: 'industry-hr', subcategory: 'ats', keywords: ['collaborative ats', 'europe', 'talent'], level: 'intermediate', popularity: 'medium' },
  
  // HRIS (20+)
  'workday': { synonyms: ['workday hcm'], related: ['hris', 'erp', 'cloud'], category: 'industry-hr', subcategory: 'hris', keywords: ['enterprise hris', 'cloud', 'human capital'], level: 'expert', popularity: 'very-high' },
  'bamboohr': { synonyms: ['bamboo hr'], related: ['hris', 'sme', 'user-friendly'], category: 'industry-hr', subcategory: 'hris', keywords: ['sme hris', 'user-friendly', 'cloud'], level: 'beginner', popularity: 'very-high' },
  'namely': { synonyms: [], related: ['hris', 'payroll', 'benefits'], category: 'industry-hr', subcategory: 'hris', keywords: ['modern hr', 'payroll', 'benefits'], level: 'intermediate', popularity: 'medium' },
  'adp': { synonyms: ['adp workforce now'], related: ['payroll', 'hris', 'benefits'], category: 'industry-hr', subcategory: 'payroll', keywords: ['payroll', 'hr management', 'enterprise'], level: 'intermediate', popularity: 'very-high' },
  'paychex': { synonyms: ['pay chex'], related: ['payroll', 'hris', 'sme'], category: 'industry-hr', subcategory: 'payroll', keywords: ['payroll services', 'sme', 'hr'], level: 'beginner', popularity: 'high' },
  'gusto': { synonyms: [], related: ['payroll', 'benefits', 'sme'], category: 'industry-hr', subcategory: 'payroll', keywords: ['payroll', 'benefits', 'simple'], level: 'beginner', popularity: 'very-high' },
  'rippling': { synonyms: [], related: ['hris', 'payroll', 'it management'], category: 'industry-hr', subcategory: 'hris', keywords: ['unified workforce', 'payroll', 'it'], level: 'intermediate', popularity: 'very-high' },
  'zenefits': { synonyms: [], related: ['hris', 'benefits', 'sme'], category: 'industry-hr', subcategory: 'hris', keywords: ['hr platform', 'benefits', 'sme'], level: 'beginner', popularity: 'high' },
  'justworks': { synonyms: ['just works'], related: ['peo', 'payroll', 'benefits'], category: 'industry-hr', subcategory: 'peo', keywords: ['peo', 'payroll', 'compliance'], level: 'beginner', popularity: 'high' },
  'trinet': { synonyms: ['tri net'], related: ['peo', 'hr outsourcing', 'payroll'], category: 'industry-hr', subcategory: 'peo', keywords: ['peo', 'hr outsourcing', 'enterprise'], level: 'intermediate', popularity: 'high' },
  'oracle hcm': { synonyms: ['oracle human capital management'], related: ['hris', 'erp', 'oracle'], category: 'industry-hr', subcategory: 'hris', keywords: ['enterprise hcm', 'oracle', 'cloud'], level: 'expert', popularity: 'high' },
  'sap successfactors': { synonyms: ['successfactors'], related: ['hcm', 'sap', 'enterprise'], category: 'industry-hr', subcategory: 'hcm', keywords: ['enterprise hcm', 'sap', 'talent'], level: 'expert', popularity: 'very-high' },
  
  // LEARNING & DEVELOPMENT (15+)
  'cornerstone': { synonyms: ['cornerstone ondemand'], related: ['lms', 'talent', 'learning'], category: 'industry-hr', subcategory: 'lms', keywords: ['learning management', 'talent development', 'enterprise'], level: 'advanced', popularity: 'high' },
  'docebo': { synonyms: [], related: ['lms', 'ai', 'learning'], category: 'industry-hr', subcategory: 'lms', keywords: ['ai-powered lms', 'social learning', 'modern'], level: 'intermediate', popularity: 'high' },
  'talentlms': { synonyms: ['talent lms'], related: ['lms', 'training', 'sme'], category: 'industry-hr', subcategory: 'lms', keywords: ['simple lms', 'training', 'affordable'], level: 'beginner', popularity: 'medium' },
  'workday learning': { synonyms: [], related: ['lms', 'workday', 'integrated'], category: 'industry-hr', subcategory: 'lms', keywords: ['enterprise learning', 'workday', 'integrated'], level: 'advanced', popularity: 'high' },
  'linkedin learning': { synonyms: ['lynda'], related: ['online courses', 'professional development'], category: 'industry-hr', subcategory: 'learning', keywords: ['online learning', 'professional', 'video courses'], level: 'beginner', popularity: 'very-high' },
  
  // PERFORMANCE MANAGEMENT (10+)
  '15five': { synonyms: ['fifteen five'], related: ['performance', 'okr', 'feedback'], category: 'industry-hr', subcategory: 'performance', keywords: ['performance management', 'okr', 'continuous feedback'], level: 'intermediate', popularity: 'high' },
  'lattice': { synonyms: [], related: ['performance', 'engagement', 'goals'], category: 'industry-hr', subcategory: 'performance', keywords: ['performance management', 'engagement', 'growth'], level: 'intermediate', popularity: 'high' },
  'culture amp': { synonyms: [], related: ['engagement', 'surveys', 'performance'], category: 'industry-hr', subcategory: 'engagement', keywords: ['employee engagement', 'surveys', 'analytics'], level: 'intermediate', popularity: 'high' },
  'betterworks': { synonyms: ['better works'], related: ['okr', 'performance', 'goals'], category: 'industry-hr', subcategory: 'performance', keywords: ['okr', 'continuous performance', 'engagement'], level: 'intermediate', popularity: 'medium' },
  'reflektive': { synonyms: [], related: ['performance', 'feedback', 'recognition'], category: 'industry-hr', subcategory: 'performance', keywords: ['performance management', 'recognition', 'feedback'], level: 'intermediate', popularity: 'medium' },

};

module.exports = {
  INDUSTRY_MARKETING_SALES_HR
};

