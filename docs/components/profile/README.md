# Profile Area Overview

Concise reference for the RoleReady profile experience. Use this file as the single source of truth for maintainers; all superseded docs have been removed.

---

## Feature Highlights

- All profile tabs (Profile, Professional, Skills, Preferences, Security, Billing, Support) share a common layout and pull data from `ProfileContext`.
- Billing now supports **Monthly** and **Annual** plans with a **20 % discount** automatically applied to annual pricing. The UI exposes a frequency toggle and shows monthly equivalents when annual billing is active.
- Security tooling covers password updates, TOTP-based 2FA, and session management. Billing and security events write to the shared audit logger via `logger`.

---

## Data & API Notes

- Primary source: `GET /api/users/profile` and `PUT /api/users/profile`.
- Media uploads hit `POST /api/users/profile/picture`; calls rely on browser `fetch` with `credentials: 'include'`.
- Billing plans are currently mocked in `BillingTab.tsx`; once the billing service is available, swap the mock loader with `apiService` calls and map plan metadata (id, monthlyPrice, features).

---

## Key Frontend Modules

- `apps/web/src/components/Profile.tsx` – shell that renders tab content and handles sanitation before persistence.
- `apps/web/src/components/profile/tabs/BillingTab.tsx` – pricing cards, monthly/annual toggle, 20 % savings logic.
- `apps/web/src/contexts/ProfileContext.tsx` – fetches profile data and exposes update helpers; remember to call `refreshProfile()` after PUT requests.

---

## Testing

- Automated coverage: Playwright E2E specs will live under `apps/web/e2e/profile.spec.ts` (added in the same change-set). They validate profile load, edit/save, and billing toggle behaviour.
- Manual checklist & environment setup live in `TESTING_GUIDE.md`.

---

## Maintenance Checklist

- When adding new tabs or API fields, update `UserData` types and extend sanitisation helpers in `Profile.tsx`.
- Keep billing feature copy in sync with pricing page designs; highlight discounts only when parity exists across marketing and product.
- Leave critical bug documentation in `docs/critical_bug_fixes/` untouched—add new cases there if profile regressions appear.

---

**Last updated:** November 2025
