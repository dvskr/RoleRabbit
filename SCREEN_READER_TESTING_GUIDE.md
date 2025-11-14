# Screen Reader Testing Guide - Templates Feature

## Overview

This guide provides comprehensive instructions for manual screen reader testing of the RoleRabbit Templates feature. Screen reader testing ensures the application is accessible to blind and visually impaired users.

---

## Screen Reader Tools

### NVDA (Windows - Free)
**Download:** https://www.nvaccess.org/download/

**Key Commands:**
- `NVDA + Space` - Toggle browse/focus mode
- `NVDA + T` - Read page title
- `NVDA + Down Arrow` - Read next item
- `NVDA + Up Arrow` - Read previous item
- `H` - Next heading
- `Shift + H` - Previous heading
- `B` - Next button
- `K` - Next link
- `F` - Next form field
- `L` - Next list
- `T` - Next table
- `D` - Next landmark
- `NVDA + F7` - Elements list

### JAWS (Windows - Paid)
**Download:** https://www.freedomscientific.com/products/software/jaws/

**Key Commands:**
- `Insert + F3` - Elements list
- `Insert + F5` - Form fields list
- `Insert + F6` - Headings list
- `Insert + F7` - Links list
- `H` - Next heading
- `B` - Next button
- `F` - Next form field
- `R` - Next region/landmark
- `T` - Next table

### VoiceOver (macOS - Built-in)
**Enable:** Cmd + F5

**Key Commands:**
- `VO` = Ctrl + Option
- `VO + A` - Read from current position
- `VO + Right/Left Arrow` - Navigate items
- `VO + U` - Rotor (elements list)
- `VO + H` - Next heading
- `VO + J` - Next form control
- `VO + Command + H` - Headings menu
- `VO + Shift + M` - Menu bar

### TalkBack (Android - Built-in)
**Enable:** Settings > Accessibility > TalkBack

**Key Gestures:**
- Swipe right - Next item
- Swipe left - Previous item
- Double-tap - Activate
- Swipe down then right - Read from top
- Two-finger swipe up - Scroll up
- Two-finger swipe down - Scroll down

### VoiceOver iOS (iPhone/iPad - Built-in)
**Enable:** Settings > Accessibility > VoiceOver

**Key Gestures:**
- Swipe right - Next item
- Swipe left - Previous item
- Double-tap - Activate
- Three-finger swipe - Scroll
- Rotor - Rotate two fingers to change navigation mode

---

## Testing Checklist

### Page Load

- [ ] Page title is announced
- [ ] Main heading (h1) is announced
- [ ] Main landmark is identified
- [ ] Number of templates is announced
- [ ] Loading state is announced if present

**Expected Announcements:**
```
"Templates - RoleRabbit"
"Heading level 1: Browse Resume Templates"
"Main region"
"Showing 12 of 44 templates"
```

### Navigation Structure

- [ ] Logical heading hierarchy (h1 -> h2 -> h3, no skipping)
- [ ] All landmarks are identified (main, navigation, search, complementary)
- [ ] Skip links are available and functional
- [ ] Breadcrumbs are announced (if present)

**Test:**
1. Press `H` repeatedly to navigate through headings
2. Verify heading levels don't skip (e.g., h1 -> h3)
3. Press `D` to navigate landmarks
4. Verify each landmark has appropriate role and label

**Expected Heading Hierarchy:**
```
H1: Browse Resume Templates
  H2: Filters
    H3: Category
    H3: Difficulty
    H3: Layout
  H2: Results
    H3: Template Name (for each template)
```

### Template Cards

- [ ] Each template card is identified as a group or article
- [ ] Template name is announced
- [ ] Template category is announced
- [ ] Template difficulty is announced
- [ ] Preview button is identified and labeled
- [ ] Favorite button is identified with state (favorited/not favorited)
- [ ] All interactive elements are keyboard accessible

**Test:**
1. Navigate to template grid
2. Use arrow keys to move between cards
3. Each card should announce all important information
4. Buttons should be clearly labeled with purpose

**Expected Announcements:**
```
"Article: Professional ATS Resume"
"Button: Preview Professional ATS Resume"
"Button: Add to favorites, not favorited"
"Category: ATS"
"Difficulty: Beginner"
"Rating: 4.5 out of 5 stars"
```

