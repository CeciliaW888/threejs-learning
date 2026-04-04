# Day 15: Introduction to LLM APIs (Claude & OpenAI)

[← Previous: Day 14 - Prompt-Driven Scene Generator](./day-14-brief.md) | [Course Home](../README.md) | [Next: Day 16 - Building a Text-to-3D Pipeline →](./day-16-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Understand how to interact with Claude and OpenAI APIs
2. Make your first API call to generate structured JSON output
3. Handle API responses, errors, and rate limits
4. Implement API key management and security best practices
5. Use structured outputs to ensure reliable JSON parsing

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1 hour (30 min reading + 30 min hands-on)

---

## 📚 Core Concepts

### From Manual Prompting to Automated API Calls

Think of LLM APIs like ordering from a restaurant. In Week 2, you manually typed prompts into ChatGPT or Claude (like calling the restaurant and placing an order). Now we're building a system that places orders automatically (API calls) and gets predictable responses (structured outputs).

The key difference: **reliability**. Manual copy-paste breaks at scale. API calls let you:
- Generate scenes in real-time as users type
- Handle thousands of requests per day
- Parse responses programmatically (no manual intervention)
- Integrate with your Three.js application seamlessly

### Two Main Players: Claude & OpenAI

**Anthropic Claude:**
- Models: claude-3-5-sonnet-20241022, claude-3-opus-20240229
- Strengths: Excellent instruction-following, great at structured outputs
- Pricing: $3/million input tokens, $15/million output tokens (Sonnet)
- Best for: Complex scene descriptions, creative variations

**OpenAI GPT:**
- Models: gpt-4o, gpt-4o-mini
- Strengths: Fast, cheaper mini model, strong JSON mode
- Pricing: $5/million input tokens, $15/million output tokens (GPT-4o)
- Best for: High-volume requests, simpler transformations

For this course, we'll focus on **Claude API** for its superior instruction-following and then show OpenAI as an alternative.

### Anatomy of an API Request

Every API call has three parts:

**1. Headers** - Authentication and metadata
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_API_KEY', // For Claude
  'anthropic-version': '2023-06-01'
}
```

**2. Body** - Your instructions
```javascript
{
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: 'Generate a 3D scene based on: "cyberpunk office"'
  }]
}
```

**3. Response** - The AI's output
```javascript
{
  content: [{
    type: 'text',
    text: '{"scene": "office", "style": "cyberpunk", ...}'
  }],
  usage: { input_tokens: 50, output_tokens: 120 }
}
```

### Structured Outputs: The Secret to Reliable JSON

The #1 problem with AI-generated content: **unpredictable formatting**. Sometimes you get JSON, sometimes you get markdown, sometimes you get explanation text wrapped around JSON.

**Solution:** Force structured outputs using system prompts:

```javascript
const systemPrompt = `You are a 3D scene generator. 
Output ONLY valid JSON matching this schema:
{
  "objects": [{ "type": string, "position": [x,y,z], "color": string }],
  "lighting": { "type": string, "intensity": number },
  "camera": { "position": [x,y,z], "lookAt": [x,y,z] }
}

No explanations. No markdown. Only JSON.`;
```

> **Key Insight:** System prompts set behavior rules. User prompts provide specific requests. Together, they ensure you get parseable JSON every time.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **API Key** | Secret credential that authenticates your requests | `sk-ant-api03-xxx` (Claude) or `sk-proj-xxx` (OpenAI) |
| **Token** | Unit of text processed by LLMs (~4 chars = 1 token) | "Hello world" ≈ 2 tokens |
| **System Prompt** | Instructions that define the AI's role and output format | "You are a JSON generator. Output only valid JSON." |
| **Structured Output** | Forcing the AI to return data in a specific format (like JSON schema) | Schema-enforced JSON responses |
| **Rate Limit** | Maximum number of requests per minute/hour | Anthropic: 50 requests/min (free tier) |
| **Streaming** | Receiving API responses incrementally (like ChatGPT's typing effect) | Real-time token-by-token output |

---

## 💻 Code Examples

### Example 1: Your First Claude API Call

```javascript
// first-api-call.js
// Purpose: Make a simple Claude API call and get JSON back

// 1. Install the SDK (run this in terminal first):
// npm install @anthropic-ai/sdk

import Anthropic from '@anthropic-ai/sdk';

// 2. Initialize the client with your API key
// Get your key from: https://console.anthropic.com/settings/keys
const anthropic = new Anthropic({
  apiKey: 'YOUR_API_KEY_HERE' // ⚠️ In production, use environment variables!
});

// 3. Define what you want
const userPrompt = "A cozy reading nook with warm lighting";

