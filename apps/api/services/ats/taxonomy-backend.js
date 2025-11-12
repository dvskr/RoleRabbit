// BACKEND FRAMEWORKS & TECHNOLOGIES (200+)
// Part of Comprehensive Technology Taxonomy

const BACKEND_TAXONOMY = {
  
  // ============================================================================
  // NODE.JS ECOSYSTEM (40+)
  // ============================================================================
  
  'node.js': {
    synonyms: ['nodejs', 'node'],
    related: ['express', 'nestjs', 'fastify', 'koa', 'npm', 'javascript', 'v8'],
    category: 'backend',
    subcategory: 'runtime',
    keywords: ['javascript runtime', 'event driven', 'non-blocking', 'server side javascript'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'express': {
    synonyms: ['expressjs', 'express.js'],
    related: ['node.js', 'middleware', 'routing', 'rest api'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['web framework', 'rest api', 'http server', 'minimal'],
    equivalents: ['fastify', 'koa', 'hapi'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'fastify': {
    synonyms: [],
    related: ['node.js', 'fast', 'schema based', 'plugins'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['fast', 'low overhead', 'plugin architecture', 'schema based'],
    equivalents: ['express', 'koa'],
    level: 'intermediate',
    popularity: 'high'
  },
  'koa': {
    synonyms: ['koajs', 'koa.js'],
    related: ['node.js', 'express', 'async/await'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['next generation', 'async/await', 'minimal', 'express successor'],
    equivalents: ['express', 'fastify'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'hapi': {
    synonyms: ['hapi.js', 'hapijs'],
    related: ['node.js', 'configuration', 'plugins'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['configuration-centric', 'enterprise', 'plugins'],
    equivalents: ['express', 'fastify'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'nestjs': {
    synonyms: ['nest', 'nest.js'],
    related: ['node.js', 'typescript', 'angular-inspired', 'dependency injection'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['typescript', 'scalable', 'angular-inspired', 'dependency injection', 'enterprise'],
    level: 'advanced',
    popularity: 'high'
  },
  'adonis.js': {
    synonyms: ['adonisjs', 'adonis'],
    related: ['node.js', 'typescript', 'mvc', 'full-featured'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'full-featured', 'batteries included', 'laravel-inspired'],
    level: 'intermediate',
    popularity: 'low'
  },
  'sails.js': {
    synonyms: ['sailsjs', 'sails'],
    related: ['node.js', 'mvc', 'realtime'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'realtime', 'websockets', 'data-driven'],
    level: 'intermediate',
    popularity: 'low'
  },
  'loopback': {
    synonyms: ['loopback4'],
    related: ['node.js', 'api framework', 'ibm'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['api framework', 'enterprise', 'openapi'],
    level: 'advanced',
    popularity: 'low'
  },
  'meteor': {
    synonyms: ['meteorjs', 'meteor.js'],
    related: ['node.js', 'full-stack', 'realtime', 'mongodb'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['full-stack', 'realtime', 'isomorphic', 'reactive'],
    level: 'intermediate',
    popularity: 'low'
  },
  'strapi': {
    synonyms: [],
    related: ['node.js', 'headless cms', 'api'],
    category: 'backend',
    subcategory: 'cms',
    keywords: ['headless cms', 'api-first', 'customizable'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'feathers.js': {
    synonyms: ['feathersjs', 'feathers'],
    related: ['node.js', 'realtime', 'rest', 'websockets'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['realtime', 'rest', 'websockets', 'microservices'],
    level: 'intermediate',
    popularity: 'low'
  },

  // ============================================================================
  // PYTHON WEB FRAMEWORKS (30+)
  // ============================================================================
  
  'django': {
    synonyms: ['django framework'],
    related: ['python', 'orm', 'django rest framework', 'drf', 'admin panel'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'orm', 'admin panel', 'batteries included', 'monolithic'],
    equivalents: ['flask', 'fastapi', 'rails'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'django rest framework': {
    synonyms: ['drf', 'django-rest-framework'],
    related: ['django', 'rest api', 'serializers'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['rest api', 'django', 'serialization', 'authentication'],
    level: 'intermediate',
    popularity: 'high'
  },
  'flask': {
    synonyms: ['flask framework'],
    related: ['python', 'wsgi', 'jinja2', 'werkzeug', 'micro framework'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['micro framework', 'lightweight', 'rest api', 'flexible'],
    equivalents: ['django', 'fastapi', 'bottle'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'fastapi': {
    synonyms: ['fast api'],
    related: ['python', 'pydantic', 'async', 'openapi', 'starlette'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['async', 'modern', 'type hints', 'automatic docs', 'fast', 'pydantic'],
    equivalents: ['flask', 'django', 'express'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'pyramid': {
    synonyms: [],
    related: ['python', 'flexible', 'wsgi'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['flexible', 'scalable', 'versatile'],
    level: 'intermediate',
    popularity: 'low'
  },
  'tornado': {
    synonyms: [],
    related: ['python', 'async', 'non-blocking', 'websockets'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['async', 'non-blocking', 'websockets', 'scalable'],
    level: 'advanced',
    popularity: 'medium'
  },
  'bottle': {
    synonyms: [],
    related: ['python', 'micro framework', 'single file'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['micro framework', 'lightweight', 'single file'],
    equivalents: ['flask'],
    level: 'beginner',
    popularity: 'low'
  },
  'cherrypy': {
    synonyms: [],
    related: ['python', 'minimalist', 'object-oriented'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['minimalist', 'object-oriented', 'pythonic'],
    level: 'intermediate',
    popularity: 'low'
  },
  'sanic': {
    synonyms: [],
    related: ['python', 'async', 'fast', 'flask-like'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['async', 'fast', 'flask-like'],
    level: 'intermediate',
    popularity: 'low'
  },
  'quart': {
    synonyms: [],
    related: ['python', 'async', 'flask-compatible'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['async', 'flask compatible', 'asgi'],
    level: 'intermediate',
    popularity: 'low'
  },
  'starlette': {
    synonyms: [],
    related: ['python', 'asgi', 'async', 'fastapi'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['asgi', 'lightweight', 'async'],
    level: 'advanced',
    popularity: 'medium'
  },
  'celery': {
    synonyms: [],
    related: ['python', 'task queue', 'distributed', 'async tasks'],
    category: 'backend',
    subcategory: 'task-queue',
    keywords: ['task queue', 'distributed', 'async tasks', 'workers'],
    level: 'intermediate',
    popularity: 'high'
  },

  // ============================================================================
  // JAVA / JVM FRAMEWORKS (40+)
  // ============================================================================
  
  'spring boot': {
    synonyms: ['springboot', 'spring'],
    related: ['java', 'spring framework', 'hibernate', 'maven', 'gradle'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['enterprise', 'microservices', 'dependency injection', 'auto-configuration'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'spring framework': {
    synonyms: ['spring'],
    related: ['java', 'spring boot', 'ioc', 'dependency injection'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['dependency injection', 'enterprise', 'comprehensive'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'spring mvc': {
    synonyms: [],
    related: ['spring', 'java', 'web', 'mvc'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'web framework', 'model-view-controller'],
    level: 'advanced',
    popularity: 'high'
  },
  'spring security': {
    synonyms: [],
    related: ['spring', 'java', 'authentication', 'authorization'],
    category: 'backend',
    subcategory: 'security',
    keywords: ['security', 'authentication', 'authorization', 'spring'],
    level: 'advanced',
    popularity: 'high'
  },
  'spring data': {
    synonyms: [],
    related: ['spring', 'java', 'orm', 'database'],
    category: 'backend',
    subcategory: 'orm',
    keywords: ['data access', 'orm', 'repositories', 'spring'],
    level: 'intermediate',
    popularity: 'high'
  },
  'hibernate': {
    synonyms: ['hibernate orm'],
    related: ['java', 'orm', 'jpa', 'database'],
    category: 'backend',
    subcategory: 'orm',
    keywords: ['orm', 'jpa', 'object relational mapping'],
    equivalents: ['jpa', 'mybatis'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'jpa': {
    synonyms: ['java persistence api'],
    related: ['java', 'orm', 'hibernate', 'eclipselink'],
    category: 'backend',
    subcategory: 'orm',
    keywords: ['persistence api', 'orm', 'specification'],
    equivalents: ['hibernate', 'mybatis'],
    level: 'intermediate',
    popularity: 'high'
  },
  'mybatis': {
    synonyms: [],
    related: ['java', 'sql mapper', 'database'],
    category: 'backend',
    subcategory: 'orm',
    keywords: ['sql mapper', 'persistence framework'],
    equivalents: ['hibernate', 'jpa'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'quarkus': {
    synonyms: [],
    related: ['java', 'kubernetes', 'cloud native', 'graalvm'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['kubernetes native', 'cloud native', 'supersonic', 'subatomic'],
    level: 'advanced',
    popularity: 'medium'
  },
  'micronaut': {
    synonyms: [],
    related: ['java', 'microservices', 'graalvm', 'low memory'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['microservices', 'low memory', 'fast startup'],
    level: 'advanced',
    popularity: 'medium'
  },
  'helidon': {
    synonyms: [],
    related: ['java', 'microservices', 'oracle'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['microservices', 'reactive', 'cloud native'],
    level: 'advanced',
    popularity: 'low'
  },
  'vert.x': {
    synonyms: ['vertx', 'eclipse vert.x'],
    related: ['java', 'reactive', 'async', 'polyglot'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['reactive', 'event-driven', 'polyglot', 'async'],
    level: 'advanced',
    popularity: 'medium'
  },
  'play framework': {
    synonyms: ['play', 'playframework'],
    related: ['java', 'scala', 'reactive', 'web'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['reactive', 'scalable', 'web framework'],
    level: 'advanced',
    popularity: 'low'
  },
  'dropwizard': {
    synonyms: [],
    related: ['java', 'restful', 'microservices'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['restful', 'microservices', 'production-ready'],
    level: 'intermediate',
    popularity: 'low'
  },
  'grails': {
    synonyms: [],
    related: ['groovy', 'java', 'jvm', 'mvc'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['groovy', 'convention over configuration', 'rapid development'],
    level: 'intermediate',
    popularity: 'low'
  },
  'javalin': {
    synonyms: [],
    related: ['java', 'kotlin', 'lightweight', 'rest'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['lightweight', 'simple', 'rest api'],
    level: 'beginner',
    popularity: 'low'
  },
  'sparkjava': {
    synonyms: ['spark java', 'spark framework'],
    related: ['java', 'micro framework', 'rest'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['micro framework', 'expressive', 'rest'],
    level: 'beginner',
    popularity: 'low'
  },

  // ============================================================================
  // PHP FRAMEWORKS (25+)
  // ============================================================================
  
  'laravel': {
    synonyms: [],
    related: ['php', 'eloquent', 'artisan', 'blade'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['elegant', 'expressive', 'mvc', 'modern php'],
    equivalents: ['symfony', 'codeigniter', 'yii'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'symfony': {
    synonyms: [],
    related: ['php', 'components', 'enterprise', 'doctrine'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['enterprise', 'flexible', 'components', 'robust'],
    equivalents: ['laravel', 'zend'],
    level: 'advanced',
    popularity: 'high'
  },
  'codeigniter': {
    synonyms: ['ci'],
    related: ['php', 'mvc', 'lightweight'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['lightweight', 'simple', 'mvc'],
    equivalents: ['laravel', 'yii'],
    level: 'beginner',
    popularity: 'medium'
  },
  'yii': {
    synonyms: ['yii2', 'yii framework'],
    related: ['php', 'high performance', 'mvc'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['high performance', 'secure', 'professional'],
    equivalents: ['laravel', 'symfony'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'cakephp': {
    synonyms: ['cake php'],
    related: ['php', 'mvc', 'rapid development'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['rapid development', 'convention', 'mvc'],
    level: 'intermediate',
    popularity: 'low'
  },
  'slim': {
    synonyms: ['slim framework', 'slim php'],
    related: ['php', 'micro framework', 'rest'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['micro framework', 'rest api', 'lightweight'],
    level: 'beginner',
    popularity: 'medium'
  },
  'lumen': {
    synonyms: [],
    related: ['php', 'laravel', 'micro framework', 'api'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['micro framework', 'laravel', 'fast', 'api'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'phalcon': {
    synonyms: [],
    related: ['php', 'c extension', 'fast'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['high performance', 'c extension', 'mvc'],
    level: 'advanced',
    popularity: 'low'
  },
  'zend framework': {
    synonyms: ['zend', 'laminas'],
    related: ['php', 'enterprise', 'components'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['enterprise', 'professional', 'components'],
    level: 'advanced',
    popularity: 'low'
  },
  'wordpress': {
    synonyms: ['wp'],
    related: ['php', 'cms', 'blogging', 'plugins'],
    category: 'backend',
    subcategory: 'cms',
    keywords: ['cms', 'blogging', 'content management', 'popular'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'drupal': {
    synonyms: [],
    related: ['php', 'cms', 'enterprise', 'modules'],
    category: 'backend',
    subcategory: 'cms',
    keywords: ['cms', 'enterprise', 'flexible', 'modular'],
    level: 'advanced',
    popularity: 'medium'
  },
  'joomla': {
    synonyms: [],
    related: ['php', 'cms', 'extensions'],
    category: 'backend',
    subcategory: 'cms',
    keywords: ['cms', 'content management', 'extensions'],
    level: 'intermediate',
    popularity: 'low'
  },
  'magento': {
    synonyms: ['adobe commerce'],
    related: ['php', 'ecommerce', 'enterprise'],
    category: 'backend',
    subcategory: 'ecommerce',
    keywords: ['ecommerce', 'enterprise', 'shopping cart'],
    level: 'advanced',
    popularity: 'medium'
  },
  'woocommerce': {
    synonyms: [],
    related: ['php', 'wordpress', 'ecommerce', 'plugins'],
    category: 'backend',
    subcategory: 'ecommerce',
    keywords: ['ecommerce', 'wordpress', 'shop', 'plugins'],
    level: 'beginner',
    popularity: 'very-high'
  },

  // ============================================================================
  // RUBY FRAMEWORKS (15+)
  // ============================================================================
  
  'ruby on rails': {
    synonyms: ['rails', 'ror'],
    related: ['ruby', 'active record', 'gem', 'mvc'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'convention over configuration', 'web framework', 'full-stack'],
    equivalents: ['django', 'laravel'],
    level: 'intermediate',
    popularity: 'high'
  },
  'sinatra': {
    synonyms: [],
    related: ['ruby', 'micro framework', 'dsl'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['micro framework', 'dsl', 'lightweight'],
    equivalents: ['flask', 'express'],
    level: 'beginner',
    popularity: 'medium'
  },
  'padrino': {
    synonyms: [],
    related: ['ruby', 'sinatra', 'full-stack'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['elegant', 'sinatra-based', 'full-stack'],
    level: 'intermediate',
    popularity: 'low'
  },
  'hanami': {
    synonyms: ['lotus'],
    related: ['ruby', 'clean architecture', 'mvc'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['clean architecture', 'testable', 'fast'],
    level: 'advanced',
    popularity: 'low'
  },
  'grape': {
    synonyms: [],
    related: ['ruby', 'rest api', 'dsl'],
    category: 'backend',
    subcategory: 'api-framework',
    keywords: ['rest api', 'microframework', 'dsl'],
    level: 'intermediate',
    popularity: 'medium'
  },

  // ============================================================================
  // .NET FRAMEWORKS (20+)
  // ============================================================================
  
  'asp.net': {
    synonyms: ['asp.net core', 'asp net'],
    related: ['c#', '.net', 'microsoft', 'mvc', 'razor'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['microsoft', 'web framework', 'mvc', 'cross-platform'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'asp.net mvc': {
    synonyms: ['asp mvc'],
    related: ['asp.net', 'c#', 'mvc', 'razor'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'model-view-controller', 'web'],
    level: 'intermediate',
    popularity: 'high'
  },
  'asp.net web api': {
    synonyms: ['web api'],
    related: ['asp.net', 'c#', 'rest api'],
    category: 'backend',
    subcategory: 'api-framework',
    keywords: ['rest api', 'http services', 'web api'],
    level: 'intermediate',
    popularity: 'high'
  },
  'entity framework': {
    synonyms: ['ef', 'ef core'],
    related: ['.net', 'c#', 'orm', 'database'],
    category: 'backend',
    subcategory: 'orm',
    keywords: ['orm', 'data access', 'linq'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'blazor': {
    synonyms: [],
    related: ['.net', 'c#', 'webassembly', 'spa'],
    category: 'frontend',
    subcategory: 'framework',
    keywords: ['webassembly', 'c# in browser', 'spa'],
    level: 'advanced',
    popularity: 'medium'
  },
  '.net core': {
    synonyms: ['dotnet core', 'dot net core'],
    related: ['c#', 'cross-platform', 'microsoft'],
    category: 'backend',
    subcategory: 'platform',
    keywords: ['cross-platform', 'open source', 'modern .net'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'nancy': {
    synonyms: ['nancyfx'],
    related: ['.net', 'c#', 'lightweight', 'web'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['lightweight', 'super-duper-happy-path', 'web'],
    level: 'intermediate',
    popularity: 'low'
  },

  // ============================================================================
  // GO FRAMEWORKS (15+)
  // ============================================================================
  
  'gin': {
    synonyms: ['gin-gonic'],
    related: ['go', 'golang', 'web framework', 'rest'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['fast', 'lightweight', 'martini-like', 'performance'],
    equivalents: ['echo', 'fiber'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'echo': {
    synonyms: [],
    related: ['go', 'golang', 'web framework', 'rest'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['fast', 'minimal', 'extensible'],
    equivalents: ['gin', 'fiber'],
    level: 'intermediate',
    popularity: 'high'
  },
  'fiber': {
    synonyms: [],
    related: ['go', 'golang', 'express-inspired', 'fast'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['express-inspired', 'fast', 'lightweight'],
    equivalents: ['gin', 'echo'],
    level: 'intermediate',
    popularity: 'high'
  },
  'beego': {
    synonyms: [],
    related: ['go', 'golang', 'mvc', 'full-stack'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['mvc', 'full-stack', 'rapid development'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'revel': {
    synonyms: [],
    related: ['go', 'golang', 'full-stack', 'mvc'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['full-stack', 'flexible', 'productive'],
    level: 'intermediate',
    popularity: 'low'
  },
  'gorilla': {
    synonyms: ['gorilla mux', 'gorilla toolkit'],
    related: ['go', 'golang', 'router', 'websockets'],
    category: 'backend',
    subcategory: 'library',
    keywords: ['router', 'websockets', 'toolkit'],
    level: 'intermediate',
    popularity: 'high'
  },
  'chi': {
    synonyms: [],
    related: ['go', 'golang', 'router', 'lightweight'],
    category: 'backend',
    subcategory: 'library',
    keywords: ['router', 'lightweight', 'composable'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'gorm': {
    synonyms: [],
    related: ['go', 'golang', 'orm', 'database'],
    category: 'backend',
    subcategory: 'orm',
    keywords: ['orm', 'database', 'developer friendly'],
    level: 'intermediate',
    popularity: 'very-high'
  },

  // ============================================================================
  // RUST FRAMEWORKS (10+)
  // ============================================================================
  
  'actix-web': {
    synonyms: ['actix'],
    related: ['rust', 'web framework', 'fast', 'actor model'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['fast', 'powerful', 'pragmatic', 'actor-based'],
    equivalents: ['rocket', 'warp'],
    level: 'advanced',
    popularity: 'high'
  },
  'rocket': {
    synonyms: [],
    related: ['rust', 'web framework', 'type-safe'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['type-safe', 'fast', 'easy to use'],
    equivalents: ['actix-web', 'warp'],
    level: 'advanced',
    popularity: 'high'
  },
  'warp': {
    synonyms: [],
    related: ['rust', 'web framework', 'composable'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['composable', 'fast', 'flexible'],
    equivalents: ['actix-web', 'rocket'],
    level: 'advanced',
    popularity: 'medium'
  },
  'axum': {
    synonyms: [],
    related: ['rust', 'web framework', 'tokio'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['modular', 'fast', 'tokio-based'],
    level: 'advanced',
    popularity: 'high'
  },
  'tide': {
    synonyms: [],
    related: ['rust', 'async', 'web framework'],
    category: 'backend',
    subcategory: 'framework',
    keywords: ['async', 'minimal', 'pragmatic'],
    level: 'advanced',
    popularity: 'medium'
  },
  'diesel': {
    synonyms: [],
    related: ['rust', 'orm', 'database', 'type-safe'],
    category: 'backend',
    subcategory: 'orm',
    keywords: ['orm', 'type-safe', 'compile-time checked'],
    level: 'advanced',
    popularity: 'high'
  },
  'sqlx': {
    synonyms: [],
    related: ['rust', 'database', 'async'],
    category: 'backend',
    subcategory: 'database-library',
    keywords: ['async', 'compile-time checked', 'sql'],
    level: 'advanced',
    popularity: 'high'
  },

  // Continue with more backend technologies...
};

module.exports = {
  BACKEND_TAXONOMY
};

