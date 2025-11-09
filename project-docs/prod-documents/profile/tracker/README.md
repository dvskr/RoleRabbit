ROLERABBIT TAB COMPLETION PROTOCOL



TAB TO COMPLETE: Profile



========================================

PHASE 1: CONNECT & ANALYZE

========================================



STEP 1: BROWSER CONNECTION

- Start dev server if not running: npm run dev

- Open browser to: http://localhost:3000/dashboard

- Navigate to the Profile tab

- Keep browser open throughout this entire process

- Note: If browser automation isn't available, I'll test manually and report findings



STEP 2: COMPLETE UI ANALYSIS

Document everything you see in: docs/analysis/[tab-name]/



A. MAP THE ENTIRE UI:

   - Every button, link, icon (name + location + expected action)

   - Every input field (type, validation, required/optional)

   - Every modal, dropdown, tooltip

   - Every section, card, table, list

   - Loading states, empty states, error states

   - Navigation elements

   - Visual components (cards, charts, tables, lists)



B. MAP USER WORKFLOWS:

   - Primary flows (what users MUST be able to do)

   - Secondary flows (nice-to-have features)

   - For each flow document:

     * Entry point (where it starts)

     * Every step the user takes

     * Expected outcome

     * Current status (working/broken/partial/missing)

   - Edge cases for each flow

   - Error scenarios for each flow



C. ANALYZE FUNCTIONALITY:

   - List every feature this tab should have

   - Check what's actually implemented

   - Identify what's using mock data

   - Note console errors/warnings

   - Check network tab for API calls (actual vs expected)

   - Check what data is stored/retrieved from database

   - Verify authentication/authorization on features



STEP 3: CODE AUDIT

Examine the codebase:

   - Main component file location and size (lines of code)

   - All sub-components used

   - State management (useState, useContext, etc.)

   - Props being passed

   - Hooks being used

   - API endpoints being called (document each one)

   - Backend routes and controllers

   - Database tables/models involved

   - Database schema (tables, columns, relationships)

   - Missing indexes that should exist

   - Mock data locations (mark ALL for removal)

   - TODO comments (list all)

   - console.log statements (list all)

   - Commented-out code (list all)

   - Type definitions (interfaces, types)

   - Utility functions used

   - External dependencies/libraries



STEP 4: GAP ANALYSIS

Create: docs/analysis/[tab-name]/gaps-and-checklist.md