// 4. System prompt forces JSON output
const systemPrompt = `You are a 3D scene generator. Output ONLY valid JSON with this structure:
{
  "objects": [{"type": "chair", "position": [0,0,0], "color": "#8B4513"}],
  "lights": [{"type": "point", "position": [2,3,2], "intensity": 0.8, "color": "#FFE4B5"}],
  "camera": {"position": [0,2,5], "lookAt": [0,0,0]}
}
No explanations. Just JSON.`;

// 5. Make the API call
async function generateScene() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt, // ← Forces structured output
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });
    
    // 6. Extract and parse the JSON
    const jsonText = message.content[0].text;
    const sceneData = JSON.parse(jsonText);
    
    console.log('✅ Generated scene:', sceneData);
    console.log('📊 Tokens used:', message.usage);
    
    return sceneData;
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    throw error;
  }
}

// 7. Run it
generateScene();

// Expected output:
// ✅ Generated scene: { objects: [...], lights: [...], camera: {...} }
// 📊 Tokens used: { input_tokens: 150, output_tokens: 95 }
```

**What's happening:** We send a user description + strict JSON schema, Claude responds with parseable JSON, we parse it and use it in Three.js.

### Example 2: Error Handling & Rate Limits

```javascript
// robust-api-client.js
// Purpose: Handle real-world API issues (rate limits, timeouts, parsing errors)

import Anthropic from '@anthropic-ai/sdk';

class SceneGeneratorAPI {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
  }
  
  // Rate limit: max 50 requests per minute (free tier)
  async waitIfNeeded() {
    this.requestCount++;
    
    if (this.requestCount >= 50) {
      const elapsed = Date.now() - this.lastRequestTime;
      if (elapsed < 60000) { // Less than 1 minute
        const waitTime = 60000 - elapsed;
        console.log(`⏳ Rate limit: waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }
  }
  
  async generateScene(userPrompt, options = {}) {
    await this.waitIfNeeded();
    
    try {
      const message = await this.client.messages.create({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7, // 0 = deterministic, 1 = creative
        system: this.getSystemPrompt(),
        messages: [{ role: 'user', content: userPrompt }]
      });
      
      const jsonText = message.content[0].text;
      
      // Validate JSON before parsing
      if (!jsonText.trim().startsWith('{')) {
        throw new Error('Response is not JSON');
      }
      
      const sceneData = JSON.parse(jsonText);
      
      // Validate schema
      if (!sceneData.objects || !sceneData.lights || !sceneData.camera) {
        throw new Error('Invalid scene schema');
      }
      
      return {
        success: true,
        data: sceneData,
        usage: message.usage
      };
      
    } catch (error) {
      // Handle different error types
      if (error.status === 429) {
        return { success: false, error: 'Rate limit exceeded. Try again in 1 minute.' };
      } else if (error.status === 401) {
        return { success: false, error: 'Invalid API key. Check your credentials.' };
      } else if (error instanceof SyntaxError) {
        return { success: false, error: 'AI returned invalid JSON. Try rephrasing your prompt.' };
      } else {
        return { success: false, error: `API Error: ${error.message}` };
      }
    }
  }
  
  getSystemPrompt() {
    return `You are a 3D scene generator for Three.js. Output ONLY valid JSON.
Schema:
{
  "objects": [{"type": string, "position": [x,y,z], "color": string, "scale": [x,y,z]}],
  "lights": [{"type": "ambient"|"directional"|"point", "position": [x,y,z], "intensity": 0-1, "color": string}],
  "camera": {"position": [x,y,z], "lookAt": [x,y,z]}
}
No markdown. No explanations. Only JSON.`;
  }
}

// Usage
const api = new SceneGeneratorAPI('YOUR_API_KEY');
const result = await api.generateScene("A minimalist office with clean lines");

if (result.success) {
  console.log('Scene:', result.data);
  console.log('Cost:', result.usage.input_tokens * 0.003 / 1000); // ~$0.003 per 1K tokens
} else {
  console.error('Error:', result.error);
}
```

**What's happening:** We wrap the API with error handling, rate limiting, and JSON validation. This is production-ready code.

> **💡 Try it:** Add a retry mechanism - if the first call fails, try again with a simplified prompt.

---

## ✏️ Hands-On Exercises

### Exercise 1: Get Your API Key (⏱️ ~10 min)

**Goal:** Set up your Claude API account and make your first authenticated call

**Instructions:**
1. Go to https://console.anthropic.com/
2. Sign up (free tier includes $5 credit)
3. Navigate to Settings → API Keys
4. Click "Create Key" → copy it
5. **Store it safely:** Create a `.env` file:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```
6. Install dependencies:
   ```bash
   npm install @anthropic-ai/sdk dotenv
   ```
7. Modify Example 1 to load from `.env`:
   ```javascript
   import 'dotenv/config';
   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY
   });
   ```

**Expected Output:**
```
✅ Generated scene: { objects: [...], lights: [...] }
```

---

### Exercise 2: Compare Claude vs OpenAI (⏱️ ~20 min)

**Goal:** Make the same request to both APIs and compare outputs

**Instructions:**
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Install OpenAI SDK: `npm install openai`
3. Create a comparison script:

```javascript
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const prompt = "A futuristic spaceship interior";

// Claude version
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const claudeResponse = await claude.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }]
});

