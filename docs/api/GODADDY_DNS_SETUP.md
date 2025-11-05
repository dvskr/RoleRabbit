# 🚀 GoDaddy DNS Setup Guide for rolerabbit.com

## Step-by-Step Instructions for GoDaddy

### Step 1: Add Domain to Resend

1. Go to: **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter: `rolerabbit.com`
4. Click **"Add Domain"**
5. **Copy all 4 DNS records** that Resend shows you (you'll need them in Step 2)

---

### Step 2: Login to GoDaddy

1. Go to: **https://www.godaddy.com**
2. Click **"Sign In"** (top right)
3. Enter your credentials and sign in

---

### Step 3: Access DNS Management

1. Click **"My Products"** (top menu)
2. Find **"rolerabbit.com"** in your domain list
3. Click the **three dots (⋯)** next to your domain
4. Click **"DNS"** from the dropdown menu

   OR

   Click directly on **"DNS"** button next to your domain

---

### Step 4: Add DNS Records

You'll see a table with existing DNS records. Scroll down and click **"Add"** button to add each record.

#### Record 1: DKIM (Domain Verification) - TXT Record

1. Click **"Add"** button
2. Select **"TXT"** from the **Type** dropdown
3. **Name/Host**: Enter `resend._domainkey`
4. **Value**: Paste the long string from Resend (starts with `p=MIGfMA0GCSqGSIb3...`)
   - ⚠️ **Important**: Copy the ENTIRE string from Resend, including all characters
5. **TTL**: Leave as default (usually `600 seconds` or `1 hour`)
6. Click **"Save"**

#### Record 2: MX Record (Email Sending)

1. Click **"Add"** button again
2. Select **"MX"** from the **Type** dropdown
3. **Name/Host**: Enter `send`
4. **Value/Points to**: Enter `feedback-smtp.us-east-1.amazonaws.com`
   - ⚠️ **Note**: The exact value might be slightly different - use what Resend shows you
5. **Priority**: Enter `10`
6. **TTL**: Leave as default
7. Click **"Save"**

#### Record 3: SPF Record (Email Authorization) - TXT Record

1. Click **"Add"** button again
2. Select **"TXT"** from the **Type** dropdown
3. **Name/Host**: Enter `send`
4. **Value**: Enter `v=spf1 include:amazonses.com ~all`
   - ⚠️ **Note**: Use the exact value Resend shows you (might be slightly different)
5. **TTL**: Leave as default
6. Click **"Save"**

#### Record 4: DMARC Record (Optional but Recommended) - TXT Record

1. Click **"Add"** button again
2. Select **"TXT"** from the **Type** dropdown
3. **Name/Host**: Enter `_dmarc`
4. **Value**: Enter `v=DMARC1; p=none;`
5. **TTL**: Leave as default
6. Click **"Save"**

---

### Step 5: Verify Records Are Added

After adding all 4 records, you should see them in your DNS records table:

```
Type    Name                Value                                    Priority
TXT     resend._domainkey   p=MIGfMA0GCSqGSIb3...                     -
MX      send                feedback-smtp.us-east-1.amazonaws.com    10
TXT     send                v=spf1 include:amazonses.com ~all         -
TXT     _dmarc              v=DMARC1; p=none;                         -
```

---

### Step 6: Wait for DNS Propagation

1. **Wait 5-10 minutes** for DNS changes to propagate
2. DNS changes can take up to 24 hours, but usually happen within 5-10 minutes

---

### Step 7: Verify in Resend

1. Go back to: **https://resend.com/domains**
2. Find `rolerabbit.com` in your domain list
3. Click **"I've added the records"** button
4. Resend will automatically check and verify your DNS records
5. Status will change to **"Verified"** ✅ (may take a few minutes)

---

### Step 8: Update Your App Configuration

Once Resend shows domain as **"Verified"**:

1. **Update `.env` file** in `apps/api/`:
   ```bash
   EMAIL_FROM=noreply@rolerabbit.com
   ```

2. **Restart your API server**:
   ```bash
   # Stop current server (Ctrl+C if running)
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

## 🆘 Troubleshooting

### Records Not Showing Up?

- **Refresh the page** in GoDaddy DNS management
- Make sure you clicked **"Save"** after adding each record
- Check that the **Type** is correct (TXT, MX, etc.)

### Resend Verification Failing?

- **Wait 10-15 minutes** - DNS propagation can be slow
- **Double-check values** - Make sure you copied them exactly from Resend
- **Check for typos** - Especially in the DKIM record (long string)
- **Verify in GoDaddy** - Go back to DNS management and confirm all 4 records are there

### Still Having Issues?

1. **Verify records in GoDaddy**:
   - Go to DNS management
   - Make sure all 4 records are visible
   - Check that values match what Resend showed you

2. **Check DNS propagation**:
   - Use a tool like: https://www.whatsmydns.net/
   - Search for `resend._domainkey.rolerabbit.com` (TXT record)
   - Should show your DKIM value after propagation

3. **Contact Resend Support**:
   - If records are correct but verification still fails
   - Resend dashboard usually shows specific error messages

---

## 📋 Quick Checklist

- [ ] Added `rolerabbit.com` to Resend
- [ ] Copied all 4 DNS records from Resend
- [ ] Logged into GoDaddy
- [ ] Opened DNS management for `rolerabbit.com`
- [ ] Added DKIM TXT record (`resend._domainkey`)
- [ ] Added MX record (`send`)
- [ ] Added SPF TXT record (`send`)
- [ ] Added DMARC TXT record (`_dmarc`)
- [ ] Verified all 4 records are visible in GoDaddy
- [ ] Waited 5-10 minutes
- [ ] Clicked "I've added the records" in Resend
- [ ] Domain verified ✅
- [ ] Updated `.env` with `EMAIL_FROM=noreply@rolerabbit.com`
- [ ] Restarted API server
- [ ] Tested email sending

---

## 💡 Tips

- **Save each record immediately** after adding it
- **Double-check the DKIM value** - it's a long string, easy to miss characters
- **Use copy/paste** for values from Resend to avoid typos
- **Take a screenshot** of Resend's DNS records page before closing it
- **Don't rush** - DNS changes need time to propagate

---

**You've got this!** 🚀 Let me know once you've added the records and I can help verify everything is working!

