# 🔀 Domain Redirect Setup: rolerabit.com → rolerabbit.com

## Overview

You want users who type `rolerabit.com` to automatically reach `rolerabbit.com`. There are several ways to do this:

---

## ✅ Option 1: GoDaddy Domain Forwarding (Easiest - Recommended)

This is the **simplest method** and works entirely within GoDaddy.

### Steps:

1. **Login to GoDaddy**
   - Go to: https://www.godaddy.com
   - Sign in to your account

2. **Access Domain Settings**
   - Click **"My Products"** (top menu)
   - Find **"rolerabit.com"** in your domain list
   - Click the **three dots (⋯)** next to it
   - Click **"Manage DNS"** or **"DNS"**

3. **Set Up Domain Forwarding**
   - Look for **"Forwarding"** section or **"Domain Forwarding"** option
   - Click **"Add"** or **"Set Up Forwarding"**
   - **Forward to**: Enter `https://rolerabbit.com`
   - **Forward type**: Select **"301 - Permanent"** (better for SEO)
   - **Settings**: 
     - ✅ **Forward only** (not masking - users see rolerabbit.com URL)
     - ✅ **Include path** (if someone visits rolerabit.com/page, they go to rolerabbit.com/page)
   - Click **"Save"** or **"Add"**

4. **Wait for Propagation**
   - Changes take effect within 5-15 minutes
   - Test by visiting `rolerabit.com` - should redirect to `rolerabbit.com`

---

## ✅ Option 2: HTTP Redirect via Web Server (For Production)

If you're hosting your website, you can set up redirects in your web server configuration.

### For Vercel/Netlify:

**Add redirect rule in `vercel.json` or `netlify.toml`:**

```json
// vercel.json
{
  "redirects": [
    {
      "source": "rolerabit.com",
      "destination": "https://rolerabbit.com",
      "permanent": true
    }
  ]
}
```

### For Nginx:

```nginx
server {
    server_name rolerabit.com;
    return 301 https://rolerabbit.com$request_uri;
}
```

### For Apache (.htaccess):

```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^rolerabit\.com$ [NC]
RewriteRule ^(.*)$ https://rolerabbit.com/$1 [R=301,L]
```

---

## ✅ Option 3: DNS CNAME (Subdomain Only)

**⚠️ Important Limitation**: You **cannot** use CNAME on the root domain (`rolerabit.com`). CNAME only works for subdomains (e.g., `www.rolerabit.com`).

If you want to redirect subdomains:

1. **Go to GoDaddy DNS**
2. **Add CNAME record**:
   - Type: `CNAME`
   - Name: `www` (or any subdomain)
   - Value: `rolerabbit.com`
   - TTL: `600` (or default)

This makes `www.rolerabit.com` point to `rolerabbit.com`, but **not** `rolerabit.com` itself.

---

## 📧 Email Configuration

### For Email Sending:

Since you're using Resend for email, you have two options:

#### Option A: Use Only rolerabbit.com (Recommended)

- Set up DNS records **only** for `rolerabbit.com` in Resend
- Use `noreply@rolerabbit.com` as your email sender
- `rolerabit.com` will just redirect to `rolerabbit.com` for web traffic

#### Option B: Set Up Both Domains

- Add both `rolerabit.com` and `rolerabbit.com` to Resend
- Configure DNS records for both domains
- You can use `noreply@rolerabit.com` or `noreply@rolerabbit.com`
- More complex, but allows both email addresses

**Recommendation**: Use **Option A** - simpler and less maintenance.

---

## 🎯 Recommended Setup

### Primary Domain: `rolerabbit.com`
- ✅ Set up in Resend for email
- ✅ Use for your website/app
- ✅ Use for all official communications

### Redirect Domain: `rolerabit.com`
- ✅ Forward to `rolerabbit.com` using GoDaddy Domain Forwarding
- ✅ No additional configuration needed
- ✅ Users typing the typo will reach the correct site

---

## ✅ Quick Checklist

### For Web Redirect:
- [ ] Login to GoDaddy
- [ ] Open DNS management for `rolerabit.com`
- [ ] Set up Domain Forwarding to `https://rolerabbit.com`
- [ ] Use 301 Permanent Redirect
- [ ] Test redirect (visit rolerabit.com)

### For Email:
- [ ] Add `rolerabbit.com` to Resend (already done ✅)
- [ ] Configure DNS records for `rolerabbit.com` in GoDaddy
- [ ] Use `noreply@rolerabbit.com` in your app
- [ ] (Optional) Add `rolerabit.com` to Resend if you want both email addresses

---

## 🆘 Troubleshooting

### Redirect Not Working?

1. **Wait 10-15 minutes** - DNS/redirect changes take time
2. **Clear browser cache** - Old redirects might be cached
3. **Test in incognito/private window**
4. **Check GoDaddy forwarding settings** - Make sure it's enabled
5. **Verify URL** - Make sure you entered `https://rolerabbit.com` correctly

### Both Domains Need Email?

If you want email addresses on both domains:
- Add both to Resend
- Configure DNS records for both in GoDaddy
- You can use either `@rolerabit.com` or `@rolerabbit.com` for sending

---

## 💡 Best Practices

1. **Use 301 Redirect** - Tells search engines this is permanent
2. **Include Path** - Preserves full URLs (rolerabit.com/page → rolerabbit.com/page)
3. **HTTPS** - Always redirect to `https://rolerabbit.com` (secure)
4. **Test Regularly** - Make sure redirect still works after DNS changes

---

## 📝 Summary

**Simplest Solution:**
1. Set up `rolerabbit.com` in Resend for email ✅
2. Use GoDaddy Domain Forwarding to redirect `rolerabit.com` → `rolerabbit.com`
3. Done! Users typing either domain will reach the correct site

**This way:**
- ✅ Web traffic: Both domains work (rolerabit.com redirects)
- ✅ Email: Use rolerabbit.com (professional, consistent)
- ✅ Simple: Minimal configuration needed

---

Let me know if you need help setting up the forwarding in GoDaddy! 🚀

