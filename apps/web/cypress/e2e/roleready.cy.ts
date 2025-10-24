describe('RoleReady E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/test-all-components');
  });

  it('should load the main application', () => {
    cy.get('[data-testid="main-container"]').should('be.visible');
    cy.get('[data-testid="navigation-menu"]').should('be.visible');
    cy.get('[data-testid="main-content"]').should('be.visible');
  });

  it('should navigate between sections', () => {
    const sections = [
      'nav-home',
      'nav-resume-editor',
      'nav-ai-panel',
      'nav-templates',
      'nav-job-tracker',
      'nav-cloud-storage',
      'nav-email',
      'nav-discussion',
      'nav-cover-letter',
      'nav-profile'
    ];
    
    sections.forEach(section => {
      cy.get(`[data-testid="${section}"]`).click();
      cy.get(`[data-testid="${section.replace('nav-', '')}-content"]`).should('be.visible');
    });
  });

  it('should create and save a resume', () => {
    cy.get('[data-testid="nav-resume-editor"]').click();
    cy.get('[data-testid="resume-name"]').type('Test Resume');
    cy.get('[data-testid="resume-summary"]').type('Test resume summary');
    cy.get('[data-testid="save-resume-button"]').click();
    cy.get('[data-testid="resume-saved"]').should('be.visible');
  });

  it('should use AI assistance', () => {
    cy.get('[data-testid="nav-ai-panel"]').click();
    cy.get('[data-testid="ai-chat-input"]').type('Help me improve my resume');
    cy.get('[data-testid="ai-send-button"]').click();
    cy.get('[data-testid="ai-response"]').should('be.visible', { timeout: 15000 });
  });

  it('should track job applications', () => {
    cy.get('[data-testid="nav-job-tracker"]').click();
    cy.get('[data-testid="add-job-button"]').click();
    cy.get('[data-testid="job-title"]').type('Software Developer');
    cy.get('[data-testid="company-name"]').type('Test Company');
    cy.get('[data-testid="job-status"]').select('applied');
    cy.get('[data-testid="save-job-button"]').click();
    cy.get('[data-testid="job-saved"]').should('be.visible');
  });

  it('should upload and manage files', () => {
    cy.get('[data-testid="nav-cloud-storage"]').click();
    cy.get('[data-testid="file-upload-input"]').selectFile('cypress/fixtures/test.pdf');
    cy.get('[data-testid="upload-success"]').should('be.visible', { timeout: 15000 });
  });

  it('should send emails', () => {
    cy.get('[data-testid="nav-email"]').click();
    cy.get('[data-testid="compose-email-button"]').click();
    cy.get('[data-testid="email-to"]').type('test@example.com');
    cy.get('[data-testid="email-subject"]').type('Test Email');
    cy.get('[data-testid="email-body"]').type('Test email body');
    cy.get('[data-testid="send-email-button"]').click();
    cy.get('[data-testid="email-sent-confirmation"]').should('be.visible', { timeout: 10000 });
  });

  it('should participate in discussions', () => {
    cy.get('[data-testid="nav-discussion"]').click();
    cy.get('[data-testid="new-post-button"]').click();
    cy.get('[data-testid="post-title"]').type('Test Post');
    cy.get('[data-testid="post-content"]').type('Test post content');
    cy.get('[data-testid="publish-post-button"]').click();
    cy.get('[data-testid="post-published"]').should('be.visible');
  });

  it('should generate cover letters', () => {
    cy.get('[data-testid="nav-cover-letter"]').click();
    cy.get('[data-testid="job-description"]').type('Software Developer position');
    cy.get('[data-testid="company-name"]').type('Test Company');
    cy.get('[data-testid="generate-cover-letter-button"]').click();
    cy.get('[data-testid="cover-letter-generated"]').should('be.visible', { timeout: 15000 });
  });

  it('should manage user profile', () => {
    cy.get('[data-testid="nav-profile"]').click();
    cy.get('[data-testid="profile-name"]').type('Test User');
    cy.get('[data-testid="profile-email"]').type('test@example.com');
    cy.get('[data-testid="profile-phone"]').type('123-456-7890');
    cy.get('[data-testid="save-profile-button"]').click();
    cy.get('[data-testid="profile-saved"]').should('be.visible');
  });

  it('should select templates', () => {
    cy.get('[data-testid="nav-templates"]').click();
    cy.get('[data-testid="select-template-button"]').click();
    cy.get('[data-testid="template-selected"]').should('be.visible');
  });

  it('should handle errors gracefully', () => {
    cy.intercept('POST', '/api/resume', { statusCode: 500 }).as('saveResume');
    
    cy.get('[data-testid="nav-resume-editor"]').click();
    cy.get('[data-testid="resume-name"]').type('Error Test Resume');
    cy.get('[data-testid="save-resume-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should work on mobile devices', () => {
    cy.viewport(375, 667);
    cy.get('[data-testid="mobile-layout"]').should('be.visible');
    
    cy.get('[data-testid="nav-resume-editor"]').click();
    cy.get('[data-testid="resume-name"]').type('Mobile Test Resume');
    cy.get('[data-testid="save-resume-button"]').click();
    cy.get('[data-testid="resume-saved"]').should('be.visible');
  });

  it('should be accessible', () => {
    cy.get('[data-testid="navigation-menu"]').should('have.attr', 'role', 'navigation');
    cy.get('[data-testid="main-content"]').should('have.attr', 'role', 'main');
    
    cy.get('body').tab();
    cy.focused().should('be.visible');
  });

  it('should perform well', () => {
    const startTime = Date.now();
    cy.visit('/test-all-components');
    cy.get('[data-testid="main-container"]').should('be.visible');
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
  });
});