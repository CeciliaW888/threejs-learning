# Day 20: Deployment & Production Best Practices

[← Previous: Day 19 - Advanced Prompting](./day-19-brief.md) | [Course Home](../README.md) | [Next: Day 21 - Final Project →](./day-21-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Deploy your Three.js + AI app to Vercel or Netlify
2. Set up environment variables securely in production
3. Implement error tracking and monitoring
4. Optimize build size and loading performance
5. Add analytics to track usage

**Difficulty:** 🟡 Intermediate  
**Estimated Time:** 1 hour (20 min reading + 40 min hands-on)

---

## 📚 Core Concepts

### Production vs Development

**Development:**
- API keys in `.env.local`
- Hot reload, verbose logging
- Unminified code
- No caching

**Production:**
- Secure environment variables
- Optimized builds, minimal logging
- Minified, tree-shaken code
- Aggressive caching

### Deployment Platforms

**Vercel (Recommended for this project)**
- Zero-config deployment for Vite projects
- Built-in serverless functions (for API proxying)
- Automatic HTTPS
- Global CDN
- Free tier: Generous limits

**Netlify (Alternative)**
- Similar features to Vercel
- Great for static sites + serverless functions
- Easy custom domain setup

**Self-Hosted (Advanced)**
- Full control, more complex
- Need to manage SSL, scaling, monitoring

### Environment Variables in Production

**Never commit API keys to git!**

```bash
# .env.local (development, git-ignored)
VITE_CLAUDE_API_KEY=sk-ant-api03-xxx

# Production: Set in hosting platform dashboard
# Vercel: Project Settings → Environment Variables
# Netlify: Site Settings → Build & Deploy → Environment
```

For Vite projects, prefix with `VITE_` to expose to client:
```javascript
const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
```

**Best Practice:** Use serverless functions to hide API keys:
```javascript
// api/generate.js (Vercel function)
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
    const anthropic = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY // Server-side only
    });
    
    const { prompt } = req.body;
    
    // Call Claude, return result
    const response = await anthropic.messages.create({...});
    res.json({ scene: response.content[0].text });
}
```

### Build Optimization

```javascript
// vite.config.js
export default {
    build: {
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                    vendor: ['@anthropic-ai/sdk']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
};
```

### Error Monitoring

Use Sentry for production error tracking:

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
    dsn: "https://xxx@sentry.io/xxx",
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
});

// Catch errors
try {
    await generateScene(prompt);
} catch (error) {
    Sentry.captureException(error);
    throw error;
}
```

> **Key Insight:** Production deployment is about security, performance, and reliability. You want fast load times, no exposed secrets, and visibility into errors when they happen.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Environment Variables** | Config values that change per environment | API keys, feature flags |
| **Serverless Function** | Backend code that runs on-demand | API proxy, auth |
| **Tree Shaking** | Removing unused code from build | Reduce bundle size |
| **Code Splitting** | Breaking bundle into smaller chunks | Lazy load routes |
| **CDN** | Content Delivery Network | Vercel Edge Network |
| **Error Tracking** | Monitoring production errors | Sentry, LogRocket |

---

## 💻 Code Examples

### Example 1: Vercel Deployment Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# Follow prompts:
# - Link to existing project? N
# - What's your project's name? my-3d-portfolio
# - In which directory is your code located? ./
# - Want to override settings? N

# Deploy to production
vercel --prod
```

**vercel.json** (optional config):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "regions": ["sfo1"],
  "env": {
    "VITE_APP_NAME": "3D AI Portfolio"
  }
}
```

**What's happening:** Vercel auto-detects Vite projects and deploys them. It builds your app, serves it globally via CDN, and provides a `.vercel.app` domain.

### Example 2: Serverless API Proxy

```javascript
// api/generate-scene.js (Vercel serverless function)
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY // Server-side only, not exposed to client
});

const SYSTEM_PROMPT = `[Your system prompt here]`;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, messages = [] } = req.body;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            temperature: 0.3,
            system: SYSTEM_PROMPT,
            messages: [
                ...messages,
                { role: 'user', content: prompt }
            ]
        });

        const sceneJSON = response.content[0].text;

        res.status(200).json({
            success: true,
            scene: JSON.parse(sceneJSON),
            usage: {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens
            }
        });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

**Client-side call:**
```javascript
// In your browser code
async function generateScene(prompt) {
    const response = await fetch('/api/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    
    const data = await response.json();
    return data.scene;
}
```

