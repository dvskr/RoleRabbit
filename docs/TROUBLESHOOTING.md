# RoleRabbit Troubleshooting Guide

This guide helps you diagnose and fix common issues in RoleRabbit.

---

## Table of Contents

1. [Development Issues](#development-issues)
2. [Database Issues](#database-issues)
3. [Authentication Issues](#authentication-issues)
4. [Deployment Issues](#deployment-issues)
5. [Performance Issues](#performance-issues)
6. [API Issues](#api-issues)
7. [Frontend Issues](#frontend-issues)
8. [Testing Issues](#testing-issues)

---

## Development Issues

### Issue: `npm install` fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Causes:**
- Conflicting package versions
- Node version mismatch
- Corrupted package-lock.json

**Solutions:**

1. **Check Node version**:
   ```bash
   node --version  # Should be 18.17.0 or higher
   nvm use 18      # If using nvm
   ```

2. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use legacy peer deps** (temporary):
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Update npm**:
   ```bash
   npm install -g npm@latest
   ```

---

### Issue: Development server won't start

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causes:**
- Port 3000 is already in use
- Previous dev server still running

**Solutions:**

1. **Find and kill process on port 3000**:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Use different port**:
   ```bash
   PORT=3001 npm run dev
   ```

3. **Kill all node processes** (careful!):
   ```bash
   killall node
   ```

---

### Issue: Environment variables not loading

**Symptoms:**
```
Error: Environment variable DATABASE_URL is not defined
```

**Causes:**
- Missing .env.local file
- Wrong file name (.env instead of .env.local)
- Variables not prefixed with NEXT_PUBLIC_ for client-side

**Solutions:**

1. **Check file exists**:
   ```bash
   ls -la apps/web/.env.local
   ```

2. **Copy from example**:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

3. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **For client-side variables**, prefix with `NEXT_PUBLIC_`:
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

---

### Issue: TypeScript errors after pulling changes

**Symptoms:**
```
error TS2307: Cannot find module '@/types' or its corresponding type declarations
```

**Causes:**
- New dependencies added
- Type definitions changed
- IDE cache out of sync

**Solutions:**

1. **Reinstall dependencies**:
   ```bash
   npm install
   ```

2. **Restart TypeScript server** (VS Code):
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Type "TypeScript: Restart TS Server"
   - Press Enter

3. **Clear Next.js cache**:
   ```bash
   rm -rf apps/web/.next
   npm run dev
   ```

4. **Rebuild types**:
   ```bash
   npm run type-check
   ```

---

## Database Issues

### Issue: "Connection refused" error

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causes:**
- PostgreSQL not running
- Wrong connection string
- Firewall blocking connection

**Solutions:**

1. **Check if PostgreSQL is running**:
   ```bash
   # macOS
   brew services list
   brew services start postgresql@14

   # Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql

   # Check connection
   psql -U postgres -h localhost
   ```

2. **Verify DATABASE_URL**:
   ```bash
   # .env.local
   DATABASE_URL=postgresql://user:password@localhost:5432/rolerabbit
   ```

3. **Test connection**:
   ```bash
   psql $DATABASE_URL
   ```

4. **For Supabase**, check project is not paused:
   - Go to https://app.supabase.com
   - Check project status
   - Resume if paused

---

### Issue: Migration fails

**Symptoms:**
```
Error: relation "portfolios" already exists
```

**Causes:**
- Migration already applied
- Database in inconsistent state
- Migration file has errors

**Solutions:**

1. **Check migration status**:
   ```bash
   npm run db:migrate:status
   ```

2. **Rollback last migration**:
   ```bash
   npm run db:migrate:down
   ```

3. **Reset database** (development only!):
   ```bash
   npm run db:reset
   npm run db:migrate
   npm run db:seed
   ```

4. **Fix migration file**:
   - Check syntax errors in SQL
   - Ensure idempotent migrations (IF NOT EXISTS)
   - Test migration in transaction:
     ```sql
     BEGIN;
     -- Your migration SQL
     ROLLBACK;  -- Change to COMMIT if looks good
     ```

---

### Issue: "Too many connections" error

**Symptoms:**
```
Error: sorry, too many clients already
```

**Causes:**
- Connection pool exhausted
- Connections not properly closed
- Too many concurrent requests

**Solutions:**

1. **Check active connections**:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Kill idle connections**:
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
     AND state_change < now() - interval '5 minutes';
   ```

3. **Increase max connections** (PostgreSQL config):
   ```
   max_connections = 100
   ```

4. **Reduce pool size** (application):
   ```typescript
   // database/client.ts
   const supabase = createClient(url, key, {
     db: {
       poolSize: 10,  // Reduce from default
     },
   });
   ```

5. **Use connection pooling** (PgBouncer):
   ```bash
   # Install PgBouncer
   brew install pgbouncer  # macOS
   sudo apt install pgbouncer  # Linux
   ```

---

## Authentication Issues

### Issue: "Invalid JWT" error

**Symptoms:**
```
Error: Invalid JWT: token expired
```

**Causes:**
- Token expired
- Token signed with different secret
- System clock out of sync

**Solutions:**

1. **Check JWT_SECRET** is consistent:
   ```bash
   # .env.local
   JWT_SECRET=your-secret-key-here
   ```

2. **Refresh token**:
   ```typescript
   // Frontend
   const { data, error } = await supabase.auth.refreshSession();
   ```

3. **Check system clock**:
   ```bash
   date
   # Should match actual time
   ```

4. **Clear auth cookies**:
   ```javascript
   // In browser console
   document.cookie.split(";").forEach((c) => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```

---

### Issue: Session not persisting

**Symptoms:**
- User logged out after page refresh
- Session lost when navigating

**Causes:**
- Cookies not set properly
- SameSite cookie restrictions
- Missing session storage

**Solutions:**

1. **Check cookie settings**:
   ```typescript
   // middleware/auth.ts
   res.setHeader('Set-Cookie', [
     `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
   ]);
   ```

2. **Enable localStorage** for session:
   ```typescript
   const supabase = createClient(url, key, {
     auth: {
       storage: window.localStorage,
       autoRefreshToken: true,
       persistSession: true,
     },
   });
   ```

3. **For development on localhost**, disable secure flag:
   ```typescript
   const isProduction = process.env.NODE_ENV === 'production';
   res.setHeader('Set-Cookie', [
     `session=${token}; Path=/; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Lax`,
   ]);
   ```

---

## Deployment Issues

### Issue: Build fails in production

**Symptoms:**
```
Error: Failed to compile
Module not found: Can't resolve '@/components/Button'
```

**Causes:**
- TypeScript errors
- Missing dependencies
- Environment variables not set

**Solutions:**

1. **Run production build locally**:
   ```bash
   npm run build
   ```

2. **Check for TypeScript errors**:
   ```bash
   npm run type-check
   ```

3. **Verify all dependencies are in package.json**:
   ```bash
   npm install
   ```

4. **Set environment variables** in deployment platform:
   - Vercel: Project Settings → Environment Variables
   - Railway: Project → Variables
   - AWS: Task Definition → Environment Variables

---

### Issue: Deployment succeeds but site shows 500 error

**Symptoms:**
- Build succeeds
- Site returns 500 Internal Server Error
- No clear error message

**Causes:**
- Database connection fails
- Missing environment variables
- API route errors

**Solutions:**

1. **Check logs**:
   ```bash
   # Vercel
   vercel logs [deployment-url]

   # Railway
   railway logs

   # AWS
   aws logs tail /aws/ecs/rolerabbit
   ```

2. **Verify DATABASE_URL** in production:
   ```bash
   # Test connection from production environment
   psql $DATABASE_URL
   ```

3. **Check error monitoring** (Sentry):
   - Go to Sentry dashboard
   - Check recent errors
   - Look for stack traces

4. **Enable debug logging** temporarily:
   ```bash
   # .env (production)
   LOG_LEVEL=debug
   ```

---

### Issue: Database migrations not applied

**Symptoms:**
- Site works locally
- Production shows errors about missing tables/columns
- Migration files exist

**Causes:**
- Migrations not run during deployment
- Migration script failed silently
- Wrong database targeted

**Solutions:**

1. **Manually run migrations**:
   ```bash
   # On deployment platform
   npm run db:migrate
   ```

2. **Check deployment logs** for migration output:
   ```bash
   # Look for migration output in build logs
   ```

3. **Verify DATABASE_URL** points to production:
   ```bash
   echo $DATABASE_URL
   # Should be production database, not local
   ```

4. **Add migration step** to deploy script:
   ```json
   // package.json
   {
     "scripts": {
       "build": "npm run db:migrate && next build"
     }
   }
   ```

---

## Performance Issues

### Issue: Slow API responses

**Symptoms:**
- API requests take >1 second
- Database queries slow
- High CPU usage

**Diagnosis:**

1. **Check database query performance**:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM portfolios WHERE user_id = 'user-123';
   ```

2. **Check for missing indexes**:
   ```sql
   SELECT schemaname, tablename, indexname
   FROM pg_indexes
   WHERE tablename = 'portfolios';
   ```

3. **Monitor query time**:
   ```typescript
   const start = Date.now();
   const result = await query();
   console.log(`Query took ${Date.now() - start}ms`);
   ```

**Solutions:**

1. **Add database indexes**:
   ```sql
   CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
   CREATE INDEX idx_portfolios_subdomain ON portfolios(subdomain);
   ```

2. **Optimize query** - select only needed fields:
   ```typescript
   // ✅ Good
   const { data } = await supabase
     .from('portfolios')
     .select('id, title, created_at');

   // ❌ Bad
   const { data } = await supabase
     .from('portfolios')
     .select('*');
   ```

3. **Add caching**:
   ```typescript
   import { cache } from '@/lib/cache';

   const portfolios = await cache.get('user-portfolios', async () => {
     return await getPortfolios(userId);
   }, { ttl: 300 }); // Cache for 5 minutes
   ```

4. **Use pagination**:
   ```typescript
   const { data } = await supabase
     .from('portfolios')
     .select('*')
     .range(0, 19)  // First 20 items
     .order('created_at', { ascending: false });
   ```

---

### Issue: High memory usage

**Symptoms:**
- Process crashes with "Out of Memory"
- Memory usage keeps growing
- Deployment platform kills process

**Diagnosis:**

1. **Check memory usage**:
   ```bash
   node --max-old-space-size=4096 server.js
   ```

2. **Use heap snapshot**:
   ```bash
   node --inspect server.js
   # Open chrome://inspect
   # Take heap snapshot
   ```

**Solutions:**

1. **Increase memory limit**:
   ```json
   // package.json
   {
     "scripts": {
       "start": "node --max-old-space-size=4096 server.js"
     }
   }
   ```

2. **Fix memory leaks**:
   - Close database connections
   - Remove event listeners
   - Clear intervals/timeouts
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => { /* ... */ }, 1000);
     return () => clearInterval(interval); // Cleanup!
   }, []);
   ```

3. **Optimize image handling**:
   ```typescript
   // Use Next.js Image optimization
   import Image from 'next/image';

   <Image
     src="/profile.jpg"
     width={500}
     height={500}
     alt="Profile"
   />
   ```

---

## API Issues

### Issue: CORS errors

**Symptoms:**
```
Access to fetch at 'https://api.rolerabbit.com' from origin 'https://rolerabbit.com' has been blocked by CORS policy
```

**Causes:**
- Missing CORS headers
- Wrong origin configuration
- Preflight request failing

**Solutions:**

1. **Add CORS middleware**:
   ```typescript
   // middleware/cors.ts
   export function corsMiddleware(req: NextApiRequest, res: NextApiResponse, next: any) {
     res.setHeader('Access-Control-Allow-Origin', 'https://rolerabbit.com');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

     if (req.method === 'OPTIONS') {
       return res.status(200).end();
     }

     next();
   }
   ```

2. **For Next.js API routes**:
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/api/:path*',
           headers: [
             { key: 'Access-Control-Allow-Origin', value: '*' },
             { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
           ],
         },
       ];
     },
   };
   ```

---

### Issue: Rate limit errors

**Symptoms:**
```
429 Too Many Requests
{ "error": "Rate limit exceeded" }
```

**Causes:**
- Too many requests from same IP/user
- Rate limit configuration too strict
- Bot traffic

**Solutions:**

1. **Check rate limit status**:
   ```bash
   curl -I https://api.rolerabbit.com/portfolios
   # Look for X-RateLimit-* headers
   ```

2. **Implement exponential backoff**:
   ```typescript
   async function fetchWithRetry(url: string, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const response = await fetch(url);

         if (response.status === 429) {
           const retryAfter = response.headers.get('Retry-After');
           const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000;
           await new Promise(resolve => setTimeout(resolve, delay));
           continue;
         }

         return response;
       } catch (error) {
         if (i === maxRetries - 1) throw error;
       }
     }
   }
   ```

3. **Adjust rate limits** (for admins):
   ```typescript
   // lib/rate-limiting/rate-limiter.ts
   export const RATE_LIMITS = {
     'api:general': {
       windowMs: 60 * 60 * 1000,
       maxRequests: 100,  // Increase from 100 to 200
     },
   };
   ```

---

## Frontend Issues

### Issue: Hydration mismatch errors

**Symptoms:**
```
Warning: Expected server HTML to contain a matching <div> in <div>
```

**Causes:**
- Server and client render different content
- Using browser-only APIs during SSR
- Date/time formatting differences

**Solutions:**

1. **Use `useEffect` for client-only code**:
   ```typescript
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
     setMounted(true);
   }, []);

   if (!mounted) return null;

   return <div>{/* Client-only content */}</div>;
   ```

2. **Disable SSR** for specific components:
   ```typescript
   import dynamic from 'next/dynamic';

   const ClientOnlyComponent = dynamic(
     () => import('@/components/ClientOnly'),
     { ssr: false }
   );
   ```

3. **Use consistent formatting**:
   ```typescript
   // ✅ Good - Consistent date format
   const formattedDate = new Date(date).toISOString();

   // ❌ Bad - Local timezone differs server/client
   const formattedDate = new Date(date).toLocaleString();
   ```

---

### Issue: Images not loading

**Symptoms:**
- Broken image icons
- 404 errors for images
- Images load locally but not in production

**Causes:**
- Wrong image path
- Missing image domain in Next.js config
- CORS issues

**Solutions:**

1. **Check image path**:
   ```typescript
   // ✅ Good - Relative to public folder
   <img src="/images/logo.png" />

   // ❌ Bad - Incorrect path
   <img src="./images/logo.png" />
   ```

2. **Add image domain** to Next.js config:
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['cdn.rolerabbit.com', 'supabase.co'],
     },
   };
   ```

3. **Check file exists**:
   ```bash
   ls -la public/images/logo.png
   ```

---

## Testing Issues

### Issue: Tests failing in CI but passing locally

**Symptoms:**
- Tests pass on local machine
- Same tests fail in GitHub Actions / CI

**Causes:**
- Environment differences
- Missing environment variables
- Timing issues
- Database state differences

**Solutions:**

1. **Check Node version** matches:
   ```yaml
   # .github/workflows/test.yml
   - uses: actions/setup-node@v3
     with:
       node-version: '18.17.0'  # Match local version
   ```

2. **Set environment variables** in CI:
   ```yaml
   # .github/workflows/test.yml
   env:
     DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
     JWT_SECRET: test-secret
   ```

3. **Add delays** for timing-sensitive tests:
   ```typescript
   test('should update after delay', async () => {
     act(() => {
       fireEvent.click(button);
     });

     await waitFor(() => {
       expect(screen.getByText('Updated')).toBeInTheDocument();
     }, { timeout: 5000 });
   });
   ```

4. **Reset database** between tests:
   ```typescript
   beforeEach(async () => {
     await resetDatabase();
   });
   ```

---

## Getting Help

If you're still stuck:

1. **Check logs**:
   - Application logs
   - Database logs
   - System logs

2. **Search documentation**:
   - [Development Guide](DEVELOPMENT.md)
   - [Deployment Guide](DEPLOYMENT.md)
   - [API Documentation](API.md)

3. **Ask for help**:
   - GitHub Issues: https://github.com/rolerabbit/RoleRabbit/issues
   - GitHub Discussions: https://github.com/rolerabbit/RoleRabbit/discussions
   - Email: support@rolerabbit.com

4. **Provide context** when asking:
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?
   - Error messages and stack traces
   - Steps to reproduce
   - Environment (OS, Node version, etc.)

---

**Last Updated:** January 15, 2025
