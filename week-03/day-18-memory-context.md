# Day 18: Adding Memory & Context to AI Agent

[← Previous: Day 17 - Real-Time Scene Modifications](./day-17-brief.md) | [Course Home](../README.md) | [Next: Day 19 - Advanced Prompting Techniques →](./day-19-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Implement conversation memory (multi-turn context)
2. Store user preferences and style guidelines
3. Use localStorage for persistent memory across sessions
4. Build a "portfolio profile" that the AI learns from
5. Optimize memory management (what to keep vs. discard)

**Difficulty:** 🟡 Intermediate  
**Estimated Time:** 1 hour (30 min reading + 30 min hands-on)

---

## 📚 Core Concepts

### Why Memory Matters

Without memory, every AI request is independent. The AI doesn't know:
- What you built earlier in the session
- Your preferred color schemes or styles
- That you're building a developer portfolio (not a game or art project)
- Past feedback ("I like minimal designs")

With memory, the AI becomes a collaborative partner that learns your preferences.

### Types of Memory

**1. Short-Term Memory (Session)**
Current conversation history — lasts until page reload.

```javascript
const messages = [
    { role: 'user', content: 'Create a workspace' },
    { role: 'assistant', content: '{"objects": [...]}' },
    { role: 'user', content: 'Add a lamp' },
    // AI sees full history
];
```

**2. Long-Term Memory (Persistent)**
User preferences stored in localStorage — survives page reloads.

```javascript
const userProfile = {
    preferredStyle: 'minimal',
    colorScheme: 'dark',
    industryKeywords: ['software', 'AI', 'web development'],
    pastProjects: [...],
};
```

**3. Working Memory (Scene State)**
Current scene + recent modifications — what's on screen now.

### Conversation History Format

Claude and OpenAI APIs use a messages array:

```javascript
const messages = [
    { role: 'user', content: 'Create a tech workspace' },
    { role: 'assistant', content: '{"objects":[...]}' },
    { role: 'user', content: 'Make it more colorful' },
    { role: 'assistant', content: '{"objects":[...]}' },
];

// Send to API
const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    system: systemPrompt,
    messages: messages  // Full conversation history
});
```

The AI uses the full history to understand context for the latest request.

### Memory Management Strategy

You can't send infinite history (API has token limits). Strategy:

1. **System prompt** — 500 tokens (always included)
2. **User profile** — 200 tokens (always included)
3. **Recent messages** — Last 5-10 turns (~2000 tokens)
4. **Current scene state** — 500 tokens

Total: ~3200 tokens input, leaving room for 4096 token output.

### Building a Portfolio Profile

Instead of generic prompts, inject context about the user:

```javascript
const portfolioProfile = {
    role: 'Web Developer',
    specialties: ['Three.js', 'React', 'AI Integration'],
    style: 'Clean, modern, slightly futuristic',
    colorPreferences: 'Blues and purples with dark backgrounds',
    projects: [
        { name: 'AI Chat App', tech: 'Claude API, React' },
        { name: '3D Product Configurator', tech: 'Three.js' }
    ]
};

const enhancedSystemPrompt = `${baseSystemPrompt}

USER PORTFOLIO PROFILE:
${JSON.stringify(portfolioProfile, null, 2)}

When generating scenes, reflect this user's style and focus on showcasing their specialties.`;
```

> **Key Insight:** AI with memory feels intelligent. It remembers your corrections, learns your taste, and produces consistently better results over time.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Conversation History** | Array of user/assistant message pairs | `[{role, content}, ...]` |
| **System Prompt** | Persistent AI instructions | Always first in request |
| **User Profile** | Stored preferences and context | Portfolio style, colors |
| **Token Window** | Max context size for API | Claude: 200K tokens |
| **localStorage** | Browser persistent storage | Survives page reloads |
| **Session State** | Temporary in-memory data | Cleared on reload |

---

## 💻 Code Examples

### Example 1: Conversation Manager

```javascript
// conversationManager.js
export class ConversationManager {
    constructor(maxMessages = 10) {
        this.messages = [];
        this.maxMessages = maxMessages;
        this.systemPrompt = '';
        this.userProfile = null;
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    setUserProfile(profile) {
        this.userProfile = profile;
    }

    addMessage(role, content) {
        this.messages.push({ role, content });
        
        // Keep only recent messages to stay within token limits
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }
    }

    getMessages() {
        return [...this.messages];
    }

    clear() {
        this.messages = [];
    }

    // Build enhanced system prompt with user profile
    getEnhancedSystemPrompt() {
        let enhanced = this.systemPrompt;
        
        if (this.userProfile) {
            enhanced += `\n\nUSER PORTFOLIO PROFILE:\n${JSON.stringify(this.userProfile, null, 2)}`;
            enhanced += '\n\nGenerate scenes that reflect this user\'s style and showcase their skills.';
        }
        
        return enhanced;
    }

    // Prepare API call payload
    getAPIPayload() {
        return {
            system: this.getEnhancedSystemPrompt(),
            messages: this.getMessages()
        };
    }
}
```

**What's happening:** This class manages conversation state. It maintains a rolling window of recent messages, injects the user profile into the system prompt, and prepares payloads for API calls.

### Example 2: Persistent User Profile

```javascript
// userProfile.js
const PROFILE_KEY = 'portfolio_ai_profile';

export function saveProfile(profile) {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        console.log('Profile saved');
    } catch (e) {
        console.error('Failed to save profile:', e);
    }
}