**What's happening:** The API key stays on the server. The browser sends prompts to your serverless function, which forwards them to Claude. This is production-safe.

### Example 3: Production Build Optimization

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    build: {
        minify: 'terser',
        sourcemap: false, // Disable in production
        rollupOptions: {
            output: {
                manualChunks: {
                    'three': ['three'],
                    'three-addons': [
                        'three/examples/jsm/controls/OrbitControls.js',
                        'three/examples/jsm/loaders/GLTFLoader.js'
                    ],
                    'vendor': ['@anthropic-ai/sdk']
                }
            }
        }
    },
    plugins: [
        visualizer({ // Analyze bundle size
            open: true,
            gzipSize: true,
            filename: 'dist/stats.html'
        })
    ]
});
```

**What's happening:** We split code into logical chunks: Three.js core, Three.js addons, and vendor libs. This enables better caching. The visualizer plugin shows you what's taking up space in your bundle.

---

## ✏️ Hands-On Exercises

### Exercise 1: Deploy to Vercel (⏱️ ~20 min)

**Goal:** Get your app live on the internet

**Instructions:**
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Run `vercel` in your project directory
4. Follow prompts to deploy
5. Test the deployed URL — verify Three.js scene loads
6. Make a change, redeploy: `vercel --prod`

**Expected Output:**
Live URL (e.g., `https://my-portfolio.vercel.app`) with working 3D scenes.

---

### Exercise 2: Secure API Keys (⏱️ ~15 min)

**Goal:** Move API key to serverless function

**Instructions:**
1. Create `api/generate-scene.js` from Example 2
2. Remove `VITE_CLAUDE_API_KEY` from client code
3. Update client to call `/api/generate-scene` instead of Claude directly
4. Set `CLAUDE_API_KEY` in Vercel dashboard (no `VITE_` prefix!)
5. Test: generate a scene from production URL

**Expected Output:**
API key hidden from client, scenes still generate.

---

### Exercise 3: Performance Audit (⏱️ ~15 min)

**Goal:** Measure and optimize production performance

**Instructions:**
1. Open production URL in Chrome DevTools
2. Run Lighthouse audit (Performance tab)
3. Note: First Contentful Paint, Time to Interactive, bundle size
4. Implement code splitting from Example 3
5. Rebuild, redeploy, re-audit
6. Document before/after metrics

**Expected Output:**
Measurable performance improvement (target: >90 Lighthouse score).

---

## 📖 Curated Resources

### Must-Read

1. **Vite Production Build** — Vite Documentation
   - 🔗 https://vitejs.dev/guide/build.html
   - Why: Official guide to optimizing Vite builds

2. **Vercel Deployment Guide** — Vercel Docs
   - 🔗 https://vercel.com/docs/deployments/overview
   - Why: Comprehensive deployment documentation

### Video Resources

3. **How to Deploy Three.js Projects** — Freddy Minn
   - 🎥 https://www.youtube.com/watch?v=qyZ48DAajE0
   - Why: Step-by-step Three.js deployment to Vercel

4. **Using Vite to Create a Three.js Project (+ Deploy on Netlify)** — Frederik De Bleser
   - 🎥 https://www.youtube.com/watch?v=2x9AuM6xpxg
   - Why: Alternative deployment to Netlify

---

## 🤔 Reflection Questions

1. **Comprehension:** Why is a serverless function better than exposing API keys in client code?

2. **Application:** How would you add a custom domain to your deployed portfolio?

3. **Connection:** How does code splitting relate to the performance optimization from Day 11?

4. **Critical Thinking:** What's the security risk of CORS set to `*`? How would you restrict it?

5. **Personal:** What's the URL of your deployed portfolio? Share it!

---

## ➡️ Next Steps

**Tomorrow:** [Day 21: Final Project — AI Portfolio Generator](./day-21-brief.md) — Build the complete portfolio experience

You've deployed your app! Tomorrow is the grand finale: combining everything into a complete AI-powered portfolio generator.

**Before moving on, make sure you can:**
- [ ] Deploy your app to Vercel or Netlify
- [ ] Set environment variables securely
- [ ] Use serverless functions to hide API keys
- [ ] Optimize build size and performance
- [ ] Monitor production errors

[← Previous: Day 19 - Advanced Prompting](./day-19-brief.md) | [Course Home](../README.md) | [Next: Day 21 - Final Project →](./day-21-brief.md)
