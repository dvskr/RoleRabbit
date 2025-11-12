// COMPREHENSIVE TECHNOLOGY TAXONOMY
// Maps technologies to synonyms, categories, and relationships
// Used for semantic matching in ATS scoring

/**
 * Technology Taxonomy Structure:
 * {
 *   canonicalName: {
 *     synonyms: [],      // Alternative names
 *     related: [],       // Related technologies
 *     category: '',      // Primary category
 *     subcategory: '',   // Subcategory
 *     keywords: [],      // Common phrases
 *     level: '',         // Typical skill level requirement
 *   }
 * }
 */

// Import comprehensive taxonomies
const { BACKEND_TAXONOMY } = require('./taxonomy-backend');
const { COMPREHENSIVE_TECH_TAXONOMY } = require('./comprehensiveTaxonomy');

// Merge all taxonomies
const TECHNOLOGY_TAXONOMY = {
  ...COMPREHENSIVE_TECH_TAXONOMY,
  ...BACKEND_TAXONOMY,
  // ============================================================================
  // FRONTEND FRAMEWORKS & LIBRARIES
  // ============================================================================
  'react': {
    synonyms: ['reactjs', 'react.js', 'react js'],
    related: ['jsx', 'hooks', 'redux', 'next.js', 'gatsby', 'react native'],
    category: 'frontend',
    subcategory: 'framework',
    keywords: ['component', 'virtual dom', 'spa', 'single page application'],
    equivalents: ['vue', 'angular', 'svelte'],
    level: 'intermediate'
  },
  'vue': {
    synonyms: ['vuejs', 'vue.js', 'vue js'],
    related: ['vuex', 'nuxt', 'vue router', 'composition api'],
    category: 'frontend',
    subcategory: 'framework',
    keywords: ['component', 'reactive', 'spa'],
    equivalents: ['react', 'angular', 'svelte'],
    level: 'intermediate'
  },
  'angular': {
    synonyms: ['angularjs', 'angular.js', 'angular 2+'],
    related: ['typescript', 'rxjs', 'ngrx', 'angular material'],
    category: 'frontend',
    subcategory: 'framework',
    keywords: ['component', 'directive', 'spa', 'dependency injection'],
    equivalents: ['react', 'vue', 'svelte'],
    level: 'intermediate'
  },
  'next.js': {
    synonyms: ['nextjs', 'next'],
    related: ['react', 'ssr', 'vercel', 'server components'],
    category: 'frontend',
    subcategory: 'framework',
    keywords: ['server side rendering', 'static site generation', 'hybrid'],
    level: 'advanced'
  },

  // ============================================================================
  // BACKEND FRAMEWORKS
  // ============================================================================
  'node.js': {
    synonyms: ['nodejs', 'node'],
    related: ['express', 'nestjs', 'fastify', 'koa', 'npm'],
    category: 'backend',
    subcategory: 'runtime',
    keywords: ['javascript runtime', 'event driven', 'non-blocking'],
    level: 'intermediate'
  },
  'express': {
    synonyms: ['expressjs', 'express.js'],
    related: ['node.js', 'middleware', 'routing'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['web framework', 'rest api', 'http server'],
    equivalents: ['fastify', 'koa', 'hapi'],
    level: 'beginner'
  },
  'django': {
    synonyms: ['django framework'],
    related: ['python', 'orm', 'django rest framework', 'drf'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'orm', 'admin panel', 'batteries included'],
    equivalents: ['flask', 'fastapi', 'rails'],
    level: 'intermediate'
  },
  'flask': {
    synonyms: ['flask framework'],
    related: ['python', 'wsgi', 'jinja2', 'werkzeug'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['micro framework', 'lightweight', 'rest api'],
    equivalents: ['django', 'fastapi', 'bottle'],
    level: 'beginner'
  },
  'fastapi': {
    synonyms: ['fast api'],
    related: ['python', 'pydantic', 'async', 'openapi'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['async', 'modern', 'type hints', 'automatic docs'],
    equivalents: ['flask', 'django', 'express'],
    level: 'intermediate'
  },
  'spring boot': {
    synonyms: ['springboot', 'spring'],
    related: ['java', 'spring framework', 'hibernate', 'maven'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['enterprise', 'microservices', 'dependency injection'],
    level: 'advanced'
  },
  'ruby on rails': {
    synonyms: ['rails', 'ror'],
    related: ['ruby', 'active record', 'gem'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'convention over configuration', 'web framework'],
    level: 'intermediate'
  },

  // ============================================================================
  // DATABASES
  // ============================================================================
  'postgresql': {
    synonyms: ['postgres', 'psql'],
    related: ['sql', 'relational database', 'pgadmin', 'postgis'],
    category: 'database',
    subcategory: 'relational',
    keywords: ['acid', 'transactions', 'jsonb', 'advanced sql'],
    equivalents: ['mysql', 'mariadb', 'oracle'],
    level: 'intermediate'
  },
  'mysql': {
    synonyms: ['my sql'],
    related: ['sql', 'relational database', 'mariadb'],
    category: 'database',
    subcategory: 'relational',
    keywords: ['rdbms', 'innodb', 'acid'],
    equivalents: ['postgresql', 'mariadb', 'sqlite'],
    level: 'beginner'
  },
  'mongodb': {
    synonyms: ['mongo'],
    related: ['nosql', 'document database', 'mongoose', 'atlas'],
    category: 'database',
    subcategory: 'nosql',
    keywords: ['document store', 'json', 'bson', 'flexible schema'],
    equivalents: ['couchdb', 'dynamodb', 'firebase'],
    level: 'beginner'
  },
  'redis': {
    synonyms: ['redis cache'],
    related: ['cache', 'in-memory', 'key-value store'],
    category: 'database',
    subcategory: 'cache',
    keywords: ['caching', 'session store', 'pub/sub', 'fast'],
    equivalents: ['memcached', 'valkey'],
    level: 'intermediate'
  },

  // ============================================================================
  // CLOUD PLATFORMS
  // ============================================================================
  'aws': {
    synonyms: ['amazon web services', 'amazon aws'],
    related: ['ec2', 's3', 'lambda', 'rds', 'dynamodb', 'cloudformation'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['cloud platform', 'infrastructure', 'scalable', 'iaas', 'paas'],
    equivalents: ['azure', 'gcp', 'google cloud'],
    level: 'intermediate'
  },
  'azure': {
    synonyms: ['microsoft azure', 'azure cloud'],
    related: ['azure devops', 'azure functions', 'cosmos db'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['cloud platform', 'microsoft', 'enterprise'],
    equivalents: ['aws', 'gcp', 'google cloud'],
    level: 'intermediate'
  },
  'gcp': {
    synonyms: ['google cloud platform', 'google cloud', 'gcloud'],
    related: ['compute engine', 'app engine', 'cloud functions', 'bigquery'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['cloud platform', 'google', 'scalable'],
    equivalents: ['aws', 'azure'],
    level: 'intermediate'
  },

  // ============================================================================
  // DEVOPS & CONTAINERS
  // ============================================================================
  'docker': {
    synonyms: ['docker container'],
    related: ['containerization', 'dockerfile', 'docker compose', 'docker hub'],
    category: 'devops',
    subcategory: 'containerization',
    keywords: ['container', 'image', 'portable', 'microservices'],
    level: 'intermediate'
  },
  'kubernetes': {
    synonyms: ['k8s', 'k8', 'kube'],
    related: ['container orchestration', 'pods', 'helm', 'kubectl', 'docker'],
    category: 'devops',
    subcategory: 'orchestration',
    keywords: ['container orchestration', 'cluster management', 'scaling', 'deployment'],
    equivalents: ['docker swarm', 'ecs', 'nomad'],
    level: 'advanced'
  },
  'terraform': {
    synonyms: ['tf'],
    related: ['infrastructure as code', 'iac', 'hashicorp', 'hcl'],
    category: 'devops',
    subcategory: 'infrastructure',
    keywords: ['infrastructure as code', 'provisioning', 'declarative', 'cloud automation'],
    equivalents: ['cloudformation', 'pulumi', 'ansible'],
    level: 'advanced'
  },
  'jenkins': {
    synonyms: ['jenkins ci'],
    related: ['ci/cd', 'continuous integration', 'pipeline', 'groovy'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'continuous deployment', 'automation', 'pipeline'],
    equivalents: ['gitlab ci', 'github actions', 'circleci', 'travis ci'],
    level: 'intermediate'
  },
  'github actions': {
    synonyms: ['gh actions', 'actions'],
    related: ['ci/cd', 'github', 'yaml', 'workflow'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'workflow automation', 'github'],
    equivalents: ['jenkins', 'gitlab ci', 'circleci'],
    level: 'beginner'
  },
  'gitlab ci': {
    synonyms: ['gitlab ci/cd', 'gitlab pipelines'],
    related: ['ci/cd', 'gitlab', 'yaml', 'runner'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'pipeline', 'automation'],
    equivalents: ['jenkins', 'github actions', 'circleci'],
    level: 'intermediate'
  },

  // ============================================================================
  // MACHINE LEARNING & DATA SCIENCE
  // ============================================================================
  'tensorflow': {
    synonyms: ['tf', 'tensorflow 2'],
    related: ['deep learning', 'neural networks', 'keras', 'python'],
    category: 'machine-learning',
    subcategory: 'framework',
    keywords: ['deep learning', 'ml framework', 'neural network', 'ai'],
    equivalents: ['pytorch', 'jax', 'mxnet'],
    level: 'advanced'
  },
  'pytorch': {
    synonyms: ['torch'],
    related: ['deep learning', 'neural networks', 'python', 'facebook'],
    category: 'machine-learning',
    subcategory: 'framework',
    keywords: ['deep learning', 'ml framework', 'dynamic graphs', 'research'],
    equivalents: ['tensorflow', 'jax', 'mxnet'],
    level: 'advanced'
  },
  'scikit-learn': {
    synonyms: ['sklearn', 'scikit learn'],
    related: ['machine learning', 'python', 'classification', 'regression'],
    category: 'machine-learning',
    subcategory: 'library',
    keywords: ['ml library', 'classical ml', 'supervised learning', 'unsupervised'],
    level: 'intermediate'
  },
  'pandas': {
    synonyms: ['pandas library'],
    related: ['python', 'data analysis', 'dataframe', 'numpy'],
    category: 'data-science',
    subcategory: 'library',
    keywords: ['data manipulation', 'dataframe', 'data analysis', 'tabular data'],
    level: 'intermediate'
  },
  'numpy': {
    synonyms: ['numerical python'],
    related: ['python', 'arrays', 'scientific computing', 'pandas'],
    category: 'data-science',
    subcategory: 'library',
    keywords: ['numerical computing', 'arrays', 'linear algebra', 'matrix'],
    level: 'intermediate'
  },

  // ============================================================================
  // PROGRAMMING LANGUAGES
  // ============================================================================
  'javascript': {
    synonyms: ['js', 'ecmascript', 'es6', 'es2015+'],
    related: ['typescript', 'node.js', 'react', 'vue', 'web development'],
    category: 'language',
    subcategory: 'scripting',
    keywords: ['web programming', 'frontend', 'backend', 'fullstack'],
    level: 'beginner'
  },
  'typescript': {
    synonyms: ['ts'],
    related: ['javascript', 'type safety', 'static typing', 'microsoft'],
    category: 'language',
    subcategory: 'compiled',
    keywords: ['typed javascript', 'type safety', 'static typing', 'interfaces'],
    level: 'intermediate'
  },
  'python': {
    synonyms: ['py', 'python3'],
    related: ['django', 'flask', 'data science', 'machine learning', 'pandas'],
    category: 'language',
    subcategory: 'interpreted',
    keywords: ['versatile', 'data science', 'web development', 'automation', 'ai'],
    level: 'beginner'
  },
  'java': {
    synonyms: ['java programming'],
    related: ['jvm', 'spring', 'maven', 'gradle', 'enterprise'],
    category: 'language',
    subcategory: 'compiled',
    keywords: ['object oriented', 'enterprise', 'jvm', 'strongly typed'],
    level: 'intermediate'
  },
  'go': {
    synonyms: ['golang', 'go lang'],
    related: ['goroutines', 'concurrency', 'microservices', 'google'],
    category: 'language',
    subcategory: 'compiled',
    keywords: ['concurrent', 'fast', 'simple', 'microservices', 'cloud native'],
    level: 'intermediate'
  },
  'rust': {
    synonyms: ['rust lang'],
    related: ['systems programming', 'memory safety', 'performance', 'cargo'],
    category: 'language',
    subcategory: 'compiled',
    keywords: ['memory safe', 'performance', 'systems programming', 'zero cost'],
    level: 'advanced'
  },

  // ============================================================================
  // TESTING
  // ============================================================================
  'jest': {
    synonyms: ['jestjs'],
    related: ['testing', 'unit test', 'javascript', 'react'],
    category: 'testing',
    subcategory: 'framework',
    keywords: ['unit testing', 'test runner', 'mocking', 'snapshot'],
    equivalents: ['mocha', 'vitest', 'jasmine'],
    level: 'beginner'
  },
  'pytest': {
    synonyms: ['py.test'],
    related: ['python', 'testing', 'unit test', 'fixtures'],
    category: 'testing',
    subcategory: 'framework',
    keywords: ['python testing', 'unit test', 'fixtures', 'assertions'],
    level: 'beginner'
  },
  'selenium': {
    synonyms: ['selenium webdriver'],
    related: ['automation', 'e2e testing', 'browser testing'],
    category: 'testing',
    subcategory: 'automation',
    keywords: ['browser automation', 'e2e', 'ui testing', 'web testing'],
    equivalents: ['playwright', 'cypress', 'puppeteer'],
    level: 'intermediate'
  },
  'cypress': {
    synonyms: ['cypress.io'],
    related: ['e2e testing', 'javascript', 'browser testing'],
    category: 'testing',
    subcategory: 'automation',
    keywords: ['e2e testing', 'modern', 'fast', 'developer friendly'],
    equivalents: ['selenium', 'playwright', 'testcafe'],
    level: 'intermediate'
  },

  // ============================================================================
  // MOBILE DEVELOPMENT
  // ============================================================================
  'react native': {
    synonyms: ['react-native', 'rn'],
    related: ['react', 'mobile', 'ios', 'android', 'expo'],
    category: 'mobile',
    subcategory: 'framework',
    keywords: ['cross platform', 'mobile development', 'native apps'],
    equivalents: ['flutter', 'ionic', 'xamarin'],
    level: 'intermediate'
  },
  'flutter': {
    synonyms: ['flutter framework'],
    related: ['dart', 'mobile', 'ios', 'android', 'google'],
    category: 'mobile',
    subcategory: 'framework',
    keywords: ['cross platform', 'mobile development', 'dart', 'widgets'],
    equivalents: ['react native', 'ionic', 'xamarin'],
    level: 'intermediate'
  },
  'swift': {
    synonyms: ['swift language'],
    related: ['ios', 'apple', 'xcode', 'swiftui', 'uikit'],
    category: 'mobile',
    subcategory: 'language',
    keywords: ['ios development', 'apple', 'native', 'modern'],
    level: 'intermediate'
  },
  'kotlin': {
    synonyms: ['kotlin language'],
    related: ['android', 'jvm', 'jetpack compose', 'google'],
    category: 'mobile',
    subcategory: 'language',
    keywords: ['android development', 'modern java', 'null safe'],
    level: 'intermediate'
  },

  // ============================================================================
  // VERSION CONTROL
  // ============================================================================
  'git': {
    synonyms: ['git version control'],
    related: ['github', 'gitlab', 'version control', 'source control'],
    category: 'tools',
    subcategory: 'version-control',
    keywords: ['version control', 'branching', 'merging', 'commits'],
    level: 'beginner'
  },
  'github': {
    synonyms: ['gh'],
    related: ['git', 'version control', 'collaboration', 'microsoft'],
    category: 'tools',
    subcategory: 'platform',
    keywords: ['code hosting', 'collaboration', 'pull requests', 'open source'],
    equivalents: ['gitlab', 'bitbucket'],
    level: 'beginner'
  },

  // ============================================================================
  // API & COMMUNICATION
  // ============================================================================
  'rest api': {
    synonyms: ['rest', 'restful api', 'restful'],
    related: ['http', 'json', 'api design', 'web services'],
    category: 'architecture',
    subcategory: 'api',
    keywords: ['http api', 'web services', 'json', 'stateless'],
    equivalents: ['graphql', 'grpc', 'soap'],
    level: 'beginner'
  },
  'graphql': {
    synonyms: ['graph ql'],
    related: ['api', 'query language', 'apollo', 'schema'],
    category: 'architecture',
    subcategory: 'api',
    keywords: ['query language', 'flexible api', 'graph', 'facebook'],
    equivalents: ['rest api', 'grpc'],
    level: 'intermediate'
  },
  'grpc': {
    synonyms: ['grpc framework'],
    related: ['protobuf', 'rpc', 'microservices', 'google'],
    category: 'architecture',
    subcategory: 'api',
    keywords: ['rpc', 'high performance', 'microservices', 'binary'],
    equivalents: ['rest api', 'graphql'],
    level: 'advanced'
  },

  // ============================================================================
  // MONITORING & OBSERVABILITY
  // ============================================================================
  'prometheus': {
    synonyms: ['prometheus monitoring'],
    related: ['monitoring', 'metrics', 'alerting', 'grafana', 'time series'],
    category: 'monitoring',
    subcategory: 'metrics',
    keywords: ['monitoring', 'metrics', 'alerts', 'time series database'],
    level: 'intermediate'
  },
  'grafana': {
    synonyms: ['grafana dashboard'],
    related: ['visualization', 'monitoring', 'dashboards', 'prometheus'],
    category: 'monitoring',
    subcategory: 'visualization',
    keywords: ['dashboards', 'visualization', 'monitoring', 'metrics'],
    level: 'intermediate'
  },
  'elk stack': {
    synonyms: ['elk', 'elasticsearch logstash kibana', 'elastic stack'],
    related: ['logging', 'elasticsearch', 'logstash', 'kibana', 'log aggregation'],
    category: 'monitoring',
    subcategory: 'logging',
    keywords: ['log aggregation', 'search', 'analytics', 'visualization'],
    level: 'advanced'
  },

  // ============================================================================
  // SECURITY
  // ============================================================================
  'oauth': {
    synonyms: ['oauth 2.0', 'oauth2'],
    related: ['authentication', 'authorization', 'security', 'jwt'],
    category: 'security',
    subcategory: 'authentication',
    keywords: ['authorization', 'authentication', 'token', 'sso'],
    level: 'intermediate'
  },
  'jwt': {
    synonyms: ['json web token', 'json web tokens'],
    related: ['authentication', 'authorization', 'security', 'oauth'],
    category: 'security',
    subcategory: 'authentication',
    keywords: ['token', 'authentication', 'stateless', 'claims'],
    level: 'intermediate'
  },

  // ============================================================================
  // CONCEPT MAPPINGS (Abstract concepts to concrete technologies)
  // ============================================================================
  'container orchestration': {
    synonyms: ['orchestration', 'container management', 'cluster orchestration'],
    related: ['kubernetes', 'docker swarm', 'ecs', 'containerization'],
    category: 'concept',
    subcategory: 'devops',
    keywords: ['manage containers', 'scaling', 'deployment', 'cluster'],
    implementations: ['kubernetes', 'docker swarm', 'ecs', 'nomad'],
    level: 'advanced'
  },
  'infrastructure as code': {
    synonyms: ['iac', 'infrastructure automation', 'programmable infrastructure'],
    related: ['terraform', 'cloudformation', 'pulumi', 'ansible'],
    category: 'concept',
    subcategory: 'devops',
    keywords: ['automate infrastructure', 'declarative', 'version control'],
    implementations: ['terraform', 'cloudformation', 'pulumi', 'ansible'],
    level: 'advanced'
  },
  'continuous integration': {
    synonyms: ['ci', 'continuous deployment', 'ci/cd', 'cicd'],
    related: ['jenkins', 'gitlab ci', 'github actions', 'circleci', 'automation'],
    category: 'concept',
    subcategory: 'devops',
    keywords: ['automated builds', 'testing', 'deployment', 'pipeline'],
    implementations: ['jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci'],
    level: 'intermediate'
  },
  'microservices': {
    synonyms: ['microservice architecture', 'microservices architecture'],
    related: ['docker', 'kubernetes', 'api gateway', 'service mesh'],
    category: 'concept',
    subcategory: 'architecture',
    keywords: ['distributed', 'scalable', 'independent services', 'decoupled'],
    level: 'advanced'
  },
  'serverless': {
    synonyms: ['serverless computing', 'faas', 'function as a service'],
    related: ['aws lambda', 'azure functions', 'google cloud functions'],
    category: 'concept',
    subcategory: 'architecture',
    keywords: ['event driven', 'pay per use', 'auto scaling', 'managed'],
    implementations: ['aws lambda', 'azure functions', 'google cloud functions', 'cloudflare workers'],
    level: 'advanced'
  }
};

// Category-level concept mappings
const CATEGORY_CONCEPTS = {
  'frontend': ['ui development', 'user interface', 'web interface', 'client side', 'browser'],
  'backend': ['server side', 'api development', 'server programming', 'backend services'],
  'fullstack': ['full stack', 'full-stack', 'end to end development'],
  'devops': ['infrastructure', 'deployment', 'automation', 'operations'],
  'mobile': ['mobile development', 'mobile apps', 'ios development', 'android development'],
  'data-science': ['data analysis', 'data analytics', 'statistical analysis', 'data manipulation'],
  'machine-learning': ['ml', 'ai', 'artificial intelligence', 'deep learning', 'neural networks'],
  'database': ['data storage', 'database management', 'data persistence'],
  'cloud': ['cloud computing', 'cloud infrastructure', 'cloud services'],
  'testing': ['quality assurance', 'qa', 'test automation', 'software testing'],
  'security': ['cybersecurity', 'information security', 'application security', 'infosec']
};

module.exports = {
  TECHNOLOGY_TAXONOMY,
  CATEGORY_CONCEPTS
};

