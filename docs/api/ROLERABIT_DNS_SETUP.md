# 🚀 Quick Setup Guide: rolerabbit.com DNS Records

## Step 1: Add Domain to Resend

1. Go to: **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter: `rolerabbit.com`
4. Click **"Add Domain"**

---

## Step 2: Copy DNS Records from Resend

After adding the domain, Resend will show you DNS records to add. You'll see:

### 📋 Required Records:

1. **DKIM Record** (Domain Verification)
   - Type: `TXT`
   - Name: `resend._domainkey`
   - Content: `[Long string starting with p=MIGfMA0GCSqGSIb3...]` (Copy from Resend)

2. **MX Record** (Email Sending)
   - Type: `MX`
   - Name: `send`
   - Content: `feedback-smtp.us-east-1.amazonaws.com` (or similar)
   - Priority: `10`

3. **SPF Record** (Email Authorization)
   - Type: `TXT`
   - Name: `send`
   - Content: `v=spf1 include:amazonses.com ~all` (or similar)

4. **DMARC Record** (Optional but Recommended)
   - Type: `TXT`
   - Name: `_dmarc`
   - Content: `v=DMARC1; p=none;`

---

## Step 3: Add Records to Your Domain Provider

### Where did you register rolerabbit.com?

**If you registered with:**
- **GoDaddy** → Go to "My Products" → "DNS"
- **Namecheap** → "Domain List" → "Advanced DNS"
- **Cloudflare** → Select domain → "DNS" → "Records"
- **Google Domains** → "DNS" section
- **Other** → Look for "DNS Management" or "DNS Settings"

### How to Add Each Record:

1. **DKIM (TXT record)**:
   - Click "Add Record" or "Create Record"
   - Type: `TXT`
   - Name/Host: `resend._domainkey`
   - Value/Content: `[Paste the long string from Resend]`
   - TTL: `Auto` or `3600`
   - Save

2. **MX Record**:
   - Click "Add Record"
   - Type: `MX`
   - Name/Host: `send`
   - Value/Mail Server: `feedback-smtp.us-east-1.amazonaws.com`
   - Priority: `10`
   - TTL: `Auto` or `3600`
   - Save

3. **SPF (TXT record)**:
   - Click "Add Record"
   - Type: `TXT`
   - Name/Host: `send`
   - Value/Content: `v=spf1 include:amazonses.com ~all`
   - TTL: `Auto` or `3600`
   - Save

4. **DMARC (TXT record)**:
   - Click "Add Record"
   - Type: `TXT`
   - Name/Host: `_dmarc`
   - Value/Content: `v=DMARC1; p=none;`
   - TTL: `Auto` or `3600`
   - Save

---

## Step 4: Verify in Resend

1. **Wait 5-10 minutes** (DNS propagation takes time)
2. Go back to **https://resend.com/domains**
3. Click **"I've added the records"** button
4. Resend will automatically verify
5. Status will change to **"Verified"** ✅

---

## Step 5: Update Your App Configuration

Once verified, update your `.env` file:

```bash
# In apps/api/.env
EMAIL_FROM=noreply@rolerabit.com
```

Then restart your API server:

```bash
cd apps/api
npm run dev
```

---

## ✅ You're Done!

Now you can:
- ✅ Send emails to **any recipient** (not just your account email)
- ✅ Use professional `@rolerabbit.com` email addresses
- ✅ Better email deliverability
- ✅ Professional branding

---

## 🆘 Need Help?

**If records aren't verifying:**
- Wait 10-15 minutes (DNS can be slow)
- Double-check you copied values exactly from Resend
- Make sure there are no extra spaces
- Check your DNS provider shows all 4 records saved

**Which domain provider are you using?** I can give you specific step-by-step instructions!

---

**Quick Checklist:**
- [ ] Added `rolerabbit.com` to Resend
- [ ] Copied all 4 DNS records from Resend
- [ ] Added DKIM record to domain provider
- [ ] Added MX record to domain provider
- [ ] Added SPF record to domain provider
- [ ] Added DMARC record to domain provider
- [ ] Waited 5-10 minutes
- [ ] Clicked "I've added the records" in Resend
- [ ] Domain verified ✅
- [ ] Updated `.env` with `EMAIL_FROM=noreply@rolerabbit.com`
- [ ] Restarted API server
- [ ] Tested email sending

