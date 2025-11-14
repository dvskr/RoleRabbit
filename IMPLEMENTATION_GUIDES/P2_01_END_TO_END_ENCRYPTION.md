# End-to-End Encryption Implementation (Premium Feature)

## Overview
Implement client-side encryption where files are encrypted before upload and decrypted after download, ensuring zero-knowledge storage where even the server cannot read file contents.

## Why E2E Encryption?
- ✅ Ultimate privacy - server never sees plaintext
- ✅ Premium differentiator (charge $50+/month)
- ✅ Compliance: HIPAA, GDPR, financial data
- ✅ Competitive advantage over Google Drive/Dropbox

## Architecture

```
Client Side:
1. Generate encryption key from user password
2. Encrypt file before upload
3. Upload encrypted file
4. Decrypt after download

Server Side:
- Stores only encrypted files
- Cannot decrypt (zero-knowledge)
- Stores encrypted metadata
```

## Implementation

### Step 1: Install Crypto Library

```bash
cd apps/web
npm install tweetnacl tweetnacl-util
```

### Step 2: Create Encryption Service

Create `apps/web/src/services/encryptionService.ts`:

```typescript
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export class EncryptionService {
  private static readonly SALT = 'rolerabbit-encryption-v1';

  /**
   * Derive encryption key from user password
   */
  static async deriveKey(password: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password + this.SALT);

    // Use PBKDF2 for key derivation
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(this.SALT),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 32 bytes
    );

    return new Uint8Array(derivedBits);
  }

  /**
   * Encrypt file buffer
   */
  static async encryptFile(
    fileBuffer: ArrayBuffer,
    key: Uint8Array
  ): Promise<{ encrypted: Uint8Array; nonce: Uint8Array }> {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const encrypted = nacl.secretbox(
      new Uint8Array(fileBuffer),
      nonce,
      key
    );

    return { encrypted, nonce };
  }

  /**
   * Decrypt file buffer
   */
  static async decryptFile(
    encryptedData: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array
  ): Promise<Uint8Array | null> {
    const decrypted = nacl.secretbox.open(encryptedData, nonce, key);
    return decrypted;
  }

  /**
   * Encrypt filename
   */
  static encryptFilename(filename: string, key: Uint8Array): string {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const encrypted = nacl.secretbox(
      encodeUTF8(filename),
      nonce,
      key
    );

    // Store nonce + encrypted data as base64
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);

    return encodeBase64(combined);
  }

  /**
   * Decrypt filename
   */
  static decryptFilename(encryptedFilename: string, key: Uint8Array): string | null {
    const combined = decodeBase64(encryptedFilename);
    const nonce = combined.slice(0, nacl.secretbox.nonceLength);
    const encrypted = combined.slice(nacl.secretbox.nonceLength);

    const decrypted = nacl.secretbox.open(encrypted, nonce, key);
    if (!decrypted) return null;

    return decodeUTF8(decrypted);
  }

  /**
   * Generate new encryption key
   */
  static generateKey(): Uint8Array {
    return nacl.randomBytes(nacl.secretbox.keyLength);
  }

  /**
   * Store encrypted key (encrypted with password)
   */
  static async storeEncryptedKey(
    key: Uint8Array,
    password: string
  ): Promise<string> {
    const derivedKey = await this.deriveKey(password);
    const { encrypted, nonce } = await this.encryptFile(key.buffer, derivedKey);

    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);

    return encodeBase64(combined);
  }

  /**
   * Retrieve encryption key (decrypt with password)
   */
  static async retrieveKey(
    encryptedKey: string,
    password: string
  ): Promise<Uint8Array | null> {
    const derivedKey = await this.deriveKey(password);
    const combined = decodeBase64(encryptedKey);
    const nonce = combined.slice(0, nacl.secretbox.nonceLength);
    const encrypted = combined.slice(nacl.secretbox.nonceLength);

    return this.decryptFile(encrypted, nonce, derivedKey);
  }
}
```

### Step 3: Update Upload to Encrypt

```typescript
// In useFileOperations.ts
import { EncryptionService } from '../../services/encryptionService';

async function handleEncryptedUpload(
  file: File,
  encryptionKey: Uint8Array,
  options: UploadOptions
) {
  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Encrypt file
  const { encrypted, nonce } = await EncryptionService.encryptFile(
    fileBuffer,
    encryptionKey
  );

  // Encrypt filename
  const encryptedFilename = EncryptionService.encryptFilename(
    file.name,
    encryptionKey
  );

  // Create encrypted blob
  const encryptedBlob = new Blob([encrypted]);
  const encryptedFile = new File(
    [encryptedBlob],
    encryptedFilename,
    { type: 'application/encrypted' }
  );

  // Store nonce in metadata
  const metadata = {
    nonce: encodeBase64(nonce),
    originalType: file.type,
    encrypted: true
  };

  // Upload encrypted file
  const response = await apiService.uploadCloudFile(
    encryptedFile,
    options.displayName,
    'encrypted',
    JSON.stringify(metadata)
  );

  return response;
}
```

### Step 4: Update Download to Decrypt

