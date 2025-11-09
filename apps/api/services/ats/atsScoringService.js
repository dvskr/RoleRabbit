const crypto = require('crypto');

// ============================================================================
// CONFIGURATION & WEIGHTS
// ============================================================================

const SCORING_WEIGHTS = Object.freeze({
  technicalSkills: 0.50,      // Hard technical skills matching (INCREASED - most critical!)
  experience: 0.25,            // Work experience relevance and depth
  education: 0.05,             // Educational background (REDUCED - don't penalize self-taught)
  contextualRelevance: 0.10,   // How well keywords appear in context (REDUCED)
  format: 0.05,                // Resume structure and ATS-friendliness (REDUCED - fixable quickly)
  softSkills: 0.05            // Soft skills and leadership qualities
});

// Importance multipliers for keyword placement
const SECTION_IMPORTANCE = {
  skills: 1.5,        // Skills section has highest weight
  summary: 1.3,       // Summary is very important
  experience: 1.2,    // Experience is important
  projects: 1.1,      // Projects are moderately important
  education: 1.0,     // Education is baseline
  certifications: 1.2 // Certifications are important
};

// ============================================================================
// COMPREHENSIVE SKILL TAXONOMIES
// ============================================================================

// Programming Languages with all variations
const PROGRAMMING_LANGUAGES = {
  javascript: { patterns: [/\b(javascript|js|ecmascript|es6|es2015|es2020)\b/gi], category: 'language', seniority: 'any' },
  typescript: { patterns: [/\b(typescript|ts)\b/gi], category: 'language', seniority: 'mid+' },
  python: { patterns: [/\b(python|py|python3?)\b/gi], category: 'language', seniority: 'any' },
  java: { patterns: [/\b(java(?!script))\b/gi], category: 'language', seniority: 'any' },
  'c++': { patterns: [/\b(c\+\+|cpp|cplusplus)\b/gi], category: 'language', seniority: 'mid+' },
  'c#': { patterns: [/\b(c#|csharp|c-sharp)\b/gi], category: 'language', seniority: 'any' },
  ruby: { patterns: [/\b(ruby)\b/gi], category: 'language', seniority: 'any' },
  php: { patterns: [/\b(php)\b/gi], category: 'language', seniority: 'any' },
  swift: { patterns: [/\b(swift)\b/gi], category: 'language', seniority: 'any' },
  kotlin: { patterns: [/\b(kotlin)\b/gi], category: 'language', seniority: 'any' },
  go: { patterns: [/\b(go|golang)\b/gi], category: 'language', seniority: 'any' },
  rust: { patterns: [/\b(rust)\b/gi], category: 'language', seniority: 'mid+' },
  scala: { patterns: [/\b(scala)\b/gi], category: 'language', seniority: 'mid+' },
  r: { patterns: [/\b(r-lang|r programming)\b/gi], category: 'language', seniority: 'any' },
  matlab: { patterns: [/\b(matlab)\b/gi], category: 'language', seniority: 'any' },
  perl: { patterns: [/\b(perl)\b/gi], category: 'language', seniority: 'any' },
  elixir: { patterns: [/\b(elixir)\b/gi], category: 'language', seniority: 'mid+' },
  dart: { patterns: [/\b(dart)\b/gi], category: 'language', seniority: 'any' }
};

// Frontend Frameworks & Libraries
const FRONTEND_TECH = {
  react: { patterns: [/\b(react(?:\.?js)?|reactjs)\b/gi], category: 'frontend', seniority: 'any' },
  angular: { patterns: [/\b(angular(?:\.?js)?|angularjs)\b/gi], category: 'frontend', seniority: 'any' },
  vue: { patterns: [/\b(vue(?:\.?js)?|vuejs)\b/gi], category: 'frontend', seniority: 'any' },
  nextjs: { patterns: [/\b(next(?:\.?js)?|nextjs)\b/gi], category: 'frontend', seniority: 'mid+' },
  nuxt: { patterns: [/\b(nuxt(?:\.?js)?|nuxtjs)\b/gi], category: 'frontend', seniority: 'mid+' },
  svelte: { patterns: [/\b(svelte)\b/gi], category: 'frontend', seniority: 'any' },
  redux: { patterns: [/\b(redux)\b/gi], category: 'frontend', seniority: 'mid+' },
  mobx: { patterns: [/\b(mobx)\b/gi], category: 'frontend', seniority: 'mid+' },
  webpack: { patterns: [/\b(webpack)\b/gi], category: 'frontend', seniority: 'mid+' },
  vite: { patterns: [/\b(vite)\b/gi], category: 'frontend', seniority: 'any' },
  tailwind: { patterns: [/\b(tailwind(?:\s+css)?)\b/gi], category: 'frontend', seniority: 'any' },
  bootstrap: { patterns: [/\b(bootstrap)\b/gi], category: 'frontend', seniority: 'any' },
  'material-ui': { patterns: [/\b(material-?ui|mui)\b/gi], category: 'frontend', seniority: 'any' },
  sass: { patterns: [/\b(sass|scss)\b/gi], category: 'frontend', seniority: 'any' },
  html: { patterns: [/\b(html5?)\b/gi], category: 'frontend', seniority: 'any' },
  css: { patterns: [/\b(css3?)\b/gi], category: 'frontend', seniority: 'any' }
};

// Backend Frameworks
const BACKEND_TECH = {
  nodejs: { patterns: [/\b(node(?:\.?js)?|nodejs)\b/gi], category: 'backend', seniority: 'any' },
  express: { patterns: [/\b(express(?:\.?js)?|expressjs)\b/gi], category: 'backend', seniority: 'any' },
  django: { patterns: [/\b(django)\b/gi], category: 'backend', seniority: 'any' },
  flask: { patterns: [/\b(flask)\b/gi], category: 'backend', seniority: 'any' },
  fastapi: { patterns: [/\b(fastapi|fast\s+api)\b/gi], category: 'backend', seniority: 'mid+' },
  spring: { patterns: [/\b(spring(?:\s+boot)?)\b/gi], category: 'backend', seniority: 'any' },
  '.net': { patterns: [/\b(\.net|dotnet|asp\.net)\b/gi], category: 'backend', seniority: 'any' },
  rails: { patterns: [/\b(rails|ruby\s+on\s+rails)\b/gi], category: 'backend', seniority: 'any' },
  laravel: { patterns: [/\b(laravel)\b/gi], category: 'backend', seniority: 'any' },
  nestjs: { patterns: [/\b(nest(?:\.?js)?|nestjs)\b/gi], category: 'backend', seniority: 'mid+' },
  graphql: { patterns: [/\b(graphql)\b/gi], category: 'backend', seniority: 'mid+' },
  'rest api': { patterns: [/\b(rest(?:ful)?\s+api|rest\s+api|restful)\b/gi], category: 'backend', seniority: 'any' },
  grpc: { patterns: [/\b(grpc|g-rpc)\b/gi], category: 'backend', seniority: 'mid+' },
  microservices: { patterns: [/\b(microservices?|micro-services?)\b/gi], category: 'backend', seniority: 'senior+' }
};

// Databases
const DATABASE_TECH = {
  postgresql: { patterns: [/\b(postgresql|postgres|psql)\b/gi], category: 'database', seniority: 'any' },
  mysql: { patterns: [/\b(mysql|mariadb)\b/gi], category: 'database', seniority: 'any' },
  mongodb: { patterns: [/\b(mongodb|mongo)\b/gi], category: 'database', seniority: 'any' },
  redis: { patterns: [/\b(redis)\b/gi], category: 'database', seniority: 'any' },
  elasticsearch: { patterns: [/\b(elasticsearch|elastic\s+search)\b/gi], category: 'database', seniority: 'mid+' },
  dynamodb: { patterns: [/\b(dynamodb)\b/gi], category: 'database', seniority: 'mid+' },
  cassandra: { patterns: [/\b(cassandra)\b/gi], category: 'database', seniority: 'mid+' },
  neo4j: { patterns: [/\b(neo4j)\b/gi], category: 'database', seniority: 'mid+' },
  firestore: { patterns: [/\b(firestore|firebase)\b/gi], category: 'database', seniority: 'any' },
  sql: { patterns: [/\b(sql)\b/gi], category: 'database', seniority: 'any' },
  nosql: { patterns: [/\b(nosql|no-sql)\b/gi], category: 'database', seniority: 'any' },
  oracle: { patterns: [/\b(oracle(?:\s+db)?)\b/gi], category: 'database', seniority: 'any' },
  'sql server': { patterns: [/\b(sql\s+server|mssql|ms\s+sql)\b/gi], category: 'database', seniority: 'any' }
};

// Cloud Platforms & Services
const CLOUD_TECH = {
  aws: { patterns: [/\b(aws|amazon\s+web\s+services)\b/gi], category: 'cloud', seniority: 'any' },
  azure: { patterns: [/\b(azure|microsoft\s+azure)\b/gi], category: 'cloud', seniority: 'any' },
  gcp: { patterns: [/\b(gcp|google\s+cloud(?:\s+platform)?)\b/gi], category: 'cloud', seniority: 'any' },
  ec2: { patterns: [/\b(ec2)\b/gi], category: 'cloud', seniority: 'any' },
  s3: { patterns: [/\b(s3|simple\s+storage\s+service)\b/gi], category: 'cloud', seniority: 'any' },
  lambda: { patterns: [/\b(lambda|aws\s+lambda)\b/gi], category: 'cloud', seniority: 'mid+' },
  cloudformation: { patterns: [/\b(cloudformation)\b/gi], category: 'cloud', seniority: 'mid+' },
  'cloud functions': { patterns: [/\b(cloud\s+functions)\b/gi], category: 'cloud', seniority: 'mid+' },
  ecs: { patterns: [/\b(ecs|elastic\s+container\s+service)\b/gi], category: 'cloud', seniority: 'mid+' },
  eks: { patterns: [/\b(eks|elastic\s+kubernetes\s+service)\b/gi], category: 'cloud', seniority: 'mid+' }
};

// DevOps & Infrastructure
const DEVOPS_TECH = {
  docker: { patterns: [/\b(docker)\b/gi], category: 'devops', seniority: 'any' },
  kubernetes: { patterns: [/\b(kubernetes|k8s)\b/gi], category: 'devops', seniority: 'mid+' },
  jenkins: { patterns: [/\b(jenkins)\b/gi], category: 'devops', seniority: 'any' },
  'github actions': { patterns: [/\b(github\s+actions)\b/gi], category: 'devops', seniority: 'any' },
  'gitlab ci': { patterns: [/\b(gitlab\s+ci(?:\/cd)?)\b/gi], category: 'devops', seniority: 'any' },
  'circle ci': { patterns: [/\b(circle\s*ci)\b/gi], category: 'devops', seniority: 'any' },
  terraform: { patterns: [/\b(terraform)\b/gi], category: 'devops', seniority: 'mid+' },
  ansible: { patterns: [/\b(ansible)\b/gi], category: 'devops', seniority: 'mid+' },
  puppet: { patterns: [/\b(puppet)\b/gi], category: 'devops', seniority: 'mid+' },
  chef: { patterns: [/\b(chef)\b/gi], category: 'devops', seniority: 'mid+' },
  'ci/cd': { patterns: [/\b(ci\/cd|cicd|continuous\s+integration|continuous\s+deployment|continuous\s+delivery)\b/gi], category: 'devops', seniority: 'any' },
  git: { patterns: [/\b(git(?:hub|lab)?)\b/gi], category: 'devops', seniority: 'any' },
  nginx: { patterns: [/\b(nginx)\b/gi], category: 'devops', seniority: 'mid+' },
  apache: { patterns: [/\b(apache(?:\s+server)?)\b/gi], category: 'devops', seniority: 'any' },
  prometheus: { patterns: [/\b(prometheus)\b/gi], category: 'devops', seniority: 'mid+' },
  grafana: { patterns: [/\b(grafana)\b/gi], category: 'devops', seniority: 'mid+' },
  datadog: { patterns: [/\b(datadog)\b/gi], category: 'devops', seniority: 'mid+' },
  'new relic': { patterns: [/\b(new\s+relic)\b/gi], category: 'devops', seniority: 'mid+' }
};

// Data Engineering & Big Data
const DATA_TECH = {
  spark: { patterns: [/\b(spark|apache\s+spark|pyspark)\b/gi], category: 'data', seniority: 'mid+' },
  hadoop: { patterns: [/\b(hadoop)\b/gi], category: 'data', seniority: 'mid+' },
  kafka: { patterns: [/\b(kafka|apache\s+kafka)\b/gi], category: 'data', seniority: 'mid+' },
  airflow: { patterns: [/\b(airflow|apache\s+airflow)\b/gi], category: 'data', seniority: 'mid+' },
  'data factory': { patterns: [/\b(data\s+factory|azure\s+data\s+factory|adf)\b/gi], category: 'data', seniority: 'mid+' },
  glue: { patterns: [/\b(glue|aws\s+glue)\b/gi], category: 'data', seniority: 'mid+' },
  databricks: { patterns: [/\b(databricks)\b/gi], category: 'data', seniority: 'mid+' },
  snowflake: { patterns: [/\b(snowflake)\b/gi], category: 'data', seniority: 'mid+' },
  redshift: { patterns: [/\b(redshift|amazon\s+redshift)\b/gi], category: 'data', seniority: 'mid+' },
  bigquery: { patterns: [/\b(bigquery|big\s+query)\b/gi], category: 'data', seniority: 'mid+' },
  'delta lake': { patterns: [/\b(delta\s+lake)\b/gi], category: 'data', seniority: 'mid+' },
  dbt: { patterns: [/\b(dbt|data\s+build\s+tool)\b/gi], category: 'data', seniority: 'mid+' },
  etl: { patterns: [/\b(etl|elt)\b/gi], category: 'data', seniority: 'any' },
  'data warehouse': { patterns: [/\b(data\s+warehouse|data\s+warehousing)\b/gi], category: 'data', seniority: 'mid+' },
  'data lake': { patterns: [/\b(data\s+lake)\b/gi], category: 'data', seniority: 'mid+' }
};

// Machine Learning & AI
const ML_TECH = {
  'machine learning': { patterns: [/\b(machine\s+learning|ml)\b/gi], category: 'ml', seniority: 'mid+' },
  'deep learning': { patterns: [/\b(deep\s+learning|dl)\b/gi], category: 'ml', seniority: 'mid+' },
  'artificial intelligence': { patterns: [/\b(artificial\s+intelligence|ai)\b/gi], category: 'ml', seniority: 'mid+' },
  'natural language processing': { patterns: [/\b(natural\s+language\s+processing|nlp)\b/gi], category: 'ml', seniority: 'mid+' },
  'computer vision': { patterns: [/\b(computer\s+vision|cv)\b/gi], category: 'ml', seniority: 'mid+' },
  tensorflow: { patterns: [/\b(tensorflow|tf)\b/gi], category: 'ml', seniority: 'mid+' },
  pytorch: { patterns: [/\b(pytorch|torch)\b/gi], category: 'ml', seniority: 'mid+' },
  keras: { patterns: [/\b(keras)\b/gi], category: 'ml', seniority: 'mid+' },
  'scikit-learn': { patterns: [/\b(scikit-learn|sklearn|sci-kit\s+learn)\b/gi], category: 'ml', seniority: 'mid+' },
  pandas: { patterns: [/\b(pandas)\b/gi], category: 'ml', seniority: 'any' },
  numpy: { patterns: [/\b(numpy)\b/gi], category: 'ml', seniority: 'any' },
  matplotlib: { patterns: [/\b(matplotlib)\b/gi], category: 'ml', seniority: 'any' },
  seaborn: { patterns: [/\b(seaborn)\b/gi], category: 'ml', seniority: 'any' },
  'jupyter': { patterns: [/\b(jupyter|jupyter\s+notebook)\b/gi], category: 'ml', seniority: 'any' },
  'hugging face': { patterns: [/\b(hugging\s+face|transformers)\b/gi], category: 'ml', seniority: 'mid+' },
  llm: { patterns: [/\b(llm|large\s+language\s+model)\b/gi], category: 'ml', seniority: 'senior+' },
  gpt: { patterns: [/\b(gpt|gpt-[0-9]|chatgpt)\b/gi], category: 'ml', seniority: 'mid+' },
  bert: { patterns: [/\b(bert)\b/gi], category: 'ml', seniority: 'mid+' }
};

// Mobile Development
const MOBILE_TECH = {
  ios: { patterns: [/\b(ios|iphone|ipad)\b/gi], category: 'mobile', seniority: 'any' },
  android: { patterns: [/\b(android)\b/gi], category: 'mobile', seniority: 'any' },
  'react native': { patterns: [/\b(react\s+native)\b/gi], category: 'mobile', seniority: 'any' },
  flutter: { patterns: [/\b(flutter)\b/gi], category: 'mobile', seniority: 'any' },
  swiftui: { patterns: [/\b(swiftui|swift\s+ui)\b/gi], category: 'mobile', seniority: 'mid+' },
  uikit: { patterns: [/\b(uikit)\b/gi], category: 'mobile', seniority: 'any' },
  'jetpack compose': { patterns: [/\b(jetpack\s+compose)\b/gi], category: 'mobile', seniority: 'mid+' },
  ionic: { patterns: [/\b(ionic)\b/gi], category: 'mobile', seniority: 'any' },
  xamarin: { patterns: [/\b(xamarin)\b/gi], category: 'mobile', seniority: 'any' }
};

// Testing
const TESTING_TECH = {
  jest: { patterns: [/\b(jest)\b/gi], category: 'testing', seniority: 'any' },
  mocha: { patterns: [/\b(mocha)\b/gi], category: 'testing', seniority: 'any' },
  pytest: { patterns: [/\b(pytest)\b/gi], category: 'testing', seniority: 'any' },
  selenium: { patterns: [/\b(selenium)\b/gi], category: 'testing', seniority: 'any' },
  cypress: { patterns: [/\b(cypress)\b/gi], category: 'testing', seniority: 'any' },
  playwright: { patterns: [/\b(playwright)\b/gi], category: 'testing', seniority: 'mid+' },
  'unit testing': { patterns: [/\b(unit\s+testing?|unit\s+tests?)\b/gi], category: 'testing', seniority: 'any' },
  'integration testing': { patterns: [/\b(integration\s+testing?|integration\s+tests?)\b/gi], category: 'testing', seniority: 'mid+' },
  'e2e testing': { patterns: [/\b(e2e|end-to-end\s+testing?)\b/gi], category: 'testing', seniority: 'mid+' },
  tdd: { patterns: [/\b(tdd|test-driven\s+development)\b/gi], category: 'testing', seniority: 'mid+' }
};

// Combine all technical skills
const ALL_TECHNICAL_SKILLS = {
  ...PROGRAMMING_LANGUAGES,
  ...FRONTEND_TECH,
  ...BACKEND_TECH,
  ...DATABASE_TECH,
  ...CLOUD_TECH,
  ...DEVOPS_TECH,
  ...DATA_TECH,
  ...ML_TECH,
  ...MOBILE_TECH,
  ...TESTING_TECH
};

// Soft Skills
const SOFT_SKILLS = {
  leadership: { patterns: [/\b(leadership|lead|leading)\b/gi], importance: 'high' },
  communication: { patterns: [/\b(communication|communicating|communicate)\b/gi], importance: 'high' },
  teamwork: { patterns: [/\b(teamwork|collaboration|collaborative|team\s+player)\b/gi], importance: 'high' },
  'problem-solving': { patterns: [/\b(problem[-\s]solving|analytical|analysis)\b/gi], importance: 'high' },
  mentoring: { patterns: [/\b(mentoring|mentorship|coaching|coaching)\b/gi], importance: 'mid' },
  agile: { patterns: [/\b(agile|scrum|kanban)\b/gi], importance: 'mid' },
  'project management': { patterns: [/\b(project\s+management|project\s+planning)\b/gi], importance: 'mid' },
  strategic: { patterns: [/\b(strategic|strategy)\b/gi], importance: 'mid' },
  innovation: { patterns: [/\b(innovation|innovative)\b/gi], importance: 'mid' },
  adaptability: { patterns: [/\b(adaptability|adaptable|flexible)\b/gi], importance: 'mid' }
};

// Seniority Indicators
const SENIORITY_KEYWORDS = {
  junior: [/\b(junior|jr|entry|entry-level|graduate|intern)\b/gi],
  mid: [/\b(mid|mid-level|intermediate)\b/gi],
  senior: [/\b(senior|sr|lead|principal|staff|expert)\b/gi],
  executive: [/\b(director|vp|vice\s+president|cto|ceo|head\s+of|chief)\b/gi]
};

// Stop words - expanded list
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'from', 'this', 'have', 'your', 'will', 'into',
  'using', 'able', 'work', 'team', 'role', 'responsibilities', 'skills', 'requirements',
  'experience', 'must', 'should', 'strong', 'develop', 'maintain', 'across', 'within', 'other',
  'candidate', 'company', 'about', 'what', 'you', 'are', 'our', 'who', 'job', 'description',
  'responsible', 'including', 'per', 'preferred', 'years', 'plus', 'need', 'join', 'new',
  'looking', 'seeking', 'ideal', 'position', 'opportunity', 'etc', 'such', 'well', 'including',
  'require', 'required', 'ability', 'knowledge', 'understanding', 'working', 'ensure', 'provide',
  'also', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'some', 'such', 'than', 'these',
  'those', 'very', 'can', 'could', 'may', 'might', 'shall', 'would', 'been', 'being', 'were',
  'has', 'had', 'does', 'did', 'having', 'make', 'made', 'take', 'where', 'when', 'why', 'how'
]);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function hashJobDescription(jobDescription = '') {
  return crypto.createHash('sha1').update(jobDescription.trim().toLowerCase()).digest('hex');
}

function normalizeText(text) {
  if (!text) return '';
  return String(text).toLowerCase().trim();
}

function cleanText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s\-\.\/\+#]/g, ' ')  // Keep alphanumeric, spaces, and common tech chars
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================================
// ADVANCED KEYWORD EXTRACTION
// ============================================================================

// Extract technical skills with pattern matching
function extractTechnicalSkills(text, skillDict = ALL_TECHNICAL_SKILLS) {
  const normalized = cleanText(text);
  const found = new Map();

  for (const [skillName, skillConfig] of Object.entries(skillDict)) {
    for (const pattern of skillConfig.patterns) {
      if (pattern.test(normalized)) {
        found.set(skillName, {
          skill: skillName,
          category: skillConfig.category,
          seniority: skillConfig.seniority
        });
        break;
      }
    }
  }

  return [...found.values()];
}

// Extract soft skills
function extractSoftSkills(text) {
  const normalized = cleanText(text);
  const found = new Map();

  for (const [skillName, skillConfig] of Object.entries(SOFT_SKILLS)) {
    for (const pattern of skillConfig.patterns) {
      if (pattern.test(normalized)) {
        found.set(skillName, {
          skill: skillName,
          importance: skillConfig.importance
        });
        break;
      }
    }
  }

  return [...found.values()];
}

// Detect seniority level from text
function detectSeniority(text) {
  const normalized = cleanText(text);
  const levels = { junior: 0, mid: 0, senior: 0, executive: 0 };

  for (const [level, patterns] of Object.entries(SENIORITY_KEYWORDS)) {
    for (const pattern of patterns) {
      const matches = normalized.match(pattern);
      if (matches) {
        levels[level] += matches.length;
      }
    }
  }

  // Return the level with highest count
  const maxLevel = Object.entries(levels).reduce((a, b) => levels[a[0]] > levels[b[0]] ? a : b);
  return maxLevel[1] > 0 ? maxLevel[0] : 'mid'; // Default to mid if not detected
}

// Extract years of experience from text
function extractYearsOfExperience(text) {
  const normalized = cleanText(text);
  
  // Pattern: "5+ years", "3-5 years", "minimum 3 years", etc.
  const patterns = [
    /(\d+)\+?\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)/gi,
    /(\d+)\+\s*(?:years?|yrs?)/gi,
    /minimum\s+(\d+)\s*(?:years?|yrs?)/gi,
    /at\s+least\s+(\d+)\s*(?:years?|yrs?)/gi
  ];

  const years = [];
  for (const pattern of patterns) {
    const matches = [...normalized.matchAll(pattern)];
    for (const match of matches) {
      if (match[2]) {
        // Range: take the minimum
        years.push(parseInt(match[1]));
      } else if (match[1]) {
        years.push(parseInt(match[1]));
      }
    }
  }

  return years.length > 0 ? Math.max(...years) : 0;
}

