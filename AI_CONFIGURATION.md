# AI Service Configuration

The RoleReady platform now supports real AI integration with OpenAI and Anthropic (Claude).

## Features

- **Real AI Integration**: Connect to OpenAI GPT-4 or Anthropic Claude
- **Graceful Fallback**: Works without API keys using smart mock responses
- **Automatic Configuration**: Reads API keys from environment variables
- **Local Storage Support**: Can store provider preferences in browser

## Configuration

### Option 1: Environment Variables (Recommended)

Add to your `.env.local` file:

```bash
# For OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here

# OR for Anthropic Claude
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### Option 2: Browser Storage

Users can configure AI provider directly in the app:

```javascript
// Store provider in localStorage
localStorage.setItem('aiProvider', 'openai'); // or 'anthropic'
localStorage.setItem('aiApiKey', 'your-api-key-here');

// Configure the service
import { aiService } from './services/aiService';
aiService.configure({
  name: 'openai',
  apiKey: 'your-api-key-here',
  model: 'gpt-4' // optional, defaults to gpt-4
});
```

## Usage

The AI service is automatically used throughout the application:

### Resume Generation
- AI-powered summary generation
- Skills suggestion
- Experience writing
- Project descriptions

### Job Application
- ATS analysis
- Keyword suggestions
- Resume tailoring recommendations

### AI Assistant
- Conversational resume help
- Real-time suggestions
- Content improvement

## API Features

### Automatic Fallback
If no API key is configured, the service automatically uses intelligent mock responses that:
- Understand the context
- Provide realistic content
- Maintain the same user experience

### Supported Providers

1. **OpenAI** (GPT-4, GPT-3.5)
   - Excellent for general text generation
   - Fast responses
   - Good for creative content

2. **Anthropic Claude**
   - Better for structured responses
   - More thoughtful analysis
   - Great for code and technical content

## Example Usage

```typescript
import { aiService } from './services/aiService';

// Generate content
const response = await aiService.generateContent({
  prompt: "Write a professional summary for a software engineer",
  systemPrompt: "You are a professional resume writer",
  maxTokens: 200,
  temperature: 0.7
});

console.log(response.content);
// Output: Intelligent resume summary text
```

## Cost Considerations

- **OpenAI GPT-4**: ~$0.03 per 1K tokens
- **OpenAI GPT-3.5**: ~$0.002 per 1K tokens
- **Anthropic Claude**: ~$0.015 per 1K tokens

The service uses appropriate token limits to control costs:
- Summary/Short content: 150-200 tokens
- Detailed content: 300-500 tokens
- Comprehensive content: 500-800 tokens

## Security

- API keys are stored securely in environment variables
- No API keys are sent to the client
- All API calls go through your backend (recommended for production)

## Production Deployment

For production, we recommend:

1. **Server-side API calls**: Implement a backend API endpoint
2. **Rate limiting**: Limit API usage per user
3. **Caching**: Cache common responses
4. **Monitoring**: Track API usage and costs

Example backend endpoint:

```javascript
// pages/api/ai/generate.js
export default async function handler(req, res) {
  const { prompt, maxTokens } = req.body;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 500
    })
  });
  
  const data = await response.json();
  res.status(200).json({ content: data.choices[0].message.content });
}
```

## Testing Without API Key

The service works immediately without any API key - it uses intelligent fallbacks. This is perfect for:
- Development
- Testing
- Demos
- Cost-conscious users

When an API key is added, the service automatically switches to real AI responses!