### Filters

- [ ] Filter sidebar is identified as navigation or complementary landmark
- [ ] Filter section headings are announced
- [ ] Each filter option is labeled
- [ ] Filter state (selected/not selected) is announced
- [ ] Number of results updates are announced

**Test:**
1. Navigate to filter sidebar
2. Tab through filter options
3. Activate a filter
4. Verify state change is announced
5. Verify results update is announced

**Expected Announcements:**
```
"Navigation region: Filters"
"Checkbox: ATS, not checked"
[After selection]
"Checkbox: ATS, checked"
"Showing 24 templates"
```

### Search

- [ ] Search input is labeled
- [ ] Search purpose is clear from label or description
- [ ] Autocomplete/suggestions are announced (if present)
- [ ] Search results are announced
- [ ] "No results" message is announced if applicable

**Test:**
1. Focus search input
2. Type search query
3. Verify results update is announced
4. Verify suggestion dropdown is announced (if present)

**Expected Announcements:**
```
"Search templates, edit text"
[After typing]
"6 suggestions available"
[After search]
"Showing 8 results for 'professional'"
```

### Sort and View Mode

- [ ] Sort dropdown is labeled
- [ ] Current sort order is announced
- [ ] View mode toggle is labeled with current state
- [ ] Mode changes are announced

**Test:**
1. Navigate to sort dropdown
2. Change sort order
3. Verify new sort order is announced
4. Toggle view mode
5. Verify mode change is announced

**Expected Announcements:**
```
"Sort by, combo box, Popular"
[After change]
"Sort order changed to Newest"
"View mode: Grid, button, pressed"
[After toggle]
"View mode changed to List"
```

### Pagination

- [ ] Pagination controls are in a navigation landmark
- [ ] Current page is announced
- [ ] Total pages is announced
- [ ] Next/Previous buttons are labeled
- [ ] Disabled state is announced for unavailable navigation

**Test:**
1. Navigate to pagination
2. Verify current page is announced
3. Navigate to next page
4. Verify page change is announced

**Expected Announcements:**
```
"Navigation region: Pagination"
"Page 1 of 4"
"Button: Next page"
[After navigation]
"Now on page 2 of 4"
```

### Modal/Preview

- [ ] Modal opening is announced
- [ ] Modal title is announced
- [ ] Focus moves to modal
- [ ] Close button is labeled
- [ ] Escape key closes modal
- [ ] Focus returns to trigger after close

**Test:**
1. Activate preview button
2. Verify modal announcement
3. Verify focus is trapped in modal
4. Tab through modal elements
5. Press Escape to close
6. Verify focus returns to preview button

**Expected Announcements:**
```
"Dialog: Professional ATS Resume Preview"
"Template preview details"
"Heading level 2: Professional ATS Resume"
"Button: Close dialog"
[After close]
"Button: Preview Professional ATS Resume"
```

### Favorites

- [ ] Favorite button state is announced
- [ ] State change is announced after toggle
- [ ] Confirmation message is announced (if shown)
- [ ] Favorites count is updated and announced

**Test:**
1. Navigate to favorite button
2. Verify current state is announced
3. Activate button
4. Verify state change is announced
5. Verify success message (if any)

**Expected Announcements:**
```
"Button: Add to favorites, not favorited"
[After activation]
"Button: Remove from favorites, favorited"
"Template added to favorites"
```

### Error States

- [ ] Error messages are announced immediately
- [ ] Error messages are associated with relevant fields
- [ ] Error icon has appropriate alt text or aria-label
- [ ] Retry options are clearly labeled

**Test:**
1. Trigger an error (disconnect network)
2. Verify error message is announced
3. Verify error is announced with aria-live region
4. Verify retry button is available and labeled

**Expected Announcements:**
```
"Alert: Failed to load templates"
"Error: Network connection lost"
"Button: Try again"
```

### Loading States

- [ ] Loading state is announced
- [ ] Loading progress is updated if applicable
- [ ] Completion is announced
- [ ] Loading indicators have appropriate labels

**Test:**
1. Trigger a loading state
2. Verify announcement of loading
3. Verify announcement when complete