export function loadProfile() {
    try {
        const stored = localStorage.getItem(PROFILE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error('Failed to load profile:', e);
        return null;
    }
}

export function createDefaultProfile() {
    return {
        role: '',
        specialties: [],
        style: 'modern and clean',
        colorScheme: 'dark with accents',
        projects: [],
        preferences: {
            lighting: 'realistic with shadows',
            complexity: 'moderate',
            theme: 'professional'
        }
    };
}

// UI for editing profile
export function showProfileEditor() {
    const profile = loadProfile() || createDefaultProfile();
    
    const form = document.createElement('div');
    form.innerHTML = `
        <div class="profile-editor">
            <h3>Your Portfolio Profile</h3>
            <label>
                Role:
                <input type="text" id="profile-role" value="${profile.role}" 
                       placeholder="e.g., Frontend Developer, 3D Artist">
            </label>
            <label>
                Specialties (comma-separated):
                <input type="text" id="profile-specialties" 
                       value="${profile.specialties.join(', ')}"
                       placeholder="e.g., React, Three.js, AI">
            </label>
            <label>
                Style Preference:
                <input type="text" id="profile-style" value="${profile.style}"
                       placeholder="e.g., minimal, futuristic, colorful">
            </label>
            <label>
                Color Scheme:
                <input type="text" id="profile-colors" value="${profile.colorScheme}"
                       placeholder="e.g., dark blues and purples">
            </label>
            <button id="save-profile">Save Profile</button>
            <button id="close-editor">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(form);
    
    document.getElementById('save-profile').addEventListener('click', () => {
        const updated = {
            role: document.getElementById('profile-role').value,
            specialties: document.getElementById('profile-specialties').value
                .split(',').map(s => s.trim()).filter(Boolean),
            style: document.getElementById('profile-style').value,
            colorScheme: document.getElementById('profile-colors').value,
            projects: profile.projects, // Preserve existing projects
            preferences: profile.preferences
        };
        
        saveProfile(updated);
        form.remove();
        location.reload(); // Reload to apply new profile
    });
    
    document.getElementById('close-editor').addEventListener('click', () => {
        form.remove();
    });
}
```

**What's happening:** User profile is stored in localStorage. A simple editor lets users define their role, specialties, and style preferences. The profile persists across sessions and enhances every AI request.

### Example 3: Full Integration

```javascript
// main.js - Update from Day 17
import { ConversationManager } from './conversationManager.js';
import { loadProfile, showProfileEditor } from './userProfile.js';

const conversation = new ConversationManager(10);
const userProfile = loadProfile();

// Set up conversation with profile
conversation.setSystemPrompt(BASE_SYSTEM_PROMPT);
if (userProfile) {
    conversation.setUserProfile(userProfile);
    console.log('Loaded user profile:', userProfile);
}

// Generate scene with memory
async function generateWithMemory(userInput) {
    // Add user message to history
    conversation.addMessage('user', userInput);
    
    // Get full conversation payload
    const payload = conversation.getAPIPayload();
    
    // Call API with conversation history
    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.3,
        ...payload
    });
    
    const sceneJSON = response.content[0].text;
    
    // Add assistant response to history
    conversation.addMessage('assistant', sceneJSON);
    
    return JSON.parse(sceneJSON);
}

// UI: Edit Profile button
document.getElementById('edit-profile-btn').addEventListener('click', () => {
    showProfileEditor();
});

// UI: Clear History button
document.getElementById('clear-history-btn').addEventListener('click', () => {
    conversation.clear();
    console.log('Conversation history cleared');
});
```

**What's happening:** Every user input is added to conversation history. The AI sees the full conversation context and user profile with each request. Users can edit their profile or clear history.

> **💡 Try it:** Set your profile to "Game Developer specializing in VR, prefers neon cyberpunk aesthetics" — watch how scene generation changes!

---

## ✏️ Hands-On Exercises

### Exercise 1: Add Conversation Memory (⏱️ ~15 min)

**Goal:** Implement multi-turn conversation tracking

**Instructions:**
1. Add ConversationManager class from Example 1
2. Store each user input and AI response
3. Send full conversation history with each API call
4. Test: generate a scene, then make 3 modifications — verify AI remembers context

**Expected Output:**
AI maintains context across multiple requests.

---

### Exercise 2: Build Profile System (⏱️ ~20 min)

**Goal:** Create persistent user profile storage

**Instructions:**
1. Implement profile save/load from Example 2
2. Create profile editor UI (or simple form)
3. Inject profile into system prompt
4. Test: create a profile, generate scenes, note how they reflect your style
5. Reload page — verify profile persists

**Expected Output:**
Scenes consistently match your defined style.

---

### Exercise 3: Memory Optimization (⏱️ ~15 min)

**Goal:** Keep conversation history manageable

**Instructions:**
1. Add token counting (estimate ~4 chars = 1 token)
2. Limit conversation to last 10 messages
3. Add a "summarize and compress" function that condenses old messages
4. Display current memory usage in UI
5. Test with 20+ messages — verify it stays under token limits

**Expected Output:**
Conversation never exceeds API token limits.

---

## 📖 Curated Resources

### Must-Read

1. **Conversation Design** — Anthropic Cookbook
   - 🔗 https://github.com/anthropics/anthropic-cookbook
   - Why: Best practices for building conversational AI apps

---

## 🤔 Reflection Questions

1. **Comprehension:** Why do we limit conversation history to recent messages instead of sending everything?

2. **Application:** How would you implement a "save this scene to my portfolio" feature?

3. **Connection:** How does the user profile concept relate to the system prompts from Day 12?

4. **Critical Thinking:** What's the risk of letting AI have long-term memory? Privacy? Bias?

5. **Personal:** After using profile-aware generation, how much better are the results?

---

## ➡️ Next Steps

**Tomorrow:** [Day 19: Advanced Prompting Techniques](./day-19-brief.md) — Chain-of-thought, self-critique, and multi-agent patterns

You've built a portfolio AI that remembers. Tomorrow we'll make it even smarter with advanced prompting techniques.

**Before moving on, make sure you can:**
- [ ] Maintain conversation history across multiple requests
- [ ] Store and load user profiles with localStorage
- [ ] Inject profile context into system prompts
- [ ] Manage memory to stay within token limits
- [ ] Clear history when needed

[← Previous: Day 17 - Real-Time Scene Modifications](./day-17-brief.md) | [Course Home](../README.md) | [Next: Day 19 - Advanced Prompting Techniques →](./day-19-brief.md)
