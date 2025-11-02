# Testing Roadmap – Phase 2 (Visual, Cross-Browser, Performance)

This phase augments the storage module test matrix with visual regression, cross-browser, and performance tooling.

## What’s Included

- **Visual regression**: Playwright screenshot assertions under `apps/web/e2e/storage.visual.spec.ts`
- **Cross-browser smoke**: Multi-project Playwright check (`storage.cross-browser.spec.ts`) verifying storage UI mounts across Chromium/Firefox/WebKit + mobile viewports
- **Accessibility a11y check**: Component-level `jest-axe` audit for `StorageHeader`
- **Lighthouse config**: `apps/web/lighthouserc.js` + `npm run test:lighthouse`
- **Test hooks**: New `data-testid`s on storage UI surfaces for deterministic selectors

## How to Run

```bash
cd apps/web
npm install           # pick up jest-axe, lhci, type defs

npm run test          # jest unit/component suite
npm run test:coverage # optional coverage report
npx playwright test   # E2E + visual regression (runs across configured browsers)
npm run test:lighthouse  # Lighthouse CI assertions
```

Visual baselines live under Playwright’s snapshot directory (`e2e/__screenshots__`). Update them with `npx playwright test --update-snapshots` when intentional UI changes occur.

## Next Steps

- Wire Playwright runs into CI (headless, per-browser)
- Publish Lighthouse reports (CI artifact)
- Extend screenshot suite for credentials tab & modals as needed
- Integrate BrowserStack/Sauce if true device coverage is required