**Expected Announcements:**
```
"Loading templates"
[After completion]
"Templates loaded, showing 12 items"
```

---

## Common Issues and Fixes

### Issue: Buttons not announced
**Fix:** Add `aria-label` or ensure visible text
```tsx
// ❌ Bad
<button><IconHeart /></button>

// ✅ Good
<button aria-label="Add to favorites"><IconHeart /></button>
```

### Issue: State changes not announced
**Fix:** Use `aria-live` region
```tsx
// ✅ Good
<div aria-live="polite" aria-atomic="true">
  Showing {count} templates
</div>
```

### Issue: Complex widgets not understood
**Fix:** Use appropriate ARIA roles
```tsx
// ✅ Good
<div role="radiogroup" aria-labelledby="difficulty-label">
  <span id="difficulty-label">Difficulty</span>
  <button role="radio" aria-checked="false">Beginner</button>
  <button role="radio" aria-checked="true">Intermediate</button>
</div>
```

### Issue: Images without alt text
**Fix:** Add descriptive alt text
```tsx
// ❌ Bad
<img src="template.png" />

// ✅ Good
<img src="template.png" alt="Professional ATS resume template preview" />

// ✅ Good for decorative
<img src="decoration.png" alt="" role="presentation" />
```

### Issue: Form inputs without labels
**Fix:** Associate labels
```tsx
// ❌ Bad
<input type="text" placeholder="Search" />

// ✅ Good
<label htmlFor="search">Search templates</label>
<input id="search" type="text" placeholder="Search" />

// ✅ Good with aria-label
<input type="text" aria-label="Search templates" placeholder="Search" />
```

---

## Testing Scenarios

### Scenario 1: Browse Templates
1. Navigate to /templates
2. Verify page title and heading
3. Navigate through template cards
4. Verify all metadata is announced
5. Activate preview on first template
6. Navigate through preview modal
7. Close modal and verify focus returns

### Scenario 2: Filter and Search
1. Navigate to filter sidebar
2. Apply category filter
3. Verify results update announcement
4. Navigate to search
5. Enter search term
6. Verify search results announcement
7. Clear filters
8. Verify all templates shown

### Scenario 3: Manage Favorites
1. Navigate to first template
2. Activate favorite button
3. Verify state change announcement
4. Navigate to favorites filter
5. Activate favorites filter
6. Verify only favorited templates shown
7. Remove from favorites
8. Verify update announcement

### Scenario 4: Pagination
1. Navigate through first page of templates
2. Go to pagination controls
3. Navigate to page 2
4. Verify page change announcement
5. Verify new templates announced
6. Return to page 1

### Scenario 5: Error Recovery
1. Disconnect network
2. Reload page
3. Verify error announcement
4. Activate retry button
5. Reconnect network
6. Verify success announcement

---

## Reporting Issues

When reporting screen reader issues, include:

1. **Screen Reader:** NVDA 2023.1, JAWS 2024, VoiceOver macOS 13, etc.
2. **Browser:** Chrome 120, Firefox 121, Safari 17, etc.
3. **OS:** Windows 11, macOS 14, etc.
4. **Location:** Specific page/component
5. **Expected:** What should be announced
6. **Actual:** What is actually announced
7. **Steps:** How to reproduce
8. **Severity:** Critical, High, Medium, Low

**Example:**
```
Screen Reader: NVDA 2023.1
Browser: Chrome 120
OS: Windows 11
Location: Templates page - Filter sidebar
Expected: "Checkbox: ATS, checked" after selection
Actual: No announcement of state change
Steps:
  1. Navigate to filters
  2. Press Space on ATS checkbox
  3. No announcement
Severity: High - Users can't determine filter state
```

---

## Resources

### Screen Reader Documentation
- **NVDA:** https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- **JAWS:** https://www.freedomscientific.com/training/jaws/
- **VoiceOver:** https://www.apple.com/voiceover/info/guide/

### Accessibility Standards
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices:** https://www.w3.org/WAI/ARIA/apg/

### Testing Tools
- **Accessibility Insights:** https://accessibilityinsights.io/
- **axe DevTools:** https://www.deque.com/axe/devtools/

---

**Last Updated:** November 14, 2025
**Maintained By:** Accessibility Team
