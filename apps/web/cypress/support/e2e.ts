// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
Cypress.on('window:before:load', (win) => {
  // Remove fetch from window to avoid conflicts
  delete win.fetch;
});

// Add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      tab(): Chainable<Element>;
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createResume(name: string, summary: string): Chainable<void>;
      addJob(title: string, company: string, status: string): Chainable<void>;
      uploadFile(name: string, type: string): Chainable<void>;
      sendEmail(to: string, subject: string, body: string): Chainable<void>;
      createPost(title: string, content: string): Chainable<void>;
      generateCoverLetter(jobDescription: string, companyName: string): Chainable<void>;
      updateProfile(name: string, email: string, phone: string): Chainable<void>;
      selectTemplate(): Chainable<void>;
    }
  }
}