// Extract multi-word phrases (bigrams and trigrams)
function extractPhrases(text) {
  const normalized = cleanText(text);
  const words = normalized.split(/\s+/).filter(w => w.length > 2);
  const phrases = new Set();

  // Bigrams (2-word phrases)
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1])) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length > 6) {
        phrases.add(phrase);
      }
    }
  }

  // Trigrams (3-word phrases)
  for (let i = 0; i < words.length - 2; i++) {
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 2])) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (phrase.length > 10) {
        phrases.add(phrase);
      }
    }
  }

  return [...phrases];
}

// Extract individual keywords with frequency
function extractKeywords(text) {
  const normalized = cleanText(text);
  const words = normalized.split(/\s+/);
  const frequency = new Map();

  for (const word of words) {
    if (word.length > 2 && !STOP_WORDS.has(word)) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
  }

  // Sort by frequency and return top 50
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
}

// Differentiate required vs preferred skills
function categorizeRequirements(jobDescription) {
  const required = [];
  const preferred = [];
  
  const lines = jobDescription.split(/\n+/);
  let isInRequiredSection = false;
  let isInPreferredSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    if (lower.includes('required') || lower.includes('must have') || lower.includes('qualifications')) {
      isInRequiredSection = true;
      isInPreferredSection = false;
    } else if (lower.includes('preferred') || lower.includes('nice to have') || lower.includes('bonus')) {
      isInPreferredSection = true;
      isInRequiredSection = false;
    } else if (lower.match(/^[a-z\s]+:$/)) {
      // New section header, reset flags
      isInRequiredSection = false;
      isInPreferredSection = false;
    }

    if (isInRequiredSection) {
      required.push(line);
    } else if (isInPreferredSection) {
      preferred.push(line);
    }
  }

  return {
    requiredText: required.join(' '),
    preferredText: preferred.join(' ')
  };
}

