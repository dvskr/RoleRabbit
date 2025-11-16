# API Code Examples

Complete code examples for the RoleReady Resume Builder API in JavaScript, Python, and cURL.

## Table of Contents

1. [Authentication](#authentication)
2. [Resume Operations](#resume-operations)
3. [Export](#export)
4. [Sharing](#sharing)
5. [Templates](#templates)
6. [Analytics](#analytics)

---

## Authentication

### Login

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token for future requests
    localStorage.setItem('auth_token', data.token);
    return data.token;
  } else {
    throw new Error(data.error);
  }
};

// Usage
try {
  const token = await login('user@example.com', 'password123');
  console.log('Logged in successfully!');
} catch (error) {
  console.error('Login failed:', error.message);
}
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
import requests

def login(email, password):
    url = 'http://localhost:3001/api/auth/login'
    payload = {
        'email': email,
        'password': password
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if data.get('success'):
        # Store token for future requests
        token = data.get('token')
        return token
    else:
        raise Exception(data.get('error'))

# Usage
try:
    token = login('user@example.com', 'password123')
    print('Logged in successfully!')
except Exception as e:
    print(f'Login failed: {e}')
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }

# Store token in variable for subsequent requests
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
</details>

---

## Resume Operations

### List All Resumes

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const getResumes = async (token) => {
  const response = await fetch('http://localhost:3001/api/base-resumes', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.resumes;
};

// Usage
const token = localStorage.getItem('auth_token');
const resumes = await getResumes(token);
console.log(`Found ${resumes.length} resumes`);
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
import requests

def get_resumes(token):
    url = 'http://localhost:3001/api/base-resumes'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(url, headers=headers)
    data = response.json()
    return data.get('resumes', [])

# Usage
resumes = get_resumes(token)
print(f'Found {len(resumes)} resumes')
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
curl -X GET http://localhost:3001/api/base-resumes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```
</details>

### Create Resume

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const createResume = async (token, resumeData) => {
  const response = await fetch('http://localhost:3001/api/base-resumes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: resumeData.name,
      data: resumeData.data,
      formatting: resumeData.formatting || {},
      metadata: resumeData.metadata || {}
    })
  });
  
  const data = await response.json();
  return data.resume;
};

// Usage
const newResume = await createResume(token, {
  name: 'Software Engineer Resume',
  data: {
    contact: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234'
    },
    summary: 'Experienced software engineer...',
    experience: [
      {
        company: 'Tech Corp',
        role: 'Senior Engineer',
        startDate: '2020-01',
        endDate: '2023-12',
        bullets: [
          'Led team of 5 engineers',
          'Increased performance by 50%'
        ]
      }
    ]
  }
});

console.log('Resume created:', newResume.id);
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
def create_resume(token, resume_data):
    url = 'http://localhost:3001/api/base-resumes'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    payload = {
        'name': resume_data['name'],
        'data': resume_data['data'],
        'formatting': resume_data.get('formatting', {}),
        'metadata': resume_data.get('metadata', {})
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    return data.get('resume')

# Usage
new_resume = create_resume(token, {
    'name': 'Software Engineer Resume',
    'data': {
        'contact': {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '555-1234'
        },
        'summary': 'Experienced software engineer...',
        'experience': [
            {
                'company': 'Tech Corp',
                'role': 'Senior Engineer',
                'startDate': '2020-01',
                'endDate': '2023-12',
                'bullets': [
                    'Led team of 5 engineers',
                    'Increased performance by 50%'
                ]
            }
        ]
    }
})

print(f"Resume created: {new_resume['id']}")
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
curl -X POST http://localhost:3001/api/base-resumes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Software Engineer Resume",
    "data": {
      "contact": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "555-1234"
      },
      "summary": "Experienced software engineer...",
      "experience": [
        {
          "company": "Tech Corp",
          "role": "Senior Engineer",
          "startDate": "2020-01",
          "endDate": "2023-12",
          "bullets": [
            "Led team of 5 engineers",
            "Increased performance by 50%"
          ]
        }
      ]
    }
  }'
```
</details>

### Duplicate Resume

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const duplicateResume = async (token, resumeId) => {
  const response = await fetch(`http://localhost:3001/api/base-resumes/${resumeId}/duplicate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.resume;
};

// Usage
const duplicated = await duplicateResume(token, 'resume123');
console.log('Duplicated resume:', duplicated.name); // "Original Name (Copy)"
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
def duplicate_resume(token, resume_id):
    url = f'http://localhost:3001/api/base-resumes/{resume_id}/duplicate'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers)
    data = response.json()
    return data.get('resume')

