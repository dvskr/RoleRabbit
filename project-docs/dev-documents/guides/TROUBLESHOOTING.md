# Troubleshooting Guide

Common development issues and their solutions.

## 🔧 Common Issues

### Port Already in Use

**Problem:** Port 3000, 3001, or 8000 is already in use

**Solution:**
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change port in .env
```

### Database Connection Errors

**Problem:** Cannot connect to PostgreSQL

**Solution:**
1. Check if PostgreSQL is running: `docker ps`
2. Verify DATABASE_URL in .env
3. Check database credentials
4. Restart Docker container: `docker-compose restart postgres`

### Module Not Found Errors

**Problem:** Import errors or module not found

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf .next
```

### TypeScript Errors

**Problem:** TypeScript compilation errors

**Solution:**
1. Run type check: `npm run type-check`
2. Check tsconfig.json configuration
3. Ensure all types are properly imported
4. Clear TypeScript cache

### Environment Variables Not Loading

**Problem:** Environment variables not available

**Solution:**
1. Ensure .env files are in correct locations
2. Restart development server
3. Check variable naming (NEXT_PUBLIC_ prefix for client-side)
4. Verify .env files are not in .gitignore

### Prisma Migration Issues

**Problem:** Migration errors

**Solution:**
```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Hot Reload Not Working

**Problem:** Changes not reflecting in browser

**Solution:**
1. Clear browser cache
2. Restart development server
3. Check file watcher limits
4. Verify file is saved

### Build Errors

**Problem:** Production build fails

**Solution:**
1. Check for TypeScript errors: `npm run type-check`
2. Run linter: `npm run lint`
3. Check for missing dependencies
4. Review build logs for specific errors

## 🐛 Debugging Tips

### Enable Debug Logging

```bash
# Node.js API
DEBUG=* npm run dev

# Next.js
NODE_OPTIONS='--inspect' npm run dev
```

### Check Logs

```bash
# Application logs
tail -f apps/logs/combined.log

# Error logs
tail -f apps/logs/error.log
```

## 📚 Additional Resources

- [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)
- [Prisma Troubleshooting](https://www.prisma.io/docs/guides/troubleshooting)
- [Docker Troubleshooting](https://docs.docker.com/config/troubleshooting/)

## 💬 Getting Help

If you can't resolve an issue:
1. Check existing GitHub issues
2. Search documentation
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant logs

---

**Last Updated:** [Date]