```typescript
async function handleEncryptedDownload(
  file: ResumeFile,
  encryptionKey: Uint8Array
) {
  // Download encrypted file
  const encryptedBlob = await apiService.downloadCloudFile(file.id);
  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  // Parse metadata for nonce
  const metadata = JSON.parse(file.description || '{}');
  const nonce = decodeBase64(metadata.nonce);

  // Decrypt file
  const decrypted = await EncryptionService.decryptFile(
    new Uint8Array(encryptedBuffer),
    nonce,
    encryptionKey
  );

  if (!decrypted) {
    throw new Error('Decryption failed');
  }

  // Decrypt filename
  const originalFilename = EncryptionService.decryptFilename(
    file.fileName,
    encryptionKey
  );

  // Create download link
  const blob = new Blob([decrypted], { type: metadata.originalType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = originalFilename || 'decrypted-file';
  link.click();
  URL.revokeObjectURL(url);
}
```

### Step 5: Key Management UI

```typescript
// EncryptionSetupModal.tsx
export function EncryptionSetupModal({ onComplete }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSetup = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Generate new encryption key
    const key = EncryptionService.generateKey();

    // Encrypt key with password
    const encryptedKey = await EncryptionService.storeEncryptedKey(key, password);

    // Store encrypted key in user settings
    await apiService.updateUserSettings({
      encryptionEnabled: true,
      encryptedKey
    });

    // Store key in session
    sessionStorage.setItem('encryptionKey', encodeBase64(key));

    onComplete();
  };

  return (
    <div className="modal">
      <h2>🔒 Enable End-to-End Encryption</h2>
      <p>Files will be encrypted before upload. You'll need this password to access your files.</p>

      <input
        type="password"
        placeholder="Encryption password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <div className="warning">
        ⚠️ If you forget this password, your files cannot be recovered!
      </div>

      <button onClick={handleSetup}>Enable Encryption</button>
    </div>
  );
}
```

### Step 6: Backend Support

Update `apps/api/routes/storage.routes.js`:

```javascript
// Accept encrypted files
fastify.post('/files/upload', async (request, reply) => {
  const { encrypted, metadata } = request.body;

  if (encrypted) {
    // Store encrypted file as-is
    // Server cannot decrypt
    logger.info('📦 Storing encrypted file');
  }

  // ... rest of upload logic
});
```

## Security Considerations

### Password Strength
```typescript
function validatePassword(password: string): boolean {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar;
}
```

### Key Derivation
- Use PBKDF2 with 100,000+ iterations
- Add app-specific salt
- Never store plain password

### Backup Key
```typescript
// Generate recovery code
function generateRecoveryCode(): string {
  const words = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(words)
    .map(n => WORD_LIST[n % WORD_LIST.length])
    .join('-');
}
```

## Premium Feature Gating

```typescript
// Check subscription tier
if (!user.subscriptionTier === 'PREMIUM') {
  throw new Error('End-to-end encryption requires Premium subscription');
}

// Add to subscription tiers
const FEATURES = {
  FREE: { encryption: false },
  PRO: { encryption: false },
  PREMIUM: { encryption: true }
};
```

## Performance Impact

### Encryption Overhead
- Small files (<10MB): +50-100ms
- Large files (100MB): +1-3 seconds
- Acceptable for premium users

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 57+
- ✅ Safari 11+
- ✅ Edge 79+

## User Experience

### First-Time Setup
1. User enables E2E encryption
2. Creates encryption password
3. System generates encryption key
4. Key encrypted with password and stored
5. User downloads recovery code

### Daily Use
1. User logs in
2. Enters encryption password once per session
3. All files auto-encrypt/decrypt
4. Seamless experience

### Password Recovery
1. User has recovery code
2. Uses recovery code to decrypt master key
3. Can set new password

## Cost
- Development: 15-20 hours
- Library: Free (tweetnacl)
- Storage: Same (encrypted files same size)
- **Can charge:** $50-100/month premium tier

## Implementation Time: 15-20 hours

## Testing

```typescript
describe('Encryption Service', () => {
  test('encrypts and decrypts file', async () => {
    const key = EncryptionService.generateKey();
    const data = new TextEncoder().encode('test data');

    const { encrypted, nonce } = await EncryptionService.encryptFile(
      data.buffer,
      key
    );

    const decrypted = await EncryptionService.decryptFile(
      encrypted,
      nonce,
      key
    );

    expect(decrypted).toEqual(data);
  });

  test('cannot decrypt with wrong key', async () => {
    const key1 = EncryptionService.generateKey();
    const key2 = EncryptionService.generateKey();

    const { encrypted, nonce } = await EncryptionService.encryptFile(
      new TextEncoder().encode('test').buffer,
      key1
    );

    const decrypted = await EncryptionService.decryptFile(
      encrypted,
      nonce,
      key2
    );

    expect(decrypted).toBeNull();
  });
});
```

## Marketing Points

- 🔒 **Zero-Knowledge Storage** - We can't access your files
- 🛡️ **Military-Grade Encryption** - AES-256 equivalent
- 🏆 **Premium Feature** - Available on Premium plan
- ✅ **HIPAA Compliant** - For healthcare data
- 💼 **Enterprise Ready** - For sensitive business data

## Revenue Impact
- Premium tier: $99/month
- Feature adoption: 10-15% of users
- Additional MRR: $10-15 per premium user
