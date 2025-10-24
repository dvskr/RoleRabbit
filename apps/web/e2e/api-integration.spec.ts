import { test, expect } from '@playwright/test';

test.describe('RoleReady - API Integration Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-all-components');
    await page.waitForLoadState('networkidle');
  });

  test('should test resume API endpoints', async ({ page }) => {
    // Test GET resume endpoint
    const getResponse = await page.request.get('/api/resume');
    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData).toBeDefined();
    
    // Test POST resume endpoint
    const postResponse = await page.request.post('/api/resume', {
      data: {
        name: 'API Test Resume',
        summary: 'Test resume for API testing'
      }
    });
    expect(postResponse.status()).toBe(201);
    const postData = await postResponse.json();
    expect(postData).toBeDefined();
    expect(postData.name).toBe('API Test Resume');
    
    // Test PUT resume endpoint
    const putResponse = await page.request.put('/api/resume/1', {
      data: {
        name: 'Updated API Test Resume',
        summary: 'Updated test resume for API testing'
      }
    });
    expect(putResponse.status()).toBe(200);
    const putData = await putResponse.json();
    expect(putData).toBeDefined();
    expect(putData.name).toBe('Updated API Test Resume');
    
    // Test DELETE resume endpoint
    const deleteResponse = await page.request.delete('/api/resume/1');
    expect(deleteResponse.status()).toBe(204);
  });

  test('should test profile API endpoints', async ({ page }) => {
    // Test GET profile endpoint
    const getResponse = await page.request.get('/api/profile');
    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData).toBeDefined();
    
    // Test POST profile endpoint
    const postResponse = await page.request.post('/api/profile', {
      data: {
        name: 'API Test User',
        email: 'apitest@example.com',
        phone: '123-456-7890'
      }
    });
    expect(postResponse.status()).toBe(201);
    const postData = await postResponse.json();
    expect(postData).toBeDefined();
    expect(postData.name).toBe('API Test User');
    
    // Test PUT profile endpoint
    const putResponse = await page.request.put('/api/profile/1', {
      data: {
        name: 'Updated API Test User',
        email: 'updatedapitest@example.com',
        phone: '987-654-3210'
      }
    });
    expect(putResponse.status()).toBe(200);
    const putData = await putResponse.json();
    expect(putData).toBeDefined();
    expect(putData.name).toBe('Updated API Test User');
  });

  test('should test job tracker API endpoints', async ({ page }) => {
    // Test GET jobs endpoint
    const getResponse = await page.request.get('/api/jobs');
    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData).toBeDefined();
    
    // Test POST job endpoint
    const postResponse = await page.request.post('/api/jobs', {
      data: {
        title: 'API Test Job',
        company: 'API Test Company',
        status: 'applied'
      }
    });
    expect(postResponse.status()).toBe(201);
    const postData = await postResponse.json();
    expect(postData).toBeDefined();
    expect(postData.title).toBe('API Test Job');
    
    // Test PUT job endpoint
    const putResponse = await page.request.put('/api/jobs/1', {
      data: {
        title: 'Updated API Test Job',
        company: 'Updated API Test Company',
        status: 'interview'
      }
    });
    expect(putResponse.status()).toBe(200);
    const putData = await putResponse.json();
    expect(putData).toBeDefined();
    expect(putData.title).toBe('Updated API Test Job');
    
    // Test DELETE job endpoint
    const deleteResponse = await page.request.delete('/api/jobs/1');
    expect(deleteResponse.status()).toBe(204);
  });

  test('should test AI API endpoints', async ({ page }) => {
    // Test POST AI chat endpoint
    const chatResponse = await page.request.post('/api/ai/chat', {
      data: {
        message: 'Test AI message',
        model: 'gpt-4'
      }
    });
    expect(chatResponse.status()).toBe(200);
    const chatData = await chatResponse.json();
    expect(chatData).toBeDefined();
    expect(chatData.response).toBeDefined();
    
    // Test POST AI improve endpoint
    const improveResponse = await page.request.post('/api/ai/improve', {
      data: {
        content: 'Test resume content',
        type: 'resume'
      }
    });
    expect(improveResponse.status()).toBe(200);
    const improveData = await improveResponse.json();
    expect(improveData).toBeDefined();
    expect(improveData.improved_content).toBeDefined();
    
    // Test POST AI generate endpoint
    const generateResponse = await page.request.post('/api/ai/generate', {
      data: {
        prompt: 'Generate a cover letter',
        type: 'cover-letter'
      }
    });
    expect(generateResponse.status()).toBe(200);
    const generateData = await generateResponse.json();
    expect(generateData).toBeDefined();
    expect(generateData.generated_content).toBeDefined();
  });

  test('should test file upload API endpoints', async ({ page }) => {
    // Test POST file upload endpoint
    const uploadResponse = await page.request.post('/api/upload', {
      multipart: {
        file: new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      }
    });
    expect(uploadResponse.status()).toBe(200);
    const uploadData = await uploadResponse.json();
    expect(uploadData).toBeDefined();
    expect(uploadData.file_id).toBeDefined();
    
    // Test GET file endpoint
    const getResponse = await page.request.get(`/api/files/${uploadData.file_id}`);
    expect(getResponse.status()).toBe(200);
    
    // Test DELETE file endpoint
    const deleteResponse = await page.request.delete(`/api/files/${uploadData.file_id}`);
    expect(deleteResponse.status()).toBe(204);
  });

  test('should test email API endpoints', async ({ page }) => {
    // Test POST email send endpoint
    const sendResponse = await page.request.post('/api/email/send', {
      data: {
        to: 'test@example.com',
        subject: 'API Test Email',
        body: 'Test email for API testing'
      }
    });
    expect(sendResponse.status()).toBe(200);
    const sendData = await sendResponse.json();
    expect(sendData).toBeDefined();
    expect(sendData.message_id).toBeDefined();
    
    // Test GET emails endpoint
    const getResponse = await page.request.get('/api/emails');
    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData).toBeDefined();
    
    // Test GET email endpoint
    const getEmailResponse = await page.request.get(`/api/emails/${sendData.message_id}`);
    expect(getEmailResponse.status()).toBe(200);
    const getEmailData = await getEmailResponse.json();
    expect(getEmailData).toBeDefined();
  });

  test('should test discussion API endpoints', async ({ page }) => {
    // Test GET posts endpoint
    const getResponse = await page.request.get('/api/discussion/posts');
    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData).toBeDefined();
    
    // Test POST post endpoint
    const postResponse = await page.request.post('/api/discussion/posts', {
      data: {
        title: 'API Test Post',
        content: 'Test post for API testing',
        category: 'general'
      }
    });
    expect(postResponse.status()).toBe(201);
    const postData = await postResponse.json();
    expect(postData).toBeDefined();
    expect(postData.title).toBe('API Test Post');
    
    // Test POST comment endpoint
    const commentResponse = await page.request.post('/api/discussion/posts/1/comments', {
      data: {
        content: 'Test comment for API testing'
      }
    });
    expect(commentResponse.status()).toBe(201);
    const commentData = await commentResponse.json();
    expect(commentData).toBeDefined();
    expect(commentData.content).toBe('Test comment for API testing');
  });

  test('should test cover letter API endpoints', async ({ page }) => {
    // Test POST cover letter generate endpoint
    const generateResponse = await page.request.post('/api/cover-letter/generate', {
      data: {
        job_description: 'Software Developer position',
        company_name: 'API Test Company',
        resume_content: 'Test resume content'
      }
    });
    expect(generateResponse.status()).toBe(200);
    const generateData = await generateResponse.json();
    expect(generateData).toBeDefined();
    expect(generateData.cover_letter).toBeDefined();
    
    // Test GET cover letters endpoint
    const getResponse = await page.request.get('/api/cover-letters');
    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData).toBeDefined();
    
    // Test PUT cover letter endpoint
    const putResponse = await page.request.put('/api/cover-letters/1', {
      data: {
        cover_letter: 'Updated cover letter content'
      }
    });
    expect(putResponse.status()).toBe(200);
    const putData = await putResponse.json();
    expect(putData).toBeDefined();
    expect(putData.cover_letter).toBe('Updated cover letter content');
  });

  test('should test templates API endpoints', async ({ page }) => {
    // Test GET templates endpoint
    const getResponse = await page.request.get('/api/templates');
    expect(getResponse.status()).toBe(200);
    const getData = await getResponse.json();
    expect(getData).toBeDefined();
    
    // Test GET template endpoint
    const getTemplateResponse = await page.request.get('/api/templates/1');
    expect(getTemplateResponse.status()).toBe(200);
    const getTemplateData = await getTemplateResponse.json();
    expect(getTemplateData).toBeDefined();
    
    // Test POST template endpoint
    const postResponse = await page.request.post('/api/templates', {
      data: {
        name: 'API Test Template',
        content: 'Test template content',
        category: 'resume'
      }
    });
    expect(postResponse.status()).toBe(201);
    const postData = await postResponse.json();
    expect(postData).toBeDefined();
    expect(postData.name).toBe('API Test Template');
  });

  test('should test authentication API endpoints', async ({ page }) => {
    // Test POST login endpoint
    const loginResponse = await page.request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData).toBeDefined();
    expect(loginData.token).toBeDefined();
    
    // Test POST register endpoint
    const registerResponse = await page.request.post('/api/auth/register', {
      data: {
        name: 'API Test User',
        email: 'apitest@example.com',
        password: 'password123'
      }
    });
    expect(registerResponse.status()).toBe(201);
    const registerData = await registerResponse.json();
    expect(registerData).toBeDefined();
    expect(registerData.user).toBeDefined();
    
    // Test POST logout endpoint
    const logoutResponse = await page.request.post('/api/auth/logout', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    expect(logoutResponse.status()).toBe(200);
  });

  test('should test error handling API endpoints', async ({ page }) => {
    // Test 404 error
    const notFoundResponse = await page.request.get('/api/nonexistent');
    expect(notFoundResponse.status()).toBe(404);
    
    // Test 400 error
    const badRequestResponse = await page.request.post('/api/resume', {
      data: {
        invalid_field: 'invalid value'
      }
    });
    expect(badRequestResponse.status()).toBe(400);
    
    // Test 401 error
    const unauthorizedResponse = await page.request.get('/api/profile');
    expect(unauthorizedResponse.status()).toBe(401);
    
    // Test 403 error
    const forbiddenResponse = await page.request.get('/api/admin');
    expect(forbiddenResponse.status()).toBe(403);
    
    // Test 500 error
    const serverErrorResponse = await page.request.get('/api/error');
    expect(serverErrorResponse.status()).toBe(500);
  });

  test('should test rate limiting API endpoints', async ({ page }) => {
    // Test rate limiting
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(page.request.get('/api/resume'));
    }
    
    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(response => response.status() === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test('should test API versioning', async ({ page }) => {
    // Test v1 API
    const v1Response = await page.request.get('/api/v1/resume');
    expect(v1Response.status()).toBe(200);
    
    // Test v2 API
    const v2Response = await page.request.get('/api/v2/resume');
    expect(v2Response.status()).toBe(200);
    
    // Test default API
    const defaultResponse = await page.request.get('/api/resume');
    expect(defaultResponse.status()).toBe(200);
  });

  test('should test API pagination', async ({ page }) => {
    // Test pagination
    const page1Response = await page.request.get('/api/resume?page=1&limit=10');
    expect(page1Response.status()).toBe(200);
    const page1Data = await page1Response.json();
    expect(page1Data).toBeDefined();
    expect(page1Data.page).toBe(1);
    expect(page1Data.limit).toBe(10);
    
    // Test next page
    const page2Response = await page.request.get('/api/resume?page=2&limit=10');
    expect(page2Response.status()).toBe(200);
    const page2Data = await page2Response.json();
    expect(page2Data).toBeDefined();
    expect(page2Data.page).toBe(2);
  });

  test('should test API filtering', async ({ page }) => {
    // Test filtering
    const filteredResponse = await page.request.get('/api/jobs?status=applied');
    expect(filteredResponse.status()).toBe(200);
    const filteredData = await filteredResponse.json();
    expect(filteredData).toBeDefined();
    
    // Test multiple filters
    const multiFilterResponse = await page.request.get('/api/jobs?status=applied&company=Test Company');
    expect(multiFilterResponse.status()).toBe(200);
    const multiFilterData = await multiFilterResponse.json();
    expect(multiFilterData).toBeDefined();
  });

  test('should test API sorting', async ({ page }) => {
    // Test sorting
    const sortedResponse = await page.request.get('/api/jobs?sort=date&order=desc');
    expect(sortedResponse.status()).toBe(200);
    const sortedData = await sortedResponse.json();
    expect(sortedData).toBeDefined();
    
    // Test multiple sorts
    const multiSortResponse = await page.request.get('/api/jobs?sort=date,company&order=desc,asc');
    expect(multiSortResponse.status()).toBe(200);
    const multiSortData = await multiSortResponse.json();
    expect(multiSortData).toBeDefined();
  });

  test('should test API search', async ({ page }) => {
    // Test search
    const searchResponse = await page.request.get('/api/resume?search=software');
    expect(searchResponse.status()).toBe(200);
    const searchData = await searchResponse.json();
    expect(searchData).toBeDefined();
    
    // Test advanced search
    const advancedSearchResponse = await page.request.get('/api/resume?search=software developer&fields=title,summary');
    expect(advancedSearchResponse.status()).toBe(200);
    const advancedSearchData = await advancedSearchResponse.json();
    expect(advancedSearchData).toBeDefined();
  });

  test('should test API caching', async ({ page }) => {
    // Test caching
    const firstResponse = await page.request.get('/api/resume');
    expect(firstResponse.status()).toBe(200);
    const firstData = await firstResponse.json();
    
    const secondResponse = await page.request.get('/api/resume');
    expect(secondResponse.status()).toBe(200);
    const secondData = await secondResponse.json();
    
    expect(firstData).toEqual(secondData);
  });

  test('should test API compression', async ({ page }) => {
    // Test compression
    const response = await page.request.get('/api/resume', {
      headers: {
        'Accept-Encoding': 'gzip, deflate'
      }
    });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-encoding']).toBeDefined();
  });

  test('should test API CORS', async ({ page }) => {
    // Test CORS
    const response = await page.request.get('/api/resume', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBeDefined();
  });
});