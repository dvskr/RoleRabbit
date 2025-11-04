# Fix Prisma Client Error

## Problem
The error `The column education.graduationDate does not exist` occurs because the Prisma client was generated with the old schema that included `graduationDate`, but the database has been migrated to use `endDate`.

## Solution

**IMPORTANT: Stop the API server first!**

1. **Stop the API server** (if it's running)

2. **Regenerate Prisma Client:**
   ```bash
   cd apps/api
   npx prisma generate
   ```

3. **Restart the API server:**
   ```bash
   npm run dev
   # or
   node server.js
   ```

## Why This Happens

- The Prisma client is generated code that reads from `schema.prisma`
- When the server starts, it loads the generated Prisma client into memory
- Even though we updated `schema.prisma` and migrated the database, the running server still has the old client code in memory
- Regenerating the client creates new code that matches the current schema
- Restarting the server loads the new client code

## Verification

After regenerating and restarting, the error should be resolved. The Prisma client will now use `endDate` instead of `graduationDate`.

