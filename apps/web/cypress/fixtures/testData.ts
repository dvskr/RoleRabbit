// Test data fixtures for Cypress tests

export const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '123-456-7890'
};

export const testResume = {
  name: 'Test Resume',
  summary: 'Test resume summary'
};

export const testJob = {
  title: 'Software Developer',
  company: 'Test Company',
  status: 'applied'
};

export const testFile = {
  name: 'test.pdf',
  type: 'application/pdf',
  size: 1024
};

export const testEmail = {
  to: 'test@example.com',
  subject: 'Test Email',
  body: 'Test email body'
};

export const testPost = {
  title: 'Test Post',
  content: 'Test post content',
  category: 'general'
};

export const testCoverLetter = {
  jobDescription: 'Software Developer position',
  companyName: 'Test Company'
};

export const testTemplate = {
  name: 'Test Template',
  content: 'Test template content',
  category: 'resume'
};

export const testProfile = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '123-456-7890'
};

export const testAIMessage = {
  message: 'Help me improve my resume',
  model: 'gpt-4'
};

export const testSearchQuery = {
  query: 'software developer',
  filters: {
    type: 'resume',
    date: 'last-week'
  }
};

export const testNotification = {
  type: 'success',
  message: 'Operation completed successfully'
};

export const testError = {
  type: 'error',
  message: 'Something went wrong',
  code: 500
};

export const testValidationError = {
  field: 'resume-name',
  message: 'This field is required'
};

export const testPerformanceMetrics = {
  loadTime: 2000,
  renderTime: 500,
  memoryUsage: 50,
  cpuUsage: 30
};

export const testAccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  keyboardNavigation: true
};

export const testMobileSettings = {
  viewport: '375x667',
  orientation: 'portrait',
  touchTargets: true,
  gestures: true
};