// OpenAI version
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openaiResponse = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  response_format: { type: 'json_object' } // Forces JSON output
});

console.log('Claude:', JSON.parse(claudeResponse.content[0].text));
console.log('OpenAI:', JSON.parse(openaiResponse.choices[0].message.content));
```

**Compare:**
- Which gives more creative results?
- Which is faster?
- Which is cheaper? (Claude Sonnet: $3/M input, OpenAI GPT-4o: $5/M input)

---

### Exercise 3: Build a Simple Web Interface (⏱️ ~30 min)

**Goal:** Create a web page that generates scenes via API

**Instructions:**
1. Create `index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>AI Scene Generator</title>
</head>
<body>
  <h1>AI 3D Scene Generator</h1>
  <textarea id="prompt" placeholder="Describe a scene..."></textarea>
  <button onclick="generate()">Generate Scene</button>
  <pre id="output"></pre>
  
  <script type="module">
    import Anthropic from 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.20.0/+esm';
    
    window.generate = async function() {
      const prompt = document.getElementById('prompt').value;
      const output = document.getElementById('output');
      
      output.textContent = '⏳ Generating...';
      
      // ⚠️ DON'T expose API keys in frontend! This is for learning only.
      // In production, use a backend proxy (we'll cover this on Day 20)
      const client = new Anthropic({
        apiKey: 'YOUR_KEY_HERE',
        dangerouslyAllowBrowser: true
      });
      
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });
      
      output.textContent = message.content[0].text;
    };
  </script>
</body>
</html>
```

2. Open in browser and test
3. **Stretch Goal:** Add loading animation, error handling, and JSON pretty-printing

---

## 📖 Curated Resources

### Must-Read

1. **Anthropic API Documentation** — Anthropic
   - 🔗 https://docs.anthropic.com/en/api/getting-started (Getting Started section, ~10 min)
   - Why: Official docs with request/response examples

2. **OpenAI API Quickstart** — OpenAI
   - 🔗 https://platform.openai.com/docs/quickstart (Quickstart section, ~15 min)
   - Why: Understand the alternative API structure

3. **JSON Schema for Structured Outputs** — JSON Schema
   - 🔗 https://json-schema.org/learn/getting-started-step-by-step (~20 min)
   - Why: Learn how to define strict schemas for reliable AI outputs

### Video Resources

4. **Anthropic API Tutorial** — Fireship
   - 🎥 https://www.youtube.com/watch?v=_rT3fM2DL7Y (6:30, entire video)
   - Why: Quick visual walkthrough of Claude API basics

5. **OpenAI Function Calling Tutorial** — Dave Ebbelaar
   - 🎥 https://www.youtube.com/watch?v=aqdWSYWC_LI (14:25, 0:00-8:00 for basics)
   - Why: Shows structured outputs with OpenAI's function calling

---

## 🤔 Reflection Questions

1. **Comprehension:** Why do we use system prompts to force JSON output instead of relying on the AI to "figure it out"?
   - *Think about: What happens when you need to parse 1000 responses per day*

2. **Application:** If you were building a production app, would you expose your API key in frontend JavaScript? Why or why not?
   - *Think about: What happens if someone views your page source*

3. **Connection:** How does structured output from APIs compare to the manual prompt testing we did in Week 2?
   - *Think about: Reliability vs flexibility*

4. **Critical Thinking:** Claude costs $3/M input tokens, OpenAI costs $5/M. But OpenAI has GPT-4o-mini at $0.15/M. When would you choose each?
   - *Think about: Quality vs cost tradeoffs*

5. **Personal:** What's one scene description you're excited to generate programmatically?

---

## ➡️ Next Steps

**Tomorrow:** Day 16 - Building a Text-to-3D Pipeline — We'll connect today's API knowledge with Three.js rendering. You'll build a function that takes a text prompt, calls Claude, parses the JSON, and renders a 3D scene automatically.

Now that you can make API calls and get structured JSON, tomorrow we'll build the full pipeline: user types → API generates scene data → Three.js renders it. By the end of Day 16, you'll have a working text-to-3D system!

**Before moving on, make sure you can:**
- [ ] Make authenticated API calls to Claude or OpenAI
- [ ] Get structured JSON responses using system prompts
- [ ] Handle errors and rate limits gracefully
- [ ] Store API keys securely in environment variables

[← Previous: Day 14 - Prompt-Driven Scene Generator](./day-14-brief.md) | [Course Home](../README.md) | [Next: Day 16 - Building a Text-to-3D Pipeline →](./day-16-brief.md)
