# ✅ DNS Records Verification Checklist for rolerabbit.com

## 📋 Records to Verify in GoDaddy

### ✅ Record 1: DKIM (Domain Verification)
- **Type**: TXT
- **Name**: `resend._domainkey`
- **Value**: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDoFjxw70BTbniHM5LXb948IVNeWmlgyUhylUicVeH6FiWlgqZrv7xZ4440dLFrFdVS+6YNAkuUNtAPk9218G7Q061L3saEFpJrQo0rUit/mGSdMAPLRTkkynl1q+Uid9vKwMN9I4YRZ34Be1lpMoOabU8LDvtPQ3Y6P4A1/3TJBQIDAQAB` (full long string from Resend)
- **TTL**: 1 Hour (or Auto)
- **Priority**: (empty)

### ✅ Record 2: MX (Email Sending)
- **Type**: MX
- **Name**: `send`
- **Value**: `feedback-smtp.us-east-1.amazonaws.com.` (note the trailing dot)
- **Priority**: `10`
- **TTL**: 1 Hour (or Auto)

### ✅ Record 3: SPF (Email Authorization)
- **Type**: TXT
- **Name**: `send`
- **Value**: `v=spf1 include:amazonses.com ~all`
- **TTL**: 1 Hour (or Auto)
- **Priority**: (empty)

### ✅ Record 4: DMARC
- **Type**: TXT
- **Name**: `_dmarc`
- **Value**: `v=DMARC1; p=none;`
- **TTL**: 1 Hour (or Auto)
- **Priority**: (empty)

---

## 🔍 How to Verify in GoDaddy

1. **Login to GoDaddy**
   - Go to: https://www.godaddy.com
   - Sign in

2. **Access DNS Management**
   - Click **"My Products"**
   - Find **"rolerabbit.com"**
   - Click **"DNS"** or **"Manage DNS"**

3. **Check Each Record**
   - Scroll through your DNS records
   - Verify all 4 records are present
   - Check that values match exactly (especially DKIM - it's a long string)

---

## 🧪 Automated Verification

Run the verification script:

```bash
cd apps/api
node verify-dns-records.js
```

This will check if DNS records are propagated and accessible.

---

## ⏱️ DNS Propagation Time

- **Typical**: 5-15 minutes
- **Maximum**: Up to 24 hours (rare)
- **Average**: 10-30 minutes

---

## ✅ Verification Steps

### Step 1: Check Records in GoDaddy
- [ ] DKIM record (`resend._domainkey`) is present
- [ ] MX record (`send`) is present
- [ ] SPF record (`send`) is present
- [ ] DMARC record (`_dmarc`) is present
- [ ] All values match Resend's instructions exactly

### Step 2: Wait for Propagation
- [ ] Wait 5-15 minutes after adding records
- [ ] Run verification script: `node verify-dns-records.js`

### Step 3: Verify in Resend
- [ ] Go to: https://resend.com/domains
- [ ] Find `rolerabbit.com`
- [ ] Click **"I've added the records"** button
- [ ] Wait for automatic verification
- [ ] Status should show **"Verified"** ✅

### Step 4: Update Configuration
- [ ] Once verified, update `.env`:
  ```bash
  EMAIL_FROM=noreply@rolerabbit.com
  ```
- [ ] Restart API server

---

## 🆘 Troubleshooting

### Records Not Showing in Verification?

1. **Double-check GoDaddy DNS**
   - Make sure records are saved
   - Refresh the DNS management page
   - Verify no typos in values

2. **Wait Longer**
   - DNS propagation can take time
   - Try again in 15-30 minutes

3. **Check DNS Propagation Tools**
   - Use: https://www.whatsmydns.net/
   - Search for: `resend._domainkey.rolerabbit.com`
   - Should show your DKIM value

### Resend Verification Failing?

1. **Check Resend Dashboard**
   - Look for specific error messages
   - Resend usually shows which record is missing

2. **Verify Exact Values**
   - DKIM: Copy entire string from Resend (very long)
   - MX: Include trailing dot if shown: `.`
   - SPF: Exact match: `v=spf1 include:amazonses.com ~all`
   - DMARC: Exact match: `v=DMARC1; p=none;`

3. **Common Issues**
   - Extra spaces in values
   - Missing trailing dot in MX record
   - Truncated DKIM string (must be complete)

---

## 📝 Quick Reference

**All 4 Records Must Be Present:**
1. ✅ DKIM: `resend._domainkey` (TXT)
2. ✅ MX: `send` (MX)
3. ✅ SPF: `send` (TXT)
4. ✅ DMARC: `_dmarc` (TXT)

**Verification Links:**
- Resend Dashboard: https://resend.com/domains
- DNS Checker: https://www.whatsmydns.net/
- GoDaddy DNS: https://www.godaddy.com (My Products → DNS)

---

Let me know what you see in GoDaddy and I can help troubleshoot! 🚀

