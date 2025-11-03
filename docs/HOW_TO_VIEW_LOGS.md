# How to View Server Logs

## 📍 Where to Check Server Logs

Your server logs are displayed in **two places**:

### 1. **Terminal/Console (Real-time)** ⭐ **Easiest Way**

The logs appear in the **terminal/console where you started the server**.

#### How to View:

1. **Find the terminal/console where you ran:**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Look at that terminal window** - all logs appear there in real-time!

3. **When you upload a profile picture**, you'll see logs like:
   ```
   2024-11-03 11:30:45 info: 📸 Found existing profile picture, extracted path: userId/2024/11/uuid-timestamp.jpg
   2024-11-03 11:30:45 info: 🗑️  Deleting old profile picture: userId/2024/11/uuid-timestamp.jpg
   2024-11-03 11:30:45 info: ✅ Successfully deleted old profile picture: userId/2024/11/uuid-timestamp.jpg
   ```

#### Tips:
- **Keep the terminal visible** while testing
- **Scroll up** if logs scroll off screen
- Use **Ctrl+F** (or Cmd+F on Mac) to search for specific messages like "profile picture"

---

### 2. **Log Files** (Saved to Disk)

Logs are also saved to files in `apps/api/logs/` directory:

- **`apps/api/logs/error.log`** - Only error messages
- **`apps/api/logs/combined.log`** - All logs (info, warn, error, etc.)

#### How to View Log Files:

**Option A: Open in Text Editor**
```bash
# View all logs
cat apps/api/logs/combined.log

# View only errors
cat apps/api/logs/error.log

# View last 50 lines (Windows PowerShell)
Get-Content apps/api/logs/combined.log -Tail 50

# Follow logs in real-time (like `tail -f` on Linux/Mac)
# (Not available in PowerShell, but you can refresh the file)
```

**Option B: Open in VS Code/Cursor**
1. Navigate to: `apps/api/logs/`
2. Open `combined.log` or `error.log`
3. Use **Ctrl+F** to search for specific messages

**Option C: Use PowerShell**
```powershell
# View last 20 lines
Get-Content apps/api/logs/combined.log -Tail 20

# Search for specific text
Get-Content apps/api/logs/combined.log | Select-String "profile picture"

# View in real-time (requires PowerShell 7+)
Get-Content apps/api/logs/combined.log -Wait -Tail 20
```

---

## 🔍 What to Look For

When testing profile picture deletion, search for these messages:

### ✅ Success Messages:
```
📸 Found existing profile picture, extracted path: ...
🗑️  Deleting old profile picture: ...
✅ Successfully deleted old profile picture: ...
```

### ⚠️ Warning Messages:
```
⚠️  Could not delete old profile picture: <error message>
⚠️  Old profile picture exists but path extraction failed
```

### ℹ️ Info Messages:
```
ℹ️  Old profile picture already deleted
ℹ️  No existing profile picture to delete
```

---

## 🧪 Quick Test

1. **Start your API server:**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Keep the terminal visible**

3. **Upload a new profile picture** in your app

4. **Watch the terminal** - you should see logs immediately!

5. **Search for "profile picture"** in the logs to find relevant messages

---

## 📝 Example Log Output

```
2024-11-03 11:30:45 info: 🚀 RoleReady Node.js API running on http://localhost:3001
2024-11-03 11:30:50 info: POST /api/users/profile/picture
2024-11-03 11:30:50 info: 📸 Found existing profile picture, extracted path: clx123/2024/11/abc-123-1709562645123.jpg
2024-11-03 11:30:51 info: 🗑️  Deleting old profile picture: clx123/2024/11/abc-123-1709562645123.jpg
2024-11-03 11:30:51 info: ✅ Successfully deleted old profile picture: clx123/2024/11/abc-123-1709562645123.jpg
2024-11-03 11:30:52 info: ✅ Profile picture uploaded successfully
```

---

## 💡 Pro Tips

1. **Clear terminal** if it's too cluttered:
   - Windows: `cls`
   - Mac/Linux: `clear`

2. **Filter logs** in terminal:
   - Use `| grep "profile picture"` on Mac/Linux
   - Use `Select-String "profile picture"` in PowerShell

3. **Check log file size:**
   ```bash
   # If logs get too large
   ls -lh apps/api/logs/
   ```

4. **If logs directory doesn't exist:**
   - The logger will create it automatically
   - Or create manually: `mkdir apps/api/logs`

---

**Best Practice:** Keep the terminal window visible while developing so you can see logs in real-time! 🚀

