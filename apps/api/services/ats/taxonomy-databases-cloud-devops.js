// DATABASES + CLOUD + DEVOPS TAXONOMY (450+ Technologies)
// Comprehensive coverage of data storage, cloud platforms, and DevOps tools

const DATABASE_CLOUD_DEVOPS_TAXONOMY = {
  
  // ============================================================================
  // DATABASES (120+ Technologies)
  // ============================================================================
  
  // === RELATIONAL / SQL DATABASES (25+) ===
  'postgresql': {
    synonyms: ['postgres', 'psql', 'pg'],
    related: ['sql', 'relational database', 'pgadmin', 'postgis', 'timescaledb'],
    category: 'database',
    subcategory: 'relational',
    keywords: ['acid', 'transactions', 'jsonb', 'advanced sql', 'open source'],
    equivalents: ['mysql', 'mariadb', 'oracle', 'sql server'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'mysql': {
    synonyms: ['my sql'],
    related: ['sql', 'relational database', 'mariadb', 'innodb'],
    category: 'database',
    subcategory: 'relational',
    keywords: ['rdbms', 'innodb', 'acid', 'open source', 'web applications'],
    equivalents: ['postgresql', 'mariadb', 'sqlite'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'mariadb': {
    synonyms: ['maria db'],
    related: ['mysql', 'sql', 'relational database'],
    category: 'database',
    subcategory: 'relational',
    keywords: ['mysql fork', 'open source', 'rdbms'],
    equivalents: ['mysql', 'postgresql'],
    level: 'beginner',
    popularity: 'high'
  },
  'sqlite': {
    synonyms: ['sqlite3'],
    related: ['sql', 'embedded database', 'lightweight'],
    category: 'database',
    subcategory: 'embedded',
    keywords: ['embedded', 'serverless', 'lightweight', 'mobile'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'microsoft sql server': {
    synonyms: ['sql server', 'mssql', 'ms sql', 't-sql'],
    related: ['sql', 'microsoft', 'azure sql', 't-sql'],
    category: 'database',
    subcategory: 'relational',
    keywords: ['enterprise', 'microsoft', 'windows', 'azure'],
    equivalents: ['oracle', 'postgresql'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'oracle database': {
    synonyms: ['oracle', 'oracle db', 'oracle rdbms'],
    related: ['sql', 'pl/sql', 'enterprise', 'rac'],
    category: 'database',
    subcategory: 'relational',
    keywords: ['enterprise', 'high availability', 'scalable', 'expensive'],
    equivalents: ['sql server', 'postgresql', 'db2'],
    level: 'advanced',
    popularity: 'high'
  },
  'ibm db2': {
    synonyms: ['db2', 'db2 luw'],
    related: ['sql', 'ibm', 'enterprise', 'mainframe'],
    category: 'database',
    subcategory: 'relational',
    keywords: ['enterprise', 'mainframe', 'ibm'],
    equivalents: ['oracle', 'sql server'],
    level: 'advanced',
    popularity: 'medium'
  },
  'cockroachdb': {
    synonyms: ['cockroach db', 'crdb'],
    related: ['distributed sql', 'postgresql compatible', 'cloud native'],
    category: 'database',
    subcategory: 'distributed-sql',
    keywords: ['distributed', 'postgresql wire protocol', 'cloud native', 'resilient'],
    equivalents: ['yugabytedb', 'tidb'],
    level: 'advanced',
    popularity: 'medium'
  },
  'yugabytedb': {
    synonyms: ['yugabyte', 'yugabyte db'],
    related: ['distributed sql', 'postgresql compatible', 'multi-cloud'],
    category: 'database',
    subcategory: 'distributed-sql',
    keywords: ['distributed', 'postgresql compatible', 'multi-cloud'],
    equivalents: ['cockroachdb', 'tidb'],
    level: 'advanced',
    popularity: 'medium'
  },
  'tidb': {
    synonyms: ['ti db'],
    related: ['distributed sql', 'mysql compatible', 'hybrid'],
    category: 'database',
    subcategory: 'distributed-sql',
    keywords: ['distributed', 'mysql compatible', 'htap'],
    equivalents: ['cockroachdb', 'yugabytedb'],
    level: 'advanced',
    popularity: 'low'
  },
  'amazon aurora': {
    synonyms: ['aurora', 'aurora mysql', 'aurora postgresql'],
    related: ['aws', 'cloud database', 'mysql', 'postgresql'],
    category: 'database',
    subcategory: 'cloud-relational',
    keywords: ['aws', 'cloud native', 'serverless', 'mysql compatible'],
    level: 'intermediate',
    popularity: 'high'
  },
  'google cloud sql': {
    synonyms: ['cloud sql', 'gcp cloud sql'],
    related: ['gcp', 'managed database', 'mysql', 'postgresql'],
    category: 'database',
    subcategory: 'cloud-relational',
    keywords: ['gcp', 'managed', 'mysql', 'postgresql'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'azure sql database': {
    synonyms: ['azure sql', 'sql azure'],
    related: ['azure', 'cloud database', 'sql server'],
    category: 'database',
    subcategory: 'cloud-relational',
    keywords: ['azure', 'managed', 'paas', 'sql server'],
    level: 'intermediate',
    popularity: 'high'
  },

  // === NOSQL - DOCUMENT DATABASES (15+) ===
  'mongodb': {
    synonyms: ['mongo'],
    related: ['nosql', 'document database', 'mongoose', 'atlas', 'bson'],
    category: 'database',
    subcategory: 'nosql-document',
    keywords: ['document store', 'json', 'bson', 'flexible schema', 'scalable'],
    equivalents: ['couchdb', 'couchbase', 'dynamodb'],
    level: 'beginner',
    popularity: 'very-high'
  },
  'couchdb': {
    synonyms: ['couch db', 'apache couchdb'],
    related: ['nosql', 'document database', 'json', 'rest api'],
    category: 'database',
    subcategory: 'nosql-document',
    keywords: ['document store', 'json', 'rest api', 'offline-first'],
    equivalents: ['mongodb', 'couchbase'],
    level: 'intermediate',
    popularity: 'low'
  },
  'couchbase': {
    synonyms: ['couch base'],
    related: ['nosql', 'document database', 'caching', 'n1ql'],
    category: 'database',
    subcategory: 'nosql-document',
    keywords: ['document store', 'caching', 'distributed', 'n1ql'],
    equivalents: ['mongodb', 'couchdb'],
    level: 'advanced',
    popularity: 'medium'
  },
  'ravendb': {
    synonyms: ['raven db'],
    related: ['nosql', 'document database', '.net', 'acid'],
    category: 'database',
    subcategory: 'nosql-document',
    keywords: ['document store', 'acid', '.net', 'distributed'],
    level: 'intermediate',
    popularity: 'low'
  },
  'documentdb': {
    synonyms: ['amazon documentdb'],
    related: ['aws', 'mongodb compatible', 'document database'],
    category: 'database',
    subcategory: 'nosql-document',
    keywords: ['aws', 'mongodb compatible', 'managed'],
    level: 'intermediate',
    popularity: 'medium'
  },
  'cosmosdb': {
    synonyms: ['azure cosmos db', 'cosmos db'],
    related: ['azure', 'multi-model', 'globally distributed'],
    category: 'database',
    subcategory: 'nosql-document',
    keywords: ['azure', 'multi-model', 'globally distributed', 'low latency'],
    level: 'advanced',
    popularity: 'high'
  },
  'firestore': {
    synonyms: ['cloud firestore', 'firebase firestore'],
    related: ['firebase', 'google cloud', 'realtime', 'nosql'],
    category: 'database',
    subcategory: 'nosql-document',
    keywords: ['firebase', 'realtime', 'mobile', 'serverless'],
    level: 'beginner',
    popularity: 'high'
  },

  // === NOSQL - KEY-VALUE STORES (12+) ===
  'redis': {
    synonyms: ['redis cache'],
    related: ['cache', 'in-memory', 'key-value store', 'pub/sub'],
    category: 'database',
    subcategory: 'nosql-keyvalue',
    keywords: ['caching', 'in-memory', 'fast', 'data structures', 'pub/sub'],
    equivalents: ['memcached', 'valkey'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'memcached': {
    synonyms: ['memcache'],
    related: ['cache', 'in-memory', 'distributed'],
    category: 'database',
    subcategory: 'nosql-keyvalue',
    keywords: ['caching', 'in-memory', 'simple', 'distributed'],
    equivalents: ['redis'],
    level: 'intermediate',
    popularity: 'high'
  },
  'valkey': {
    synonyms: [],
    related: ['redis', 'cache', 'in-memory'],
    category: 'database',
    subcategory: 'nosql-keyvalue',
    keywords: ['redis fork', 'in-memory', 'open source'],
    equivalents: ['redis', 'memcached'],
    level: 'intermediate',
    popularity: 'low'
  },
  'dynamodb': {
    synonyms: ['amazon dynamodb', 'dynamo db'],
    related: ['aws', 'nosql', 'key-value', 'serverless'],
    category: 'database',
    subcategory: 'nosql-keyvalue',
    keywords: ['aws', 'serverless', 'scalable', 'low latency'],
    equivalents: ['cassandra', 'mongodb'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'etcd': {
    synonyms: [],
    related: ['distributed', 'key-value', 'kubernetes', 'consensus'],
    category: 'database',
    subcategory: 'nosql-keyvalue',
    keywords: ['distributed', 'consistent', 'kubernetes', 'raft'],
    level: 'advanced',
    popularity: 'medium'
  },
  'consul': {
    synonyms: ['hashicorp consul'],
    related: ['service discovery', 'key-value', 'distributed', 'hashicorp'],
    category: 'database',
    subcategory: 'nosql-keyvalue',
    keywords: ['service discovery', 'key-value store', 'health checking'],
    level: 'advanced',
    popularity: 'medium'
  },
  'riak': {
    synonyms: ['riak kv'],
    related: ['distributed', 'nosql', 'key-value'],
    category: 'database',
    subcategory: 'nosql-keyvalue',
    keywords: ['distributed', 'fault-tolerant', 'highly available'],
    level: 'advanced',
    popularity: 'low'
  },

  // === NOSQL - COLUMN-FAMILY (8+) ===
  'cassandra': {
    synonyms: ['apache cassandra'],
    related: ['nosql', 'distributed', 'wide-column', 'cql'],
    category: 'database',
    subcategory: 'nosql-column',
    keywords: ['distributed', 'scalable', 'no single point of failure', 'wide-column'],
    equivalents: ['scylladb', 'hbase'],
    level: 'advanced',
    popularity: 'high'
  },
  'scylladb': {
    synonyms: ['scylla'],
    related: ['cassandra compatible', 'nosql', 'high performance'],
    category: 'database',
    subcategory: 'nosql-column',
    keywords: ['cassandra compatible', 'c++', 'high performance'],
    equivalents: ['cassandra', 'hbase'],
    level: 'advanced',
    popularity: 'medium'
  },
  'hbase': {
    synonyms: ['apache hbase'],
    related: ['hadoop', 'nosql', 'big data', 'column-family'],
    category: 'database',
    subcategory: 'nosql-column',
    keywords: ['hadoop', 'big data', 'distributed', 'google bigtable'],
    equivalents: ['cassandra', 'bigtable'],
    level: 'advanced',
    popularity: 'medium'
  },
  'bigtable': {
    synonyms: ['google bigtable', 'cloud bigtable'],
    related: ['gcp', 'nosql', 'wide-column', 'big data'],
    category: 'database',
    subcategory: 'nosql-column',
    keywords: ['gcp', 'managed', 'scalable', 'low latency'],
    level: 'advanced',
    popularity: 'medium'
  },

  // === NOSQL - GRAPH DATABASES (10+) ===
  'neo4j': {
    synonyms: ['neo4j graph database'],
    related: ['graph database', 'cypher', 'relationships', 'nodes'],
    category: 'database',
    subcategory: 'graph',
    keywords: ['graph', 'relationships', 'cypher query language', 'nodes edges'],
    equivalents: ['arangodb', 'janusgraph', 'neptune'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'arangodb': {
    synonyms: ['arango db'],
    related: ['graph database', 'multi-model', 'document', 'aql'],
    category: 'database',
    subcategory: 'graph',
    keywords: ['graph', 'multi-model', 'document', 'key-value'],
    equivalents: ['neo4j', 'orientdb'],
    level: 'advanced',
    popularity: 'medium'
  },
  'janusgraph': {
    synonyms: ['janus graph'],
    related: ['graph database', 'distributed', 'apache tinkerpop'],
    category: 'database',
    subcategory: 'graph',
    keywords: ['graph', 'distributed', 'scalable', 'gremlin'],
    equivalents: ['neo4j', 'neptune'],
    level: 'advanced',
    popularity: 'low'
  },
  'neptune': {
    synonyms: ['amazon neptune', 'aws neptune'],
    related: ['aws', 'graph database', 'managed', 'gremlin', 'sparql'],
    category: 'database',
    subcategory: 'graph',
    keywords: ['aws', 'managed', 'graph', 'gremlin', 'sparql'],
    equivalents: ['neo4j', 'janusgraph'],
    level: 'advanced',
    popularity: 'medium'
  },
  'tigergraph': {
    synonyms: ['tiger graph'],
    related: ['graph database', 'analytics', 'real-time'],
    category: 'database',
    subcategory: 'graph',
    keywords: ['graph', 'analytics', 'real-time', 'native parallel'],
    level: 'advanced',
    popularity: 'low'
  },
  'orientdb': {
    synonyms: ['orient db'],
    related: ['graph database', 'multi-model', 'document'],
    category: 'database',
    subcategory: 'graph',
    keywords: ['graph', 'multi-model', 'document', 'object'],
    level: 'advanced',
    popularity: 'low'
  },

  // === TIME-SERIES DATABASES (10+) ===
  'influxdb': {
    synonyms: ['influx db', 'influx'],
    related: ['time-series', 'metrics', 'monitoring', 'telegraf'],
    category: 'database',
    subcategory: 'time-series',
    keywords: ['time-series', 'metrics', 'iot', 'monitoring', 'flux'],
    equivalents: ['timescaledb', 'prometheus'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'timescaledb': {
    synonyms: ['timescale', 'timescale db'],
    related: ['time-series', 'postgresql', 'sql', 'extension'],
    category: 'database',
    subcategory: 'time-series',
    keywords: ['time-series', 'postgresql extension', 'sql', 'hypertables'],
    equivalents: ['influxdb', 'clickhouse'],
    level: 'intermediate',
    popularity: 'high'
  },
  'prometheus': {
    synonyms: ['prometheus monitoring'],
    related: ['time-series', 'monitoring', 'metrics', 'alerting', 'promql'],
    category: 'database',
    subcategory: 'time-series',
    keywords: ['time-series', 'monitoring', 'metrics', 'pull-based', 'prometheus'],
    equivalents: ['influxdb', 'graphite'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'clickhouse': {
    synonyms: ['click house'],
    related: ['column-oriented', 'analytics', 'olap', 'real-time'],
    category: 'database',
    subcategory: 'analytical',
    keywords: ['column-oriented', 'analytics', 'fast', 'sql', 'real-time'],
    equivalents: ['druid', 'snowflake'],
    level: 'advanced',
    popularity: 'high'
  },
  'questdb': {
    synonyms: ['quest db'],
    related: ['time-series', 'sql', 'high performance'],
    category: 'database',
    subcategory: 'time-series',
    keywords: ['time-series', 'sql', 'high performance', 'ingestion'],
    level: 'intermediate',
    popularity: 'low'
  },
  'opentsdb': {
    synonyms: ['open tsdb'],
    related: ['time-series', 'hbase', 'big data'],
    category: 'database',
    subcategory: 'time-series',
    keywords: ['time-series', 'hbase', 'scalable', 'distributed'],
    level: 'advanced',
    popularity: 'low'
  },

  // === SEARCH & ANALYTICS ENGINES (8+) ===
  'elasticsearch': {
    synonyms: ['elastic search', 'es', 'elastic'],
    related: ['search engine', 'elk stack', 'lucene', 'kibana', 'logstash'],
    category: 'database',
    subcategory: 'search',
    keywords: ['search', 'full-text search', 'analytics', 'distributed'],
    equivalents: ['solr', 'algolia'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'solr': {
    synonyms: ['apache solr'],
    related: ['search engine', 'lucene', 'full-text search'],
    category: 'database',
    subcategory: 'search',
    keywords: ['search', 'full-text', 'apache lucene', 'faceted search'],
    equivalents: ['elasticsearch', 'algolia'],
    level: 'advanced',
    popularity: 'medium'
  },
  'algolia': {
    synonyms: [],
    related: ['search', 'saas', 'real-time', 'api'],
    category: 'database',
    subcategory: 'search',
    keywords: ['search as a service', 'real-time', 'typo-tolerance'],
    equivalents: ['elasticsearch', 'meilisearch'],
    level: 'beginner',
    popularity: 'high'
  },
  'meilisearch': {
    synonyms: ['meili search'],
    related: ['search', 'open source', 'typo-tolerant'],
    category: 'database',
    subcategory: 'search',
    keywords: ['search', 'fast', 'typo-tolerant', 'open source'],
    equivalents: ['algolia', 'typesense'],
    level: 'beginner',
    popularity: 'medium'
  },
  'typesense': {
    synonyms: ['type sense'],
    related: ['search', 'open source', 'fast', 'typo-tolerant'],
    category: 'database',
    subcategory: 'search',
    keywords: ['search', 'fast', 'typo-tolerant', 'in-memory'],
    equivalents: ['algolia', 'meilisearch'],
    level: 'beginner',
    popularity: 'low'
  },

  // === DATA WAREHOUSES & ANALYTICS (10+) ===
  'snowflake': {
    synonyms: ['snowflake data warehouse'],
    related: ['data warehouse', 'cloud', 'sql', 'analytics'],
    category: 'database',
    subcategory: 'data-warehouse',
    keywords: ['data warehouse', 'cloud native', 'scalable', 'sql'],
    equivalents: ['bigquery', 'redshift'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'bigquery': {
    synonyms: ['google bigquery', 'bq'],
    related: ['gcp', 'data warehouse', 'analytics', 'sql'],
    category: 'database',
    subcategory: 'data-warehouse',
    keywords: ['data warehouse', 'serverless', 'sql', 'big data'],
    equivalents: ['snowflake', 'redshift'],
    level: 'intermediate',
    popularity: 'very-high'
  },
  'redshift': {
    synonyms: ['amazon redshift', 'aws redshift'],
    related: ['aws', 'data warehouse', 'postgresql compatible'],
    category: 'database',
    subcategory: 'data-warehouse',
    keywords: ['data warehouse', 'aws', 'columnar', 'petabyte scale'],
    equivalents: ['snowflake', 'bigquery'],
    level: 'advanced',
    popularity: 'very-high'
  },
  'databricks': {
    synonyms: ['databricks platform'],
    related: ['spark', 'data lake', 'ml', 'analytics'],
    category: 'database',
    subcategory: 'data-platform',
    keywords: ['unified analytics', 'spark', 'data lake', 'collaborative'],
    level: 'advanced',
    popularity: 'very-high'
  },

  // Continue with CLOUD and DEVOPS in next section...
};

module.exports = {
  DATABASE_CLOUD_DEVOPS_TAXONOMY
};