Identify:

   ✅ WORKING: Features that work 100% (list each with file location)

   ⚠️  PARTIAL: Features with UI but broken/mock backend (list specifics)

   ❌ BROKEN: Features completely non-functional (list what's wrong)

   📝 MISSING: Features that should exist but don't (list requirements)



For each gap, document:

   - What's wrong (specific description)

   - Where in the code (file path + line numbers)

   - What needs to be fixed (detailed action items)

   - Priority (🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low)

   - Estimated time to fix

   - Dependencies (what else needs to be fixed first)



Specific gap categories to check:

   FRONTEND GAPS:

   - Missing UI components

   - Broken event handlers

   - Missing loading states

   - Missing error handling

   - Missing form validation

   

   BACKEND GAPS:

   - Missing API endpoints

   - Incomplete controllers

   - Missing database operations

   - Missing authentication checks

   - Missing authorization checks

   - Missing input validation

   

   DATABASE GAPS:

   - Missing tables

   - Missing columns

   - Missing indexes

   - Missing foreign keys

   - Schema inconsistencies

   

   SECURITY GAPS:

   - Endpoints without authentication

   - Missing ownership checks

   - SQL injection vulnerabilities

   - XSS vulnerabilities

   - Missing rate limiting



STEP 5: CREATE IMPLEMENTATION CHECKLIST

In the same gaps-and-checklist.md file, create:



CHECKLIST TO 100% PRODUCTION READY:



🔴 CRITICAL (Blocks production - fix first):

- [ ] [Specific task] - File: [path:line] - Issue: [description] - ETA: [time]

- [ ] [Next critical task]

...



🟠 HIGH PRIORITY (Major features broken):

- [ ] [Specific task] - File: [path:line] - Issue: [description] - ETA: [time]

- [ ] [Next high task]

...



🟡 MEDIUM PRIORITY (Partial functionality):

- [ ] [Specific task] - File: [path:line] - Issue: [description] - ETA: [time]

- [ ] [Next medium task]

...



🟢 LOW PRIORITY (Nice to have):

- [ ] [Specific task] - File: [path:line] - Issue: [description] - ETA: [time]

- [ ] [Next low task]

...



========================================

PHASE 2: TEST & FIX EVERYTHING

========================================



NOW, WITH BROWSER STILL OPEN:



STEP 6: SYSTEMATIC USER TESTING

For EVERY interactive element (buttons, forms, features):



1. ACT AS USER:

   - Click the button/submit the form

   - Use REAL sample data (not mock):

     * Real names, emails, phone numbers

     * Real file uploads (PDFs, images)

     * Real text content

     * Real dates and times

   - Try to complete the workflow from start to finish

   - Check if data appears in database (query PostgreSQL)

   - Check network tab for API calls

   - Check console for errors



2. IF IT WORKS:

   - ✅ Mark as working

   - Document in: docs/testing/[tab-name]/test-results.md

     * What was tested

     * Sample data used

     * Result (success)

     * Any observations

   - Move to next element



3. IF IT BREAKS OR USES MOCK DATA:

   - 🔧 IMMEDIATELY FIX IT:

     

     FRONTEND FIXES:

     * Connect button to actual function (add onClick handler)

     * Implement the handler function

     * Add form validation

     * Add loading state (useState + spinner)

     * Add error handling (try-catch + error message display)

     * Add success feedback (notification/toast)

     * Replace mock data with API call

     

     BACKEND FIXES:

     * If endpoint missing: Create route in apps/api/src/routes/

     * Create controller function in apps/api/src/controllers/

     * Add authentication middleware

     * Add authorization checks (user can only access their data)

     * Add input validation (validate request body/params)

     * Implement database operations (INSERT/UPDATE/DELETE/SELECT)

     * Add error handling (try-catch + proper error responses)

     * Return correct status codes (200, 201, 400, 401, 403, 404, 500)

     

     DATABASE FIXES:

     * If table missing: Create migration file

     * If column missing: Add to schema

     * If index missing: Add index for performance

     * Run migration: npm run migrate (or equivalent)

     * Verify schema in PostgreSQL

     

   - ✅ TEST THE FIX:

     * Test with valid data → should work

     * Test with invalid data → should show error

     * Test with missing auth → should reject (401)

     * Test with wrong user → should reject (403)

     * Check database → data should persist correctly

     * Check console → no errors

     

   - ✅ VERIFY END-TO-END:

     * Complete workflow works from start to finish

     * Data flows correctly: UI → API → Database → Response → UI

     * User sees appropriate feedback at each step

     

   - 📝 DOCUMENT THE FIX:

     * What was broken

     * Root cause

     * What you fixed (files changed)

     * How you tested it

     

   - Move to next element



4. REPEAT for every single feature until ALL work perfectly



STEP 7: IMPLEMENT MISSING FEATURES

Check your checklist from Step 5:

- Work through checklist in priority order (🔴 → 🟠 → 🟡 → 🟢)

- For each unchecked item:

  

  FULL IMPLEMENTATION:

  * Design the feature (if needed)

  * Implement frontend UI

  * Implement frontend logic

  * Create backend API endpoint

  * Implement backend logic

  * Set up database operations

  * Add authentication/authorization

  * Add validation (frontend + backend)

  * Add error handling

  * Add loading states

  * Test with real data

  * Test edge cases

  * Test error scenarios

  * Verify it works end-to-end

  * Check it off ✅

  * Update documentation



========================================

PHASE 3: FINAL VERIFICATION

========================================



STEP 8: COMPLETE PRODUCTION READINESS CHECKLIST

Verify ALL of these in browser:



✅ FUNCTIONALITY CHECKS:

- [ ] Every button performs its intended action

- [ ] Every form submits successfully with valid data

- [ ] Every form shows validation errors with invalid data

- [ ] All data saves to PostgreSQL database correctly

- [ ] All data loads from database correctly

- [ ] All data displays correctly in UI

- [ ] No mock data remains ANYWHERE in the codebase

- [ ] All API endpoints exist and work

- [ ] All user workflows complete successfully from start to finish

- [ ] Search/filter/sort functions work (if applicable)

- [ ] Pagination works (if applicable)

- [ ] File upload/download works (if applicable)

- [ ] Real-time updates work (if applicable)



✅ ERROR HANDLING CHECKS:

- [ ] Network failures show user-friendly error messages

- [ ] API errors show appropriate messages (not raw errors)

- [ ] Invalid inputs show clear validation errors

- [ ] 404 errors handled gracefully

- [ ] 500 errors handled gracefully

- [ ] Unauthorized access (401) shows login prompt

- [ ] Forbidden access (403) shows appropriate message

- [ ] Loading states appear during ALL async operations

- [ ] Success messages/notifications appear after successful actions

- [ ] Error messages are helpful (tell user what to do)

- [ ] No silent failures (everything has feedback)



✅ CODE QUALITY CHECKS:

- [ ] No console.log statements anywhere

- [ ] No console.error unless intentional logging

- [ ] No console warnings in browser

- [ ] No TODO comments remain

- [ ] No FIXME comments remain

- [ ] No commented-out code blocks

- [ ] No hardcoded values (all use .env or constants)

- [ ] No mock data or mock services

- [ ] All TypeScript types are correct (no 'any' types)

- [ ] No unused imports

- [ ] No unused variables

- [ ] No unused functions

- [ ] Consistent code formatting

- [ ] Meaningful variable/function names

- [ ] Functions are small and focused

- [ ] Components are modular and reusable



✅ UI/UX CHECKS:

- [ ] Responsive on desktop (1920x1080, 1366x768)

- [ ] Responsive on tablet (768x1024)

- [ ] Responsive on mobile (375x667, 414x896)

- [ ] All text is readable (contrast, size)

- [ ] All buttons are clickable (size, spacing)

- [ ] All forms are usable on mobile

- [ ] Empty states display correctly (helpful message + CTA)

- [ ] Loading states display correctly (spinners/skeletons)

- [ ] Error states display correctly (icon + message)

- [ ] Success states display correctly (checkmark + message)

- [ ] Hover states work on interactive elements

- [ ] Focus states visible for keyboard navigation

- [ ] Transitions/animations smooth (not janky)

- [ ] No content overflow (horizontal scroll)

- [ ] Images/icons load correctly

- [ ] Tooltips appear when needed



✅ SECURITY CHECKS:

- [ ] All API routes require authentication (JWT token)

- [ ] JWT tokens validated on every request

- [ ] Invalid/expired tokens rejected (401)

- [ ] Users can only access their own data

- [ ] Admin-only routes check for admin role

- [ ] User IDs come from JWT, not request body

- [ ] SQL injection prevented (parameterized queries)

- [ ] XSS prevented (input sanitization + React escaping)

- [ ] CSRF protection enabled (if using cookies)

- [ ] Input validation on frontend (immediate feedback)

- [ ] Input validation on backend (security)

- [ ] File upload restrictions (type, size)

- [ ] Rate limiting on API endpoints

- [ ] No sensitive data in console

- [ ] No sensitive data in network responses

- [ ] No API keys in frontend code

- [ ] HTTPS enforced in production (check config)

- [ ] CORS configured correctly



✅ PERFORMANCE CHECKS:

- [ ] Page loads in < 3 seconds (desktop)

- [ ] Page loads in < 5 seconds (mobile)

- [ ] API responses in < 1 second (average)

- [ ] No unnecessary re-renders (check React DevTools)

- [ ] Images optimized (compressed, correct format)

- [ ] Large lists virtualized (if > 100 items)

- [ ] Database queries optimized (use indexes)

- [ ] No N+1 query problems

- [ ] Bundle size reasonable (check build output)

- [ ] Code splitting implemented (if needed)

- [ ] Lazy loading implemented (if needed)

- [ ] No memory leaks (check in DevTools)



✅ DATABASE CHECKS:

- [ ] All required tables exist

- [ ] All required columns exist

- [ ] Column types are correct

- [ ] Foreign keys set up correctly

- [ ] Indexes on frequently queried columns

- [ ] Indexes on foreign keys

- [ ] No duplicate data

- [ ] Data normalized appropriately

- [ ] Constraints enforced (NOT NULL, UNIQUE, etc.)

- [ ] Default values set where appropriate

- [ ] Timestamps (created_at, updated_at) on all tables

- [ ] Soft delete columns (deleted_at) if needed

- [ ] Database migrations run successfully

- [ ] Can rollback migrations if needed



✅ API CHECKS:

- [ ] All endpoints follow REST conventions

- [ ] Consistent response format { success, data/error }

- [ ] Correct HTTP methods (GET, POST, PUT, DELETE)

- [ ] Correct status codes (200, 201, 400, 401, 403, 404, 500)

- [ ] Error responses include helpful messages

- [ ] Pagination implemented for list endpoints

- [ ] Filtering implemented where needed

- [ ] Sorting implemented where needed

- [ ] API documentation exists (or clear code comments)

- [ ] All endpoints tested with Postman/curl

- [ ] All endpoints handle edge cases



✅ TESTING CHECKS:

- [ ] Tested happy path (everything works)

- [ ] Tested with empty data (no crashes)

- [ ] Tested with maximum data (performance ok)

- [ ] Tested with special characters in inputs

- [ ] Tested with very long inputs

- [ ] Tested with very short inputs

- [ ] Tested with duplicate submissions

- [ ] Tested with concurrent requests

- [ ] Tested with slow network (throttle in DevTools)

- [ ] Tested with no network (offline mode)

- [ ] Tested with different user roles

- [ ] Tested with logged out user

- [ ] Tested on Chrome

- [ ] Tested on Firefox

- [ ] Tested on Safari

- [ ] Tested on mobile devices (real or emulated)



========================================

STEP 9: CROSS-FEATURE INTEGRATION

========================================



Test how this tab integrates with other tabs:



INTEGRATION TESTS:

- [ ] Data created in this tab appears in other relevant tabs

- [ ] Data updated in this tab updates in other relevant tabs

- [ ] Data deleted in this tab is removed from other relevant tabs

- [ ] Navigation between tabs works smoothly

- [ ] Shared data models are consistent across tabs

- [ ] User session persists across tab switches

- [ ] No conflicts when using multiple tabs



Examples to test:

- Create resume in Resume Builder → See it in Cloud Storage

- Upload file in Cloud Storage → Use it in Cover Letter

- Update profile → See changes reflected in Dashboard

- Add job to tracker → See it in Dashboard stats

- etc.



========================================

DOCUMENTATION REQUIREMENTS

========================================



Store all docs in: docs/[tab-name]/



CREATE THESE FILES (with actual content, not placeholders):



1. **analysis.md** - What you found in Phase 1:

   - UI component inventory (complete list)

   - User workflow maps (all flows documented)

   - Functionality analysis (what works, what doesn't)

   - Code audit findings (file locations, structure)



2. **gaps-and-checklist.md** - Gaps identified + Implementation checklist:

   - All gaps categorized by type

   - All gaps categorized by priority

   - Complete implementation checklist

   - Dependencies mapped out



3. **test-results.md** - What you tested and results:

   - Every feature tested (with sample data used)

   - Test outcomes (pass/fail)

   - Edge cases tested

   - Error scenarios tested

   - Browser/device testing results



4. **fixes-applied.md** - List of all fixes made:

   - Each bug/issue fixed

   - Root cause of each issue

   - Solution implemented

   - Files changed (with line numbers)

   - How it was tested



5. **final-status.md** - Final production-ready confirmation:

   - All checklists completed

   - Final test results (100% pass rate)

   - Known limitations (if any)

   - Future enhancements (if any)

   - Sign-off that tab is production-ready



========================================

COMPLETION CRITERIA

========================================



This tab is 100% PRODUCTION READY when:



✅ ANALYSIS:

- [ ] Complete UI analysis documented

- [ ] All user workflows mapped

- [ ] All functionality analyzed

- [ ] Complete code audit done

- [ ] All gaps identified and documented



✅ IMPLEMENTATION:

- [ ] Every feature works with real data (no mocks)

- [ ] Every API endpoint implemented and working

- [ ] Every database operation working

- [ ] All user workflows tested and working

- [ ] All gaps from checklist addressed



✅ QUALITY:

- [ ] All console errors gone

- [ ] All console warnings gone

- [ ] No TODO/FIXME comments

- [ ] No console.log statements

- [ ] No commented-out code

- [ ] TypeScript types correct everywhere

- [ ] Code is clean and maintainable



✅ FUNCTIONALITY:

- [ ] Every button works correctly

- [ ] Every form works correctly

- [ ] All CRUD operations work

- [ ] All validations work

- [ ] All error handling works

- [ ] All loading states work



✅ UI/UX:

- [ ] Mobile responsive (tested)

- [ ] Empty states correct

- [ ] Loading states correct

- [ ] Error states correct

- [ ] User feedback on all actions



✅ SECURITY:

- [ ] Authentication on all routes

- [ ] Authorization checks in place

- [ ] Input validation (frontend + backend)

- [ ] No security vulnerabilities

- [ ] Users can only access their data



✅ PERFORMANCE:

- [ ] Page loads fast (< 3 seconds)

- [ ] API responses fast (< 1 second)

- [ ] No memory leaks

- [ ] Database queries optimized



✅ TESTING:

- [ ] All features tested manually

- [ ] All edge cases tested

- [ ] All error scenarios tested

- [ ] Cross-browser tested

- [ ] Mobile device tested

- [ ] Integration tested



✅ DOCUMENTATION:

- [ ] All required docs created

- [ ] All docs have actual content

- [ ] All checklists completed

- [ ] All fixes documented



✅ FINAL VERIFICATION:

- [ ] Every single checkbox in this document is checked

- [ ] Can deploy to production with confidence

- [ ] No known bugs or issues

- [ ] Tab is feature-complete



========================================

IMPORTANT NOTES

========================================



CRITICAL REMINDERS:

- All .env variables are configured - NO PLACEHOLDERS

- Use real OpenAI API, real Supabase, real PostgreSQL database

- Test with REAL sample data (upload real files, enter real text)

- Fix issues AS YOU FIND THEM - don't just document and move on

- Update docs as you go - not at the end

- Commit frequently: git commit -m "fix([tab]): description"

- Test every fix before moving to next issue

- Don't skip any checklist items

- Don't mark something as done unless it's 100% working

- If stuck on something, explain the blocker clearly



WORKFLOW PRINCIPLES:

1. Analyze first, fix later (don't fix blindly)

2. Fix critical issues before low priority

3. Test everything with real data

4. Document as you go

5. Commit after each working fix

6. Verify end-to-end before moving on

7. Don't assume anything works - test it



SUCCESS METRICS:

- 0 console errors

- 0 console warnings

- 0 TODO comments

- 0 mock data

- 100% test pass rate

- 100% checklist completion

- 100% user confidence



========================================

NOW BEGIN

========================================



Start with Phase 1, Step 1. Work through systematically.



PROGRESS REPORTING:

- Report completion after Phase 1 (Analysis)

- Report completion after Phase 2 (Implementation)

- Report completion after Phase 3 (Verification)

- Report when tab is 100% production-ready



FINAL DELIVERABLE:

When complete, provide:

1. Summary of what was fixed

2. Summary of what was implemented

3. Link to all documentation

4. Confirmation all checklists complete

5. Statement: "Profile is 100% production-ready ✅"



GO. Start now.

