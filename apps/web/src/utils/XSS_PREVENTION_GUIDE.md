# XSS Prevention Guide

## Overview

Cross-Site Scripting (XSS) is a critical security vulnerability where malicious scripts are injected into trusted websites. This guide documents the XSS prevention measures implemented in RoleRabbit and provides best practices for maintaining secure code.

## Table of Contents

- [What is XSS?](#what-is-xss)
- [Attack Vectors](#attack-vectors)
- [Prevention Measures](#prevention-measures)
- [Sanitization Utilities](#sanitization-utilities)
- [Usage Examples](#usage-examples)
- [React Best Practices](#react-best-practices)
- [Testing for XSS](#testing-for-xss)
- [Security Checklist](#security-checklist)

---

## What is XSS?

Cross-Site Scripting (XSS) attacks occur when:

1. **User input** or **external data** contains malicious JavaScript
2. This data is **rendered in the browser** without proper sanitization
3. The malicious script **executes** in the victim's browser

### Example Attack

```tsx
// VULNERABLE CODE (don't do this!)
const userInput = '<script>alert("XSS")</script>';
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
// ❌ Script executes!

// SAFE CODE
import { escapeHtml } from '@/utils/sanitize';
const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
return <div dangerouslySetInnerHTML={{ __html: safe }} />;
// ✅ Displays: &lt;script&gt;alert("XSS")&lt;/script&gt;
```

### Impact

- **Session hijacking** - Steal cookies/tokens
- **Data theft** - Access sensitive information
- **Defacement** - Modify page content
- **Malware distribution** - Redirect to malicious sites
- **Keylogging** - Capture user input

---

## Attack Vectors

### 1. HTML Injection

```tsx
// VULNERABLE
const name = '<img src=x onerror="alert(\'XSS\')">';
const html = `<div>${name}</div>`; // ❌ Script executes

// SAFE
import { escapeHtml } from '@/utils/sanitize';
const name = '<img src=x onerror="alert(\'XSS\')">';
const html = `<div>${escapeHtml(name)}</div>`; // ✅ Safe
```

### 2. Attribute Injection

```tsx
// VULNERABLE
const userTitle = '" onload="alert(\'XSS\')"';
const html = `<img title="${userTitle}" />`; // ❌ Breaks out of attribute

// SAFE
import { sanitizeAttribute } from '@/utils/sanitize';
const userTitle = '" onload="alert(\'XSS\')"';
const html = `<img title="${sanitizeAttribute(userTitle)}" />`; // ✅ Safe
```

### 3. JavaScript Protocol URLs

```tsx
// VULNERABLE
const userLink = 'javascript:alert("XSS")';
return <a href={userLink}>Click</a>; // ❌ Executes on click

// SAFE
import { sanitizeUrl } from '@/utils/sanitize';
const userLink = 'javascript:alert("XSS")';
const safeUrl = sanitizeUrl(userLink); // Returns ''
return <a href={safeUrl || '#'}>Click</a>; // ✅ Safe
```

### 4. Template Injection

```tsx
// VULNERABLE
const template = {
  name: '</title><script>alert("XSS")</script><title>',
};
const html = `<title>${template.name}</title>`; // ❌ Breaks out of title tag

// SAFE
import { sanitizeTemplateField } from '@/utils/sanitize';
const template = {
  name: '</title><script>alert("XSS")</script><title>',
};
const html = `<title>${sanitizeTemplateField(template.name)}</title>`; // ✅ Safe
```

### 5. Markdown XSS

```tsx
// VULNERABLE (old Markdown.tsx)
const markdown = '<script>alert("XSS")</script>';
// Custom parser doesn't escape HTML ❌

// SAFE (new Markdown.tsx)
import { escapeHtml } from '@/utils/sanitize';
const markdown = '<script>alert("XSS")</script>';
const escaped = escapeHtml(markdown); // First escape HTML
// Then apply markdown transformations ✅
```

---

## Prevention Measures

### 1. **React Automatic Escaping** (Default Protection)

React **automatically escapes** values in JSX:

```tsx
// ✅ SAFE - React escapes automatically
const userInput = '<script>alert("XSS")</script>';
return <div>{userInput}</div>;
// Renders: &lt;script&gt;alert("XSS")&lt;/script&gt;
```

**Key Point:** As long as you use JSX `{value}` syntax, you're protected!

### 2. **Avoid dangerouslySetInnerHTML**

```tsx
// ❌ DANGEROUS - No automatic escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - Use JSX instead
<div>{userInput}</div>

// ✅ SAFE - If you must use dangerouslySetInnerHTML, sanitize first
import { sanitizeHtml } from '@/utils/sanitize';
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
```

### 3. **HTML Entity Escaping**

```tsx
import { escapeHtml } from '@/utils/sanitize';

// Escape dangerous characters
const safe = escapeHtml('<script>alert("XSS")</script>');
// Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
```

### 4. **URL Validation**

```tsx
import { sanitizeUrl } from '@/utils/sanitize';

const userUrl = 'javascript:alert("XSS")';
const safeUrl = sanitizeUrl(userUrl); // Returns ''

return <a href={safeUrl || '#'}>Link</a>;
```

### 5. **Content Security Policy (CSP)**

Add CSP headers to prevent inline scripts:

```tsx
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

## Sanitization Utilities

Located in `/utils/sanitize.ts`

### Core Functions

#### `escapeHtml(text: string): string`

Escapes HTML entities. **Use this for plain text insertion.**

```tsx
import { escapeHtml } from '@/utils/sanitize';

const name = '<b>John</b>';
const html = `<div>${escapeHtml(name)}</div>`;
// Result: <div>&lt;b&gt;John&lt;/b&gt;</div>
```

**Escapes:**
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`
- `&` → `&amp;`
- `/` → `&#x2F;`

#### `sanitizeHtml(html: string, options?): string`

Allows safe HTML tags while removing dangerous ones.

```tsx
import { sanitizeHtml } from '@/utils/sanitize';

const userHtml = '<p>Safe</p><script>alert("XSS")</script>';
const safe = sanitizeHtml(userHtml);
// Result: '<p>Safe</p>' (script removed)
```

**Options:**
- `allowedTags` - Array of allowed tags (default: `['p', 'b', 'i', 'a', ...]`)
- `allowedAttributes` - Array of allowed attributes (default: `['href', 'title', ...]`)
- `stripAll` - Remove all HTML tags (default: `false`)

#### `sanitizeTemplateField(value: string, maxLength?: number): string`

**Use this for template metadata** (name, description, etc.)

```tsx
import { sanitizeTemplateField } from '@/utils/sanitize';

const template = {
  name: '<script>alert("XSS")</script>Template Name',
  description: 'A template description with <b>HTML</b>',
};

const safeName = sanitizeTemplateField(template.name, 100);
const safeDesc = sanitizeTemplateField(template.description, 200);

const html = `
  <title>${safeName}</title>
  <meta name="description" content="${safeDesc}">
`;
```

**Features:**
- Escapes HTML entities
- Limits length (prevents DOS)
- Removes control characters
- Trims whitespace

#### `sanitizeUrl(url: string): string`

Validates and sanitizes URLs. Returns empty string if dangerous.

```tsx
import { sanitizeUrl } from '@/utils/sanitize';

sanitizeUrl('https://example.com'); // ✅ Returns: 'https://example.com'
sanitizeUrl('javascript:alert(1)'); // ❌ Returns: ''
sanitizeUrl('data:text/html,<script>alert(1)</script>'); // ❌ Returns: ''
```

**Blocks:**
- `javascript:`
- `data:`
- `vbscript:`
- `file:`
- `about:`

#### `stripHtml(html: string): string`

Removes all HTML tags, leaving only text.

```tsx
import { stripHtml } from '@/utils/sanitize';

const html = '<p>Hello <b>World</b></p>';
const text = stripHtml(html);
// Result: 'Hello World'
```

#### `sanitizeAttribute(value: string): string`

Sanitizes values for HTML attributes.

```tsx
import { sanitizeAttribute } from '@/utils/sanitize';

const userTitle = '" onload="alert(1)"';
const html = `<img title="${sanitizeAttribute(userTitle)}" />`;
// Safe: escapes quotes to prevent attribute breakout
```

#### `containsPotentialXSS(value: string): boolean`

Detects potential XSS patterns.

```tsx
import { containsPotentialXSS } from '@/utils/sanitize';

containsPotentialXSS('<script>alert(1)</script>'); // true
containsPotentialXSS('javascript:alert(1)'); // true
containsPotentialXSS('Hello World'); // false
```

**Detects:**
- `<script>` tags
- `javascript:` URLs
- Event handlers (`onclick=`, `onload=`, etc.)
- `<iframe>`, `<object>`, `<embed>` tags
- `eval()` calls

---

## Usage Examples

### Example 1: Template Download HTML

**Before (Vulnerable):**
```tsx
// ❌ VULNERABLE
export const getTemplateDownloadHTML = (template: any): string => {
  return `
    <title>${template.name}</title>
    <meta name="description" content="${template.description}">
  `;
};
```

**After (Fixed):**
```tsx
// ✅ SAFE
import { sanitizeTemplateField } from '@/utils/sanitize';

export const getTemplateDownloadHTML = (template: any): string => {
  const safeName = sanitizeTemplateField(template.name, 100);
  const safeDescription = sanitizeTemplateField(template.description, 200);

  return `
    <title>${safeName}</title>
    <meta name="description" content="${safeDescription}">
  `;
};
```

### Example 2: Markdown Component

**Before (Vulnerable):**
```tsx
// ❌ VULNERABLE
export function Markdown({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    let html = text; // No escaping!
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: html };
  };

  return <div dangerouslySetInnerHTML={renderMarkdown(content)} />;
}
```

**After (Fixed):**
```tsx
// ✅ SAFE
import { escapeHtml } from '@/utils/sanitize';

export function Markdown({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    let html = escapeHtml(text); // Escape HTML first!
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: html };
  };

  return <div dangerouslySetInnerHTML={renderMarkdown(content)} />;
}
```

### Example 3: User Profile Display

```tsx
import { escapeHtml, sanitizeUrl } from '@/utils/sanitize';

function UserProfile({ user }: { user: any }) {
  const safeName = escapeHtml(user.name);
  const safeBio = escapeHtml(user.bio);
  const safeWebsite = sanitizeUrl(user.website);

  return (
    <div>
      <h1>{user.name}</h1> {/* ✅ React auto-escapes */}
      <p>{user.bio}</p> {/* ✅ React auto-escapes */}

      {safeWebsite && (
        <a href={safeWebsite} target="_blank" rel="noopener noreferrer">
          Website
        </a>
      )}
    </div>
  );
}
```

### Example 4: Template Validation

```tsx
import { sanitizeTemplate, containsPotentialXSS } from '@/utils/sanitize';

function validateTemplate(template: any): boolean {
  // Check for XSS in critical fields
  if (containsPotentialXSS(template.name)) {
    throw new Error('Template name contains potentially malicious content');
  }

  if (containsPotentialXSS(template.description)) {
    throw new Error('Template description contains potentially malicious content');
  }

  return true;
}

function useTemplate(template: any) {
  // Validate
  validateTemplate(template);

  // Sanitize all fields
  const safeTemplate = sanitizeTemplate(template);

  // Now safe to use
  return safeTemplate;
}
```

---

## React Best Practices

### ✅ DO: Use JSX for Dynamic Content

```tsx
// ✅ SAFE - React auto-escapes
const name = '<script>alert("XSS")</script>';
return <div>{name}</div>;
```

### ✅ DO: Sanitize Before dangerouslySetInnerHTML

```tsx
// ✅ SAFE - Sanitized first
import { sanitizeHtml } from '@/utils/sanitize';
const html = sanitizeHtml(userHtml);
return <div dangerouslySetInnerHTML={{ __html: html }} />;
```

### ✅ DO: Validate URLs

```tsx
// ✅ SAFE - URL validated
import { sanitizeUrl } from '@/utils/sanitize';
const url = sanitizeUrl(userUrl);
return <a href={url || '#'}>Link</a>;
```

### ❌ DON'T: Trust User Input

```tsx
// ❌ NEVER TRUST USER INPUT
const userInput = getUserInput();
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
```

### ❌ DON'T: Use eval()

```tsx
// ❌ EXTREMELY DANGEROUS
const code = userInput;
eval(code); // Never do this!
```

### ❌ DON'T: Create Scripts from Strings

```tsx
// ❌ DANGEROUS
const script = document.createElement('script');
script.textContent = userInput; // XSS!
document.body.appendChild(script);
```

---

## Testing for XSS

### Manual Testing

Test with these common XSS payloads:

```tsx
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror="alert(\'XSS\')">',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')">',
  '"><script>alert("XSS")</script>',
  '<svg onload="alert(\'XSS\')">',
  '<body onload="alert(\'XSS\')">',
  '<input onfocus="alert(\'XSS\')" autofocus>',
  'data:text/html,<script>alert("XSS")</script>',
];

// Test each input field with these payloads
xssPayloads.forEach(payload => {
  const result = sanitizeHtml(payload);
  console.log('Input:', payload);
  console.log('Output:', result);
  console.log('Safe:', !result.includes('<script>'));
});
```

### Automated Testing

```tsx
// tests/sanitize.test.ts
import { escapeHtml, sanitizeUrl, containsPotentialXSS } from '@/utils/sanitize';

describe('XSS Prevention', () => {
  test('escapeHtml should escape dangerous characters', () => {
    const input = '<script>alert("XSS")</script>';
    const output = escapeHtml(input);
    expect(output).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(output).not.toContain('<script>');
  });

  test('sanitizeUrl should block javascript: URLs', () => {
    const input = 'javascript:alert("XSS")';
    const output = sanitizeUrl(input);
    expect(output).toBe('');
  });

  test('containsPotentialXSS should detect XSS', () => {
    expect(containsPotentialXSS('<script>alert(1)</script>')).toBe(true);
    expect(containsPotentialXSS('Hello World')).toBe(false);
  });
});
```

---

## Security Checklist

Use this checklist when handling user input or external data:

### Input Validation

- [ ] All user input is validated on the backend
- [ ] Input length is limited (prevent DOS)
- [ ] Special characters are handled properly
- [ ] File uploads are validated (type, size, content)

### Output Encoding

- [ ] HTML entities are escaped when rendering user content
- [ ] URLs are validated before use in `href` or `src`
- [ ] Template fields are sanitized before HTML insertion
- [ ] `dangerouslySetInnerHTML` is avoided or properly sanitized

### React Specific

- [ ] Using JSX `{value}` syntax for dynamic content (auto-escapes)
- [ ] Avoiding `dangerouslySetInnerHTML` when possible
- [ ] Sanitizing HTML before using `dangerouslySetInnerHTML`
- [ ] Not creating elements from strings with user input

### Template Security

- [ ] Template names are sanitized
- [ ] Template descriptions are sanitized
- [ ] Template metadata is validated
- [ ] Downloaded HTML includes sanitized content

### URL Security

- [ ] All URLs are validated with `sanitizeUrl()`
- [ ] `javascript:` protocol is blocked
- [ ] `data:` URLs are blocked (or carefully validated)
- [ ] External links use `rel="noopener noreferrer"`

### General Security

- [ ] Content Security Policy (CSP) is configured
- [ ] HTTPS is enforced
- [ ] Cookies use `httpOnly` and `secure` flags
- [ ] Regular security audits are performed
- [ ] Dependencies are kept up to date

---

## Additional Resources

### Libraries

**For Production Use:**
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- [react-markdown](https://github.com/remarkjs/react-markdown) - Safe markdown rendering
- [rehype-sanitize](https://github.com/rehypejs/rehype-sanitize) - HTML sanitizer for remark/rehype

### Documentation

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP XSS Filter Evasion](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Tools

- [XSS Hunter](https://xsshunter.com/) - Find XSS vulnerabilities
- [Burp Suite](https://portswigger.net/burp) - Web security testing
- [OWASP ZAP](https://www.zaproxy.org/) - Security scanner

---

## Support

For security concerns or questions:

1. Review this guide
2. Check `/utils/sanitize.ts` for available utilities
3. Consult the [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
4. Report security vulnerabilities privately to the security team

**Remember:** When in doubt, **escape everything** and use React's automatic escaping by default!

---

**Last Updated:** 2025-11-13
**Version:** 1.0
**Status:** Active