// Main job description analyzer
function analyzeJobDescription(jobDescription) {
  const { requiredText, preferredText } = categorizeRequirements(jobDescription);
  const fullText = jobDescription;

  // Extract technical skills
  const requiredSkills = extractTechnicalSkills(requiredText);
  const preferredSkills = extractTechnicalSkills(preferredText);
  const allSkills = extractTechnicalSkills(fullText);
  
  // If categorization didn't find any required/preferred sections,
  // default all skills to required (conservative approach)
  const finalRequired = requiredSkills.length > 0 ? requiredSkills : allSkills;
  const finalPreferred = preferredSkills.length > 0 ? preferredSkills : [];

  return {
    technical: {
      required: finalRequired,
      preferred: finalPreferred,
      all: allSkills
    },
    soft: extractSoftSkills(fullText),
    seniority: detectSeniority(fullText),
    yearsRequired: extractYearsOfExperience(fullText),
    phrases: extractPhrases(fullText),
    keywords: extractKeywords(fullText)
  };
}

// ============================================================================
// RESUME ANALYSIS
// ============================================================================

function analyzeResume(resumeData = {}) {
  const sections = {
    skills: { text: '', weight: SECTION_IMPORTANCE.skills },
    summary: { text: '', weight: SECTION_IMPORTANCE.summary },
    experience: { text: '', weight: SECTION_IMPORTANCE.experience },
    projects: { text: '', weight: SECTION_IMPORTANCE.projects },
    education: { text: '', weight: SECTION_IMPORTANCE.education },
    certifications: { text: '', weight: SECTION_IMPORTANCE.certifications }
  };

  // Summary
  if (resumeData.summary) {
    sections.summary.text = resumeData.summary;
  }

  // Skills - handle both arrays and objects with numeric keys
  let skills = resumeData.skills?.technical || resumeData.skills || [];
  
  // Convert object with numeric keys to array if needed
  if (skills && typeof skills === 'object' && !Array.isArray(skills)) {
    skills = Object.values(skills);
  }
  
  if (Array.isArray(skills)) {
    sections.skills.text = skills.map(s => typeof s === 'string' ? s : s?.name || '').join(' ');
  }

  // Experience - handle both arrays and objects with numeric keys
  let experience = resumeData.experience || [];
  if (experience && typeof experience === 'object' && !Array.isArray(experience)) {
    experience = Object.values(experience);
  }
  
  if (Array.isArray(experience)) {
    const expText = [];
    for (const exp of experience) {
      if (exp.company) expText.push(exp.company);
      if (exp.role || exp.title) expText.push(exp.role || exp.title);
      
      // Handle bullets as array or object
      let bullets = exp.bullets || [];
      if (bullets && typeof bullets === 'object' && !Array.isArray(bullets)) {
        bullets = Object.values(bullets);
      }
      if (Array.isArray(bullets)) expText.push(...bullets);
      
      // Handle responsibilities as array or object
      let responsibilities = exp.responsibilities || [];
      if (responsibilities && typeof responsibilities === 'object' && !Array.isArray(responsibilities)) {
        responsibilities = Object.values(responsibilities);
      }
      if (Array.isArray(responsibilities)) expText.push(...responsibilities);
    }
    sections.experience.text = expText.join(' ');
  }

  // Projects - handle both arrays and objects with numeric keys
  let projects = resumeData.projects || [];
  if (projects && typeof projects === 'object' && !Array.isArray(projects)) {
    projects = Object.values(projects);
  }
  
  if (Array.isArray(projects)) {
    const projText = [];
    for (const proj of projects) {
      if (proj.name) projText.push(proj.name);
      if (proj.summary || proj.description) projText.push(proj.summary || proj.description);
      
      // Handle technologies as array or object
      let technologies = proj.technologies || [];
      if (technologies && typeof technologies === 'object' && !Array.isArray(technologies)) {
        technologies = Object.values(technologies);
      }
      if (Array.isArray(technologies)) projText.push(...technologies);
      
      // Handle skills as array or object
      let skills = proj.skills || [];
      if (skills && typeof skills === 'object' && !Array.isArray(skills)) {
        skills = Object.values(skills);
      }
      if (Array.isArray(skills)) projText.push(...skills);
    }
    sections.projects.text = projText.join(' ');
  }

  // Education - handle both arrays and objects with numeric keys
  let education = resumeData.education || [];
  if (education && typeof education === 'object' && !Array.isArray(education)) {
    education = Object.values(education);
  }
  
  if (Array.isArray(education)) {
    const eduText = [];
    for (const edu of education) {
      if (edu.degree) eduText.push(edu.degree);
      if (edu.field) eduText.push(edu.field);
      if (edu.school || edu.institution) eduText.push(edu.school || edu.institution);
    }
    sections.education.text = eduText.join(' ');
  }

  // Certifications - handle both arrays and objects with numeric keys
  let certifications = resumeData.certifications || [];
  if (certifications && typeof certifications === 'object' && !Array.isArray(certifications)) {
    certifications = Object.values(certifications);
  }
  
  if (Array.isArray(certifications)) {
    const certText = [];
    for (const cert of certifications) {
      if (cert.name) certText.push(cert.name);
      if (cert.issuer) certText.push(cert.issuer);
    }
    sections.certifications.text = certText.join(' ');
  }

  // Combine all text
  const allText = Object.values(sections).map(s => s.text).join(' ');

  // Extract years of experience from dates
  let totalYears = 0;
  if (Array.isArray(resumeData.experience)) {
    for (const exp of resumeData.experience) {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
        totalYears += years;
      }
    }
  }

  return {
    sections,
    technical: extractTechnicalSkills(allText),
    soft: extractSoftSkills(allText),
    phrases: extractPhrases(allText),
    keywords: extractKeywords(allText),
    yearsOfExperience: Math.round(totalYears * 10) / 10,
    allText
  };
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

