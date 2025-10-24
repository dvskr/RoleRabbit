// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for tab navigation
Cypress.Commands.add('tab', () => {
  cy.get('body').trigger('keydown', { key: 'Tab' });
});

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.get('[data-testid="login-button"]').click();
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
  cy.get('[data-testid="login-success"]').should('be.visible');
});

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.get('[data-testid="logout-success"]').should('be.visible');
});

// Custom command for creating resume
Cypress.Commands.add('createResume', (name: string, summary: string) => {
  cy.get('[data-testid="nav-resume-editor"]').click();
  cy.get('[data-testid="resume-name"]').type(name);
  cy.get('[data-testid="resume-summary"]').type(summary);
  cy.get('[data-testid="save-resume-button"]').click();
  cy.get('[data-testid="resume-saved"]').should('be.visible');
});

// Custom command for adding job
Cypress.Commands.add('addJob', (title: string, company: string, status: string) => {
  cy.get('[data-testid="nav-job-tracker"]').click();
  cy.get('[data-testid="add-job-button"]').click();
  cy.get('[data-testid="job-title"]').type(title);
  cy.get('[data-testid="company-name"]').type(company);
  cy.get('[data-testid="job-status"]').select(status);
  cy.get('[data-testid="save-job-button"]').click();
  cy.get('[data-testid="job-saved"]').should('be.visible');
});

// Custom command for uploading file
Cypress.Commands.add('uploadFile', (name: string, type: string) => {
  cy.get('[data-testid="nav-cloud-storage"]').click();
  cy.get('[data-testid="file-upload-input"]').selectFile(`cypress/fixtures/${name}`);
  cy.get('[data-testid="upload-success"]').should('be.visible', { timeout: 15000 });
});

// Custom command for sending email
Cypress.Commands.add('sendEmail', (to: string, subject: string, body: string) => {
  cy.get('[data-testid="nav-email"]').click();
  cy.get('[data-testid="compose-email-button"]').click();
  cy.get('[data-testid="email-to"]').type(to);
  cy.get('[data-testid="email-subject"]').type(subject);
  cy.get('[data-testid="email-body"]').type(body);
  cy.get('[data-testid="send-email-button"]').click();
  cy.get('[data-testid="email-sent-confirmation"]').should('be.visible', { timeout: 10000 });
});

// Custom command for creating post
Cypress.Commands.add('createPost', (title: string, content: string) => {
  cy.get('[data-testid="nav-discussion"]').click();
  cy.get('[data-testid="new-post-button"]').click();
  cy.get('[data-testid="post-title"]').type(title);
  cy.get('[data-testid="post-content"]').type(content);
  cy.get('[data-testid="publish-post-button"]').click();
  cy.get('[data-testid="post-published"]').should('be.visible');
});

// Custom command for generating cover letter
Cypress.Commands.add('generateCoverLetter', (jobDescription: string, companyName: string) => {
  cy.get('[data-testid="nav-cover-letter"]').click();
  cy.get('[data-testid="job-description"]').type(jobDescription);
  cy.get('[data-testid="company-name"]').type(companyName);
  cy.get('[data-testid="generate-cover-letter-button"]').click();
  cy.get('[data-testid="cover-letter-generated"]').should('be.visible', { timeout: 15000 });
});

// Custom command for updating profile
Cypress.Commands.add('updateProfile', (name: string, email: string, phone: string) => {
  cy.get('[data-testid="nav-profile"]').click();
  cy.get('[data-testid="profile-name"]').type(name);
  cy.get('[data-testid="profile-email"]').type(email);
  cy.get('[data-testid="profile-phone"]').type(phone);
  cy.get('[data-testid="save-profile-button"]').click();
  cy.get('[data-testid="profile-saved"]').should('be.visible');
});

// Custom command for selecting template
Cypress.Commands.add('selectTemplate', () => {
  cy.get('[data-testid="nav-templates"]').click();
  cy.get('[data-testid="select-template-button"]').click();
  cy.get('[data-testid="template-selected"]').should('be.visible');
});
