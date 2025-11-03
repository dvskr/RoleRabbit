# Profile Feature - Quick Test Checklist

## 🚀 Quick Start (5 minutes)

### 1. Start Backend
```bash
cd apps/api
npm run dev
```
✅ **Check:** `http://localhost:3001/health` returns `{"status":"ok"}`

### 2. Start Frontend
```bash
cd apps/web
npm run dev
```
✅ **Check:** `http://localhost:3000` loads

### 3. Create Test Account
- Go to `http://localhost:3000/register`
- Register: `test@example.com` / `Test123!@#`
- Login

### 4. Navigate to Profile
- Click "Profile" in navigation
- ✅ Should see 8 tabs

---

## ✅ Essential Tests (15 minutes)

### Profile Tab
- [ ] Click "Edit Profile"
- [ ] Fill: First Name, Last Name, Phone, Location, Bio
- [ ] Click "Save"
- [ ] ✅ Data saves and persists

### Profile Picture
- [ ] Click profile picture area
- [ ] Upload image (JPG/PNG < 5MB)
- [ ] ✅ Picture uploads and displays

### Professional Tab
- [ ] Click "Professional" tab
- [ ] Click "Edit"
- [ ] Fill: Role, Company, Industry
- [ ] Click "Save"
- [ ] ✅ Data saves

### Skills Tab
- [ ] Click "Skills & Expertise" tab
- [ ] Add skill: `JavaScript` (Expert, 5 years)
- [ ] ✅ Skill appears in list

### Security Tab
- [ ] Click "Security" tab
- [ ] Click "Change Password"
- [ ] Enter: Current, New, Confirm
- [ ] ✅ Password changes successfully

### Sessions
- [ ] Scroll to "Login Activity"
- [ ] ✅ Current session listed
- [ ] ✅ Can revoke other sessions

### 2FA (Optional)
- [ ] Click "Enable Two-Factor Authentication"
- [ ] ✅ QR code appears
- [ ] Scan with authenticator app
- [ ] Enter code and enable
- [ ] ✅ 2FA enabled

---

## 🐛 Quick Error Tests

- [ ] Try invalid email format → ✅ Error shown
- [ ] Try upload non-image file → ✅ Error shown
- [ ] Try weak password → ✅ Error shown
- [ ] Logout and try to access profile → ✅ Redirected to login

---

## ✅ Success Indicators

- [ ] All tabs load without errors
- [ ] Data saves and persists on refresh
- [ ] Profile picture uploads
- [ ] Password change works
- [ ] No console errors
- [ ] No API errors in network tab

---

## 📋 Full Testing Guide

For complete testing instructions, see: `docs/components/profile/TESTING_GUIDE.md`

---

**Time Estimate:** 
- Quick Test: 15-20 minutes
- Full Test: 1-2 hours

