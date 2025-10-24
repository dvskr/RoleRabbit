import { test, expect } from '@playwright/test';

export class RoleReadyPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('/test-all-components');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToResumeEditor() {
    await this.page.click('[data-testid="nav-resume-editor"]');
    await expect(this.page.locator('[data-testid="resume-editor-content"]')).toBeVisible();
  }

  async navigateToAIPanel() {
    await this.page.click('[data-testid="nav-ai-panel"]');
    await expect(this.page.locator('[data-testid="ai-panel-content"]')).toBeVisible();
  }

  async navigateToJobTracker() {
    await this.page.click('[data-testid="nav-job-tracker"]');
    await expect(this.page.locator('[data-testid="job-tracker-content"]')).toBeVisible();
  }

  async navigateToCloudStorage() {
    await this.page.click('[data-testid="nav-cloud-storage"]');
    await expect(this.page.locator('[data-testid="cloud-storage-content"]')).toBeVisible();
  }

  async navigateToEmail() {
    await this.page.click('[data-testid="nav-email"]');
    await expect(this.page.locator('[data-testid="email-content"]')).toBeVisible();
  }

  async navigateToDiscussion() {
    await this.page.click('[data-testid="nav-discussion"]');
    await expect(this.page.locator('[data-testid="discussion-content"]')).toBeVisible();
  }

  async navigateToCoverLetter() {
    await this.page.click('[data-testid="nav-cover-letter"]');
    await expect(this.page.locator('[data-testid="cover-letter-content"]')).toBeVisible();
  }

  async navigateToProfile() {
    await this.page.click('[data-testid="nav-profile"]');
    await expect(this.page.locator('[data-testid="profile-content"]')).toBeVisible();
  }

  async navigateToTemplates() {
    await this.page.click('[data-testid="nav-templates"]');
    await expect(this.page.locator('[data-testid="templates-content"]')).toBeVisible();
  }

  async createResume(name: string, summary: string) {
    await this.navigateToResumeEditor();
    await this.page.fill('[data-testid="resume-name"]', name);
    await this.page.fill('[data-testid="resume-summary"]', summary);
    await this.page.click('[data-testid="save-resume-button"]');
    await expect(this.page.locator('[data-testid="resume-saved"]')).toBeVisible();
  }

  async addResumeSection(title: string, content: string) {
    await this.page.click('[data-testid="add-section-button"]');
    await this.page.fill('[data-testid="section-title-0"]', title);
    await this.page.fill('[data-testid="section-content-0"]', content);
  }

  async useAI(message: string) {
    await this.navigateToAIPanel();
    await this.page.fill('[data-testid="ai-chat-input"]', message);
    await this.page.click('[data-testid="ai-send-button"]');
    await expect(this.page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
  }

  async addJob(title: string, company: string, status: string) {
    await this.navigateToJobTracker();
    await this.page.click('[data-testid="add-job-button"]');
    await this.page.fill('[data-testid="job-title"]', title);
    await this.page.fill('[data-testid="company-name"]', company);
    await this.page.selectOption('[data-testid="job-status"]', status);
    await this.page.click('[data-testid="save-job-button"]');
    await expect(this.page.locator('[data-testid="job-saved"]')).toBeVisible();
  }

  async uploadFile(name: string, type: string, content: string) {
    await this.navigateToCloudStorage();
    const fileInput = this.page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles({
      name: name,
      mimeType: type,
      buffer: Buffer.from(content)
    });
    await expect(this.page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
  }

  async sendEmail(to: string, subject: string, body: string) {
    await this.navigateToEmail();
    await this.page.click('[data-testid="compose-email-button"]');
    await this.page.fill('[data-testid="email-to"]', to);
    await this.page.fill('[data-testid="email-subject"]', subject);
    await this.page.fill('[data-testid="email-body"]', body);
    await this.page.click('[data-testid="send-email-button"]');
    await expect(this.page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
  }

  async createPost(title: string, content: string) {
    await this.navigateToDiscussion();
    await this.page.click('[data-testid="new-post-button"]');
    await this.page.fill('[data-testid="post-title"]', title);
    await this.page.fill('[data-testid="post-content"]', content);
    await this.page.click('[data-testid="publish-post-button"]');
    await expect(this.page.locator('[data-testid="post-published"]')).toBeVisible();
  }

  async generateCoverLetter(jobDescription: string, companyName: string) {
    await this.navigateToCoverLetter();
    await this.page.fill('[data-testid="job-description"]', jobDescription);
    await this.page.fill('[data-testid="company-name"]', companyName);
    await this.page.click('[data-testid="generate-cover-letter-button"]');
    await expect(this.page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
  }

  async updateProfile(name: string, email: string, phone: string) {
    await this.navigateToProfile();
    await this.page.fill('[data-testid="profile-name"]', name);
    await this.page.fill('[data-testid="profile-email"]', email);
    await this.page.fill('[data-testid="profile-phone"]', phone);
    await this.page.click('[data-testid="save-profile-button"]');
    await expect(this.page.locator('[data-testid="profile-saved"]')).toBeVisible();
  }

  async selectTemplate() {
    await this.navigateToTemplates();
    await this.page.click('[data-testid="select-template-button"]');
    await expect(this.page.locator('[data-testid="template-selected"]')).toBeVisible();
  }

  async expectResumeSaved() {
    await expect(this.page.locator('[data-testid="resume-saved"]')).toBeVisible();
  }

  async expectJobSaved() {
    await expect(this.page.locator('[data-testid="job-saved"]')).toBeVisible();
  }

  async expectFileUploaded() {
    await expect(this.page.locator('[data-testid="upload-success"]')).toBeVisible();
  }

  async expectEmailSent() {
    await expect(this.page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible();
  }

  async expectPostPublished() {
    await expect(this.page.locator('[data-testid="post-published"]')).toBeVisible();
  }

  async expectCoverLetterGenerated() {
    await expect(this.page.locator('[data-testid="cover-letter-generated"]')).toBeVisible();
  }

  async expectProfileSaved() {
    await expect(this.page.locator('[data-testid="profile-saved"]')).toBeVisible();
  }

  async expectTemplateSelected() {
    await expect(this.page.locator('[data-testid="template-selected"]')).toBeVisible();
  }

  async expectError(message: string) {
    await expect(this.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="error-message"]')).toContainText(message);
  }

  async expectValidationError() {
    await expect(this.page.locator('[data-testid="validation-error"]')).toBeVisible();
  }

  async expectLoading() {
    await expect(this.page.locator('[data-testid="loading-indicator"]')).toBeVisible();
  }

  async expectSuccess() {
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
  }
}