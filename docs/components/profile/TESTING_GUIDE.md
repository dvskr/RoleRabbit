# Profile Testing Guide

Short checklist for verifying the profile experience. Use Playwright for automated coverage and fall back to these manual steps when debugging.

---

## 1. Environment

```bash
# backend
cd apps/api
npm install
npx prisma migrate dev
npm run dev

# frontend
cd apps/web
npm install
npm run dev
```

Variables:

```
apps/api/.env       → DATABASE_URL, JWT_SECRET, PORT=3001
apps/web/.env.local → NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 2. Automated Suite

After adding `apps/web/e2e/profile.spec.ts`, run:

```bash
cd apps/web
npx playwright test profile
```

The spec covers:
- Auth bootstrap via API helpers
- Profile tab read/write flow (name + bio) with save + refresh verification
- Billing toggle (Monthly ↔ Annual) including the 20 % savings check

---

## 3. Manual Smoke

1. Login as a seeded user and open `/dashboard?tab=profile`.
2. Edit display name and bio, save, refresh → data persists.
3. Switch to Billing, pick Annual → totals drop by 20 % and monthly equivalent copy appears.
4. Switch back to Monthly → original pricing restored.
5. Security tab → run through password change flow (use mock backend response if auth not wired locally).

---

## 4. Troubleshooting

- **Profile blank?** Check `ProfileContext` network call for 401/500 responses.
- **Billing math off?** Verify `getPlanPrice` and `getAnnualMonthlyEquivalent` helpers in `BillingTab.tsx`.
- **Avatar upload stuck?** Ensure requests hit `/api/users/profile/picture` with `FormData` and inspect API logs.

---

**Last updated:** November 2025