// Context-aware matching with section importance weighting
function computeContextualMatch(resumeSections, jobAnalysis) {
  let totalScore = 0;
  let totalWeight = 0;
  const matched = new Set();
  const missing = new Set();

  // All job requirements (technical skills prioritized)
  const allJobSkills = [
    ...jobAnalysis.technical.required.map(s => s.skill),
    ...jobAnalysis.technical.preferred.map(s => s.skill),
    ...jobAnalysis.technical.all.map(s => s.skill)
  ];
  const uniqueJobSkills = [...new Set(allJobSkills)];

  // Check each resume section
  for (const [sectionName, section] of Object.entries(resumeSections)) {
    const sectionText = cleanText(section.text);
    let sectionMatches = 0;

    for (const skill of uniqueJobSkills) {
      const skillNorm = cleanText(skill);
      if (sectionText.includes(skillNorm)) {
        matched.add(skill);
        sectionMatches++;
      }
    }

    // Weight the section score
    if (uniqueJobSkills.length > 0) {
      const sectionScore = (sectionMatches / uniqueJobSkills.length) * 100;
      totalScore += sectionScore * section.weight;
      totalWeight += section.weight;
    }
  }

  // Calculate missing skills
  for (const skill of uniqueJobSkills) {
    if (!matched.has(skill)) {
      missing.add(skill);
    }
  }

  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  return {
    score: Math.round(Math.max(0, Math.min(100, finalScore))),
    matched: [...matched],
    missing: [...missing]
  };
}

