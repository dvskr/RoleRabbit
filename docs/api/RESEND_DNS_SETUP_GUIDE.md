# Resend DNS Records Setup Guide for rolerabbit.com

## ✅ Current Status
- Domain: `rolerabbit.com` ✅
- Resend Domain Added: ⏳ (Next step)
- DNS Records: Need to be added to your domain provider

## 📋 DNS Records to Add

### Step 1: Domain Verification (Required)

**DKIM Record** - Verifies you own the domain
```
Type: TXT
Name: resend._domainkey
Content: [Copy from Resend dashboard - starts with p=MIGfMA0GCSqGSIb3...]
TTL: Auto (or 3600)
```

### Step 2: Enable Sending (Required)

**MX Record** - For email sending
```
Type: MX
Name: send
Content: feedback-smtp.us-east-1.amazonaws.com
Priority: 10
TTL: Auto (or 3600)
```

**SPF Record** - Authorizes Resend to send emails
```
Type: TXT
Name: send
Content: v=spf1 include:amazonses.com ~all
TTL: Auto (or 3600)
```

**DMARC Record** (Optional but Recommended)
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none;
TTL: Auto (or 3600)
```

### Step 3: Enable Receiving (Optional - Only if you want to receive emails)

Leave this OFF for now (you can enable later if needed).

---

## 🔧 How to Add DNS Records

### Option A: Cloudflare (If your domain is there)

1. Login to Cloudflare
2. Select `rolerabbit.com` domain
3. Go to **DNS** → **Records**
4. Click **Add record**

**Add each record:**

1. **DKIM Record:**
   - Type: `TXT`
   - Name: `resend._domainkey`
   - Content: `[paste from Resend]`
   - TTL: `Auto`
   - Click **Save**

2. **MX Record:**
   - Type: `MX`
   - Name: `send`
   - Mail server: `feedback-smtp.us-east-1.amazonaws.com`
   - Priority: `10`
   - TTL: `Auto`
   - Click **Save**

3. **SPF Record:**
   - Type: `TXT`
   - Name: `send`
   - Content: `v=spf1 include:amazonses.com ~all`
   - TTL: `Auto`
   - Click **Save**

4. **DMARC Record:**
   - Type: `TXT`
   - Name: `_dmarc`
   - Content: `v=DMARC1; p=none;`
   - TTL: `Auto`
   - Click **Save**

### Option B: Namecheap

1. Login to Namecheap
2. Go to **Domain List** → Click **Manage** on `rolerabbit.com`
3. Go to **Advanced DNS** tab
4. Click **Add New Record**

**Add each record** (same as above)

### Option C: Other Domain Providers

1. Login to your domain registrar
2. Find **DNS Management** or **DNS Settings**
3. Look for **Add Record** or **Manage DNS**
4. Add each record as shown above

---

## ⏱️ Verification Time

After adding records:
- **Wait 5-10 minutes** for DNS propagation
- Resend will automatically verify
- You'll see "Verified" status in Resend dashboard

---

## ✅ After Verification

Once Resend shows domain as verified:

1. **Update `.env` file:**
   ```bash
   EMAIL_FROM=noreply@rolerabbit.com
   ```

2. **Restart API Server:**
   ```bash
   # Stop current server (Ctrl+C)
   cd apps/api
   npm run dev
   ```

3. **Test Email:**
   - Try password reset or email update
   - Emails will now send from `noreply@rolerabbit.com`
   - Can send to **any email address** ✅

---

## 🎯 Quick Checklist

- [ ] Add DKIM record (resend._domainkey)
- [ ] Add MX record (send)
- [ ] Add SPF record (send)
- [ ] Add DMARC record (_dmarc) - optional
- [ ] Wait 5-10 minutes
- [ ] Click "I've added the records" in Resend
- [ ] Wait for verification
- [ ] Update EMAIL_FROM in .env
- [ ] Restart API server
- [ ] Test email sending

---

## 📧 Email Addresses You Can Use

Once verified, you can use any email address on your domain:

- `noreply@rolerabbit.com` ⭐ (Recommended for automated emails)
- `hello@rolerabbit.com` (For welcome emails)
- `support@rolerabbit.com` (For support)
- `notifications@rolerabbit.com` (For notifications)

**Recommended:** Use `noreply@rolerabbit.com` for OTP and automated emails.

---

## 🆘 Troubleshooting

### Records Not Verifying?
- Wait 10-15 minutes (DNS propagation takes time)
- Double-check record values match exactly
- Make sure no typos in content
- Check TTL is set correctly

### Still Not Working?
- Verify records are saved in your DNS provider
- Check Resend dashboard for specific error messages
- DNS propagation can take up to 24 hours (usually 5-10 min)

---

## ✅ You're Almost There!

Once you add these DNS records and Resend verifies your domain, you'll be able to:
- ✅ Send emails to **any recipient**
- ✅ Use professional `@rolerabbit.com` email addresses
- ✅ Better email deliverability
- ✅ Professional branding

Let me know once you've added the records and I can help verify everything is working! 🚀

