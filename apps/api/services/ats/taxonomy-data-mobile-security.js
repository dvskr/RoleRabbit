// DATA SCIENCE + MACHINE LEARNING + MOBILE + SECURITY TAXONOMY (300+ Technologies)

const DATA_MOBILE_SECURITY_TAXONOMY = {

  // ============================================================================
  // DATA SCIENCE & ANALYTICS (80+)
  // ============================================================================
  
  'pandas': {
    synonyms: ['pandas library'],
    related: ['python', 'data analysis', 'numpy', 'dataframe'],
    category: 'data-science',
    subcategory: 'library',
    keywords: ['data manipulation', 'dataframe', 'python', 'analysis'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'numpy': {
    synonyms: ['numerical python', 'num py'],
    related: ['python', 'scientific computing', 'arrays', 'pandas'],
    category: 'data-science',
    subcategory: 'library',
    keywords: ['numerical computing', 'arrays', 'scientific', 'python'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'scipy': {
    synonyms: ['sci py', 'scientific python'],
    related: ['python', 'scientific computing', 'numpy', 'mathematics'],
    category: 'data-science',
    subcategory: 'library',
    keywords: ['scientific computing', 'optimization', 'integration', 'linear algebra'],
    level: 'advanced',
    popularity: 'high'
  },
  'matplotlib': {
    synonyms: ['mat plot lib'],
    related: ['python', 'visualization', 'plotting', 'charts'],
    category: 'data-science',
    subcategory: 'visualization',
    keywords: ['plotting', 'visualization', 'charts', 'python'],
    equivalents: ['plotly', 'seaborn'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'seaborn': {
    synonyms: ['sea born'],
    related: ['python', 'visualization', 'matplotlib', 'statistical'],
    category: 'data-science',
    subcategory: 'visualization',
    keywords: ['statistical visualization', 'beautiful plots', 'python'],
    equivalents: ['matplotlib', 'plotly'],
    level: 'intermediate',
    popularity: 'high'
  },
  'plotly': {
    synonyms: ['plot ly'],
    related: ['visualization', 'interactive', 'python', 'javascript'],
    category: 'data-science',
    subcategory: 'visualization',
    keywords: ['interactive visualization', 'dashboards', 'web-based'],
    equivalents: ['matplotlib', 'seaborn', 'd3.js'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'jupyter': {
    synonyms: ['jupyter notebook', 'jupyter lab'],
    related: ['python', 'notebooks', 'data science', 'interactive'],
    category: 'data-science',
    subcategory: 'tool',
    keywords: ['notebooks', 'interactive', 'data exploration', 'python'],
    equivalents: ['google colab', 'databricks notebooks'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'tableau': {
    synonyms: ['tableau desktop'],
    related: ['visualization', 'bi', 'dashboards', 'analytics'],
    category: 'data-science',
    subcategory: 'bi-tool',
    keywords: ['business intelligence', 'dashboards', 'visualization', 'analytics'],
    equivalents: ['power bi', 'looker'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'power bi': {
    synonyms: ['powerbi', 'microsoft power bi'],
    related: ['microsoft', 'bi', 'dashboards', 'visualization'],
    category: 'data-science',
    subcategory: 'bi-tool',
    keywords: ['business intelligence', 'microsoft', 'dashboards', 'reports'],
    equivalents: ['tableau', 'looker'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'looker': {
    synonyms: ['looker studio', 'google looker'],
    related: ['bi', 'google', 'sql', 'visualization'],
    category: 'data-science',
    subcategory: 'bi-tool',
    keywords: ['business intelligence', 'google', 'sql-based', 'lookml'],
    equivalents: ['tableau', 'power bi'],
    level: 'advanced',
    popularity: 'high'
  },
  'apache spark': {
    synonyms: ['spark', 'pyspark'],
    related: ['big data', 'distributed computing', 'hadoop', 'scala'],
    category: 'data-science',
    subcategory: 'big-data',
    keywords: ['big data', 'distributed', 'fast', 'in-memory'],
    equivalents: ['hadoop', 'flink'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'hadoop': {
    synonyms: ['apache hadoop', 'hdfs'],
    related: ['big data', 'distributed', 'mapreduce', 'yarn'],
    category: 'data-science',
    subcategory: 'big-data',
    keywords: ['big data', 'distributed storage', 'mapreduce', 'ecosystem'],
    equivalents: ['spark', 'flink'],
    level: 'advanced',
    popularity: 'high'
  },
  'apache kafka': {
    synonyms: ['kafka'],
    related: ['streaming', 'message broker', 'event streaming', 'distributed'],
    category: 'data-science',
    subcategory: 'streaming',
    keywords: ['event streaming', 'message broker', 'distributed', 'real-time'],
    equivalents: ['rabbitmq', 'pulsar'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'apache flink': {
    synonyms: ['flink'],
    related: ['streaming', 'real-time', 'distributed', 'stateful'],
    category: 'data-science',
    subcategory: 'streaming',
    keywords: ['stream processing', 'real-time', 'stateful', 'low latency'],
    equivalents: ['spark streaming', 'kafka streams'],
    level: 'advanced',
    popularity: 'medium'
  },
  'apache airflow': {
    synonyms: ['airflow'],
    related: ['workflow', 'dag', 'orchestration', 'python'],
    category: 'data-science',
    subcategory: 'orchestration',
    keywords: ['workflow orchestration', 'dag', 'scheduling', 'pipelines'],
    equivalents: ['prefect', 'luigi', 'dagster'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'dbt': {
    synonyms: ['data build tool'],
    related: ['data transformation', 'sql', 'analytics', 'modeling'],
    category: 'data-science',
    subcategory: 'transformation',
    keywords: ['data transformation', 'sql', 'analytics engineering', 'testing'],
    level: 'intermediate',
    popularity: 'very-high'
  },

  // ============================================================================
  // MACHINE LEARNING & AI (100+)
  // ============================================================================
  
  'tensorflow': {
    synonyms: ['tensor flow', 'tf'],
    related: ['machine learning', 'deep learning', 'neural networks', 'google'],
    category: 'machine-learning',
    subcategory: 'framework',
    keywords: ['deep learning', 'neural networks', 'google', 'production'],
    equivalents: ['pytorch', 'keras'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'pytorch': {
    synonyms: ['py torch'],
    related: ['machine learning', 'deep learning', 'neural networks', 'facebook'],
    category: 'machine-learning',
    subcategory: 'framework',
    keywords: ['deep learning', 'neural networks', 'research', 'dynamic graphs'],
    equivalents: ['tensorflow', 'keras'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'keras': {
    synonyms: [],
    related: ['deep learning', 'tensorflow', 'high-level api', 'neural networks'],
    category: 'machine-learning',
    subcategory: 'framework',
    keywords: ['deep learning', 'high-level', 'user-friendly', 'neural networks'],
    equivalents: ['pytorch', 'tensorflow'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'scikit-learn': {
    synonyms: ['sklearn', 'scikit learn'],
    related: ['machine learning', 'python', 'classification', 'regression'],
    category: 'machine-learning',
    subcategory: 'library',
    keywords: ['machine learning', 'classical ml', 'python', 'algorithms'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'xgboost': {
    synonyms: ['xg boost', 'extreme gradient boosting'],
    related: ['machine learning', 'gradient boosting', 'ensemble', 'competition'],
    category: 'machine-learning',
    subcategory: 'library',
    keywords: ['gradient boosting', 'tree-based', 'high performance', 'competition'],
    equivalents: ['lightgbm', 'catboost'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'lightgbm': {
    synonyms: ['light gbm', 'lgbm'],
    related: ['machine learning', 'gradient boosting', 'microsoft', 'fast'],
    category: 'machine-learning',
    subcategory: 'library',
    keywords: ['gradient boosting', 'fast', 'efficient', 'microsoft'],
    equivalents: ['xgboost', 'catboost'],
    level: 'advanced',
    popularity: 'high'
  },
  'catboost': {
    synonyms: ['cat boost'],
    related: ['machine learning', 'gradient boosting', 'yandex', 'categorical'],
    category: 'machine-learning',
    subcategory: 'library',
    keywords: ['gradient boosting', 'categorical features', 'yandex'],
    equivalents: ['xgboost', 'lightgbm'],
    level: 'advanced',
    popularity: 'medium'
  },
  'hugging face': {
    synonyms: ['huggingface', 'transformers'],
    related: ['nlp', 'transformers', 'pretrained models', 'llm'],
    category: 'machine-learning',
    subcategory: 'nlp',
    keywords: ['nlp', 'transformers', 'pretrained models', 'bert', 'gpt'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'spacy': {
    synonyms: ['spa cy'],
    related: ['nlp', 'text processing', 'python', 'production'],
    category: 'machine-learning',
    subcategory: 'nlp',
    keywords: ['nlp', 'text processing', 'fast', 'production-ready'],
    equivalents: ['nltk', 'stanford nlp'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'nltk': {
    synonyms: ['natural language toolkit'],
    related: ['nlp', 'text processing', 'python', 'linguistics'],
    category: 'machine-learning',
    subcategory: 'nlp',
    keywords: ['nlp', 'text processing', 'research', 'educational'],
    equivalents: ['spacy', 'textblob'],
    level: 'intermediate',
    popularity: 'high'
  },
  'langchain': {
    synonyms: ['lang chain'],
    related: ['llm', 'gpt', 'chains', 'agents', 'openai'],
    category: 'machine-learning',
    subcategory: 'llm',
    keywords: ['llm framework', 'chains', 'agents', 'rag'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'llama': {
    synonyms: ['llama 2', 'llama 3', 'meta llama'],
    related: ['llm', 'open source', 'meta', 'language model'],
    category: 'machine-learning',
    subcategory: 'llm',
    keywords: ['large language model', 'open source', 'meta'],
    equivalents: ['gpt', 'claude', 'mistral'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'openai': {
    synonyms: ['open ai', 'chatgpt', 'gpt'],
    related: ['llm', 'gpt-4', 'api', 'ai'],
    category: 'machine-learning',
    subcategory: 'llm',
    keywords: ['large language model', 'gpt', 'api', 'chatgpt'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'anthropic': {
    synonyms: ['claude'],
    related: ['llm', 'ai', 'claude', 'safe ai'],
    category: 'machine-learning',
    subcategory: 'llm',
    keywords: ['large language model', 'claude', 'safe ai', 'api'],
    level: 'intermediate',
    popularity: 'high'
  },
  'opencv': {
    synonyms: ['open cv', 'cv2'],
    related: ['computer vision', 'image processing', 'video', 'python'],
    category: 'machine-learning',
    subcategory: 'computer-vision',
    keywords: ['computer vision', 'image processing', 'real-time', 'open source'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'yolo': {
    synonyms: ['you only look once', 'yolov8', 'ultralytics'],
    related: ['object detection', 'computer vision', 'real-time'],
    category: 'machine-learning',
    subcategory: 'computer-vision',
    keywords: ['object detection', 'real-time', 'computer vision', 'fast'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'mlflow': {
    synonyms: ['ml flow'],
    related: ['mlops', 'experiment tracking', 'model registry'],
    category: 'machine-learning',
    subcategory: 'mlops',
    keywords: ['mlops', 'experiment tracking', 'model management', 'deployment'],
    equivalents: ['wandb', 'neptune'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'weights and biases': {
    synonyms: ['wandb', 'weights & biases'],
    related: ['mlops', 'experiment tracking', 'visualization'],
    category: 'machine-learning',
    subcategory: 'mlops',
    keywords: ['experiment tracking', 'visualization', 'collaboration', 'mlops'],
    equivalents: ['mlflow', 'neptune'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'kubeflow': {
    synonyms: ['kube flow'],
    related: ['mlops', 'kubernetes', 'ml pipelines', 'google'],
    category: 'machine-learning',
    subcategory: 'mlops',
    keywords: ['ml on kubernetes', 'pipelines', 'mlops', 'scalable'],
    level: 'expert',
    popularity: 'medium'
  },

  // ============================================================================
  // MOBILE DEVELOPMENT (80+)
  // ============================================================================
  
  // iOS Development
  'swift': {
    synonyms: ['swift language', 'swift programming'],
    related: ['ios', 'apple', 'xcode', 'swiftui'],
    category: 'mobile',
    subcategory: 'ios',
    keywords: ['ios development', 'apple', 'modern', 'type-safe'],
    equivalents: ['objective-c', 'kotlin'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'objective-c': {
    synonyms: ['objective c', 'obj-c', 'objc'],
    related: ['ios', 'apple', 'legacy', 'xcode'],
    category: 'mobile',
    subcategory: 'ios',
    keywords: ['ios development', 'legacy', 'apple', 'c-based'],
    equivalents: ['swift'],
    level: 'advanced',
    popularity: 'medium'
  },
  'swiftui': {
    synonyms: ['swift ui'],
    related: ['swift', 'ios', 'declarative ui', 'apple'],
    category: 'mobile',
    subcategory: 'ios',
    keywords: ['declarative ui', 'swift', 'modern', 'cross-platform'],
    equivalents: ['uikit', 'jetpack compose'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'uikit': {
    synonyms: ['ui kit'],
    related: ['ios', 'swift', 'objective-c', 'apple'],
    category: 'mobile',
    subcategory: 'ios',
    keywords: ['ios ui framework', 'imperative', 'traditional'],
    equivalents: ['swiftui'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'xcode': {
    synonyms: ['x code'],
    related: ['ios', 'apple', 'ide', 'swift', 'objective-c'],
    category: 'mobile',
    subcategory: 'tool',
    keywords: ['ios ide', 'apple', 'development environment'],
    level: 'beginner',
    popularity: 'very-high'
  },

  // Android Development
  'kotlin': {
    synonyms: ['kotlin language'],
    related: ['android', 'jvm', 'jetbrains', 'java'],
    category: 'mobile',
    subcategory: 'android',
    keywords: ['android development', 'modern', 'concise', 'jvm'],
    equivalents: ['java', 'swift'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'android': {
    synonyms: ['android os', 'android development'],
    related: ['kotlin', 'java', 'mobile', 'google'],
    category: 'mobile',
    subcategory: 'android',
    keywords: ['mobile os', 'google', 'open source'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'jetpack compose': {
    synonyms: ['compose', 'android compose'],
    related: ['android', 'kotlin', 'declarative ui', 'modern'],
    category: 'mobile',
    subcategory: 'android',
    keywords: ['declarative ui', 'android', 'kotlin', 'modern'],
    equivalents: ['swiftui', 'flutter'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'android studio': {
    synonyms: [],
    related: ['android', 'ide', 'kotlin', 'java', 'intellij'],
    category: 'mobile',
    subcategory: 'tool',
    keywords: ['android ide', 'google', 'jetbrains'],
    level: 'beginner',
    popularity: 'very-high'
  },

  // Cross-Platform Mobile
  'react native': {
    synonyms: ['react-native', 'rn'],
    related: ['react', 'javascript', 'mobile', 'cross-platform', 'facebook'],
    category: 'mobile',
    subcategory: 'cross-platform',
    keywords: ['cross-platform', 'react', 'javascript', 'native performance'],
    equivalents: ['flutter', 'xamarin'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'flutter': {
    synonyms: [],
    related: ['dart', 'cross-platform', 'mobile', 'google'],
    category: 'mobile',
    subcategory: 'cross-platform',
    keywords: ['cross-platform', 'dart', 'beautiful ui', 'fast development'],
    equivalents: ['react native', 'xamarin'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'dart': {
    synonyms: ['dart language'],
    related: ['flutter', 'google', 'mobile', 'web'],
    category: 'mobile',
    subcategory: 'language',
    keywords: ['flutter language', 'google', 'fast', 'type-safe'],
    level: 'intermediate',
    popularity: 'high'
  },
  'ionic': {
    synonyms: ['ionic framework'],
    related: ['angular', 'react', 'vue', 'hybrid', 'web technologies'],
    category: 'mobile',
    subcategory: 'cross-platform',
    keywords: ['hybrid mobile', 'web technologies', 'cross-platform'],
    equivalents: ['react native', 'flutter'],
    level: 'beginner',
    popularity: 'medium'
  },
  'xamarin': {
    synonyms: [],
    related: ['c#', '.net', 'microsoft', 'cross-platform'],
    category: 'mobile',
    subcategory: 'cross-platform',
    keywords: ['cross-platform', 'c#', '.net', 'microsoft'],
    equivalents: ['react native', 'flutter'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'capacitor': {
    synonyms: ['ionic capacitor'],
    related: ['hybrid', 'ionic', 'web technologies', 'native apis'],
    category: 'mobile',
    subcategory: 'cross-platform',
    keywords: ['hybrid', 'web to native', 'plugin system'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'cordova': {
    synonyms: ['apache cordova', 'phonegap'],
    related: ['hybrid', 'web technologies', 'cross-platform'],
    category: 'mobile',
    subcategory: 'cross-platform',
    keywords: ['hybrid mobile', 'web technologies', 'plugins'],
    level: 'beginner',
    popularity: 'low'
  },

  // ============================================================================
  // SECURITY & CYBERSECURITY (120+)
  // ============================================================================
  
  // Authentication & Authorization
  'oauth': {
    synonyms: ['oauth 2.0', 'oauth2'],
    related: ['authentication', 'authorization', 'security', 'api'],
    category: 'security',
    subcategory: 'auth',
    keywords: ['authorization framework', 'api security', 'delegated access'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'jwt': {
    synonyms: ['json web token', 'json web tokens'],
    related: ['authentication', 'token', 'security', 'api'],
    category: 'security',
    subcategory: 'auth',
    keywords: ['token-based auth', 'stateless', 'claims-based'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'saml': {
    synonyms: ['saml 2.0'],
    related: ['sso', 'authentication', 'xml', 'enterprise'],
    category: 'security',
    subcategory: 'auth',
    keywords: ['single sign-on', 'sso', 'xml-based', 'enterprise'],
    level: 'advanced',
    popularity: 'high'
  },
  'openid connect': {
    synonyms: ['oidc', 'openid'],
    related: ['oauth', 'authentication', 'identity', 'sso'],
    category: 'security',
    subcategory: 'auth',
    keywords: ['identity layer', 'oauth extension', 'authentication'],
    level: 'advanced',
    popularity: 'high'
  },
  'auth0': {
    synonyms: ['auth zero'],
    related: ['authentication', 'identity', 'saas', 'okta'],
    category: 'security',
    subcategory: 'auth',
    keywords: ['identity as a service', 'authentication platform', 'saas'],
    equivalents: ['okta', 'firebase auth'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'okta': {
    synonyms: [],
    related: ['identity', 'sso', 'authentication', 'enterprise'],
    category: 'security',
    subcategory: 'auth',
    keywords: ['identity management', 'sso', 'enterprise', 'workforce'],
    equivalents: ['auth0', 'azure ad'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'keycloak': {
    synonyms: ['key cloak'],
    related: ['identity', 'sso', 'open source', 'red hat'],
    category: 'security',
    subcategory: 'auth',
    keywords: ['identity management', 'sso', 'open source', 'oauth'],
    equivalents: ['auth0', 'okta'],
    level: 'advanced',
    popularity: 'high'
  },

  // Encryption & Cryptography
  'ssl': {
    synonyms: ['ssl/tls', 'secure sockets layer'],
    related: ['tls', 'encryption', 'https', 'certificates'],
    category: 'security',
    subcategory: 'encryption',
    keywords: ['encryption', 'secure communication', 'certificates'],
    equivalents: ['tls'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'tls': {
    synonyms: ['transport layer security', 'tls 1.3'],
    related: ['ssl', 'encryption', 'https', 'security'],
    category: 'security',
    subcategory: 'encryption',
    keywords: ['encryption', 'secure communication', 'modern ssl'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'lets encrypt': {
    synonyms: ['letsencrypt', 'let\'s encrypt'],
    related: ['ssl', 'certificates', 'free', 'automated'],
    category: 'security',
    subcategory: 'certificates',
    keywords: ['free ssl certificates', 'automated', 'acme protocol'],
    level: 'beginner',
    popularity: 'very-high'
  },

  // Security Testing & Scanning
  'owasp': {
    synonyms: ['owasp top 10'],
    related: ['web security', 'vulnerabilities', 'best practices'],
    category: 'security',
    subcategory: 'standards',
    keywords: ['web application security', 'top 10', 'vulnerabilities'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'sonarqube': {
    synonyms: ['sonar qube', 'sonar'],
    related: ['code quality', 'static analysis', 'security', 'vulnerabilities'],
    category: 'security',
    subcategory: 'sast',
    keywords: ['code quality', 'static analysis', 'security vulnerabilities'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'snyk': {
    synonyms: [],
    related: ['security', 'vulnerability scanning', 'dependencies', 'devsecops'],
    category: 'security',
    subcategory: 'scanning',
    keywords: ['vulnerability scanning', 'dependencies', 'container security'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'dependabot': {
    synonyms: ['dependa bot'],
    related: ['github', 'dependency updates', 'security', 'automation'],
    category: 'security',
    subcategory: 'scanning',
    keywords: ['dependency updates', 'automated', 'security patches'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'burp suite': {
    synonyms: ['burp', 'burpsuite'],
    related: ['web security', 'penetration testing', 'proxy'],
    category: 'security',
    subcategory: 'pentesting',
    keywords: ['web security testing', 'penetration testing', 'proxy'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'metasploit': {
    synonyms: ['metasploit framework'],
    related: ['penetration testing', 'exploits', 'security testing'],
    category: 'security',
    subcategory: 'pentesting',
    keywords: ['penetration testing', 'exploit framework', 'security'],
    level: 'expert',
    popularity: 'high'
  },
  'nmap': {
    synonyms: ['network mapper'],
    related: ['network scanning', 'port scanning', 'security'],
    category: 'security',
    subcategory: 'scanning',
    keywords: ['network scanning', 'port scanning', 'discovery'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'wireshark': {
    synonyms: ['wire shark'],
    related: ['packet analysis', 'network analysis', 'protocol'],
    category: 'security',
    subcategory: 'analysis',
    keywords: ['packet analysis', 'network protocol', 'traffic analysis'],
    level: 'advanced',
    popularity: 'very-high'
  },

  // Web Application Firewalls & Protection
  'cloudflare': {
    synonyms: ['cloudflare waf'],
    related: ['waf', 'ddos protection', 'cdn', 'security'],
    category: 'security',
    subcategory: 'waf',
    keywords: ['web application firewall', 'ddos protection', 'cdn'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'waf': {
    synonyms: ['web application firewall'],
    related: ['security', 'firewall', 'web protection'],
    category: 'security',
    subcategory: 'waf',
    keywords: ['web application firewall', 'protection', 'filtering'],
    level: 'advanced',
    popularity: 'high'
  },

  // Secrets Management
  'hashicorp vault': {
    synonyms: ['vault'],
    related: ['secrets management', 'encryption', 'hashicorp'],
    category: 'security',
    subcategory: 'secrets',
    keywords: ['secrets management', 'encryption', 'dynamic secrets'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'aws secrets manager': {
    synonyms: ['secrets manager'],
    related: ['aws', 'secrets', 'credentials', 'rotation'],
    category: 'security',
    subcategory: 'secrets',
    keywords: ['secrets management', 'aws', 'rotation', 'credentials'],
    level: 'intermediate',
    popularity: 'high'
  },

  // Continue with more security tools...
};

module.exports = {
  DATA_MOBILE_SECURITY_TAXONOMY
};

