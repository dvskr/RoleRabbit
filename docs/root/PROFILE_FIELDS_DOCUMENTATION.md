# Profile Fields Documentation

This document lists all fields available in each sub-option (tab) of the Profile section.

## 1. Profile Tab (Basic Information)

### Profile Picture
- **profilePicture** (string | null) - Profile picture URL/base64

### Basic Information Section
- **firstName** (string) - First name (Required)
- **lastName** (string) - Last name (Required)
- **email** (string) - Login email/username (Read-only, cannot be changed)
- **personalEmail** (string, optional) - Personal/contact email (different from login email)
- **phone** (string) - Phone number
- **location** (string) - Location (City, Country)

### Social Links Section
- **linkedin** (string, optional) - LinkedIn profile URL
- **github** (string, optional) - GitHub profile URL
- **portfolio** (string, optional) - Portfolio URL
- **website** (string, optional) - Personal website URL

---

## 2. Professional Tab

### Professional Bio Section
- **professionalBio** (string, optional) - Professional bio/overview (max 5000 characters)
  - Can also use **bio** field (legacy support)
  - Minimum recommended: 50 characters

### Work Experience Section
Each work experience entry contains:
- **id** (string, optional) - Unique identifier
- **company** (string) - Company name
- **role** (string) - Job title/position
- **location** (string, optional) - Work location
- **startDate** (string) - Start date (format: MM/YYYY)
- **endDate** (string, optional) - End date (format: MM/YYYY or empty if current)
- **isCurrent** (boolean) - Whether this is the current position
- **description** (string, optional) - Job description/responsibilities (max 10000 characters, supports bullet points)
- **projectType** (string, optional) - Employment type (one of):
  - 'Client Project'
  - 'Full-time'
  - 'Part-time'
  - 'Contract'
  - 'Freelance'
  - 'Consulting'
  - 'Internship'

---

## 3. Skills & Expertise Tab

### Technical Skills Section
Each skill entry contains:
- **name** (string) - Skill name
- **yearsOfExperience** (number, optional) - Years of experience
- **verified** (boolean, optional) - Whether skill is verified

### Certifications Section
Each certification entry contains:
- **id** (string, optional) - Unique identifier
- **name** (string) - Certification name
- **issuer** (string) - Issuing organization
- **date** (string, optional) - Issue date
- **expiryDate** (string, optional) - Expiry date
- **credentialUrl** (string, optional) - URL to credential/verification
- **verified** (boolean, optional) - Whether certification is verified

### Languages Section
Each language entry contains:
- **name** (string) - Language name
- **proficiency** (string) - Proficiency level (typically 'Native', but can be customized)

### Education Section
Each education entry contains:
- **id** (string, optional) - Unique identifier
- **institution** (string) - School/University name
- **degree** (string, optional) - Degree type (e.g., Bachelor of Science)
- **field** (string, optional) - Field of study/Major
- **startDate** (string, optional) - Start date (format: YYYY-MM or "Sep 2015")
- **endDate** (string, optional) - End date/Graduation date (format: YYYY-MM or "Present")
- **gpa** (string, optional) - GPA score
- **honors** (string, optional) - Honors and awards
- **location** (string, optional) - Institution location
- **description** (string, optional) - Additional details (key courses, achievements, activities)

---

## 4. Preferences Tab

### Notification Preferences Section
- **emailNotifications** (boolean) - Enable/disable email notifications
- **smsNotifications** (boolean) - Enable/disable SMS notifications

### Privacy Settings Section
- **profileVisibility** (string) - Profile visibility level (one of):
  - 'Public' - Visible to everyone
  - 'Recruiters Only' - Visible to verified recruiters
  - 'Private' - Only you can see
- **privacyLevel** (string) - Privacy level for recruiter sharing (one of):
  - 'Professional' - Share full profile
  - 'Limited' - Share basic info only
  - 'Minimal' - Share contact info only

---

## 5. Security Tab

### Password Management Section
- **currentPassword** (string) - Current password (for password change)
- **newPassword** (string) - New password (for password change)
- **confirmPassword** (string) - Confirm new password (for password change)

### Two-Factor Authentication (2FA) Section
- **twoFAEnabled** (boolean) - Whether 2FA is enabled
- **secret** (string) - 2FA secret key (for setup)
- **qrCode** (string) - QR code for 2FA setup
- **backupCodes** (string[]) - Backup codes for 2FA recovery
- **verificationCode** (string) - Code to verify 2FA setup

### Login Activity Section
Each session entry contains:
- **id** (string) - Session identifier
- **device** (string) - Device name
- **ipAddress** (string) - IP address
- **lastActive** (string) - Last activity timestamp
- **isCurrent** (boolean) - Whether this is the current session
- **userAgent** (string) - User agent string

### Privacy Settings Section (Security Tab)
- **profileVisibility** (ProfileVisibility) - Profile visibility setting
- **showContactInfo** (boolean) - Whether to show contact information

---

## 6. Support Tab (Help & Support)

This tab does not contain editable fields. It provides:
- Help Center link
- Live Chat option
- Contact information (Email, Phone)
- Documentation links
- Frequently Asked Questions

---

## Additional Fields (Available in UserData but not directly editable in tabs)

These fields exist in the data model but may not have dedicated UI sections:

### Career Goals
- **careerGoals** (CareerGoal[]) - Array of career goal objects
- **targetRoles** (string[]) - Array of target role names
- **targetCompanies** (string[]) - Array of target company names
- **relocationWillingness** (string) - Willingness to relocate

### Professional Information
- **currentRole** (string) - Current job title
- **currentCompany** (string) - Current company
- **experience** (string) - Years of experience
- **industry** (string) - Industry
- **jobLevel** (string) - Job level
- **employmentType** (string) - Employment type
- **availability** (string) - Availability status
- **salaryExpectation** (string) - Salary expectation
- **workPreference** (string) - Work preference

### Portfolio & Projects
- **projects** (Project[]) - Array of project objects
- **achievements** (Achievement[]) - Array of achievement objects
- **socialLinks** (SocialLink[]) - Array of social link objects
- **careerTimeline** (TimelineEvent[]) - Career timeline events

### Advanced Professional
- **workExperiences** (WorkExperience[]) - Work experience entries (managed in Professional Tab)
- **volunteerExperiences** (VolunteerExperience[]) - Volunteer experience entries
- **recommendations** (Recommendation[]) - Recommendations/endorsements
- **publications** (Publication[]) - Publications
- **patents** (Patent[]) - Patents
- **organizations** (Organization[]) - Professional organizations
- **testScores** (TestScore[]) - Test scores (SAT, GRE, GMAT, etc.)

### Analytics & Insights (Read-only)
- **profileViews** (number) - Number of profile views
- **successRate** (number) - Success rate percentage
- **profileCompleteness** (number) - Profile completeness percentage
- **skillMatchRate** (number) - Skill match rate percentage
- **avgResponseTime** (number) - Average response time

---

## Notes

1. **Required Fields**: Only `firstName` and `lastName` are marked as required in the Profile Tab.
2. **Read-only Fields**: `email` (login email) cannot be changed once set.
3. **Array Fields**: Many fields are arrays that can contain multiple entries (skills, certifications, education, work experiences, etc.).
4. **Character Limits**: 
   - Professional Bio: 5000 characters max
   - Work Experience Description: 10000 characters max
5. **Data Validation**: Fields may have format requirements (dates, URLs, emails, etc.).

