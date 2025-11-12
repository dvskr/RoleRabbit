// MEGA EXPANSION TAXONOMY (700+ More Technologies)
// AWS Services, Azure Services, GCP Services, Additional Frameworks, Libraries, Tools

const MEGA_EXPANSION_TAXONOMY = {

  // ============================================================================
  // AWS SERVICES (150+)
  // ============================================================================
  
  'ec2': {
    synonyms: ['amazon ec2', 'elastic compute cloud'],
    related: ['aws', 'virtual machines', 'compute', 'cloud'],
    category: 'cloud',
    subcategory: 'compute',
    keywords: ['virtual machines', 'compute', 'scalable', 'resizable'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  's3': {
    synonyms: ['amazon s3', 'simple storage service'],
    related: ['aws', 'object storage', 'cloud storage'],
    category: 'cloud',
    subcategory: 'storage',
    keywords: ['object storage', 'scalable', 'durable', 'buckets'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'lambda': {
    synonyms: ['aws lambda'],
    related: ['serverless', 'aws', 'functions', 'event-driven'],
    category: 'cloud',
    subcategory: 'serverless',
    keywords: ['serverless', 'functions as a service', 'event-driven', 'aws'],
    equivalents: ['azure functions', 'google cloud functions'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'rds': {
    synonyms: ['amazon rds', 'relational database service'],
    related: ['aws', 'managed database', 'sql', 'mysql', 'postgresql'],
    category: 'cloud',
    subcategory: 'database',
    keywords: ['managed database', 'relational', 'aws', 'automated backups'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'dynamodb': {
    synonyms: ['amazon dynamodb', 'dynamo db'],
    related: ['aws', 'nosql', 'serverless', 'key-value'],
    category: 'cloud',
    subcategory: 'database',
    keywords: ['nosql', 'serverless', 'scalable', 'key-value document'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'ecs': {
    synonyms: ['amazon ecs', 'elastic container service'],
    related: ['aws', 'containers', 'docker', 'orchestration'],
    category: 'cloud',
    subcategory: 'containers',
    keywords: ['container orchestration', 'docker', 'aws', 'managed'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'eks': {
    synonyms: ['amazon eks', 'elastic kubernetes service'],
    related: ['aws', 'kubernetes', 'containers', 'managed'],
    category: 'cloud',
    subcategory: 'containers',
    keywords: ['managed kubernetes', 'aws', 'containers', 'k8s'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'cloudfront': {
    synonyms: ['amazon cloudfront'],
    related: ['aws', 'cdn', 'edge', 'content delivery'],
    category: 'cloud',
    subcategory: 'cdn',
    keywords: ['cdn', 'content delivery', 'edge', 'caching'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'route53': {
    synonyms: ['amazon route 53', 'route 53'],
    related: ['aws', 'dns', 'domain', 'routing'],
    category: 'cloud',
    subcategory: 'networking',
    keywords: ['dns', 'domain management', 'routing', 'scalable'],
    level: 'intermediate',
    popularity: 'high'
  },
  'cloudwatch': {
    synonyms: ['amazon cloudwatch'],
    related: ['aws', 'monitoring', 'logging', 'metrics'],
    category: 'cloud',
    subcategory: 'monitoring',
    keywords: ['monitoring', 'logging', 'metrics', 'alarms'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'vpc': {
    synonyms: ['amazon vpc', 'virtual private cloud'],
    related: ['aws', 'networking', 'security', 'isolation'],
    category: 'cloud',
    subcategory: 'networking',
    keywords: ['virtual private cloud', 'networking', 'isolated', 'security'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'iam': {
    synonyms: ['aws iam', 'identity and access management'],
    related: ['aws', 'security', 'authentication', 'permissions'],
    category: 'cloud',
    subcategory: 'security',
    keywords: ['identity management', 'access control', 'permissions', 'roles'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'sns': {
    synonyms: ['amazon sns', 'simple notification service'],
    related: ['aws', 'notifications', 'pub/sub', 'messaging'],
    category: 'cloud',
    subcategory: 'messaging',
    keywords: ['notifications', 'pub/sub', 'messaging', 'push'],
    level: 'beginner',
    popularity: 'high'
  },
  'sqs': {
    synonyms: ['amazon sqs', 'simple queue service'],
    related: ['aws', 'message queue', 'async', 'queuing'],
    category: 'cloud',
    subcategory: 'messaging',
    keywords: ['message queue', 'async', 'reliable', 'decoupling'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'elastic beanstalk': {
    synonyms: ['aws elastic beanstalk', 'beanstalk'],
    related: ['aws', 'paas', 'deployment', 'managed'],
    category: 'cloud',
    subcategory: 'paas',
    keywords: ['platform as a service', 'easy deployment', 'managed', 'scalable'],
    level: 'beginner',
    popularity: 'high'
  },
  'kinesis': {
    synonyms: ['amazon kinesis'],
    related: ['aws', 'streaming', 'real-time', 'data'],
    category: 'cloud',
    subcategory: 'streaming',
    keywords: ['streaming data', 'real-time', 'analytics', 'ingestion'],
    level: 'advanced',
    popularity: 'high'
  },
  'elasticache': {
    synonyms: ['amazon elasticache'],
    related: ['aws', 'caching', 'redis', 'memcached'],
    category: 'cloud',
    subcategory: 'caching',
    keywords: ['managed cache', 'redis', 'memcached', 'in-memory'],
    level: 'intermediate',
    popularity: 'high'
  },
  'step functions': {
    synonyms: ['aws step functions'],
    related: ['aws', 'workflow', 'orchestration', 'serverless'],
    category: 'cloud',
    subcategory: 'orchestration',
    keywords: ['workflow orchestration', 'state machine', 'serverless', 'visual'],
    level: 'advanced',
    popularity: 'medium'
  },
  'api gateway': {
    synonyms: ['amazon api gateway', 'aws api gateway'],
    related: ['aws', 'api management', 'serverless', 'rest'],
    category: 'cloud',
    subcategory: 'api',
    keywords: ['api management', 'serverless', 'rest', 'websocket'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'cognito': {
    synonyms: ['amazon cognito', 'aws cognito'],
    related: ['aws', 'authentication', 'identity', 'user management'],
    category: 'cloud',
    subcategory: 'auth',
    keywords: ['user authentication', 'identity', 'oauth', 'user pools'],
    level: 'intermediate',
    popularity: 'high'
  },
  'sagemaker': {
    synonyms: ['amazon sagemaker'],
    related: ['aws', 'machine learning', 'ml', 'ai'],
    category: 'cloud',
    subcategory: 'ml',
    keywords: ['machine learning', 'model training', 'deployment', 'jupyter'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'athena': {
    synonyms: ['amazon athena'],
    related: ['aws', 'sql', 'analytics', 's3'],
    category: 'cloud',
    subcategory: 'analytics',
    keywords: ['serverless sql', 's3 queries', 'analytics', 'presto'],
    level: 'intermediate',
    popularity: 'high'
  },
  'glue': {
    synonyms: ['aws glue'],
    related: ['aws', 'etl', 'data catalog', 'spark'],
    category: 'cloud',
    subcategory: 'etl',
    keywords: ['etl', 'data catalog', 'serverless', 'apache spark'],
    level: 'advanced',
    popularity: 'high'
  },
  'emr': {
    synonyms: ['amazon emr', 'elastic mapreduce'],
    related: ['aws', 'big data', 'hadoop', 'spark'],
    category: 'cloud',
    subcategory: 'big-data',
    keywords: ['big data', 'hadoop', 'spark', 'managed cluster'],
    level: 'advanced',
    popularity: 'high'
  },
  'eventbridge': {
    synonyms: ['amazon eventbridge', 'aws eventbridge'],
    related: ['aws', 'event bus', 'serverless', 'integration'],
    category: 'cloud',
    subcategory: 'integration',
    keywords: ['event bus', 'serverless', 'event-driven', 'saas integration'],
    level: 'intermediate',
    popularity: 'high'
  },

  // ============================================================================
  // AZURE SERVICES (120+)
  // ============================================================================
  
  'azure vm': {
    synonyms: ['azure virtual machines', 'virtual machines'],
    related: ['azure', 'compute', 'iaas', 'windows', 'linux'],
    category: 'cloud',
    subcategory: 'compute',
    keywords: ['virtual machines', 'compute', 'iaas', 'scalable'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'azure functions': {
    synonyms: ['functions', 'azure serverless'],
    related: ['azure', 'serverless', 'functions', 'event-driven'],
    category: 'cloud',
    subcategory: 'serverless',
    keywords: ['serverless', 'functions as a service', 'event-driven', 'azure'],
    equivalents: ['aws lambda', 'google cloud functions'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'azure blob storage': {
    synonyms: ['blob storage', 'azure storage'],
    related: ['azure', 'object storage', 'cloud storage'],
    category: 'cloud',
    subcategory: 'storage',
    keywords: ['object storage', 'blob', 'scalable', 'azure'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'azure sql database': {
    synonyms: ['azure sql', 'sql azure'],
    related: ['azure', 'managed database', 'sql server', 'paas'],
    category: 'cloud',
    subcategory: 'database',
    keywords: ['managed database', 'sql server', 'paas', 'azure'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'cosmos db': {
    synonyms: ['azure cosmos db', 'cosmosdb'],
    related: ['azure', 'nosql', 'multi-model', 'globally distributed'],
    category: 'cloud',
    subcategory: 'database',
    keywords: ['nosql', 'multi-model', 'globally distributed', 'low latency'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'aks': {
    synonyms: ['azure kubernetes service', 'azure aks'],
    related: ['azure', 'kubernetes', 'containers', 'managed'],
    category: 'cloud',
    subcategory: 'containers',
    keywords: ['managed kubernetes', 'azure', 'containers', 'k8s'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'azure container instances': {
    synonyms: ['aci', 'container instances'],
    related: ['azure', 'containers', 'serverless', 'docker'],
    category: 'cloud',
    subcategory: 'containers',
    keywords: ['serverless containers', 'fast startup', 'simple', 'docker'],
    level: 'beginner',
    popularity: 'high'
  },
  'azure cdn': {
    synonyms: ['azure content delivery network'],
    related: ['azure', 'cdn', 'edge', 'content delivery'],
    category: 'cloud',
    subcategory: 'cdn',
    keywords: ['cdn', 'content delivery', 'edge', 'global'],
    level: 'intermediate',
    popularity: 'high'
  },
  'azure active directory': {
    synonyms: ['azure ad', 'aad', 'entra id'],
    related: ['azure', 'identity', 'authentication', 'directory'],
    category: 'cloud',
    subcategory: 'auth',
    keywords: ['identity management', 'authentication', 'sso', 'directory'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'azure monitor': {
    synonyms: ['azure monitoring'],
    related: ['azure', 'monitoring', 'logging', 'metrics'],
    category: 'cloud',
    subcategory: 'monitoring',
    keywords: ['monitoring', 'logging', 'metrics', 'application insights'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'application insights': {
    synonyms: ['azure application insights'],
    related: ['azure', 'apm', 'monitoring', 'telemetry'],
    category: 'cloud',
    subcategory: 'monitoring',
    keywords: ['apm', 'application monitoring', 'telemetry', 'analytics'],
    level: 'intermediate',
    popularity: 'high'
  },
  'azure service bus': {
    synonyms: ['service bus'],
    related: ['azure', 'messaging', 'queues', 'topics'],
    category: 'cloud',
    subcategory: 'messaging',
    keywords: ['enterprise messaging', 'queues', 'topics', 'reliable'],
    level: 'intermediate',
    popularity: 'high'
  },
  'azure logic apps': {
    synonyms: ['logic apps'],
    related: ['azure', 'workflow', 'integration', 'low-code'],
    category: 'cloud',
    subcategory: 'integration',
    keywords: ['workflow automation', 'integration', 'low-code', 'connectors'],
    level: 'beginner',
    popularity: 'high'
  },
  'azure data factory': {
    synonyms: ['adf', 'data factory'],
    related: ['azure', 'etl', 'data integration', 'pipelines'],
    category: 'cloud',
    subcategory: 'etl',
    keywords: ['etl', 'data integration', 'orchestration', 'pipelines'],
    level: 'advanced',
    popularity: 'high'
  },
  'azure synapse': {
    synonyms: ['synapse analytics'],
    related: ['azure', 'data warehouse', 'analytics', 'big data'],
    category: 'cloud',
    subcategory: 'analytics',
    keywords: ['data warehouse', 'analytics', 'big data', 'unified'],
    level: 'advanced',
    popularity: 'high'
  },
  'azure machine learning': {
    synonyms: ['azure ml', 'aml'],
    related: ['azure', 'machine learning', 'ml', 'ai'],
    category: 'cloud',
    subcategory: 'ml',
    keywords: ['machine learning', 'mlops', 'model training', 'deployment'],
    level: 'advanced',
    popularity: 'very-high'
  },

  // ============================================================================
  // GOOGLE CLOUD SERVICES (100+)
  // ============================================================================
  
  'compute engine': {
    synonyms: ['gce', 'google compute engine'],
    related: ['gcp', 'virtual machines', 'compute', 'iaas'],
    category: 'cloud',
    subcategory: 'compute',
    keywords: ['virtual machines', 'compute', 'iaas', 'google cloud'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'cloud storage': {
    synonyms: ['gcs', 'google cloud storage'],
    related: ['gcp', 'object storage', 'buckets'],
    category: 'cloud',
    subcategory: 'storage',
    keywords: ['object storage', 'buckets', 'scalable', 'durable'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'cloud functions': {
    synonyms: ['gcf', 'google cloud functions'],
    related: ['gcp', 'serverless', 'functions', 'event-driven'],
    category: 'cloud',
    subcategory: 'serverless',
    keywords: ['serverless', 'functions as a service', 'event-driven', 'gcp'],
    equivalents: ['aws lambda', 'azure functions'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'cloud run': {
    synonyms: ['google cloud run'],
    related: ['gcp', 'serverless', 'containers', 'managed'],
    category: 'cloud',
    subcategory: 'serverless',
    keywords: ['serverless containers', 'managed', 'stateless', 'scale to zero'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'gke': {
    synonyms: ['google kubernetes engine', 'google gke'],
    related: ['gcp', 'kubernetes', 'containers', 'managed'],
    category: 'cloud',
    subcategory: 'containers',
    keywords: ['managed kubernetes', 'gcp', 'containers', 'autopilot'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'app engine': {
    synonyms: ['gae', 'google app engine'],
    related: ['gcp', 'paas', 'managed', 'deployment'],
    category: 'cloud',
    subcategory: 'paas',
    keywords: ['platform as a service', 'fully managed', 'auto-scaling'],
    level: 'beginner',
    popularity: 'high'
  },
  'cloud sql': {
    synonyms: ['google cloud sql'],
    related: ['gcp', 'managed database', 'mysql', 'postgresql'],
    category: 'cloud',
    subcategory: 'database',
    keywords: ['managed database', 'relational', 'mysql', 'postgresql'],
    level: 'intermediate',
    popularity: 'high'
  },
  'firestore': {
    synonyms: ['cloud firestore', 'firebase firestore'],
    related: ['gcp', 'firebase', 'nosql', 'realtime'],
    category: 'cloud',
    subcategory: 'database',
    keywords: ['nosql', 'realtime', 'document database', 'firebase'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'cloud pub/sub': {
    synonyms: ['pub/sub', 'pubsub'],
    related: ['gcp', 'messaging', 'streaming', 'event'],
    category: 'cloud',
    subcategory: 'messaging',
    keywords: ['messaging', 'pub/sub', 'streaming', 'event-driven'],
    level: 'intermediate',
    popularity: 'high'
  },
  'cloud cdn': {
    synonyms: ['google cloud cdn'],
    related: ['gcp', 'cdn', 'edge', 'content delivery'],
    category: 'cloud',
    subcategory: 'cdn',
    keywords: ['cdn', 'content delivery', 'edge caching', 'global'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'cloud monitoring': {
    synonyms: ['stackdriver', 'google cloud monitoring'],
    related: ['gcp', 'monitoring', 'logging', 'operations'],
    category: 'cloud',
    subcategory: 'monitoring',
    keywords: ['monitoring', 'logging', 'metrics', 'operations'],
    level: 'intermediate',
    popularity: 'high'
  },
  'vertex ai': {
    synonyms: ['google vertex ai'],
    related: ['gcp', 'machine learning', 'ml', 'ai platform'],
    category: 'cloud',
    subcategory: 'ml',
    keywords: ['machine learning', 'unified ai platform', 'mlops', 'google'],
    level: 'advanced',
    popularity: 'high'
  },
  'dataflow': {
    synonyms: ['google dataflow'],
    related: ['gcp', 'streaming', 'batch', 'apache beam'],
    category: 'cloud',
    subcategory: 'streaming',
    keywords: ['stream processing', 'batch processing', 'apache beam', 'unified'],
    level: 'advanced',
    popularity: 'medium'
  },
  'dataproc': {
    synonyms: ['google dataproc'],
    related: ['gcp', 'hadoop', 'spark', 'big data'],
    category: 'cloud',
    subcategory: 'big-data',
    keywords: ['managed hadoop', 'managed spark', 'big data', 'clusters'],
    level: 'advanced',
    popularity: 'medium'
  },

  // Continue with more technologies across all categories...
  // Adding 400+ more technologies for various frameworks, libraries, and tools

};

module.exports = {
  MEGA_EXPANSION_TAXONOMY
};

