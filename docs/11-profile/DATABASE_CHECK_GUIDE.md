# How to Check Profile Data in Database

This guide shows you how to verify that your profile data is being saved correctly in the PostgreSQL database.

## Method 1: Prisma Studio (Easiest - Visual Interface) ⭐ RECOMMENDED

Prisma Studio is a visual database browser that lets you view and edit data through a web interface.

### Steps:

1. **Open a terminal in the `apps/api` directory:**
   ```bash
   cd apps/api
   ```

2. **Start Prisma Studio:**
   ```bash
   npx prisma studio
   ```

3. **Prisma Studio will open in your browser** (usually at `http://localhost:5555`)

4. **Click on the "User" model** to see all users

5. **Click on any user** to see their complete profile data including:
   - Basic info (email, name, etc.)
   - Extended profile fields (firstName, lastName, phone, location, etc.)
   - JSON fields (skills, education, certifications, etc.)
   - Dates (createdAt, updatedAt)

6. **Filter/Search** users by email or any field

## Method 2: Direct SQL Query

If you prefer using SQL directly or have a PostgreSQL client installed:

### Using psql (PostgreSQL command line):

```bash
# Connect to database (you'll need your DATABASE_URL from .env)
psql <your_database_url>

# Or if you have connection details:
psql -h localhost -U postgres -d roleready
```

### Useful SQL Queries:

```sql
-- View all users with basic info
SELECT id, email, name, "firstName", "lastName", phone, location, "currentRole", "currentCompany" 
FROM "User";

-- View specific user by email
SELECT * FROM "User" WHERE email = 'dvskr.333@gmail.com';

-- View all profile fields for a user
SELECT 
  id, email, name,
  "firstName", "lastName", phone, location, bio,
  "currentRole", "currentCompany", experience, industry,
  skills, education, certifications, projects,
  "createdAt", "updatedAt"
FROM "User" 
WHERE email = 'dvskr.333@gmail.com';

-- Check JSON fields (skills, education, etc.)
SELECT 
  email, 
  skills, 
  education, 
  certifications,
  projects
FROM "User" 
WHERE email = 'dvskr.333@gmail.com';

-- See when profile was last updated
SELECT 
  email, 
  name,
  "updatedAt",
  "createdAt"
FROM "User" 
ORDER BY "updatedAt" DESC;
```

## Method 3: Using Prisma CLI (Node.js Script)

Create a temporary script to query the database:

### Create `check-profile.js` in `apps/api`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProfile() {
  try {
    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: 'dvskr.333@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        bio: true,
        currentRole: true,
        currentCompany: true,
        experience: true,
        industry: true,
        skills: true,
        education: true,
        certifications: true,
        projects: true,
        linkedin: true,
        github: true,
        website: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (user) {
      console.log('\n=== User Profile ===');
      console.log(JSON.stringify(user, null, 2));
      
      // Parse JSON fields for better readability
      if (user.skills) {
        console.log('\n=== Skills ===');
        console.log(JSON.parse(user.skills));
      }
      
      if (user.education) {
        console.log('\n=== Education ===');
        console.log(JSON.parse(user.education));
      }
      
      if (user.projects) {
        console.log('\n=== Projects ===');
        console.log(JSON.parse(user.projects));
      }
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfile();
```

### Run the script:

```bash
cd apps/api
node check-profile.js
```

## Method 4: Using Database GUI Tools

If you have database management tools installed:

### DBeaver, pgAdmin, TablePlus, etc.:

1. **Get your DATABASE_URL** from `apps/api/.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

2. **Connect using the connection details**

3. **Navigate to the `User` table**

4. **View/Edit data** as needed

## Quick Verification Steps:

After saving your profile:

1. **Open Prisma Studio** (Method 1 - easiest)
2. **Find your user** by email
3. **Check the fields** you just updated:
   - Look at `updatedAt` - should be recent
   - Check specific fields like `firstName`, `lastName`, `phone`, etc.
   - Check JSON fields like `skills`, `education` (they're stored as JSON strings)

## Understanding JSON Fields:

Some fields are stored as JSON strings in the database:
- `skills` - Array of skill names
- `education` - Array of education objects
- `certifications` - Array of certification objects
- `projects` - Array of project objects
- `careerTimeline` - Array of career events

In Prisma Studio, you'll see them as strings like:
```json
"[{\"school\":\"MIT\",\"degree\":\"BS\",\"field\":\"Computer Science\"}]"
```

The API automatically parses these when sending to frontend.

## Troubleshooting:

### If Prisma Studio doesn't open:
- Check if port 5555 is available
- Try: `npx prisma studio --port 5556`

### If database connection fails:
- Check `DATABASE_URL` in `apps/api/.env`
- Ensure PostgreSQL is running
- Verify database credentials

### To see raw SQL queries:
- Prisma logs queries in development mode
- Check your API server terminal for SQL output

