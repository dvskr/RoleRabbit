# Profile Data Flow - Where Your Data Goes

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   1. USER ENTERS DATA                           │
│  ProfileTab.tsx (Form Input)                                     │
│  - firstName, lastName, email, phone, bio, etc.                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   2. LOCAL STATE UPDATE                          │
│  Profile.tsx - handleUserDataChange()                            │
│  - Updates localProfileData state immediately                    │
│  - User sees changes instantly (responsive UI)                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   3. USER CLICKS "SAVE"                          │
│  Profile.tsx - handleSave()                                      │
│  - Cleans data (removes null/undefined)                         │
│  - Converts arrays to JSON strings                               │
│  - Calls: apiService.updateUserProfile(cleanedData)             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   4. API SERVICE LAYER                           │
│  apps/web/src/services/apiService.ts                           │
│  - updateUserProfile() method                                   │
│  - Makes HTTP PUT request                                        │
│  - URL: http://localhost:3001/api/users/profile                │
│  - Headers: Cookie with session_id                              │
│  - Body: JSON with profile data                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ HTTP PUT Request
                     │
┌─────────────────────────────────────────────────────────────────┐
│                   5. BACKEND API ROUTE                          │
│  apps/api/routes/users.routes.js                                │
│  PUT /api/users/profile                                         │
│  - Authentication middleware checks session                      │
│  - Extracts userId from session                                  │
│  - Validates allowed fields                                      │
│  - Converts JSON arrays to strings (for database storage)        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   6. DATABASE UPDATE                            │
│  Prisma ORM                                                      │
│  - prisma.user.update()                                          │
│  - WHERE: id = userId                                            │
│  - Updates PostgreSQL database                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   7. POSTGRESQL DATABASE                        │
│  Database: roleready_db (schema: roleready)                     │
│  Table: users                                                    │
│  - Stores data in columns: firstName, lastName, email, etc.     │
│  - JSON fields stored as TEXT (e.g., skills, education)          │
│  - updatedAt timestamp automatically updated                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   8. RESPONSE BACK TO FRONTEND                  │
│  - Returns updated user data                                     │
│  - Frontend updates local state                                  │
│  - Shows success message                                         │
│  - Profile completeness recalculated                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Step-by-Step

### Step 1: User Types in Form
**File:** `apps/web/src/components/profile/tabs/ProfileTab.tsx`

```typescript
// User types in input field
<FormField
  label="First Name"
  value={userData.firstName}
  onChange={(value) => onUserDataChange({ firstName: value })}
/>
```

**What happens:**
- `onChange` fires immediately as user types
- Calls `onUserDataChange({ firstName: value })`

---

### Step 2: Update Local State
**File:** `apps/web/src/components/Profile.tsx`

```typescript
const handleUserDataChange = (data: Partial<UserData>) => {
  // Update local state immediately for responsive typing
  if (localProfileData) {
    setLocalProfileData({ ...localProfileData, ...data });
  }
};
```

**What happens:**
- State updates immediately (React state)
- UI re-renders showing new value
- **Data is NOT saved yet** - only in browser memory

---

### Step 3: User Clicks "Save" Button
**File:** `apps/web/src/components/Profile.tsx`

```typescript
const handleSave = async () => {
  setIsSaving(true);
  
  // Clean up data
  const cleanedData: Partial<UserData> = {};
  // ... removes null/undefined values
  
  // Send to API
  await apiService.updateUserProfile(cleanedData);
  
  setIsSaving(false);
  setIsSaved(true);
};
```

**What happens:**
- Cleans data (removes empty fields)
- Skips large base64 images (uploaded separately)
- Calls API service

---

### Step 4: API Service Makes HTTP Request
**File:** `apps/web/src/services/apiService.ts`

```typescript
async updateUserProfile(data: Partial<UserData>) {
  return this.request('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
```

**HTTP Request:**
```
PUT http://localhost:3001/api/users/profile
Headers:
  Cookie: session_id=abc123...
  Content-Type: application/json
Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "bio": "Software engineer...",
  "skills": ["JavaScript", "React"],
  ...
}
```

**What happens:**
- Creates HTTP PUT request
- Includes session cookie for authentication
- Sends JSON body with profile data

---

### Step 5: Backend Receives Request
**File:** `apps/api/routes/users.routes.js`

```javascript
fastify.put('/api/users/profile', {
  preHandler: authenticate  // Checks session
}, async (request, reply) => {
  const userId = request.user.userId;  // From session
  const updates = request.body;       // Profile data
  
  // Validate allowed fields
  const allowedFields = ['firstName', 'lastName', 'email', ...];
  
  // Convert arrays to JSON strings for database
  const jsonFields = ['skills', 'education', ...];
  if (jsonFields.includes(field)) {
    updateData[field] = JSON.stringify(updates[field]);
  }
  
  // Update database...
});
```

