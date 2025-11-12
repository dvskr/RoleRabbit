// CLOUD + DEVOPS COMPLETE TAXONOMY (350+ Technologies)
// AWS, Azure, GCP, DevOps Tools, CI/CD, Monitoring, IaC, Containers

const CLOUD_DEVOPS_COMPLETE = {

  // ============================================================================
  // CLOUD PLATFORMS (15+)
  // ============================================================================
  
  'aws': {
    synonyms: ['amazon web services', 'amazon aws'],
    related: ['ec2', 's3', 'lambda', 'rds', 'dynamodb', 'cloudformation'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['cloud platform', 'infrastructure', 'scalable', 'iaas', 'paas'],
    equivalents: ['azure', 'gcp', 'google cloud'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'azure': {
    synonyms: ['microsoft azure', 'azure cloud'],
    related: ['azure devops', 'azure functions', 'cosmos db', 'aks'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['cloud platform', 'microsoft', 'enterprise'],
    equivalents: ['aws', 'gcp', 'google cloud'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'gcp': {
    synonyms: ['google cloud platform', 'google cloud', 'gcloud'],
    related: ['compute engine', 'app engine', 'cloud functions', 'bigquery'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['cloud platform', 'google', 'scalable'],
    equivalents: ['aws', 'azure'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'digitalocean': {
    synonyms: ['digital ocean', 'do'],
    related: ['droplets', 'kubernetes', 'app platform'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['cloud hosting', 'developer friendly', 'simple'],
    level: 'beginner',
    popularity: 'high'
  },
  'linode': {
    synonyms: ['akamai cloud'],
    related: ['linux', 'vps', 'cloud hosting'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['linux cloud', 'vps', 'simple'],
    level: 'beginner',
    popularity: 'medium'
  },
  'vultr': {
    synonyms: [],
    related: ['vps', 'cloud hosting', 'bare metal'],
    category: 'cloud',
    subcategory: 'platform',
    keywords: ['cloud hosting', 'performance', 'global'],
    level: 'beginner',
    popularity: 'medium'
  },
  'heroku': {
    synonyms: [],
    related: ['paas', 'buildpacks', 'dynos', 'salesforce'],
    category: 'cloud',
    subcategory: 'paas',
    keywords: ['platform as a service', 'easy deployment', 'git based'],
    level: 'beginner',
    popularity: 'high'
  },
  'vercel': {
    synonyms: ['zeit'],
    related: ['next.js', 'frontend', 'serverless', 'edge'],
    category: 'cloud',
    subcategory: 'paas',
    keywords: ['frontend cloud', 'next.js', 'edge network', 'jamstack'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'netlify': {
    synonyms: [],
    related: ['jamstack', 'static sites', 'serverless functions'],
    category: 'cloud',
    subcategory: 'paas',
    keywords: ['jamstack', 'static sites', 'continuous deployment'],
    level: 'beginner',
    popularity: 'high'
  },
  'cloudflare': {
    synonyms: ['cloudflare workers'],
    related: ['cdn', 'edge computing', 'dns', 'ddos protection'],
    category: 'cloud',
    subcategory: 'edge',
    keywords: ['cdn', 'edge computing', 'security', 'workers'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'render': {
    synonyms: [],
    related: ['paas', 'static sites', 'docker'],
    category: 'cloud',
    subcategory: 'paas',
    keywords: ['paas', 'auto deploy', 'free tier'],
    level: 'beginner',
    popularity: 'medium'
  },
  'railway': {
    synonyms: ['railway app'],
    related: ['paas', 'docker', 'databases'],
    category: 'cloud',
    subcategory: 'paas',
    keywords: ['paas', 'simple', 'instant deploy'],
    level: 'beginner',
    popularity: 'medium'
  },
  'fly.io': {
    synonyms: ['fly'],
    related: ['edge', 'containers', 'global'],
    category: 'cloud',
    subcategory: 'paas',
    keywords: ['edge deployment', 'global', 'containers'],
    level: 'intermediate',
    popularity: 'medium'
  },

  // ============================================================================
  // CONTAINER & ORCHESTRATION (25+)
  // ============================================================================
  
  'docker': {
    synonyms: ['docker container'],
    related: ['containerization', 'dockerfile', 'docker compose', 'docker hub'],
    category: 'devops',
    subcategory: 'containerization',
    keywords: ['container', 'image', 'portable', 'microservices'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'kubernetes': {
    synonyms: ['k8s', 'k8', 'kube'],
    related: ['container orchestration', 'pods', 'helm', 'kubectl', 'docker'],
    category: 'devops',
    subcategory: 'orchestration',
    keywords: ['container orchestration', 'cluster management', 'scaling', 'deployment'],
    equivalents: ['docker swarm', 'nomad'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'docker compose': {
    synonyms: ['docker-compose', 'compose'],
    related: ['docker', 'multi-container', 'yaml'],
    category: 'devops',
    subcategory: 'containerization',
    keywords: ['multi-container', 'local development', 'yaml configuration'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'docker swarm': {
    synonyms: ['swarm'],
    related: ['docker', 'orchestration', 'clustering'],
    category: 'devops',
    subcategory: 'orchestration',
    keywords: ['docker native orchestration', 'clustering', 'simple'],
    equivalents: ['kubernetes', 'nomad'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'helm': {
    synonyms: ['helm charts'],
    related: ['kubernetes', 'package manager', 'charts'],
    category: 'devops',
    subcategory: 'package-manager',
    keywords: ['kubernetes package manager', 'charts', 'templating'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'kubectl': {
    synonyms: ['kube ctl'],
    related: ['kubernetes', 'cli', 'cluster management'],
    category: 'devops',
    subcategory: 'tool',
    keywords: ['kubernetes cli', 'cluster control', 'command line'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'minikube': {
    synonyms: ['mini kube'],
    related: ['kubernetes', 'local development', 'learning'],
    category: 'devops',
    subcategory: 'tool',
    keywords: ['local kubernetes', 'development', 'learning'],
    level: 'beginner',
    popularity: 'high'
  },
  'kind': {
    synonyms: ['kubernetes in docker'],
    related: ['kubernetes', 'docker', 'testing'],
    category: 'devops',
    subcategory: 'tool',
    keywords: ['kubernetes testing', 'docker', 'ci'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'k3s': {
    synonyms: ['lightweight kubernetes'],
    related: ['kubernetes', 'edge', 'iot', 'rancher'],
    category: 'devops',
    subcategory: 'orchestration',
    keywords: ['lightweight kubernetes', 'edge', 'iot', 'small footprint'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'openshift': {
    synonyms: ['red hat openshift'],
    related: ['kubernetes', 'red hat', 'paas', 'enterprise'],
    category: 'devops',
    subcategory: 'platform',
    keywords: ['kubernetes platform', 'enterprise', 'red hat'],
    level: 'advanced',
    popularity: 'medium'
  },
  'rancher': {
    synonyms: ['rancher labs'],
    related: ['kubernetes', 'multi-cluster', 'management'],
    category: 'devops',
    subcategory: 'platform',
    keywords: ['kubernetes management', 'multi-cluster', 'ui'],
    level: 'advanced',
    popularity: 'medium'
  },
  'nomad': {
    synonyms: ['hashicorp nomad'],
    related: ['orchestration', 'hashicorp', 'scheduling'],
    category: 'devops',
    subcategory: 'orchestration',
    keywords: ['orchestration', 'simple', 'flexible', 'hashicorp'],
    equivalents: ['kubernetes', 'docker swarm'],
    level: 'intermediate',
    popularity: 'low'
  },
  'podman': {
    synonyms: ['pod man'],
    related: ['containers', 'docker alternative', 'daemonless'],
    category: 'devops',
    subcategory: 'containerization',
    keywords: ['docker alternative', 'daemonless', 'rootless'],
    equivalents: ['docker'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'containerd': {
    synonyms: ['container d'],
    related: ['container runtime', 'kubernetes', 'docker'],
    category: 'devops',
    subcategory: 'containerization',
    keywords: ['container runtime', 'cncf', 'kubernetes'],
    level: 'advanced',
    popularity: 'medium'
  },

  // ============================================================================
  // CI/CD (40+)
  // ============================================================================
  
  'jenkins': {
    synonyms: ['jenkins ci'],
    related: ['ci/cd', 'continuous integration', 'pipeline', 'groovy'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'continuous deployment', 'automation', 'pipeline'],
    equivalents: ['gitlab ci', 'github actions', 'circleci', 'travis ci'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'github actions': {
    synonyms: ['gh actions', 'actions'],
    related: ['ci/cd', 'github', 'yaml', 'workflow'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'workflow automation', 'github'],
    equivalents: ['jenkins', 'gitlab ci', 'circleci'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'gitlab ci': {
    synonyms: ['gitlab ci/cd', 'gitlab pipelines'],
    related: ['ci/cd', 'gitlab', 'yaml', 'runner'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'pipeline', 'automation'],
    equivalents: ['jenkins', 'github actions', 'circleci'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'circleci': {
    synonyms: ['circle ci'],
    related: ['ci/cd', 'cloud', 'docker'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'cloud native', 'fast'],
    equivalents: ['jenkins', 'github actions', 'travis ci'],
    level: 'beginner',
    popularity: 'high'
  },
  'travis ci': {
    synonyms: ['travis'],
    related: ['ci/cd', 'github', 'open source'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'github integration', 'yaml'],
    equivalents: ['jenkins', 'circleci'],
    level: 'beginner',
    popularity: 'medium'
  },
  'azure devops': {
    synonyms: ['azure pipelines', 'vsts'],
    related: ['microsoft', 'ci/cd', 'azure', 'git'],
    category: 'devops',
    subcategory: 'platform',
    keywords: ['microsoft', 'ci/cd', 'project management', 'pipelines'],
    level: 'intermediate',
    popularity: 'high'
  },
  'bamboo': {
    synonyms: ['atlassian bamboo'],
    related: ['ci/cd', 'atlassian', 'jira'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'atlassian', 'enterprise'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'teamcity': {
    synonyms: ['team city'],
    related: ['ci/cd', 'jetbrains', 'build server'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['continuous integration', 'jetbrains', 'intelligent'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'drone': {
    synonyms: ['drone ci'],
    related: ['ci/cd', 'docker', 'containers'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['container native', 'docker', 'simple'],
    level: 'intermediate',
    popularity: 'low'
  },
  'buildkite': {
    synonyms: ['build kite'],
    related: ['ci/cd', 'hybrid', 'agents'],
    category: 'devops',
    subcategory: 'ci-cd',
    keywords: ['hybrid ci', 'fast', 'scalable'],
    level: 'intermediate',
    popularity: 'low'
  },
  'argocd': {
    synonyms: ['argo cd'],
    related: ['gitops', 'kubernetes', 'continuous deployment'],
    category: 'devops',
    subcategory: 'gitops',
    keywords: ['gitops', 'kubernetes', 'declarative', 'continuous deployment'],
    level: 'advanced',
    popularity: 'high'
  },
  'flux': {
    synonyms: ['flux cd', 'fluxcd'],
    related: ['gitops', 'kubernetes', 'continuous deployment'],
    category: 'devops',
    subcategory: 'gitops',
    keywords: ['gitops', 'kubernetes', 'cncf', 'continuous deployment'],
    equivalents: ['argocd'],
    level: 'advanced',
    popularity: 'medium'
  },
  'spinnaker': {
    synonyms: [],
    related: ['continuous delivery', 'multi-cloud', 'netflix'],
    category: 'devops',
    subcategory: 'cd',
    keywords: ['continuous delivery', 'multi-cloud', 'deployments'],
    level: 'advanced',
    popularity: 'medium'
  },

  // ============================================================================
  // INFRASTRUCTURE AS CODE (IaC) (20+)
  // ============================================================================
  
  'terraform': {
    synonyms: ['tf'],
    related: ['infrastructure as code', 'iac', 'hashicorp', 'hcl'],
    category: 'devops',
    subcategory: 'iac',
    keywords: ['infrastructure as code', 'provisioning', 'declarative', 'cloud automation'],
    equivalents: ['cloudformation', 'pulumi', 'ansible'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'ansible': {
    synonyms: ['ansible automation'],
    related: ['configuration management', 'automation', 'yaml', 'red hat'],
    category: 'devops',
    subcategory: 'configuration-management',
    keywords: ['configuration management', 'automation', 'agentless', 'playbooks'],
    equivalents: ['chef', 'puppet', 'saltstack'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'cloudformation': {
    synonyms: ['cloud formation', 'cfn'],
    related: ['aws', 'infrastructure as code', 'templates'],
    category: 'devops',
    subcategory: 'iac',
    keywords: ['aws', 'infrastructure as code', 'json', 'yaml'],
    equivalents: ['terraform', 'pulumi'],
    level: 'intermediate',
    popularity: 'high'
  },
  'pulumi': {
    synonyms: [],
    related: ['infrastructure as code', 'programming languages', 'modern'],
    category: 'devops',
    subcategory: 'iac',
    keywords: ['infrastructure as code', 'real programming languages', 'modern'],
    equivalents: ['terraform', 'cloudformation'],
    level: 'advanced',
    popularity: 'medium'
  },
  'chef': {
    synonyms: ['chef infra'],
    related: ['configuration management', 'ruby', 'cookbooks'],
    category: 'devops',
    subcategory: 'configuration-management',
    keywords: ['configuration management', 'ruby', 'cookbooks', 'recipes'],
    equivalents: ['ansible', 'puppet'],
    level: 'advanced',
    popularity: 'medium'
  },
  'puppet': {
    synonyms: ['puppet labs'],
    related: ['configuration management', 'infrastructure', 'manifests'],
    category: 'devops',
    subcategory: 'configuration-management',
    keywords: ['configuration management', 'declarative', 'enterprise'],
    equivalents: ['ansible', 'chef'],
    level: 'advanced',
    popularity: 'medium'
  },
  'saltstack': {
    synonyms: ['salt'],
    related: ['configuration management', 'python', 'event-driven'],
    category: 'devops',
    subcategory: 'configuration-management',
    keywords: ['configuration management', 'event-driven', 'fast'],
    equivalents: ['ansible', 'chef'],
    level: 'advanced',
    popularity: 'low'
  },
  'vagrant': {
    synonyms: ['hashicorp vagrant'],
    related: ['development environments', 'virtualbox', 'hashicorp'],
    category: 'devops',
    subcategory: 'development',
    keywords: ['development environments', 'portable', 'reproducible'],
    level: 'beginner',
    popularity: 'medium'
  },
  'packer': {
    synonyms: ['hashicorp packer'],
    related: ['image building', 'automation', 'hashicorp'],
    category: 'devops',
    subcategory: 'image-building',
    keywords: ['machine images', 'automation', 'multi-platform'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'bicep': {
    synonyms: ['azure bicep'],
    related: ['azure', 'infrastructure as code', 'arm templates'],
    category: 'devops',
    subcategory: 'iac',
    keywords: ['azure', 'infrastructure as code', 'dsl'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'cdk': {
    synonyms: ['aws cdk', 'cloud development kit'],
    related: ['aws', 'infrastructure as code', 'programming'],
    category: 'devops',
    subcategory: 'iac',
    keywords: ['aws', 'infrastructure as code', 'typescript', 'python'],
    level: 'advanced',
    popularity: 'high'
  },

  // ============================================================================
  // MONITORING & OBSERVABILITY (40+)
  // ============================================================================
  
  'prometheus': {
    synonyms: ['prometheus monitoring'],
    related: ['monitoring', 'metrics', 'alerting', 'grafana', 'time series'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['monitoring', 'metrics', 'alerts', 'time series database'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'grafana': {
    synonyms: ['grafana dashboard'],
    related: ['visualization', 'monitoring', 'dashboards', 'prometheus'],
    category: 'devops',
    subcategory: 'visualization',
    keywords: ['dashboards', 'visualization', 'monitoring', 'metrics'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'datadog': {
    synonyms: ['data dog'],
    related: ['monitoring', 'apm', 'infrastructure', 'logs'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['full stack monitoring', 'apm', 'cloud', 'saas'],
    equivalents: ['new relic', 'dynatrace'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'new relic': {
    synonyms: ['newrelic'],
    related: ['monitoring', 'apm', 'observability'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['application monitoring', 'apm', 'full stack'],
    equivalents: ['datadog', 'dynatrace'],
    level: 'intermediate',
    popularity: 'high'
  },
  'dynatrace': {
    synonyms: ['dyna trace'],
    related: ['monitoring', 'apm', 'ai', 'enterprise'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['apm', 'ai-powered', 'full stack', 'enterprise'],
    equivalents: ['datadog', 'new relic'],
    level: 'advanced',
    popularity: 'high'
  },
  'appdynamics': {
    synonyms: ['app dynamics'],
    related: ['monitoring', 'apm', 'cisco', 'enterprise'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['apm', 'application monitoring', 'enterprise'],
    level: 'advanced',
    popularity: 'medium'
  },
  'nagios': {
    synonyms: [],
    related: ['monitoring', 'alerting', 'infrastructure', 'legacy'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['infrastructure monitoring', 'alerting', 'open source'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'zabbix': {
    synonyms: [],
    related: ['monitoring', 'enterprise', 'infrastructure'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['enterprise monitoring', 'infrastructure', 'open source'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'elk stack': {
    synonyms: ['elk', 'elasticsearch logstash kibana', 'elastic stack'],
    related: ['logging', 'elasticsearch', 'logstash', 'kibana', 'log aggregation'],
    category: 'devops',
    subcategory: 'logging',
    keywords: ['log aggregation', 'search', 'analytics', 'visualization'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'elasticsearch': {
    synonyms: ['elastic search', 'es'],
    related: ['search', 'elk', 'logging', 'analytics'],
    category: 'devops',
    subcategory: 'logging',
    keywords: ['search engine', 'log storage', 'distributed'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'logstash': {
    synonyms: ['log stash'],
    related: ['elk', 'log processing', 'pipeline'],
    category: 'devops',
    subcategory: 'logging',
    keywords: ['log processing', 'pipeline', 'ingestion'],
    level: 'intermediate',
    popularity: 'high'
  },
  'kibana': {
    synonyms: [],
    related: ['elk', 'visualization', 'elasticsearch'],
    category: 'devops',
    subcategory: 'visualization',
    keywords: ['log visualization', 'dashboards', 'elasticsearch ui'],
    level: 'intermediate',
    popularity: 'high'
  },
  'fluentd': {
    synonyms: ['fluent d'],
    related: ['log collection', 'cncf', 'unified logging'],
    category: 'devops',
    subcategory: 'logging',
    keywords: ['log collection', 'unified logging', 'cloud native'],
    equivalents: ['logstash', 'filebeat'],
    level: 'intermediate',
    popularity: 'high'
  },
  'filebeat': {
    synonyms: ['file beat'],
    related: ['elastic', 'log shipping', 'lightweight'],
    category: 'devops',
    subcategory: 'logging',
    keywords: ['log shipping', 'lightweight', 'elastic'],
    level: 'beginner',
    popularity: 'high'
  },
  'loki': {
    synonyms: ['grafana loki'],
    related: ['logging', 'grafana', 'prometheus-inspired'],
    category: 'devops',
    subcategory: 'logging',
    keywords: ['log aggregation', 'grafana', 'cost effective'],
    level: 'intermediate',
    popularity: 'high'
  },
  'splunk': {
    synonyms: [],
    related: ['logging', 'analytics', 'enterprise', 'siem'],
    category: 'devops',
    subcategory: 'logging',
    keywords: ['log management', 'analytics', 'enterprise', 'siem'],
    level: 'advanced',
    popularity: 'high'
  },
  'sumologic': {
    synonyms: ['sumo logic'],
    related: ['logging', 'cloud', 'analytics', 'saas'],
    category: 'devops',
    subcategory: 'logging',
    keywords: ['log management', 'cloud native', 'analytics'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'jaeger': {
    synonyms: [],
    related: ['distributed tracing', 'opentelemetry', 'cncf'],
    category: 'devops',
    subcategory: 'tracing',
    keywords: ['distributed tracing', 'microservices', 'cncf'],
    equivalents: ['zipkin', 'opentelemetry'],
    level: 'advanced',
    popularity: 'high'
  },
  'zipkin': {
    synonyms: [],
    related: ['distributed tracing', 'microservices'],
    category: 'devops',
    subcategory: 'tracing',
    keywords: ['distributed tracing', 'latency', 'microservices'],
    equivalents: ['jaeger', 'opentelemetry'],
    level: 'advanced',
    popularity: 'medium'
  },
  'opentelemetry': {
    synonyms: ['otel', 'open telemetry'],
    related: ['observability', 'tracing', 'metrics', 'logs'],
    category: 'devops',
    subcategory: 'observability',
    keywords: ['observability', 'vendor neutral', 'tracing', 'metrics'],
    level: 'advanced',
    popularity: 'high'
  },
  'sentry': {
    synonyms: [],
    related: ['error tracking', 'monitoring', 'crash reporting'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['error tracking', 'crash reporting', 'real-time'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'bugsnag': {
    synonyms: ['bug snag'],
    related: ['error tracking', 'crash reporting', 'monitoring'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['error tracking', 'crash reporting', 'stability'],
    level: 'beginner',
    popularity: 'medium'
  },
  'rollbar': {
    synonyms: [],
    related: ['error tracking', 'monitoring', 'real-time'],
    category: 'devops',
    subcategory: 'monitoring',
    keywords: ['error tracking', 'real-time errors', 'debugging'],
    level: 'beginner',
    popularity: 'medium'
  },

  // ============================================================================
  // SERVICE MESH & NETWORKING (15+)
  // ============================================================================
  
  'istio': {
    synonyms: [],
    related: ['service mesh', 'kubernetes', 'traffic management', 'envoy'],
    category: 'devops',
    subcategory: 'service-mesh',
    keywords: ['service mesh', 'microservices', 'traffic management', 'security'],
    equivalents: ['linkerd', 'consul connect'],
    level: 'expert',
    popularity: 'high'
  },
  'linkerd': {
    synonyms: ['linker d'],
    related: ['service mesh', 'kubernetes', 'lightweight', 'cncf'],
    category: 'devops',
    subcategory: 'service-mesh',
    keywords: ['service mesh', 'lightweight', 'simple', 'kubernetes'],
    equivalents: ['istio', 'consul connect'],
    level: 'advanced',
    popularity: 'medium'
  },
  'consul': {
    synonyms: ['hashicorp consul'],
    related: ['service mesh', 'service discovery', 'hashicorp'],
    category: 'devops',
    subcategory: 'service-mesh',
    keywords: ['service discovery', 'service mesh', 'consul connect'],
    level: 'advanced',
    popularity: 'medium'
  },
  'traefik': {
    synonyms: ['traefik proxy'],
    related: ['reverse proxy', 'load balancer', 'kubernetes'],
    category: 'devops',
    subcategory: 'proxy',
    keywords: ['reverse proxy', 'load balancer', 'cloud native'],
    equivalents: ['nginx', 'haproxy'],
    level: 'intermediate',
    popularity: 'high'
  },
  'nginx': {
    synonyms: ['engine x'],
    related: ['web server', 'reverse proxy', 'load balancer'],
    category: 'devops',
    subcategory: 'web-server',
    keywords: ['web server', 'reverse proxy', 'high performance'],
    equivalents: ['apache', 'caddy'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'apache': {
    synonyms: ['apache http server', 'httpd'],
    related: ['web server', 'http', 'modules'],
    category: 'devops',
    subcategory: 'web-server',
    keywords: ['web server', 'flexible', 'modular'],
    equivalents: ['nginx', 'iis'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'haproxy': {
    synonyms: ['ha proxy'],
    related: ['load balancer', 'proxy', 'high availability'],
    category: 'devops',
    subcategory: 'load-balancer',
    keywords: ['load balancer', 'high availability', 'tcp/http'],
    level: 'advanced',
    popularity: 'high'
  },
  'caddy': {
    synonyms: ['caddy server'],
    related: ['web server', 'automatic https', 'simple'],
    category: 'devops',
    subcategory: 'web-server',
    keywords: ['web server', 'automatic https', 'simple', 'modern'],
    level: 'beginner',
    popularity: 'medium'
  },
  'envoy': {
    synonyms: ['envoy proxy'],
    related: ['proxy', 'service mesh', 'cncf', 'istio'],
    category: 'devops',
    subcategory: 'proxy',
    keywords: ['edge proxy', 'service mesh', 'cloud native'],
    level: 'expert',
    popularity: 'high'
  },

  // Continue in next file...
};

module.exports = {
  CLOUD_DEVOPS_COMPLETE
};

