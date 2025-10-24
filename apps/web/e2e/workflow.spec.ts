import { test, expect } from '@playwright/test';

test.describe('RoleReady - Workflow Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full resume creation workflow', async ({ page }) => {
    // Step 1: Select template
    await page.click('[data-testid="nav-templates"]');
    await page.click('[data-testid="template-card-0"]');
    await page.click('[data-testid="use-template-button"]');
    await expect(page.locator('[data-testid="template-applied"]')).toBeVisible();
    
    // Step 2: Edit resume
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Complete Workflow Resume');
    await page.fill('[data-testid="resume-summary"]', 'Experienced software developer with 5+ years of experience');
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-0"]', 'Experience');
    await page.fill('[data-testid="section-content-0"]', 'Software Developer at Tech Company (2020-2024)');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Step 3: Get AI feedback
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Review my resume and suggest improvements');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // Step 4: Export resume
    await page.click('[data-testid="nav-resume-editor"]');
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="export-pdf"]');
    await expect(page.locator('[data-testid="pdf-export-success"]')).toBeVisible({ timeout: 15000 });
  });

  test('should complete job application workflow', async ({ page }) => {
    // Step 1: Create resume
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Job Application Resume');
    await page.fill('[data-testid="resume-summary"]', 'Software developer seeking new opportunities');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Step 2: Add job to tracker
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="add-job-button"]');
    await page.fill('[data-testid="job-title"]', 'Senior Software Developer');
    await page.fill('[data-testid="company-name"]', 'Tech Corp');
    await page.selectOption('[data-testid="job-status"]', 'applied');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
    
    // Step 3: Generate cover letter
    await page.click('[data-testid="nav-cover-letter"]');
    await page.fill('[data-testid="job-description"]', 'Senior Software Developer position at Tech Corp');
    await page.fill('[data-testid="company-name"]', 'Tech Corp');
    await page.click('[data-testid="generate-cover-letter-button"]');
    await expect(page.locator('[data-testid="cover-letter-generated"]')).toBeVisible({ timeout: 15000 });
    
    // Step 4: Send application email
    await page.click('[data-testid="nav-email"]');
    await page.click('[data-testid="compose-email-button"]');
    await page.fill('[data-testid="email-to"]', 'hr@techcorp.com');
    await page.fill('[data-testid="email-subject"]', 'Application for Senior Software Developer Position');
    await page.fill('[data-testid="email-body"]', 'Please find my resume and cover letter attached');
    await page.click('[data-testid="send-email-button"]');
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible({ timeout: 10000 });
    
    // Step 5: Update job status
    await page.click('[data-testid="nav-job-tracker"]');
    await page.click('[data-testid="edit-job-button"]');
    await page.selectOption('[data-testid="job-status"]', 'interview-scheduled');
    await page.click('[data-testid="save-job-button"]');
    await expect(page.locator('[data-testid="job-saved"]')).toBeVisible();
  });

  test('should complete AI-assisted resume improvement workflow', async ({ page }) => {
    // Step 1: Create basic resume
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'AI Improved Resume');
    await page.fill('[data-testid="resume-summary"]', 'Software developer');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Step 2: Get AI suggestions
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Help me write a better professional summary');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // Step 3: Apply AI suggestions
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-summary"]', 'Experienced software developer with expertise in full-stack development');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Step 4: Get more AI feedback
    await page.click('[data-testid="nav-ai-panel"]');
    await page.fill('[data-testid="ai-chat-input"]', 'Suggest skills to add to my resume');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // Step 5: Add suggested skills
    await page.click('[data-testid="nav-resume-editor"]');
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title-0"]', 'Skills');
    await page.fill('[data-testid="section-content-0"]', 'JavaScript, React, Node.js, Python, SQL');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should complete collaborative resume editing workflow', async ({ page }) => {
    // Step 1: Create resume
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Collaborative Resume');
    await page.fill('[data-testid="resume-summary"]', 'Team-oriented software developer');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
    
    // Step 2: Share resume
    await page.click('[data-testid="share-button"]');
    await page.fill('[data-testid="share-email"]', 'colleague@example.com');
    await page.click('[data-testid="send-share-invite"]');
    await expect(page.locator('[data-testid="share-sent"]')).toBeVisible();
    
    // Step 3: Enable real-time collaboration
    await page.click('[data-testid="enable-collaboration"]');
    await expect(page.locator('[data-testid="collaboration-enabled"]')).toBeVisible();
    
    // Step 4: Make collaborative edits
    await page.fill('[data-testid="resume-summary"]', 'Collaborative software developer with team leadership experience');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should complete template customization workflow', async ({ page }) => {
    // Step 1: Browse templates
    await page.click('[data-testid="nav-templates"]');
    await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
    
    // Step 2: Preview template
    await page.click('[data-testid="template-card-0"]');
    await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();
    
    // Step 3: Customize template
    await page.click('[data-testid="customize-template"]');
    await page.fill('[data-testid="template-name"]', 'Custom Template');
    await page.fill('[data-testid="template-description"]', 'My custom resume template');
    await page.click('[data-testid="save-template"]');
    await expect(page.locator('[data-testid="template-saved"]')).toBeVisible();
    
    // Step 4: Use customized template
    await page.click('[data-testid="use-template-button"]');
    await expect(page.locator('[data-testid="template-applied"]')).toBeVisible();
    
    // Step 5: Edit resume with template
    await page.click('[data-testid="nav-resume-editor"]');
    await page.fill('[data-testid="resume-name"]', 'Template Customized Resume');
    await page.click('[data-testid="save-resume-button"]');
    await expect(page.locator('[data-testid="resume-saved"]')).toBeVisible();
  });

  test('should complete profile setup workflow', async ({ page }) => {
    // Step 1: Access profile
    await page.click('[data-testid="nav-profile"]');
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
    
    // Step 2: Fill basic information
    await page.fill('[data-testid="profile-name"]', 'John Doe');
    await page.fill('[data-testid="profile-email"]', 'john.doe@example.com');
    await page.fill('[data-testid="profile-phone"]', '123-456-7890');
    await page.fill('[data-testid="profile-location"]', 'San Francisco, CA');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    
    // Step 3: Upload profile picture
    const fileInput = page.locator('[data-testid="profile-picture-input"]');
    await fileInput.setInputFiles({
      name: 'profile.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image content')
    });
    await expect(page.locator('[data-testid="profile-picture-uploaded"]')).toBeVisible();
    
    // Step 4: Add social links
    await page.fill('[data-testid="linkedin-url"]', 'https://linkedin.com/in/johndoe');
    await page.fill('[data-testid="github-url"]', 'https://github.com/johndoe');
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
  });

  test('should complete cloud storage management workflow', async ({ page }) => {
    // Step 1: Access cloud storage
    await page.click('[data-testid="nav-cloud-storage"]');
    await expect(page.locator('[data-testid="cloud-storage"]')).toBeVisible();
    
    // Step 2: Upload files
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    await fileInput.setInputFiles([
      {
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('resume content')
      },
      {
        name: 'cover-letter.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: Buffer.from('cover letter content')
      }
    ]);
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 15000 });
    
    // Step 3: Organize files
    await page.click('[data-testid="create-folder-button"]');
    await page.fill('[data-testid="folder-name"]', 'Job Applications');
    await page.click('[data-testid="create-folder"]');
    await expect(page.locator('[data-testid="folder-created"]')).toBeVisible();
    
    // Step 4: Move files to folder
    await page.click('[data-testid="move-file-button"]');
    await page.selectOption('[data-testid="destination-folder"]', 'Job Applications');
    await page.click('[data-testid="confirm-move"]');
    await expect(page.locator('[data-testid="file-moved"]')).toBeVisible();
  });

  test('should complete discussion forum workflow', async ({ page }) => {
    // Step 1: Access discussion forum
    await page.click('[data-testid="nav-discussion"]');
    await expect(page.locator('[data-testid="discussion-forum"]')).toBeVisible();
    
    // Step 2: Create new post
    await page.click('[data-testid="new-post-button"]');
    await page.fill('[data-testid="post-title"]', 'Resume Review Request');
    await page.fill('[data-testid="post-content"]', 'Looking for feedback on my software developer resume');
    await page.selectOption('[data-testid="post-category"]', 'resume-review');
    await page.click('[data-testid="publish-post-button"]');
    await expect(page.locator('[data-testid="post-published"]')).toBeVisible();
    
    // Step 3: Reply to post
    await page.click('[data-testid="reply-button"]');
    await page.fill('[data-testid="reply-content"]', 'Great resume! Consider adding more specific achievements');
    await page.click('[data-testid="submit-reply"]');
    await expect(page.locator('[data-testid="reply-submitted"]')).toBeVisible();
    
    // Step 4: Like post
    await page.click('[data-testid="like-button"]');
    await expect(page.locator('[data-testid="post-liked"]')).toBeVisible();
  });

  test('should complete advanced AI features workflow', async ({ page }) => {
    // Step 1: Access AI panel
    await page.click('[data-testid="nav-ai-panel"]');
    await expect(page.locator('[data-testid="ai-panel"]')).toBeVisible();
    
    // Step 2: Configure AI settings
    await page.click('[data-testid="ai-settings-button"]');
    await page.selectOption('[data-testid="ai-model"]', 'gpt-4');
    await page.fill('[data-testid="ai-temperature"]', '0.7');
    await page.click('[data-testid="save-ai-settings"]');
    await expect(page.locator('[data-testid="ai-settings-saved"]')).toBeVisible();
    
    // Step 3: Use AI for resume improvement
    await page.fill('[data-testid="ai-chat-input"]', 'Analyze my resume and suggest improvements');
    await page.click('[data-testid="ai-send-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 15000 });
    
    // Step 4: View AI analytics
    await page.click('[data-testid="nav-ai-analytics"]');
    await expect(page.locator('[data-testid="ai-analytics-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
  });
});