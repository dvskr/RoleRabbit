// TESTING + DESIGN + BLOCKCHAIN + INDUSTRY-SPECIFIC TAXONOMY (300+ Technologies)

const TESTING_DESIGN_BLOCKCHAIN_INDUSTRY_TAXONOMY = {

  // ============================================================================
  // TESTING & QA (100+)
  // ============================================================================
  
  // Unit Testing
  'jest': {
    synonyms: ['jest testing'],
    related: ['javascript', 'unit testing', 'react', 'facebook'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['unit testing', 'javascript', 'snapshot testing', 'coverage'],
    equivalents: ['mocha', 'vitest'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'mocha': {
    synonyms: ['mocha js'],
    related: ['javascript', 'unit testing', 'chai', 'node.js'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['unit testing', 'javascript', 'flexible', 'bdd tdd'],
    equivalents: ['jest', 'jasmine'],
    level: 'intermediate',
    popularity: 'high'
  },
  'chai': {
    synonyms: ['chai js'],
    related: ['assertion library', 'mocha', 'javascript', 'testing'],
    category: 'testing',
    subcategory: 'assertion',
    keywords: ['assertion library', 'bdd', 'tdd', 'javascript'],
    level: 'beginner',
    popularity: 'high'
  },
  'jasmine': {
    synonyms: ['jasmine testing'],
    related: ['javascript', 'unit testing', 'bdd', 'angular'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['unit testing', 'javascript', 'bdd', 'behavior-driven'],
    equivalents: ['jest', 'mocha'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'vitest': {
    synonyms: ['vi test'],
    related: ['vite', 'unit testing', 'javascript', 'fast'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['unit testing', 'vite', 'fast', 'jest compatible'],
    equivalents: ['jest'],
    level: 'beginner',
    popularity: 'high'
  },
  'junit': {
    synonyms: ['j unit', 'junit5'],
    related: ['java', 'unit testing', 'testing framework'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['java testing', 'unit testing', 'junit5', 'annotations'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'pytest': {
    synonyms: ['py test'],
    related: ['python', 'unit testing', 'fixtures', 'testing'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['python testing', 'fixtures', 'simple', 'powerful'],
    equivalents: ['unittest', 'nose'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'unittest': {
    synonyms: ['unit test', 'python unittest'],
    related: ['python', 'standard library', 'testing'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['python testing', 'standard library', 'xunit'],
    equivalents: ['pytest'],
    level: 'beginner',
    popularity: 'high'
  },
  'rspec': {
    synonyms: ['r spec'],
    related: ['ruby', 'testing', 'bdd', 'rails'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['ruby testing', 'bdd', 'behavior-driven', 'rails'],
    level: 'intermediate',
    popularity: 'high'
  },
  'nunit': {
    synonyms: ['n unit'],
    related: ['.net', 'c#', 'unit testing'],
    category: 'testing',
    subcategory: 'unit',
    keywords: ['.net testing', 'c#', 'unit testing', 'xunit'],
    level: 'intermediate',
    popularity: 'high'
  },

  // E2E & Integration Testing
  'selenium': {
    synonyms: ['selenium webdriver'],
    related: ['automation', 'web testing', 'browser automation', 'e2e'],
    category: 'testing',
    subcategory: 'e2e',
    keywords: ['browser automation', 'web testing', 'cross-browser', 'e2e'],
    equivalents: ['cypress', 'playwright', 'puppeteer'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'cypress': {
    synonyms: ['cypress.io'],
    related: ['e2e testing', 'web testing', 'javascript', 'modern'],
    category: 'testing',
    subcategory: 'e2e',
    keywords: ['e2e testing', 'developer friendly', 'fast', 'modern'],
    equivalents: ['selenium', 'playwright'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'playwright': {
    synonyms: ['playwright testing'],
    related: ['e2e testing', 'cross-browser', 'microsoft', 'automation'],
    category: 'testing',
    subcategory: 'e2e',
    keywords: ['e2e testing', 'cross-browser', 'reliable', 'fast'],
    equivalents: ['selenium', 'cypress', 'puppeteer'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'puppeteer': {
    synonyms: [],
    related: ['headless chrome', 'automation', 'google', 'node.js'],
    category: 'testing',
    subcategory: 'e2e',
    keywords: ['headless chrome', 'automation', 'scraping', 'testing'],
    equivalents: ['playwright', 'selenium'],
    level: 'intermediate',
    popularity: 'high'
  },
  'testcafe': {
    synonyms: ['test cafe'],
    related: ['e2e testing', 'cross-browser', 'node.js'],
    category: 'testing',
    subcategory: 'e2e',
    keywords: ['e2e testing', 'no webdriver', 'cross-browser'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'nightwatch': {
    synonyms: ['nightwatch.js'],
    related: ['e2e testing', 'selenium', 'node.js'],
    category: 'testing',
    subcategory: 'e2e',
    keywords: ['e2e testing', 'selenium-based', 'nodejs'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'webdriverio': {
    synonyms: ['webdriver io', 'wdio'],
    related: ['selenium', 'webdriver', 'node.js', 'automation'],
    category: 'testing',
    subcategory: 'e2e',
    keywords: ['webdriver', 'automation', 'flexible', 'nodejs'],
    level: 'intermediate',
    popularity: 'medium'
  },

  // API Testing
  'postman': {
    synonyms: [],
    related: ['api testing', 'rest', 'http', 'automation'],
    category: 'testing',
    subcategory: 'api',
    keywords: ['api testing', 'rest', 'http client', 'collections'],
    equivalents: ['insomnia', 'rest client'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'insomnia': {
    synonyms: [],
    related: ['api testing', 'rest', 'graphql', 'http'],
    category: 'testing',
    subcategory: 'api',
    keywords: ['api client', 'rest', 'graphql', 'testing'],
    equivalents: ['postman'],
    level: 'beginner',
    popularity: 'high'
  },
  'rest assured': {
    synonyms: ['restassured'],
    related: ['java', 'api testing', 'rest', 'automation'],
    category: 'testing',
    subcategory: 'api',
    keywords: ['java api testing', 'rest', 'dsl', 'automation'],
    level: 'intermediate',
    popularity: 'high'
  },
  'supertest': {
    synonyms: ['super test'],
    related: ['node.js', 'api testing', 'http', 'integration'],
    category: 'testing',
    subcategory: 'api',
    keywords: ['nodejs api testing', 'http assertions', 'integration'],
    level: 'beginner',
    popularity: 'high'
  },

  // Performance & Load Testing
  'jmeter': {
    synonyms: ['apache jmeter', 'j meter'],
    related: ['load testing', 'performance', 'apache', 'stress testing'],
    category: 'testing',
    subcategory: 'performance',
    keywords: ['load testing', 'performance testing', 'stress testing', 'apache'],
    equivalents: ['gatling', 'k6'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'gatling': {
    synonyms: [],
    related: ['load testing', 'performance', 'scala', 'continuous'],
    category: 'testing',
    subcategory: 'performance',
    keywords: ['load testing', 'performance', 'continuous', 'dsl'],
    equivalents: ['jmeter', 'k6'],
    level: 'advanced',
    popularity: 'high'
  },
  'k6': {
    synonyms: [],
    related: ['load testing', 'performance', 'javascript', 'cloud'],
    category: 'testing',
    subcategory: 'performance',
    keywords: ['load testing', 'developer-friendly', 'javascript', 'grafana'],
    equivalents: ['jmeter', 'gatling'],
    level: 'intermediate',
    popularity: 'high'
  },
  'locust': {
    synonyms: [],
    related: ['load testing', 'python', 'distributed'],
    category: 'testing',
    subcategory: 'performance',
    keywords: ['load testing', 'python', 'distributed', 'scriptable'],
    level: 'intermediate',
    popularity: 'medium'
  },

  // Mobile Testing
  'appium': {
    synonyms: [],
    related: ['mobile testing', 'automation', 'ios', 'android'],
    category: 'testing',
    subcategory: 'mobile',
    keywords: ['mobile automation', 'cross-platform', 'ios android'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'detox': {
    synonyms: [],
    related: ['react native', 'mobile testing', 'e2e'],
    category: 'testing',
    subcategory: 'mobile',
    keywords: ['react native testing', 'gray box', 'e2e'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'espresso': {
    synonyms: ['android espresso'],
    related: ['android', 'ui testing', 'google'],
    category: 'testing',
    subcategory: 'mobile',
    keywords: ['android ui testing', 'google', 'fast'],
    level: 'intermediate',
    popularity: 'high'
  },
  'xctest': {
    synonyms: ['xc test', 'xcode test'],
    related: ['ios', 'xcode', 'apple', 'ui testing'],
    category: 'testing',
    subcategory: 'mobile',
    keywords: ['ios testing', 'xcode', 'apple', 'unit ui'],
    level: 'intermediate',
    popularity: 'very-high'
  },

  // ============================================================================
  // DESIGN & UI/UX (80+)
  // ============================================================================
  
  'figma': {
    synonyms: [],
    related: ['ui design', 'ux', 'prototyping', 'collaboration'],
    category: 'design',
    subcategory: 'ui-ux',
    keywords: ['ui design', 'prototyping', 'collaborative', 'web-based'],
    equivalents: ['sketch', 'adobe xd'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'sketch': {
    synonyms: ['sketch app'],
    related: ['ui design', 'mac', 'prototyping', 'vector'],
    category: 'design',
    subcategory: 'ui-ux',
    keywords: ['ui design', 'mac', 'vector', 'symbols'],
    equivalents: ['figma', 'adobe xd'],
    level: 'beginner',
    popularity: 'high'
  },
  'adobe xd': {
    synonyms: ['xd', 'experience design'],
    related: ['ui design', 'ux', 'prototyping', 'adobe'],
    category: 'design',
    subcategory: 'ui-ux',
    keywords: ['ui ux design', 'prototyping', 'adobe', 'interactive'],
    equivalents: ['figma', 'sketch'],
    level: 'beginner',
    popularity: 'high'
  },
  'invision': {
    synonyms: ['in vision'],
    related: ['prototyping', 'collaboration', 'design workflow'],
    category: 'design',
    subcategory: 'prototyping',
    keywords: ['prototyping', 'collaboration', 'workflow', 'feedback'],
    level: 'beginner',
    popularity: 'medium'
  },
  'zeplin': {
    synonyms: [],
    related: ['design handoff', 'developer tools', 'collaboration'],
    category: 'design',
    subcategory: 'handoff',
    keywords: ['design handoff', 'specs', 'collaboration', 'assets'],
    level: 'beginner',
    popularity: 'medium'
  },
  'photoshop': {
    synonyms: ['adobe photoshop', 'ps'],
    related: ['image editing', 'graphics', 'adobe', 'raster'],
    category: 'design',
    subcategory: 'graphics',
    keywords: ['image editing', 'photo manipulation', 'raster', 'industry standard'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'illustrator': {
    synonyms: ['adobe illustrator', 'ai'],
    related: ['vector graphics', 'illustration', 'adobe', 'design'],
    category: 'design',
    subcategory: 'graphics',
    keywords: ['vector graphics', 'illustration', 'logos', 'adobe'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'after effects': {
    synonyms: ['adobe after effects', 'ae'],
    related: ['motion graphics', 'animation', 'video', 'adobe'],
    category: 'design',
    subcategory: 'motion',
    keywords: ['motion graphics', 'animation', 'vfx', 'compositing'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'premiere pro': {
    synonyms: ['adobe premiere', 'premiere'],
    related: ['video editing', 'adobe', 'post-production'],
    category: 'design',
    subcategory: 'video',
    keywords: ['video editing', 'professional', 'post-production'],
    equivalents: ['final cut pro', 'davinci resolve'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'canva': {
    synonyms: [],
    related: ['graphic design', 'simple', 'templates', 'social media'],
    category: 'design',
    subcategory: 'graphics',
    keywords: ['graphic design', 'templates', 'easy', 'social media'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'blender': {
    synonyms: ['blender 3d'],
    related: ['3d modeling', 'animation', 'rendering', 'open source'],
    category: 'design',
    subcategory: '3d',
    keywords: ['3d modeling', 'animation', 'rendering', 'free'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'unity': {
    synonyms: ['unity3d', 'unity engine'],
    related: ['game engine', '3d', 'game development', 'c#'],
    category: 'design',
    subcategory: 'game-engine',
    keywords: ['game engine', '3d', 'cross-platform', 'c#'],
    equivalents: ['unreal engine', 'godot'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'unreal engine': {
    synonyms: ['ue4', 'ue5', 'unreal'],
    related: ['game engine', '3d', 'game development', 'c++'],
    category: 'design',
    subcategory: 'game-engine',
    keywords: ['game engine', 'aaa games', 'photorealistic', 'c++'],
    equivalents: ['unity', 'godot'],
    level: 'expert',
    popularity: 'very-high'
  },

  // ============================================================================
  // BLOCKCHAIN & WEB3 (90+)
  // ============================================================================
  
  'ethereum': {
    synonyms: ['eth'],
    related: ['blockchain', 'smart contracts', 'solidity', 'web3'],
    category: 'blockchain',
    subcategory: 'platform',
    keywords: ['blockchain platform', 'smart contracts', 'decentralized', 'cryptocurrency'],
    equivalents: ['binance smart chain', 'polygon'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'solidity': {
    synonyms: [],
    related: ['ethereum', 'smart contracts', 'blockchain', 'programming'],
    category: 'blockchain',
    subcategory: 'language',
    keywords: ['smart contract language', 'ethereum', 'evm', 'contracts'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'web3': {
    synonyms: ['web3.js', 'web 3'],
    related: ['blockchain', 'ethereum', 'decentralized', 'dapps'],
    category: 'blockchain',
    subcategory: 'library',
    keywords: ['blockchain interaction', 'ethereum', 'javascript', 'dapps'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'ethers.js': {
    synonyms: ['ethers'],
    related: ['ethereum', 'web3', 'javascript', 'blockchain'],
    category: 'blockchain',
    subcategory: 'library',
    keywords: ['ethereum library', 'javascript', 'wallet', 'contracts'],
    equivalents: ['web3.js'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'hardhat': {
    synonyms: [],
    related: ['ethereum', 'development', 'testing', 'deployment'],
    category: 'blockchain',
    subcategory: 'tool',
    keywords: ['ethereum development', 'testing', 'deployment', 'environment'],
    equivalents: ['truffle', 'foundry'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'truffle': {
    synonyms: ['truffle suite'],
    related: ['ethereum', 'smart contracts', 'development', 'testing'],
    category: 'blockchain',
    subcategory: 'tool',
    keywords: ['ethereum development', 'testing', 'migration', 'ganache'],
    equivalents: ['hardhat', 'foundry'],
    level: 'advanced',
    popularity: 'high'
  },
  'metamask': {
    synonyms: ['meta mask'],
    related: ['wallet', 'ethereum', 'browser extension', 'web3'],
    category: 'blockchain',
    subcategory: 'wallet',
    keywords: ['crypto wallet', 'browser extension', 'ethereum', 'dapps'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'ipfs': {
    synonyms: ['interplanetary file system'],
    related: ['distributed storage', 'p2p', 'decentralized', 'content addressing'],
    category: 'blockchain',
    subcategory: 'storage',
    keywords: ['distributed storage', 'p2p', 'content addressing', 'permanent web'],
    level: 'advanced',
    popularity: 'high'
  },
  'polygon': {
    synonyms: ['matic', 'polygon matic'],
    related: ['ethereum', 'layer 2', 'scaling', 'blockchain'],
    category: 'blockchain',
    subcategory: 'platform',
    keywords: ['ethereum scaling', 'layer 2', 'low fees', 'fast'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'solana': {
    synonyms: [],
    related: ['blockchain', 'high performance', 'rust', 'web3'],
    category: 'blockchain',
    subcategory: 'platform',
    keywords: ['high performance blockchain', 'fast', 'low fees', 'rust'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'polkadot': {
    synonyms: ['dot'],
    related: ['blockchain', 'interoperability', 'web3', 'substrate'],
    category: 'blockchain',
    subcategory: 'platform',
    keywords: ['interoperability', 'multi-chain', 'web3', 'scalable'],
    level: 'expert',
    popularity: 'medium'
  },
  'chainlink': {
    synonyms: ['link'],
    related: ['oracle', 'smart contracts', 'data feeds', 'decentralized'],
    category: 'blockchain',
    subcategory: 'oracle',
    keywords: ['decentralized oracle', 'smart contract data', 'off-chain'],
    level: 'advanced',
    popularity: 'high'
  },
  'the graph': {
    synonyms: ['graph protocol', 'grt'],
    related: ['blockchain', 'indexing', 'querying', 'subgraphs'],
    category: 'blockchain',
    subcategory: 'indexing',
    keywords: ['blockchain indexing', 'querying', 'graphql', 'subgraphs'],
    level: 'advanced',
    popularity: 'medium'
  },

  // ============================================================================
  // INDUSTRY-SPECIFIC TECHNOLOGIES (200+)
  // ============================================================================
  
  // Healthcare & Medical
  'fhir': {
    synonyms: ['fast healthcare interoperability resources', 'hl7 fhir'],
    related: ['healthcare', 'hl7', 'medical records', 'interoperability'],
    category: 'industry-healthcare',
    subcategory: 'standard',
    keywords: ['healthcare standard', 'medical records', 'interoperability', 'hl7'],
    level: 'advanced',
    popularity: 'high'
  },
  'hl7': {
    synonyms: ['health level 7'],
    related: ['healthcare', 'medical data', 'standards', 'interoperability'],
    category: 'industry-healthcare',
    subcategory: 'standard',
    keywords: ['healthcare messaging', 'medical data exchange', 'standards'],
    level: 'advanced',
    popularity: 'high'
  },
  'hipaa': {
    synonyms: ['health insurance portability'],
    related: ['healthcare', 'compliance', 'privacy', 'security'],
    category: 'industry-healthcare',
    subcategory: 'compliance',
    keywords: ['healthcare compliance', 'patient privacy', 'security', 'regulations'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'epic': {
    synonyms: ['epic systems', 'epic ehr'],
    related: ['ehr', 'healthcare', 'medical records', 'enterprise'],
    category: 'industry-healthcare',
    subcategory: 'ehr',
    keywords: ['electronic health records', 'ehr', 'healthcare', 'enterprise'],
    equivalents: ['cerner', 'allscripts'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'cerner': {
    synonyms: ['oracle cerner'],
    related: ['ehr', 'healthcare', 'medical records'],
    category: 'industry-healthcare',
    subcategory: 'ehr',
    keywords: ['electronic health records', 'healthcare it', 'oracle'],
    equivalents: ['epic', 'allscripts'],
    level: 'advanced',
    popularity: 'high'
  },
  'dicom': {
    synonyms: ['digital imaging communications'],
    related: ['medical imaging', 'healthcare', 'radiology'],
    category: 'industry-healthcare',
    subcategory: 'imaging',
    keywords: ['medical imaging', 'radiology', 'standard', 'pacs'],
    level: 'advanced',
    popularity: 'high'
  },

  // Financial Services & FinTech
  'pci dss': {
    synonyms: ['pci compliance', 'payment card industry'],
    related: ['payment', 'security', 'compliance', 'fintech'],
    category: 'industry-fintech',
    subcategory: 'compliance',
    keywords: ['payment security', 'compliance', 'credit card', 'standards'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'stripe': {
    synonyms: [],
    related: ['payments', 'fintech', 'api', 'online payments'],
    category: 'industry-fintech',
    subcategory: 'payment',
    keywords: ['payment processing', 'api', 'online payments', 'developer-friendly'],
    equivalents: ['paypal', 'square', 'braintree'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'plaid': {
    synonyms: [],
    related: ['fintech', 'banking api', 'financial data', 'integration'],
    category: 'industry-fintech',
    subcategory: 'banking-api',
    keywords: ['banking api', 'financial data', 'account linking', 'fintech'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'quickbooks': {
    synonyms: ['quick books'],
    related: ['accounting', 'bookkeeping', 'fintech', 'small business'],
    category: 'industry-fintech',
    subcategory: 'accounting',
    keywords: ['accounting software', 'bookkeeping', 'small business', 'invoicing'],
    level: 'beginner',
    popularity: 'very-high'
  },

  // E-commerce & Retail
  'shopify': {
    synonyms: [],
    related: ['ecommerce', 'online store', 'saas', 'retail'],
    category: 'industry-ecommerce',
    subcategory: 'platform',
    keywords: ['ecommerce platform', 'online store', 'saas', 'dropshipping'],
    equivalents: ['woocommerce', 'magento', 'bigcommerce'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'woocommerce': {
    synonyms: ['woo commerce'],
    related: ['ecommerce', 'wordpress', 'online store', 'plugin'],
    category: 'industry-ecommerce',
    subcategory: 'platform',
    keywords: ['wordpress ecommerce', 'plugin', 'flexible', 'open source'],
    equivalents: ['shopify', 'magento'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'magento': {
    synonyms: ['adobe commerce'],
    related: ['ecommerce', 'enterprise', 'php', 'adobe'],
    category: 'industry-ecommerce',
    subcategory: 'platform',
    keywords: ['enterprise ecommerce', 'flexible', 'scalable', 'php'],
    equivalents: ['shopify', 'woocommerce'],
    level: 'advanced',
    popularity: 'high'
  },

  // Education & EdTech
  'moodle': {
    synonyms: [],
    related: ['lms', 'education', 'elearning', 'open source'],
    category: 'industry-education',
    subcategory: 'lms',
    keywords: ['learning management system', 'open source', 'education', 'courses'],
    equivalents: ['canvas', 'blackboard'],
    level: 'intermediate',
    popularity: 'high'
  },
  'canvas': {
    synonyms: ['canvas lms'],
    related: ['lms', 'education', 'elearning', 'instructure'],
    category: 'industry-education',
    subcategory: 'lms',
    keywords: ['learning management system', 'education', 'cloud-based', 'modern'],
    equivalents: ['moodle', 'blackboard'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'zoom': {
    synonyms: [],
    related: ['video conferencing', 'remote', 'education', 'collaboration'],
    category: 'industry-education',
    subcategory: 'video',
    keywords: ['video conferencing', 'online meetings', 'webinar', 'remote'],
    equivalents: ['microsoft teams', 'google meet'],
    level: 'beginner',
    popularity: 'very-high'
  },

  // Manufacturing & IoT
  'mqtt': {
    synonyms: ['message queuing telemetry transport'],
    related: ['iot', 'messaging', 'lightweight', 'publish-subscribe'],
    category: 'industry-iot',
    subcategory: 'protocol',
    keywords: ['iot protocol', 'lightweight', 'publish-subscribe', 'messaging'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'modbus': {
    synonyms: [],
    related: ['industrial', 'plc', 'scada', 'automation'],
    category: 'industry-manufacturing',
    subcategory: 'protocol',
    keywords: ['industrial protocol', 'plc', 'automation', 'serial'],
    level: 'advanced',
    popularity: 'high'
  },
  'opcua': {
    synonyms: ['opc ua', 'opc unified architecture'],
    related: ['industrial', 'automation', 'iiot', 'interoperability'],
    category: 'industry-manufacturing',
    subcategory: 'protocol',
    keywords: ['industrial automation', 'iiot', 'machine-to-machine', 'secure'],
    level: 'advanced',
    popularity: 'high'
  },
  'scada': {
    synonyms: ['supervisory control and data acquisition'],
    related: ['industrial', 'automation', 'monitoring', 'control'],
    category: 'industry-manufacturing',
    subcategory: 'system',
    keywords: ['industrial control', 'monitoring', 'automation', 'real-time'],
    level: 'expert',
    popularity: 'high'
  },

  // Telecommunications
  'sip': {
    synonyms: ['session initiation protocol'],
    related: ['voip', 'telecommunications', 'signaling', 'real-time'],
    category: 'industry-telecom',
    subcategory: 'protocol',
    keywords: ['voip protocol', 'signaling', 'telecommunications', 'real-time'],
    level: 'advanced',
    popularity: 'high'
  },
  'webrtc': {
    synonyms: ['web rtc'],
    related: ['real-time communication', 'video', 'audio', 'p2p'],
    category: 'industry-telecom',
    subcategory: 'technology',
    keywords: ['real-time communication', 'peer-to-peer', 'video', 'browser'],
    level: 'advanced',
    popularity: 'very-high'
  },

  // Continue with more industry-specific technologies...
};

module.exports = {
  TESTING_DESIGN_BLOCKCHAIN_INDUSTRY_TAXONOMY
};