**What happens:**
- Authentication middleware verifies session
- Extracts `userId` from authenticated session
- Validates only allowed fields can be updated
- Converts arrays to JSON strings (database requirement)

---

### Step 6: Database Update via Prisma
**File:** `apps/api/routes/users.routes.js`

```javascript
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: updateData,
  select: { /* fields to return */ }
});
```

**Prisma generates SQL:**
```sql
UPDATE "roleready"."users"
SET 
  "firstName" = 'John',
  "lastName" = 'Doe',
  "email" = 'john@example.com',
  "bio" = 'Software engineer...',
  "skills" = '["JavaScript","React"]',  -- JSON string
  "updatedAt" = NOW()
WHERE "id" = 'user_abc123';
```

**What happens:**
- Prisma ORM generates SQL query
- Executes UPDATE statement
- Updates PostgreSQL database

---

### Step 7: Data Stored in PostgreSQL
**Database:** PostgreSQL (Supabase or local)

**Table:** `users` (schema: `roleready`)

**Storage:**
- **Text fields:** Stored as VARCHAR/TEXT
  - `firstName`: "John"
  - `lastName`: "Doe"
  - `email`: "john@example.com"
  
- **JSON fields:** Stored as TEXT (JSON string)
  - `skills`: `'["JavaScript","React","Node.js"]'`
  - `education`: `'[{"school":"MIT","degree":"BS"}]'`
  - `workExperiences`: `'[{"company":"Google",...}]'`

- **Timestamps:** Auto-updated
  - `updatedAt`: `2025-11-03 01:30:00`

**Physical Location:**
- **Local:** `apps/api/prisma/dev.db` (if SQLite)
- **Remote:** PostgreSQL server at `db.oawxoirhnnvcomopxcdd.supabase.co:5432`

---

### Step 8: Response & UI Update
**Backend returns:**
```json
{
  "user": {
    "id": "user_abc123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "profileCompleteness": 75,
    ...
  }
}
```

**Frontend updates:**
- Updates local state with saved data
- Shows success message: "Profile saved successfully!"
- Recalculates profile completeness percentage
- UI reflects saved state

---

## 🔐 Security & Authentication

### How Authentication Works:
1. **Session Cookie:** Browser sends `session_id` cookie with every request
2. **Backend Verification:** Backend checks session in database
3. **User ID Extraction:** Gets `userId` from session
4. **Authorization:** Only updates data for authenticated user's own profile

### Database Security:
- **SQL Injection Prevention:** Prisma ORM uses parameterized queries
- **Field Validation:** Only allowed fields can be updated
- **Email Validation:** Backend validates email format
- **Type Safety:** TypeScript/Prisma ensures correct data types

---

## 📍 Data Storage Locations

### During Edit (Not Saved):
- **Location:** Browser memory (React state)
- **Persistence:** Lost on page refresh
- **Files:** `Profile.tsx` - `localProfileData` state

### After Save:
- **Location:** PostgreSQL database
- **Persistence:** Permanent (until deleted)
- **Table:** `users` in `roleready` schema
- **Connection:** Defined in `apps/api/.env` → `DATABASE_URL`

---

## 🔄 Data Retrieval Flow

When you refresh the page or navigate to profile:

```
1. Frontend loads → ProfileContext.tsx
2. Calls: apiService.getUserProfile()
3. GET http://localhost:3001/api/users/profile
4. Backend: GET /api/users/profile
5. Database: SELECT * FROM users WHERE id = ?
6. Parse JSON fields back to arrays
7. Return to frontend
8. Display in form
```

---

## 🛠️ Troubleshooting

### Data Not Saving?
1. **Check Backend:** Is server running on port 3001?
2. **Check Network:** Open browser DevTools → Network tab
3. **Check Console:** Look for error messages
4. **Check Session:** Are you logged in? Check cookies

### Data Not Loading?
1. **Check Database:** Is database connected?
2. **Check API:** Test `GET /api/users/profile` directly
3. **Check Console:** Look for fetch errors

### Where to Check Data:
- **Database:** Use Prisma Studio: `npx prisma studio`
- **API Response:** Browser DevTools → Network → Response
- **State:** React DevTools → Components → Profile → State

---

## 📝 Summary

**Your data journey:**
1. Type in form → React state (browser memory)
2. Click Save → HTTP PUT request
3. Backend receives → Validates & processes
4. Prisma updates → PostgreSQL database
5. Response returns → Frontend updates UI

**Data is stored in:** PostgreSQL database (permanent)
**Data format:** JSON strings for arrays, TEXT for strings
**Security:** Session-based authentication, field validation

---

**Last Updated:** 2025-11-03