// Technical skills matching with required vs preferred differentiation
function scoreTechnicalSkills(resumeAnalysis, jobAnalysis) {
  const resumeSkills = new Set(resumeAnalysis.technical.map(s => s.skill));
  
  const requiredSkills = jobAnalysis.technical.required.map(s => s.skill);
  const preferredSkills = jobAnalysis.technical.preferred.map(s => s.skill);
  const allJobSkills = jobAnalysis.technical.all.map(s => s.skill);

  // Match required skills (critical)
  const matchedRequired = requiredSkills.filter(skill => {
    const skillNorm = cleanText(skill);
    return [...resumeSkills].some(rs => cleanText(rs).includes(skillNorm) || skillNorm.includes(cleanText(rs)));
  });

  // Match preferred skills (nice to have)
  const matchedPreferred = preferredSkills.filter(skill => {
    const skillNorm = cleanText(skill);
    return [...resumeSkills].some(rs => cleanText(rs).includes(skillNorm) || skillNorm.includes(cleanText(rs)));
  });

  // Match all skills (comprehensive check)
  const matchedAll = allJobSkills.filter(skill => {
    const skillNorm = cleanText(skill);
    return [...resumeSkills].some(rs => cleanText(rs).includes(skillNorm) || skillNorm.includes(cleanText(rs)));
  });

  // Calculate weighted score: Required (85%), Preferred (15%)
  // Missing required skills should heavily penalize the score
  const requiredScore = requiredSkills.length > 0 ? (matchedRequired.length / requiredSkills.length) * 85 : 85;
  const preferredScore = preferredSkills.length > 0 ? (matchedPreferred.length / preferredSkills.length) * 15 : 15;
  const totalScore = requiredScore + preferredScore;

  return {
    score: Math.round(totalScore),
    matchedRequired,
    matchedPreferred,
    matchedAll,
    missingRequired: requiredSkills.filter(s => !matchedRequired.includes(s)),
    missingPreferred: preferredSkills.filter(s => !matchedPreferred.includes(s))
  };
}

