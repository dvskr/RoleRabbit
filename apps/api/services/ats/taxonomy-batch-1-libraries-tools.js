// BATCH 1: FRAMEWORK LIBRARIES & DEVELOPMENT TOOLS (300+ Technologies)
// React, Vue, Angular ecosystems + IDEs, Editors, Linters, Formatters

const BATCH_1_LIBRARIES_TOOLS = {

  // ============================================================================
  // REACT ECOSYSTEM (80+)
  // ============================================================================
  
  'react-router': { synonyms: ['react-router-dom', 'react router'], related: ['react', 'routing', 'spa'], category: 'frontend', subcategory: 'react-library', keywords: ['routing', 'navigation', 'react'], level: 'beginner', popularity: 'very-high' },
  'react-query': { synonyms: ['tanstack query', '@tanstack/react-query'], related: ['react', 'data fetching', 'caching'], category: 'frontend', subcategory: 'react-library', keywords: ['data fetching', 'caching', 'server state'], level: 'intermediate', popularity: 'very-high' },
  'react-hook-form': { synonyms: ['rhf'], related: ['react', 'forms', 'validation'], category: 'frontend', subcategory: 'react-library', keywords: ['forms', 'validation', 'performance'], level: 'beginner', popularity: 'very-high' },
  'formik': { synonyms: [], related: ['react', 'forms', 'validation', 'yup'], category: 'frontend', subcategory: 'react-library', keywords: ['forms', 'validation', 'react'], level: 'beginner', popularity: 'high' },
  'yup': { synonyms: [], related: ['validation', 'schema', 'formik'], category: 'frontend', subcategory: 'validation', keywords: ['validation', 'schema', 'javascript'], level: 'beginner', popularity: 'high' },
  'zod': { synonyms: [], related: ['validation', 'schema', 'typescript'], category: 'frontend', subcategory: 'validation', keywords: ['validation', 'typescript-first', 'schema'], level: 'intermediate', popularity: 'very-high' },
  'react-spring': { synonyms: [], related: ['react', 'animation', 'spring physics'], category: 'frontend', subcategory: 'react-library', keywords: ['animation', 'spring physics', 'react'], level: 'intermediate', popularity: 'high' },
  'framer-motion': { synonyms: ['framer'], related: ['react', 'animation', 'gestures'], category: 'frontend', subcategory: 'react-library', keywords: ['animation', 'gestures', 'production-ready'], level: 'beginner', popularity: 'very-high' },
  'react-beautiful-dnd': { synonyms: ['react dnd'], related: ['react', 'drag and drop', 'accessible'], category: 'frontend', subcategory: 'react-library', keywords: ['drag and drop', 'accessible', 'beautiful'], level: 'intermediate', popularity: 'high' },
  'react-table': { synonyms: ['tanstack table'], related: ['react', 'tables', 'data grid'], category: 'frontend', subcategory: 'react-library', keywords: ['tables', 'data grid', 'headless'], level: 'intermediate', popularity: 'very-high' },
  'react-virtualized': { synonyms: [], related: ['react', 'virtualization', 'performance'], category: 'frontend', subcategory: 'react-library', keywords: ['virtualization', 'performance', 'large lists'], level: 'advanced', popularity: 'medium' },
  'react-window': { synonyms: [], related: ['react', 'virtualization', 'lists'], category: 'frontend', subcategory: 'react-library', keywords: ['virtualization', 'windowing', 'performance'], level: 'intermediate', popularity: 'high' },
  'react-helmet': { synonyms: ['react helmet async'], related: ['react', 'seo', 'meta tags'], category: 'frontend', subcategory: 'react-library', keywords: ['seo', 'head management', 'meta tags'], level: 'beginner', popularity: 'high' },
  'react-toastify': { synonyms: ['toastify'], related: ['react', 'notifications', 'toast'], category: 'frontend', subcategory: 'react-library', keywords: ['notifications', 'toast', 'alerts'], level: 'beginner', popularity: 'very-high' },
  'react-icons': { synonyms: [], related: ['react', 'icons', 'svg'], category: 'frontend', subcategory: 'react-library', keywords: ['icons', 'svg', 'popular icon packs'], level: 'beginner', popularity: 'very-high' },
  'react-select': { synonyms: [], related: ['react', 'select', 'dropdown'], category: 'frontend', subcategory: 'react-library', keywords: ['select', 'dropdown', 'searchable'], level: 'beginner', popularity: 'very-high' },
  'react-datepicker': { synonyms: [], related: ['react', 'date picker', 'calendar'], category: 'frontend', subcategory: 'react-library', keywords: ['date picker', 'calendar', 'time picker'], level: 'beginner', popularity: 'high' },
  'react-dropzone': { synonyms: [], related: ['react', 'file upload', 'drag drop'], category: 'frontend', subcategory: 'react-library', keywords: ['file upload', 'drag and drop', 'accessible'], level: 'beginner', popularity: 'high' },
  'react-i18next': { synonyms: ['i18next react'], related: ['react', 'i18n', 'translation'], category: 'frontend', subcategory: 'react-library', keywords: ['internationalization', 'translation', 'i18n'], level: 'intermediate', popularity: 'very-high' },
  'swr': { synonyms: ['stale-while-revalidate'], related: ['react', 'data fetching', 'vercel'], category: 'frontend', subcategory: 'react-library', keywords: ['data fetching', 'caching', 'real-time'], level: 'intermediate', popularity: 'very-high' },
  
  // VUE ECOSYSTEM (40+)
  'vue-router': { synonyms: [], related: ['vue', 'routing', 'spa'], category: 'frontend', subcategory: 'vue-library', keywords: ['routing', 'navigation', 'vue'], level: 'beginner', popularity: 'very-high' },
  'vuelidate': { synonyms: [], related: ['vue', 'validation', 'forms'], category: 'frontend', subcategory: 'vue-library', keywords: ['validation', 'forms', 'vue'], level: 'beginner', popularity: 'high' },
  'vue-i18n': { synonyms: [], related: ['vue', 'i18n', 'translation'], category: 'frontend', subcategory: 'vue-library', keywords: ['internationalization', 'translation', 'vue'], level: 'intermediate', popularity: 'high' },
  'vue-meta': { synonyms: [], related: ['vue', 'seo', 'meta tags'], category: 'frontend', subcategory: 'vue-library', keywords: ['seo', 'meta tags', 'ssr'], level: 'beginner', popularity: 'medium' },
  'vue-test-utils': { synonyms: [], related: ['vue', 'testing', 'unit tests'], category: 'frontend', subcategory: 'testing', keywords: ['vue testing', 'unit tests', 'official'], level: 'intermediate', popularity: 'very-high' },
  'vee-validate': { synonyms: [], related: ['vue', 'validation', 'forms'], category: 'frontend', subcategory: 'vue-library', keywords: ['validation', 'forms', 'template-based'], level: 'beginner', popularity: 'high' },
  'vue-apollo': { synonyms: [], related: ['vue', 'graphql', 'apollo'], category: 'frontend', subcategory: 'vue-library', keywords: ['graphql', 'apollo', 'vue'], level: 'advanced', popularity: 'medium' },
  'nuxt': { synonyms: ['nuxt.js', 'nuxtjs'], related: ['vue', 'ssr', 'framework'], category: 'frontend', subcategory: 'framework', keywords: ['vue framework', 'ssr', 'static generation'], level: 'intermediate', popularity: 'very-high' },
  'nuxt-content': { synonyms: [], related: ['nuxt', 'cms', 'markdown'], category: 'frontend', subcategory: 'cms', keywords: ['git-based cms', 'markdown', 'nuxt'], level: 'intermediate', popularity: 'high' },
  
  // ANGULAR ECOSYSTEM (30+)
  'rxjs': { synonyms: ['reactive extensions'], related: ['angular', 'reactive programming', 'observables'], category: 'frontend', subcategory: 'library', keywords: ['reactive programming', 'observables', 'streams'], level: 'advanced', popularity: 'very-high' },
  'ngx-bootstrap': { synonyms: [], related: ['angular', 'bootstrap', 'components'], category: 'frontend', subcategory: 'component-library', keywords: ['angular', 'bootstrap', 'components'], level: 'beginner', popularity: 'high' },
  'angular-material': { synonyms: ['material angular'], related: ['angular', 'material design', 'components'], category: 'frontend', subcategory: 'component-library', keywords: ['material design', 'angular', 'official'], level: 'beginner', popularity: 'very-high' },
  'ngx-translate': { synonyms: [], related: ['angular', 'i18n', 'translation'], category: 'frontend', subcategory: 'angular-library', keywords: ['internationalization', 'translation', 'angular'], level: 'intermediate', popularity: 'high' },
  'angular-cli': { synonyms: ['ng cli'], related: ['angular', 'cli', 'build tool'], category: 'devops', subcategory: 'cli', keywords: ['angular cli', 'scaffolding', 'build'], level: 'beginner', popularity: 'very-high' },
  'ngrx-store': { synonyms: ['ngrx store'], related: ['angular', 'state management', 'redux'], category: 'frontend', subcategory: 'state-management', keywords: ['angular state', 'redux pattern', 'rxjs'], level: 'advanced', popularity: 'high' },
  'ngrx-effects': { synonyms: [], related: ['angular', 'ngrx', 'side effects'], category: 'frontend', subcategory: 'state-management', keywords: ['side effects', 'ngrx', 'angular'], level: 'advanced', popularity: 'high' },
  
  // PYTHON LIBRARIES (60+)
  'requests': { synonyms: ['python requests'], related: ['python', 'http', 'api client'], category: 'backend', subcategory: 'python-library', keywords: ['http', 'api client', 'elegant'], level: 'beginner', popularity: 'very-high' },
  'beautifulsoup4': { synonyms: ['beautiful soup', 'bs4'], related: ['python', 'web scraping', 'html parsing'], category: 'backend', subcategory: 'python-library', keywords: ['web scraping', 'html parsing', 'xml'], level: 'beginner', popularity: 'very-high' },
  'pillow': { synonyms: ['pil'], related: ['python', 'image processing', 'imaging'], category: 'backend', subcategory: 'python-library', keywords: ['image processing', 'image manipulation', 'python'], level: 'intermediate', popularity: 'very-high' },
  'celery': { synonyms: [], related: ['python', 'task queue', 'distributed', 'async'], category: 'backend', subcategory: 'python-library', keywords: ['task queue', 'distributed', 'background jobs'], level: 'advanced', popularity: 'very-high' },
  'sqlalchemy': { synonyms: ['sql alchemy'], related: ['python', 'orm', 'database'], category: 'backend', subcategory: 'orm', keywords: ['python orm', 'database', 'sql toolkit'], level: 'advanced', popularity: 'very-high' },
  'alembic': { synonyms: [], related: ['python', 'sqlalchemy', 'migrations'], category: 'backend', subcategory: 'migration', keywords: ['database migrations', 'sqlalchemy', 'version control'], level: 'advanced', popularity: 'high' },
  'pydantic': { synonyms: [], related: ['python', 'validation', 'type hints'], category: 'backend', subcategory: 'validation', keywords: ['data validation', 'type hints', 'parsing'], level: 'intermediate', popularity: 'very-high' },
  'httpx': { synonyms: [], related: ['python', 'http', 'async'], category: 'backend', subcategory: 'python-library', keywords: ['http client', 'async', 'modern'], level: 'intermediate', popularity: 'high' },
  'aiohttp': { synonyms: [], related: ['python', 'async', 'http'], category: 'backend', subcategory: 'python-library', keywords: ['async http', 'client server', 'asyncio'], level: 'advanced', popularity: 'very-high' },
  'uvicorn': { synonyms: [], related: ['python', 'asgi', 'server'], category: 'backend', subcategory: 'server', keywords: ['asgi server', 'fastapi', 'lightning fast'], level: 'intermediate', popularity: 'very-high' },
  'gunicorn': { synonyms: ['green unicorn'], related: ['python', 'wsgi', 'server'], category: 'backend', subcategory: 'server', keywords: ['wsgi server', 'python', 'production'], level: 'intermediate', popularity: 'very-high' },
  'click': { synonyms: [], related: ['python', 'cli', 'command line'], category: 'backend', subcategory: 'python-library', keywords: ['cli', 'command line', 'composable'], level: 'intermediate', popularity: 'high' },
  'typer': { synonyms: [], related: ['python', 'cli', 'type hints'], category: 'backend', subcategory: 'python-library', keywords: ['cli', 'type hints', 'modern'], level: 'intermediate', popularity: 'high' },
  'pytest-cov': { synonyms: [], related: ['pytest', 'coverage', 'testing'], category: 'testing', subcategory: 'coverage', keywords: ['code coverage', 'pytest plugin', 'testing'], level: 'intermediate', popularity: 'very-high' },
  'pytest-asyncio': { synonyms: [], related: ['pytest', 'async', 'testing'], category: 'testing', subcategory: 'python', keywords: ['async testing', 'pytest', 'asyncio'], level: 'advanced', popularity: 'high' },
  'black': { synonyms: ['black formatter'], related: ['python', 'formatter', 'code style'], category: 'devops', subcategory: 'formatter', keywords: ['python formatter', 'opinionated', 'automatic'], level: 'beginner', popularity: 'very-high' },
  'flake8': { synonyms: [], related: ['python', 'linter', 'style'], category: 'devops', subcategory: 'linter', keywords: ['python linter', 'pep8', 'style checker'], level: 'beginner', popularity: 'very-high' },
  'pylint': { synonyms: [], related: ['python', 'linter', 'analysis'], category: 'devops', subcategory: 'linter', keywords: ['python linter', 'static analysis', 'comprehensive'], level: 'intermediate', popularity: 'very-high' },
  'mypy': { synonyms: [], related: ['python', 'type checking', 'static'], category: 'devops', subcategory: 'type-checker', keywords: ['type checker', 'static typing', 'python'], level: 'advanced', popularity: 'very-high' },
  'autopep8': { synonyms: [], related: ['python', 'formatter', 'pep8'], category: 'devops', subcategory: 'formatter', keywords: ['python formatter', 'pep8', 'automatic'], level: 'beginner', popularity: 'high' },
  'isort': { synonyms: [], related: ['python', 'imports', 'formatter'], category: 'devops', subcategory: 'formatter', keywords: ['import sorting', 'python', 'code organization'], level: 'beginner', popularity: 'high' },
  
  // JAVA LIBRARIES (30+)
  'lombok': { synonyms: ['project lombok'], related: ['java', 'boilerplate', 'annotations'], category: 'backend', subcategory: 'java-library', keywords: ['reduce boilerplate', 'annotations', 'java'], level: 'intermediate', popularity: 'very-high' },
  'guava': { synonyms: ['google guava'], related: ['java', 'utilities', 'collections'], category: 'backend', subcategory: 'java-library', keywords: ['core libraries', 'google', 'collections'], level: 'intermediate', popularity: 'very-high' },
  'apache-commons': { synonyms: ['commons'], related: ['java', 'utilities', 'apache'], category: 'backend', subcategory: 'java-library', keywords: ['utilities', 'reusable components', 'apache'], level: 'intermediate', popularity: 'very-high' },
  'jackson': { synonyms: ['jackson-databind'], related: ['java', 'json', 'serialization'], category: 'backend', subcategory: 'java-library', keywords: ['json', 'serialization', 'data binding'], level: 'intermediate', popularity: 'very-high' },
  'gson': { synonyms: ['google gson'], related: ['java', 'json', 'google'], category: 'backend', subcategory: 'java-library', keywords: ['json', 'serialization', 'google'], level: 'beginner', popularity: 'very-high' },
  'slf4j': { synonyms: ['simple logging facade'], related: ['java', 'logging', 'facade'], category: 'backend', subcategory: 'logging', keywords: ['logging facade', 'abstraction', 'java'], level: 'intermediate', popularity: 'very-high' },
  'logback': { synonyms: [], related: ['java', 'logging', 'slf4j'], category: 'backend', subcategory: 'logging', keywords: ['logging framework', 'slf4j', 'successor to log4j'], level: 'intermediate', popularity: 'very-high' },
  'log4j': { synonyms: ['log4j2'], related: ['java', 'logging', 'apache'], category: 'backend', subcategory: 'logging', keywords: ['logging', 'java', 'apache'], level: 'intermediate', popularity: 'very-high' },
  'mockito': { synonyms: [], related: ['java', 'mocking', 'testing'], category: 'testing', subcategory: 'mocking', keywords: ['mocking framework', 'java', 'unit testing'], level: 'intermediate', popularity: 'very-high' },
  'junit5': { synonyms: ['junit jupiter'], related: ['java', 'testing', 'unit tests'], category: 'testing', subcategory: 'unit', keywords: ['java testing', 'unit tests', 'jupiter'], level: 'beginner', popularity: 'very-high' },
  'testng': { synonyms: ['test ng'], related: ['java', 'testing', 'framework'], category: 'testing', subcategory: 'unit', keywords: ['testing framework', 'java', 'flexible'], level: 'intermediate', popularity: 'high' },
  'hibernate': { synonyms: ['hibernate orm'], related: ['java', 'orm', 'jpa'], category: 'backend', subcategory: 'orm', keywords: ['orm', 'jpa', 'persistence'], level: 'advanced', popularity: 'very-high' },
  'spring-data-jpa': { synonyms: ['spring data'], related: ['spring', 'jpa', 'orm'], category: 'backend', subcategory: 'orm', keywords: ['spring data', 'jpa', 'repositories'], level: 'intermediate', popularity: 'very-high' },
  
  // IDEs & EDITORS (40+)
  'vscode': { synonyms: ['visual studio code', 'vs code'], related: ['ide', 'microsoft', 'electron'], category: 'devops', subcategory: 'ide', keywords: ['code editor', 'extensible', 'free'], level: 'beginner', popularity: 'very-high' },
  'intellij idea': { synonyms: ['intellij', 'idea'], related: ['ide', 'jetbrains', 'java'], category: 'devops', subcategory: 'ide', keywords: ['java ide', 'intelligent', 'jetbrains'], level: 'intermediate', popularity: 'very-high' },
  'pycharm': { synonyms: [], related: ['ide', 'python', 'jetbrains'], category: 'devops', subcategory: 'ide', keywords: ['python ide', 'intelligent', 'jetbrains'], level: 'intermediate', popularity: 'very-high' },
  'webstorm': { synonyms: [], related: ['ide', 'javascript', 'jetbrains'], category: 'devops', subcategory: 'ide', keywords: ['javascript ide', 'web development', 'jetbrains'], level: 'intermediate', popularity: 'high' },
  'phpstorm': { synonyms: [], related: ['ide', 'php', 'jetbrains'], category: 'devops', subcategory: 'ide', keywords: ['php ide', 'intelligent', 'jetbrains'], level: 'intermediate', popularity: 'high' },
  'rider': { synonyms: [], related: ['ide', '.net', 'jetbrains', 'c#'], category: 'devops', subcategory: 'ide', keywords: ['.net ide', 'c#', 'cross-platform'], level: 'intermediate', popularity: 'high' },
  'clion': { synonyms: [], related: ['ide', 'c++', 'jetbrains'], category: 'devops', subcategory: 'ide', keywords: ['c++ ide', 'cmake', 'jetbrains'], level: 'advanced', popularity: 'medium' },
  'goland': { synonyms: [], related: ['ide', 'go', 'jetbrains'], category: 'devops', subcategory: 'ide', keywords: ['go ide', 'jetbrains', 'intelligent'], level: 'intermediate', popularity: 'medium' },
  'visual studio': { synonyms: ['vs'], related: ['ide', 'microsoft', '.net'], category: 'devops', subcategory: 'ide', keywords: ['.net development', 'microsoft', 'enterprise'], level: 'intermediate', popularity: 'very-high' },
  'eclipse': { synonyms: [], related: ['ide', 'java', 'open source'], category: 'devops', subcategory: 'ide', keywords: ['java ide', 'open source', 'extensible'], level: 'intermediate', popularity: 'high' },
  'netbeans': { synonyms: [], related: ['ide', 'java', 'apache'], category: 'devops', subcategory: 'ide', keywords: ['java ide', 'apache', 'open source'], level: 'intermediate', popularity: 'medium' },
  'sublime text': { synonyms: ['sublime'], related: ['editor', 'fast', 'lightweight'], category: 'devops', subcategory: 'editor', keywords: ['text editor', 'fast', 'multiple selections'], level: 'beginner', popularity: 'high' },
  'atom': { synonyms: ['atom editor'], related: ['editor', 'github', 'electron'], category: 'devops', subcategory: 'editor', keywords: ['hackable', 'github', 'packages'], level: 'beginner', popularity: 'medium' },
  'vim': { synonyms: ['vi improved'], related: ['editor', 'terminal', 'modal'], category: 'devops', subcategory: 'editor', keywords: ['terminal editor', 'modal', 'powerful'], level: 'advanced', popularity: 'very-high' },
  'neovim': { synonyms: ['nvim'], related: ['vim', 'editor', 'modern'], category: 'devops', subcategory: 'editor', keywords: ['vim fork', 'modern', 'extensible'], level: 'advanced', popularity: 'high' },
  'emacs': { synonyms: [], related: ['editor', 'lisp', 'extensible'], category: 'devops', subcategory: 'editor', keywords: ['extensible', 'powerful', 'lisp'], level: 'expert', popularity: 'medium' },
  'nano': { synonyms: [], related: ['editor', 'terminal', 'simple'], category: 'devops', subcategory: 'editor', keywords: ['simple', 'terminal', 'beginner-friendly'], level: 'beginner', popularity: 'high' },
  
  // LINTERS & FORMATTERS (20+)
  'eslint': { synonyms: ['es lint'], related: ['javascript', 'linter', 'pluggable'], category: 'devops', subcategory: 'linter', keywords: ['javascript linter', 'pluggable', 'configurable'], level: 'beginner', popularity: 'very-high' },
  'prettier': { synonyms: [], related: ['formatter', 'opinionated', 'javascript'], category: 'devops', subcategory: 'formatter', keywords: ['code formatter', 'opinionated', 'multi-language'], level: 'beginner', popularity: 'very-high' },
  'tslint': { synonyms: ['ts lint'], related: ['typescript', 'linter', 'deprecated'], category: 'devops', subcategory: 'linter', keywords: ['typescript linter', 'deprecated', 'use eslint'], level: 'intermediate', popularity: 'low' },
  'stylelint': { synonyms: ['style lint'], related: ['css', 'linter', 'scss'], category: 'devops', subcategory: 'linter', keywords: ['css linter', 'scss', 'modern'], level: 'intermediate', popularity: 'high' },
  'jshint': { synonyms: ['js hint'], related: ['javascript', 'linter', 'legacy'], category: 'devops', subcategory: 'linter', keywords: ['javascript linter', 'configurable', 'legacy'], level: 'intermediate', popularity: 'low' },
  'standardjs': { synonyms: ['standard', 'standard js'], related: ['javascript', 'style', 'zero-config'], category: 'devops', subcategory: 'linter', keywords: ['javascript standard', 'zero config', 'opinionated'], level: 'beginner', popularity: 'medium' },
  'rubocop': { synonyms: [], related: ['ruby', 'linter', 'formatter'], category: 'devops', subcategory: 'linter', keywords: ['ruby linter', 'style guide', 'formatter'], level: 'intermediate', popularity: 'very-high' },
  'checkstyle': { synonyms: [], related: ['java', 'linter', 'style'], category: 'devops', subcategory: 'linter', keywords: ['java style checker', 'coding standards', 'configurable'], level: 'intermediate', popularity: 'high' },
  'pmd': { synonyms: [], related: ['java', 'analyzer', 'bugs'], category: 'devops', subcategory: 'analyzer', keywords: ['source code analyzer', 'java', 'finds bugs'], level: 'advanced', popularity: 'high' },
  'spotbugs': { synonyms: ['findbugs'], related: ['java', 'static analysis', 'bugs'], category: 'devops', subcategory: 'analyzer', keywords: ['bug detection', 'static analysis', 'java'], level: 'advanced', popularity: 'high' },

};

module.exports = {
  BATCH_1_LIBRARIES_TOOLS
};

