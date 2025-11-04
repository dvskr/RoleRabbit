# Supabase Storage Credentials Explained

## 🔑 Two Different Types of Keys

Supabase Storage supports **two different ways** to access files:

### 1. **JavaScript SDK Method** (What We're Using) ✅
- Uses: **Service Role Key** (JWT token)
- Location: **Settings → API**
- Format: Long JWT token starting with `eyJ...`

### 2. **S3-Compatible API Method** (Not What We're Using) ❌
- Uses: **Access Key ID** + **Secret Access Key**
- Location: **Storage → Access Keys**
- Format: Short alphanumeric keys

---

## 📍 Service Role Key (What You Need)

### What Is It?
The **Service Role Key** is a special JWT (JSON Web Token) that gives **full access** to your Supabase project. It's used by backend servers to:
- Bypass Row-Level Security (RLS) policies
- Access all data and storage
- Perform administrative operations

### Where to Find It:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Look for **"service_role"** key (under "Project API keys")
5. Copy the long JWT token

### What It Looks Like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3hvaXJobm52Y29tb3B4Y2RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.your-signature-here
```

**Characteristics:**
- ✅ Very long string (usually 200+ characters)
- ✅ Has three parts separated by dots (.)
- ✅ Starts with `eyJ...`
- ✅ JWT token format

---

## 📍 S3 Access Keys (NOT What We Need)

### What Are They?
**S3 Access Keys** are credentials for using Supabase Storage via **S3-compatible API** (like AWS S3). They're used with tools like:
- AWS SDK
- S3-compatible clients
- Direct HTTP requests to S3 endpoint

### Where to Find Them:
1. Go to **Storage** → **Settings** (or **Policies**)
2. Look for **"Access Keys"** section
3. You'll see:
   - **Access Key ID**: `a5f750a866c6d895fc440eecf7b4604d`
   - **Storage Endpoint**: `https://oawxoirhnnvcomopxcdd.storage.supabase.co/storage/v1/s3`
   - **Secret Access Key**: (shown when you create a new key)

### What They Look Like:
```
Access Key ID: a5f750a866c6d895fc440eecf7b4604d
Secret Access Key: abc123xyz789... (different format)
```

**Characteristics:**
- ❌ Much shorter (32+ characters)
- ❌ No dots (.)
- ❌ Alphanumeric only
- ❌ Different format from JWT

---

## 🔄 Visual Comparison

| Feature | Service Role Key | S3 Access Key ID |
|---------|----------------|------------------|
| **Location** | Settings → API | Storage → Access Keys |
| **Format** | JWT token (`eyJ...`) | Alphanumeric string |
| **Length** | ~200+ characters | ~32 characters |
| **Usage** | Supabase JavaScript SDK | S3-compatible API |
| **For Our Code** | ✅ **YES** | ❌ NO |

---

## 💡 Why We Use Service Role Key

Our storage handler uses the **Supabase JavaScript SDK**, which:
- ✅ Simpler to use
- ✅ Built-in authentication
- ✅ Automatic retry logic
- ✅ Better error handling
- ✅ Integrated with Supabase features

The SDK requires:
- **SUPABASE_URL** (Project URL)
- **SUPABASE_SERVICE_ROLE_KEY** (Service Role Key)
- **SUPABASE_STORAGE_BUCKET** (Bucket name)

---

## 📝 What to Add to .env

```env
# ✅ Use Service Role Key (from Settings → API)
SUPABASE_URL=https://oawxoirhnnvcomopxcdd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3hvaXJobm52Y29tb3B4Y2RkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODc2NTQzMiwiZXhwIjoyMDE0MzQxNDMyfQ.your-key
SUPABASE_STORAGE_BUCKET=roleready-file

# ❌ DO NOT USE S3 Access Keys
# These are for S3-compatible API (different method)
# ACCESS_KEY_ID=a5f750a866c6d895fc440eecf7b4604d
# STORAGE_ENDPOINT=https://oawxoirhnnvcomopxcdd.storage.supabase.co/storage/v1/s3
```

---

## 🎯 Quick Answer

**Service Role Key** = JWT token from **Settings → API → service_role**  
**S3 Access Key** = Different key from **Storage → Access Keys**

**For our implementation:**
- ✅ Use **Service Role Key** (JWT from API settings)
- ❌ Don't use **S3 Access Keys** (those are for a different API method)

---

## 🔍 How to Verify You Have the Right Key

**Service Role Key (Correct ✅):**
- Long string (200+ chars)
- Starts with `eyJ`
- Has dots in it
- Found in Settings → API

**S3 Access Key ID (Wrong ❌):**
- Shorter string (32 chars)
- No dots
- Alphanumeric only
- Found in Storage → Access Keys

---

**TL;DR:** Service Role Key and S3 Access Key are completely different. You need the Service Role Key from **Settings → API**, not the S3 Access Key from **Storage → Access Keys**.