// Experience scoring (years and relevance)
function scoreExperience(resumeAnalysis, jobAnalysis) {
  const resumeYears = resumeAnalysis.yearsOfExperience;
  const requiredYears = jobAnalysis.yearsRequired;

  // Years match score
  let yearsScore = 100;
  if (requiredYears > 0) {
    if (resumeYears < requiredYears * 0.5) {
      yearsScore = 30; // Significantly under-qualified
    } else if (resumeYears < requiredYears) {
      yearsScore = 60; // Slightly under-qualified
    } else if (resumeYears >= requiredYears && resumeYears <= requiredYears * 2) {
      yearsScore = 100; // Perfect match
    } else {
      yearsScore = 85; // Over-qualified (slightly penalized)
    }
  }

  // Phrase matching for context
  const resumePhrases = new Set(resumeAnalysis.phrases);
  const jobPhrases = jobAnalysis.phrases;
  
  const matchedPhrases = jobPhrases.filter(jp => {
    return [...resumePhrases].some(rp => rp.includes(jp) || jp.includes(rp));
  });

  const phraseScore = jobPhrases.length > 0 ? (matchedPhrases.length / jobPhrases.length) * 100 : 50;

  // Combined score: 80% years (more important), 20% phrases (context)
  const combinedScore = (yearsScore * 0.8) + (phraseScore * 0.2);

  return {
    score: Math.round(combinedScore),
    yearsScore,
    phraseScore,
    resumeYears,
    requiredYears,
    matchedPhrases
  };
}

