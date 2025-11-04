# Schema Cleanup Analysis

## Models to REMOVE (Not used in Profile Tabs)

Based on the profile structure, these models are NOT needed:

1. **CareerTimeline** - Not in any profile tab
2. **VolunteerExperience** - Not in any profile tab  
3. **Recommendation** - Not in any profile tab
4. **Publication** - Not in any profile tab
5. **Patent** - Not in any profile tab
6. **Organization** - Not in any profile tab
7. **TestScore** - Not in any profile tab

## Models to KEEP (Used in Profile Tabs)

### Profile Tab
- **UserProfile** - Contains: firstName, lastName, phone, personalEmail, location, profilePicture, linkedin, github, portfolio, website

### Professional Tab
- **WorkExperience** - Work experience entries
- **Project** - Projects (separate section)

### Skills & Expertise Tab
- **Education** - Education entries
- **Certification** - Certification entries
- **Language** - Language entries
- **UserSkill** - User skills with years of experience
- **Skill** - Skill master table

### Preferences Tab (in User model)
- **User** - Contains: emailNotifications, smsNotifications, privacyLevel, profileVisibility

### Security Tab (in User model)
- **User** - Contains: password, twoFactorEnabled, twoFactorSecret, twoFactorBackupCodes
- **Session** - User sessions/login activity
- **PasswordResetToken** - Password reset tokens
- **RefreshToken** - Refresh tokens

## Storage Models (Keep - Used for file management)

These are used for file storage functionality, not profile tabs:
- **StorageFile** - File storage
- **StorageFolder** - Folder organization
- **StorageQuota** - Storage quotas
- **Credential** - Credential management
- **CredentialReminder** - Credential reminders
- **FileShare** - File sharing
- **FileComment** - File comments
- **FileAccessLog** - File access logs
- **ShareLink** - Share links

## Changes Needed

1. Remove 7 unused models from schema
2. Remove relations from UserProfile to deleted models
3. Create migration to drop unused tables
4. Update API routes to remove references to deleted models

