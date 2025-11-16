/**
 * Screen Reader Announcer Utility
 * 
 * Provides accessible announcements for screen readers using ARIA live regions.
 * Supports both polite and assertive announcements.
 */

class ScreenReaderAnnouncer {
  private politeRegion: HTMLDivElement | null = null;
  private assertiveRegion: HTMLDivElement | null = null;
  private initialized = false;

  /**
   * Initialize the live regions (call once on app mount)
   */
  initialize() {
    if (this.initialized || typeof document === 'undefined') {
      return;
    }

    // Create polite live region for non-urgent announcements
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.setAttribute('role', 'status');
    this.politeRegion.className = 'sr-only';
    document.body.appendChild(this.politeRegion);

    // Create assertive live region for urgent announcements
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.className = 'sr-only';
    document.body.appendChild(this.assertiveRegion);

    this.initialized = true;
  }

  /**
   * Announce a message politely (for success messages, status updates)
   */
  announcePolite(message: string) {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.politeRegion) {
      // Clear and set new message
      this.politeRegion.textContent = '';
      setTimeout(() => {
        if (this.politeRegion) {
          this.politeRegion.textContent = message;
        }
      }, 100);
    }
  }

  /**
   * Announce a message assertively (for errors, warnings)
   */
  announceAssertive(message: string) {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.assertiveRegion) {
      // Clear and set new message
      this.assertiveRegion.textContent = '';
      setTimeout(() => {
        if (this.assertiveRegion) {
          this.assertiveRegion.textContent = message;
        }
      }, 100);
    }
  }

  /**
   * Announce success message
   */
  announceSuccess(message: string) {
    this.announcePolite(message);
  }

  /**
   * Announce error message
   */
  announceError(message: string) {
    this.announceAssertive(message);
  }

  /**
   * Announce warning message
   */
  announceWarning(message: string) {
    this.announceAssertive(message);
  }

  /**
   * Announce info message
   */
  announceInfo(message: string) {
    this.announcePolite(message);
  }

  /**
   * Clean up (call on app unmount)
   */
  cleanup() {
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
    this.initialized = false;
  }
}

// Export singleton instance
export const screenReaderAnnouncer = new ScreenReaderAnnouncer();

// Helper functions for common announcements
export const announceResumeAction = {
  saved: () => screenReaderAnnouncer.announceSuccess('Resume saved successfully'),
  saveFailed: () => screenReaderAnnouncer.announceError('Failed to save resume'),
  sectionAdded: (sectionName: string) => screenReaderAnnouncer.announceSuccess(`${sectionName} section added`),
  sectionRemoved: (sectionName: string) => screenReaderAnnouncer.announceSuccess(`${sectionName} section removed`),
  sectionReordered: () => screenReaderAnnouncer.announceSuccess('Section order updated'),
  atsScore: (score: number) => screenReaderAnnouncer.announcePolite(`ATS score: ${score} out of 100`),
  tailoringComplete: () => screenReaderAnnouncer.announceSuccess('Resume tailored successfully'),
  templateApplied: (templateName: string) => screenReaderAnnouncer.announceSuccess(`${templateName} template applied`),
  importSuccess: () => screenReaderAnnouncer.announceSuccess('Resume imported successfully'),
  exportSuccess: () => screenReaderAnnouncer.announceSuccess('Resume exported successfully'),
  draftSaved: () => screenReaderAnnouncer.announcePolite('Draft auto-saved'),
  draftDiscarded: () => screenReaderAnnouncer.announceSuccess('Draft discarded'),
  conflictDetected: () => screenReaderAnnouncer.announceWarning('Conflict detected. Please resolve before saving.'),
  offline: () => screenReaderAnnouncer.announceWarning('You are offline. Changes will be saved when reconnected.'),
  online: () => screenReaderAnnouncer.announceInfo('You are back online'),
};