// Education relevance scoring
function scoreEducation(resumeAnalysis, jobAnalysis) {
  const resumeText = cleanText(resumeAnalysis.sections.education?.text || '');
  
  // Common relevant degree keywords
  const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'mba', 'bs', 'ms', 'ba', 'ma'];
  const hasDegree = degreeKeywords.some(keyword => resumeText.includes(keyword));

  // Check for relevant fields
  const jobText = cleanText(jobAnalysis.phrases.join(' '));
  const eduFields = ['computer science', 'engineering', 'mathematics', 'data science', 'information technology', 'software'];
  const hasRelevantField = eduFields.some(field => {
    return resumeText.includes(field) || jobText.includes(field);
  });

  let score = 50; // Base score
  if (hasDegree) score += 30;
  if (hasRelevantField) score += 20;

  return {
    score: Math.min(100, score),
    hasDegree,
    hasRelevantField
  };
}

// Soft skills matching
function scoreSoftSkills(resumeAnalysis, jobAnalysis) {
  const resumeSkills = new Set(resumeAnalysis.soft.map(s => s.skill));
  const jobSkills = jobAnalysis.soft.map(s => s.skill);

  const matched = jobSkills.filter(skill => resumeSkills.has(skill));
  const score = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 100 : 50;

  return {
    score: Math.round(score),
    matched,
    missing: jobSkills.filter(s => !matched.includes(s))
  };
}

// Format and ATS-friendliness check
function scoreFormat(resumeData = {}) {
  let score = 100;
  const issues = [];
  const tips = [];

  // Check summary
  if (!resumeData.summary) {
    score -= 15;
    issues.push('Missing professional summary');
    tips.push('Add a 2-3 sentence summary highlighting your key strengths');
  } else if (resumeData.summary.length < 100) {
    score -= 8;
    issues.push('Summary is too short');
    tips.push('Expand summary to 150-250 characters for better impact');
  }

  // Check experience
  if (!Array.isArray(resumeData.experience) || resumeData.experience.length === 0) {
    score -= 30;
    issues.push('No professional experience listed');
    tips.push('Add work experience with specific achievements');
  } else {
    let detailedCount = 0;
    for (const exp of resumeData.experience) {
      const bullets = exp.bullets || exp.responsibilities || [];
      if (Array.isArray(bullets) && bullets.length >= 3) {
        detailedCount++;
      }
    }
    
    if (detailedCount === 0) {
      score -= 15;
      issues.push('Experience entries lack detail');
      tips.push('Add 3-5 bullet points per role with quantifiable achievements');
    }
  }

  // Check skills section
  const skills = resumeData.skills?.technical || resumeData.skills || [];
  if (!Array.isArray(skills) || skills.length === 0) {
    score -= 25;
    issues.push('No skills section');
    tips.push('Add a dedicated skills section with 10-15 relevant technologies');
  } else if (skills.length < 8) {
    score -= 10;
    issues.push('Limited skills listed');
    tips.push('List more technical skills relevant to your target roles');
  }

  // Check for quantifiable results
  const allText = JSON.stringify(resumeData).toLowerCase();
  const metrics = allText.match(/\d+%|\d+[xX]|\d+[kKmMbB]|\$\d+|\d+\+/g) || [];
  if (metrics.length === 0) {
    score -= 12;
    issues.push('No quantifiable achievements');
    tips.push('Include metrics: "Increased efficiency by 35%", "Reduced costs by $50K"');
  } else if (metrics.length < 5) {
    score -= 6;
    issues.push('Limited quantifiable results');
    tips.push('Add more measurable outcomes to demonstrate impact');
  }

  // Check education
  if (!Array.isArray(resumeData.education) || resumeData.education.length === 0) {
    score -= 8;
    issues.push('Education section missing');
    tips.push('Include your educational background');
  }

  // Check for action verbs
  const actionVerbs = [
    'led', 'managed', 'developed', 'implemented', 'designed', 'built', 'created',
    'improved', 'increased', 'reduced', 'achieved', 'delivered', 'launched'
  ];
  const hasActionVerbs = actionVerbs.some(verb => allText.includes(verb));
  if (!hasActionVerbs) {
    score -= 5;
    issues.push('Weak action verbs');
    tips.push('Start bullet points with strong action verbs (Led, Architected, Optimized)');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    tips
  };
}

