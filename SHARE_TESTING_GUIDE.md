# Share Functionality Testing Guide

## Overview
This guide helps you test the complete share functionality with `dvskr.1729@gmail.com`.

## Prerequisites
1. ✅ Resend API key configured in `.env` file
2. ✅ Database migration applied (permission field added to ShareLink)
3. ✅ At least one file uploaded to your account

## Testing Steps

### Step 1: Upload a Test File
1. Go to `http://localhost:3000/dashboard?tab=storage`
2. Click "Upload File"
3. Select a file (PDF, DOC, DOCX, or TXT)
4. Enter file name: "Test Share File"
5. Click "Upload File"

### Step 2: Get File ID
**Option A: From Browser Console**
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Find the request to `/api/storage/files`
5. Check the response - find the `id` of your uploaded file

**Option B: From Database**
```sql
SELECT id, name FROM storage_files WHERE "userId" = 'YOUR_USER_ID' ORDER BY "createdAt" DESC LIMIT 1;
```

### Step 3: Get Auth Token
1. Open DevTools (F12)
2. Go to Application tab > Cookies
3. Find `http://localhost:3000`
4. Copy the value of the `token` cookie

### Step 4: Run Tests

**Option A: Using the Test Script**
```bash
# Set environment variables
export FILE_ID="your-file-id-here"
export AUTH_TOKEN="your-auth-token-here"
export API_URL="http://localhost:3001"

# Run tests
node test-share-complete.js
```

**Option B: Manual Testing via Browser**
1. Click the share icon (Share2) on your file card
2. Enter email: `dvskr.1729@gmail.com`
3. Test each scenario:

#### Test 1: Basic Share (View Permission)
- Email: `dvskr.1729@gmail.com`
- Permission: View
- Click the "+" button
- ✅ Should show success toast
- ✅ Should appear in "Currently Shared" section
- ✅ Email should be sent

#### Test 2: Share with Comment Permission
- Email: `dvskr.1729@gmail.com`
- Permission: Comment
- Click the "+" button
- ✅ Verify permission badge shows "comment"

#### Test 3: Share with Edit Permission
- Email: `dvskr.1729@gmail.com`
- Permission: Edit
- Click the "+" button
- ✅ Verify permission badge shows "edit"

#### Test 4: Share with Admin Permission
- Email: `dvskr.1729@gmail.com`
- Permission: Admin
- Click the "+" button
- ✅ Verify permission badge shows "admin"

#### Test 5: Share with Expiration Date
- Email: `dvskr.1729@gmail.com`
- Permission: View
- Expiration: Set to 7 days from now
- Click the "+" button
- ✅ Verify expiration date is saved

#### Test 6: Share with Max Downloads
- Email: `dvskr.1729@gmail.com`
- Permission: View
- Max Downloads: 5
- Click the "+" button
- ✅ Verify max downloads is saved

#### Test 7: Share with All Options
- Email: `dvskr.1729@gmail.com`
- Permission: Edit
- Expiration: 30 days from now
- Max Downloads: 10
- Click the "+" button
- ✅ Verify all options are saved

### Step 5: Verify Email Delivery
1. Check inbox at `dvskr.1729@gmail.com`
2. Look for emails with subject: "Someone shared [filename] with you"
3. Email should contain:
   - File name
   - Permission level
   - Expiration date (if set)
   - Share link (if user doesn't exist) OR direct file link (if user exists)

### Step 6: Test Share Link (if user doesn't exist)
1. If `dvskr.1729@gmail.com` is not a registered user:
   - Email will contain a share link
   - Click the link
   - ✅ Should open file preview/download page

### Step 7: Test Remove Share
1. Click the trash icon next to a shared user
2. ✅ Share should be removed
3. ✅ User should disappear from "Currently Shared" section

## Expected Results

### ✅ Success Indicators
- Success toast notification appears
- Share appears in "Currently Shared" section
- Email sent successfully (check Resend dashboard)
- Real-time update (if user is logged in)
- No console errors

### ❌ Failure Indicators
- Error toast notification
- Console errors
- No email sent (check Resend logs)
- Share doesn't appear in list

## Troubleshooting

### Email Not Sending
1. Check `RESEND_API_KEY` in `.env` file
2. Check Resend dashboard for API status
3. Verify domain is verified in Resend
4. Check server logs for email errors

### Share Not Appearing
1. Check browser console for errors
2. Verify API response in Network tab
3. Check database: `SELECT * FROM file_shares WHERE "fileId" = 'YOUR_FILE_ID';`

### Permission Issues
1. Verify user is authenticated
2. Check file ownership
3. Verify API endpoint permissions

## API Endpoint Details

**Endpoint:** `POST /api/storage/files/:id/share`

**Request Body:**
```json
{
  "userEmail": "dvskr.1729@gmail.com",
  "permission": "view|comment|edit|admin",
  "expiresAt": "2025-01-10T00:00:00.000Z", // Optional
  "maxDownloads": 5 // Optional
}
```

**Response:**
```json
{
  "success": true,
  "share": {
    "id": "share-id",
    "fileId": "file-id",
    "sharedWith": "user-id",
    "permission": "view",
    "expiresAt": "2025-01-10T00:00:00.000Z",
    "createdAt": "2025-01-03T00:00:00.000Z"
  },
  "emailSent": true
}
```

## Notes
- External users (not registered) will receive a share link
- Registered users will receive a direct file link
- All shares are logged in the database
- Real-time updates via WebSocket for logged-in users