# Usage
duplicated = duplicate_resume(token, 'resume123')
print(f"Duplicated resume: {duplicated['name']}")
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
RESUME_ID="resume123"

curl -X POST http://localhost:3001/api/base-resumes/$RESUME_ID/duplicate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```
</details>

---

## Export

### Export Resume to PDF

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const exportResume = async (token, resumeId, format = 'pdf') => {
  // Step 1: Request export
  const response = await fetch(`http://localhost:3001/api/base-resumes/${resumeId}/export`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ format })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  // Step 2: Download file
  const downloadUrl = `http://localhost:3001${data.fileUrl}`;
  const fileResponse = await fetch(downloadUrl);
  const blob = await fileResponse.blob();
  
  // Step 3: Trigger download in browser
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = data.fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  return data;
};

// Usage
await exportResume(token, 'resume123', 'pdf');
console.log('Resume exported successfully!');
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
import requests

def export_resume(token, resume_id, format='pdf', output_path=None):
    # Step 1: Request export
    url = f'http://localhost:3001/api/base-resumes/{resume_id}/export'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    payload = {'format': format}
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    
    if not data.get('success'):
        raise Exception(data.get('error'))
    
    # Step 2: Download file
    download_url = f"http://localhost:3001{data['fileUrl']}"
    file_response = requests.get(download_url)
    
    # Step 3: Save to file
    if output_path is None:
        output_path = data['fileName']
    
    with open(output_path, 'wb') as f:
        f.write(file_response.content)
    
    print(f"Resume exported to: {output_path}")
    return output_path

# Usage
export_resume(token, 'resume123', format='pdf', output_path='my_resume.pdf')
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
RESUME_ID="resume123"

# Step 1: Request export
EXPORT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/base-resumes/$RESUME_ID/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format": "pdf"}')

# Step 2: Extract download URL
DOWNLOAD_URL=$(echo $EXPORT_RESPONSE | jq -r '.fileUrl')
FILE_NAME=$(echo $EXPORT_RESPONSE | jq -r '.fileName')

# Step 3: Download file
curl -o "$FILE_NAME" "http://localhost:3001$DOWNLOAD_URL"

echo "Resume exported to: $FILE_NAME"
```
</details>

---

## Sharing

### Create Share Link

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const createShareLink = async (token, resumeId, options = {}) => {
  const response = await fetch(`http://localhost:3001/api/base-resumes/${resumeId}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      expiresInDays: options.expiresInDays || 30,
      password: options.password || null,
      allowDownload: options.allowDownload !== false
    })
  });
  
  const data = await response.json();
  return data.shareLink;
};

// Usage
const shareLink = await createShareLink(token, 'resume123', {
  expiresInDays: 7,
  password: 'secret123',
  allowDownload: true
});

console.log('Share URL:', shareLink.url);
console.log('Expires:', shareLink.expiresAt);
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
def create_share_link(token, resume_id, expires_in_days=30, password=None, allow_download=True):
    url = f'http://localhost:3001/api/base-resumes/{resume_id}/share'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    payload = {
        'expiresInDays': expires_in_days,
        'password': password,
        'allowDownload': allow_download
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    return data.get('shareLink')

# Usage
share_link = create_share_link(token, 'resume123', expires_in_days=7, password='secret123')
print(f"Share URL: {share_link['url']}")
print(f"Expires: {share_link['expiresAt']}")
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
RESUME_ID="resume123"

curl -X POST http://localhost:3001/api/base-resumes/$RESUME_ID/share \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expiresInDays": 7,
    "password": "secret123",
    "allowDownload": true
  }'
```
</details>

### Access Shared Resume

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const accessSharedResume = async (shareToken, password = null) => {
  const url = new URL(`http://localhost:3001/api/share/${shareToken}`);
  if (password) {
    url.searchParams.append('password', password);
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.success) {
    if (data.requiresPassword) {
      throw new Error('Password required');
    }
    throw new Error(data.error);
  }
  
  return data.resume;
};

// Usage (no authentication required!)
const sharedResume = await accessSharedResume('abc123', 'secret123');
console.log('Shared resume:', sharedResume.name);
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
def access_shared_resume(share_token, password=None):
    url = f'http://localhost:3001/api/share/{share_token}'
    params = {}
    if password:
        params['password'] = password
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if not data.get('success'):
        if data.get('requiresPassword'):
            raise Exception('Password required')
        raise Exception(data.get('error'))
    
    return data.get('resume')

# Usage (no authentication required!)
shared_resume = access_shared_resume('abc123', password='secret123')
print(f"Shared resume: {shared_resume['name']}")
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
SHARE_TOKEN="abc123"
PASSWORD="secret123"

