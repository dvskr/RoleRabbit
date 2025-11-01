# Testing Instructions

## ✅ Fixes Applied

1. **Resume Validation** - Fixed in `apps/api/utils/validation.js`
   - Now accepts `{name, data, templateId}` structure
   - Returns proper `{isValid, errors}` format

2. **Profile PUT Endpoint** - Added in `apps/api/routes/users.routes.js`
   - Endpoint: `PUT /api/users/profile`
   - Allows updating: name, email, profilePicture
   - Wrapped with errorHandler for consistency

## 🚀 Running Tests

### 1. Start the API Server
```powershell
cd apps/api
npm run dev
```

### 2. Run Comprehensive Tests
```powershell
cd C:\RoleReady-FullStack
powershell -ExecutionPolicy Bypass -File test-comprehensive.ps1
```

### What Gets Tested

The test script will automatically:
- ✅ Check server health
- ✅ Login authentication
- ✅ Resume CRUD (Create, Read, Update, Delete)
- ✅ Profile Update
- ✅ Job CRUD (Create, Update, Delete)
- ✅ Cover Letter Creation

### Test Results

Results are displayed in console and saved to:
- `test-results-YYYYMMDD-HHmmss.csv`

## 📊 Expected Results (After Server Restart)

If fixes are working correctly:
- ✅ Resume CREATE should pass (validation fixed)
- ✅ Profile UPDATE should pass (endpoint added)
- ✅ Resume/Job CRUD should work
- ⚠️ Some operations may still fail if validation needs adjustment

## 🔍 Manual Testing

If you want to test manually:

### Test Resume Creation
```powershell
# Login first
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body '{"email":"test@example.com","password":"Test1234!"}' -ContentType "application/json"
$token = $login.token
$headers = @{Authorization="Bearer $token"; "Content-Type"="application/json"}

# Create resume
$body = '{"name":"Test Resume","data":"{\"name\":\"Test\",\"email\":\"test@test.com\"}"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/resumes" -Method POST -Headers $headers -Body $body
```

### Test Profile Update
```powershell
$body = '{"name":"Updated Name"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/users/profile" -Method PUT -Headers $headers -Body $body
```

---

**Note:** Server must be running for tests to work!

