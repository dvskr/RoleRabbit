# Database Connection Guide

## 🚀 Quick Connect

**Prisma Studio (Easiest):**
```bash
cd apps/api
npx prisma studio
```
Opens `http://localhost:5555` - Click "Session" to view sessions

**Or use script:**
```powershell
.\connect-supabase.ps1
```

---

## 📊 Check Sessions

### View Active Sessions:
```sql
SELECT * FROM roleready.sessions WHERE "isActive" = true;
```

### Sessions with User Info:
```sql
SELECT 
  u.email,
  s."isActive",
  s."lastActivity",
  s."expiresAt"
FROM roleready.sessions s
JOIN roleready.users u ON s."userId" = u.id
WHERE s."isActive" = true
ORDER BY s."lastActivity" DESC;
```

---

## 🔗 Connection Methods

### Supabase (Current):
```bash
.\connect-supabase.ps1
```

### Docker:
```bash
docker exec -it roleready-postgres psql -U roleready -d roleready_db
```

### Direct:
```bash
psql "postgresql://postgres:6174%40Kakashi@db.oawxoirhnnvcomopxcdd.supabase.co:5432/postgres?schema=roleready"
```

---

**See:** `docs/components/profile/` for feature-specific guides