// ============================================================================
// MAIN ATS SCORING FUNCTION
// ============================================================================

function scoreResumeAgainstJob({ resumeData = {}, jobDescription }) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new Error('jobDescription is required for ATS scoring');
  }

  // Analyze job description
  const jobAnalysis = analyzeJobDescription(jobDescription);

  // Analyze resume
  const resumeAnalysis = analyzeResume(resumeData);

  // Score individual components
  const technicalScore = scoreTechnicalSkills(resumeAnalysis, jobAnalysis);
  const experienceScore = scoreExperience(resumeAnalysis, jobAnalysis);
  const educationScore = scoreEducation(resumeAnalysis, jobAnalysis);
  const softSkillsScore = scoreSoftSkills(resumeAnalysis, jobAnalysis);
  const formatScore = scoreFormat(resumeData);

  // Calculate weighted overall score
  const overall = Math.round(
    (technicalScore.score * SCORING_WEIGHTS.technicalSkills) +
    (experienceScore.score * SCORING_WEIGHTS.experience) +
    (educationScore.score * SCORING_WEIGHTS.education) +
    (experienceScore.phraseScore * SCORING_WEIGHTS.contextualRelevance) +
    (formatScore.score * SCORING_WEIGHTS.format) +
    (softSkillsScore.score * SCORING_WEIGHTS.softSkills)
  );

  // Build comprehensive strengths
  const strengths = [];
  
  if (technicalScore.matchedRequired.length >= (jobAnalysis.technical.required.length * 0.8)) {
    strengths.push(`✓ Strong match: ${technicalScore.matchedRequired.length}/${jobAnalysis.technical.required.length} required skills`);
  }
  
  if (technicalScore.matchedAll.length >= 10) {
    strengths.push(`✓ Comprehensive skillset: ${technicalScore.matchedAll.length} relevant technologies`);
  }
  
  if (experienceScore.yearsScore >= 80) {
    strengths.push(`✓ Experience level aligned: ${resumeAnalysis.yearsOfExperience} years`);
  }
  
  if (formatScore.score >= 85) {
    strengths.push('✓ Well-structured, ATS-friendly resume format');
  }
  
  if (experienceScore.matchedPhrases.length >= 5) {
    strengths.push(`✓ Relevant context: ${experienceScore.matchedPhrases.length} matching industry phrases`);
  }

  // Build actionable improvements
  const improvements = [];
  
  if (technicalScore.missingRequired.length > 0) {
    improvements.push(`⚠ Add critical skills: ${technicalScore.missingRequired.slice(0, 5).join(', ')}`);
  }
  
  if (technicalScore.missingPreferred.length > 0 && technicalScore.missingPreferred.length <= 5) {
    improvements.push(`💡 Boost score with: ${technicalScore.missingPreferred.slice(0, 3).join(', ')}`);
  }
  
  if (experienceScore.yearsScore < 60) {
    improvements.push(`⚠ Experience gap: ${resumeAnalysis.yearsOfExperience} years listed, ${jobAnalysis.yearsRequired}+ required`);
  }
  
  improvements.push(...formatScore.tips.slice(0, 3));

  // Detailed breakdown
  const breakdown = {
    technicalSkills: {
      score: technicalScore.score,
      requiredMatched: technicalScore.matchedRequired.length,
      requiredTotal: jobAnalysis.technical.required.length,
      preferredMatched: technicalScore.matchedPreferred.length,
      preferredTotal: jobAnalysis.technical.preferred.length,
      matched: technicalScore.matchedAll,
      missing: [...technicalScore.missingRequired, ...technicalScore.missingPreferred]
    },
    experience: {
      score: experienceScore.score,
      years: resumeAnalysis.yearsOfExperience,
      required: jobAnalysis.yearsRequired,
      contextMatches: experienceScore.matchedPhrases.length
    },
    education: {
      score: educationScore.score,
      hasDegree: educationScore.hasDegree,
      relevant: educationScore.hasRelevantField
    },
    softSkills: {
      score: softSkillsScore.score,
      matched: softSkillsScore.matched,
      missing: softSkillsScore.missing
    },
    format: {
      score: formatScore.score,
      issues: formatScore.issues
    }
  };

  return {
    overall,
    breakdown,
    strengths,
    improvements,
    seniority: {
      detected: jobAnalysis.seniority,
      aligned: jobAnalysis.seniority === 'junior' ? 
        resumeAnalysis.yearsOfExperience <= 2 :
        jobAnalysis.seniority === 'mid' ?
          resumeAnalysis.yearsOfExperience >= 2 && resumeAnalysis.yearsOfExperience <= 5 :
          resumeAnalysis.yearsOfExperience > 5
    },
    // Legacy format for backward compatibility
    keywords: technicalScore.score,
    experience: experienceScore.score,
    content: experienceScore.phraseScore,
    format: formatScore.score,
    matchedKeywords: technicalScore.matchedAll,
    missingKeywords: [...technicalScore.missingRequired, ...technicalScore.missingPreferred].slice(0, 15),
    jobDescriptionHash: hashJobDescription(jobDescription)
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  hashJobDescription,
  extractKeywords,
  scoreResumeAgainstJob,
  analyzeJobDescription,
  analyzeResume,
  extractTechnicalSkills,
  ALL_TECHNICAL_SKILLS
};