curl -X GET "http://localhost:3001/api/share/$SHARE_TOKEN?password=$PASSWORD"
```
</details>

---

## Templates

### List All Templates

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const getTemplates = async (filters = {}) => {
  const url = new URL('http://localhost:3001/api/resume-templates');
  
  if (filters.category) {
    url.searchParams.append('category', filters.category);
  }
  if (filters.isPremium !== undefined) {
    url.searchParams.append('isPremium', filters.isPremium);
  }
  if (filters.search) {
    url.searchParams.append('search', filters.search);
  }
  
  const response = await fetch(url);
  const data = await response.json();
  return data.templates;
};

// Usage
const templates = await getTemplates({ category: 'professional', isPremium: false });
console.log(`Found ${templates.length} templates`);
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
def get_templates(category=None, is_premium=None, search=None):
    url = 'http://localhost:3001/api/resume-templates'
    params = {}
    
    if category:
        params['category'] = category
    if is_premium is not None:
        params['isPremium'] = str(is_premium).lower()
    if search:
        params['search'] = search
    
    response = requests.get(url, params=params)
    data = response.json()
    return data.get('templates', [])

# Usage
templates = get_templates(category='professional', is_premium=False)
print(f"Found {len(templates)} templates")
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
# List all templates
curl -X GET http://localhost:3001/api/resume-templates

# Filter by category
curl -X GET "http://localhost:3001/api/resume-templates?category=professional"

# Filter by premium status
curl -X GET "http://localhost:3001/api/resume-templates?isPremium=false"

# Search templates
curl -X GET "http://localhost:3001/api/resume-templates?search=modern"
```
</details>

---

## Analytics

### Get Resume Analytics

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
const getAnalytics = async (token, resumeId) => {
  const response = await fetch(`http://localhost:3001/api/base-resumes/${resumeId}/analytics`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.analytics;
};

// Usage
const analytics = await getAnalytics(token, 'resume123');
console.log(`Views: ${analytics.viewCount}`);
console.log(`Exports: ${analytics.exportCount}`);
console.log(`Tailors: ${analytics.tailorCount}`);
console.log(`Shares: ${analytics.shareCount}`);
```
</details>

<details>
<summary><strong>Python (requests)</strong></summary>

```python
def get_analytics(token, resume_id):
    url = f'http://localhost:3001/api/base-resumes/{resume_id}/analytics'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(url, headers=headers)
    data = response.json()
    return data.get('analytics')

# Usage
analytics = get_analytics(token, 'resume123')
print(f"Views: {analytics['viewCount']}")
print(f"Exports: {analytics['exportCount']}")
print(f"Tailors: {analytics['tailorCount']}")
print(f"Shares: {analytics['shareCount']}")
```
</details>

<details>
<summary><strong>cURL</strong></summary>

```bash
RESUME_ID="resume123"

curl -X GET http://localhost:3001/api/base-resumes/$RESUME_ID/analytics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```
</details>

---

## Complete Example: Full Resume Workflow

<details>
<summary><strong>JavaScript (fetch)</strong></summary>

```javascript
// Complete workflow: Create, export, share, and track analytics
async function completeResumeWorkflow() {
  // 1. Login
  const token = await login('user@example.com', 'password123');
  
  // 2. Create resume
  const resume = await createResume(token, {
    name: 'My Professional Resume',
    data: { /* resume data */ }
  });
  console.log('✅ Resume created:', resume.id);
  
  // 3. Export to PDF
  await exportResume(token, resume.id, 'pdf');
  console.log('✅ Resume exported');
  
  // 4. Create share link
  const shareLink = await createShareLink(token, resume.id, {
    expiresInDays: 7,
    allowDownload: true
  });
  console.log('✅ Share link created:', shareLink.url);
  
  // 5. Check analytics
  const analytics = await getAnalytics(token, resume.id);
  console.log('✅ Analytics:', analytics);
  
  return { resume, shareLink, analytics };
}

// Run workflow
completeResumeWorkflow().catch(console.error);
```
</details>

---

## Error Handling

All API responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `NOT_FOUND` - Resource not found (404)
- `UNAUTHORIZED` - Authentication required (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `VALIDATION_ERROR` - Invalid request data (400)
- `RATE_LIMIT_EXCEEDED` - Too many requests (429)
- `INTERNAL_ERROR` - Server error (500)

---

## Support

For more examples and support:
- Documentation: http://localhost:3001/api/docs
- Swagger UI: http://localhost:3001/api/docs
- Email: support@roleready.com

