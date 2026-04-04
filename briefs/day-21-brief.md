# Day 21: Final Project — AI Portfolio Generator

[← Previous: Day 20 - Deployment & Production](./day-20-brief.md) | [Course Home](../README.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Build a complete AI-powered 3D portfolio from scratch
2. Integrate all 20 days of learning into one cohesive project
3. Create a portfolio that showcases your skills through AI-generated 3D scenes
4. Add portfolio-specific features: project showcases, about section, contact
5. Polish the user experience and prepare for real-world use

**Difficulty:** 🔴 Advanced  
**Estimated Time:** 2-3 hours (full capstone project)

---

## 📚 Project Requirements

### What We're Building

An AI-powered 3D portfolio where:

1. **Landing Scene**: User arrives at a personalized 3D workspace that represents YOU
2. **Conversational Interface**: Chat with AI to explore your portfolio
3. **Project Showcases**: 3D representations of your projects (e.g., "show me your React work")
4. **Dynamic Scenes**: AI generates different scenes based on what the user wants to see
5. **About/Contact**: AI-driven storytelling of your background and skills

### Core Features Checklist

**Scene Generation (Week 1-2):**
- [ ] Three.js scene with lighting, materials, shadows
- [ ] Load 3D models (optional: your logo, custom objects)
- [ ] Performance optimized (60fps, <500 draw calls)
- [ ] Responsive (works on desktop + mobile)

**AI Integration (Week 3):**
- [ ] Claude/OpenAI API integration via serverless function
- [ ] Conversational scene modification
- [ ] Memory of user preferences and conversation history
- [ ] Chain-of-thought scene generation

**Portfolio Content:**
- [ ] User profile with skills, projects, bio
- [ ] Project database (3-5 real projects)
- [ ] AI generates scenes representing each project
- [ ] Contact information accessible

**Polish:**
- [ ] Loading states, error handling
- [ ] Smooth scene transitions
- [ ] UI/UX: clean input, readable text
- [ ] Analytics (optional: track popular scenes)

---

## 💻 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
│  - Chat Input                                                │
│  - 3D Canvas (Three.js)                                      │
│  - Project Menu                                              │
│  - Loading States                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─► Text Input → Intent Classifier
                            │                    │
                            │                    ├─► "Show project X" → Load Project Scene
                            │                    ├─► "About you" → Bio Scene
                            │                    ├─► "Modify scene" → Scene Modifier
                            │                    └─► Custom request → AI Generator
                            │
┌─────────────────────────────────────────────────────────────┐
│                      AI LAYER                               │
│  - Conversation Manager (memory)                            │
│  - Intent Classifier                                         │
│  - Scene Generator (Claude API)                             │
│  - User Profile Context                                      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      3D LAYER                               │
│  - SceneBuilder (JSON → Three.js)                           │
│  - Scene Transition Manager                                  │
│  - Portfolio Content Database                                │
│  - Camera Controller                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Example: Project Showcase Scenes

When user says "show me your React projects," generate a scene representing that work:

```javascript
const projectScenes = {
    "react-chat-app": {
        theme: "communication, real-time",
        objects: [
            // Chat bubbles floating in space
            { name: "bubble-1", geometry: "sphere", material: { color: "#4488ff" }, ... },
            // Desktop with React logo
            { name: "laptop", geometry: "box", ... },
            // Animated particles representing messages
            { name: "particles", ... }
        ],
        description: "Real-time chat app with WebSocket, React hooks, and TypeScript"
    },
    "3d-product-configurator": {
        theme: "customization, e-commerce",
        objects: [
            // Product on pedestal
            { name: "product", geometry: "torus", material: { metalness: 0.9 }, ... },
            // Color swatches
            // Interactive UI elements
        ],
        description: "Three.js product configurator with 50+ customization options"
    }
};
```

AI generates scenes that visually represent the nature of each project.

---

## 🔑 Complete Feature Breakdown

### 1. Landing Experience

**First visit:**
```
[3D workspace scene fades in]
AI: "Hi! I'm an AI-powered portfolio. Ask me about [Your Name]'s projects, 
     skills, or tell me what kind of scene you'd like to see."
```

**User can:**
- Type natural language requests
- Click pre-made prompts ("Show me React projects", "Tell me about you")
- Explore the 3D scene with mouse

### 2. Intent Classification

```javascript
function classifyIntent(userInput) {
    const input = userInput.toLowerCase();
    
    if (input.includes('project') || input.includes('work')) {
        return { intent: 'show-projects', extract: extractProjectKeywords(input) };
    }
    if (input.includes('about') || input.includes('who')) {
        return { intent: 'show-bio' };
    }
    if (input.includes('contact') || input.includes('email')) {
        return { intent: 'show-contact' };
    }
    if (input.includes('skill') || input.includes('tech')) {
        return { intent: 'show-skills' };
    }
    if (input.includes('add') || input.includes('change') || input.includes('remove')) {
        return { intent: 'modify-scene', modification: input };
    }
    
    return { intent: 'generate-custom', prompt: input };
}
```

### 3. Portfolio Database

```javascript
const portfolioData = {
    name: "Your Name",
    role: "Creative Developer",
    bio: "I build interactive experiences with Three.js, React, and AI...",
    skills: ["Three.js", "React", "Claude API", "WebGL", "TypeScript"],
    projects: [
        {
            id: "project-1",
            name: "AI Chat Interface",
            tech: ["React", "Claude API", "WebSocket"],
            description: "...",
            sceneTheme: "communication, real-time interaction",
            link: "https://github.com/..."
        },
        // ... more projects
    ],
    contact: {
        email: "you@example.com",
        github: "github.com/yourname",
        linkedin: "linkedin.com/in/yourname"
    }
};
```

### 4. Dynamic Scene Router

```javascript
async function handleUserInput(input) {
    const { intent, ...data } = classifyIntent(input);
    
    switch (intent) {
        case 'show-projects':
            const projects = filterProjects(data.extract);
            await showProjectShowcase(projects);
            break;
        case 'show-bio':
            await showBioScene();
            break;
        case 'show-contact':
            await showContactScene();
            break;
        case 'modify-scene':
            await modifyCurrentScene(data.modification);
            break;
        case 'generate-custom':
            await generateCustomScene(data.prompt);
            break;
    }
}
```

---

## ✏️ Final Project Tasks

### Phase 1: Setup & Structure (30 min)

- [ ] Create project repository
- [ ] Set up Vite + Three.js + AI integration
- [ ] Create folder structure: `/src/components`, `/src/ai`, `/src/scenes`, `/api`
- [ ] Configure environment variables
- [ ] Deploy initial version to Vercel

### Phase 2: Portfolio Content (45 min)

- [ ] Define your `portfolioData` object (bio, skills, 3-5 projects)
- [ ] Create user profile for AI context
- [ ] Design 3-5 pre-made scene templates for projects
- [ ] Write welcome message and sample prompts

### Phase 3: AI Integration (60 min)

- [ ] Set up serverless API endpoint
- [ ] Implement intent classification
- [ ] Connect Claude API with conversation memory
- [ ] Add project-specific scene generation
- [ ] Test all intent paths

### Phase 4: Polish & Testing (45 min)

- [ ] Add loading states and error handling
- [ ] Implement scene transitions
- [ ] Responsive design (test on mobile)
- [ ] Performance audit (60fps target)
- [ ] Test all features end-to-end

### Phase 5: Deployment (20 min)

- [ ] Final deployment to production
- [ ] Test on multiple devices/browsers
- [ ] Share with 3-5 people for feedback
- [ ] Add analytics (optional)
- [ ] Create README with project description

---

## 🎓 Stretch Goals

If you finish early:

1. **Voice Input**: Use Web Speech API for voice commands
2. **Share Scenes**: Generate shareable URLs for specific scenes
3. **Project Gallery**: Grid view of all projects before diving in
4. **Easter Eggs**: Hidden scenes or interactions
5. **Multi-language**: Support English + your native language
6. **Animations**: Animated project transitions
7. **Music**: Background ambient sound (toggle on/off)
8. **VR Mode**: WebXR support for VR headsets

---

## 📖 Resources for Reference

Throughout today, refer back to:

- **Day 1-8**: Three.js fundamentals
- **Day 9-11**: Models, lighting, performance
- **Day 12-14**: Prompt engineering, scene builder
- **Day 15-19**: AI integration, memory, advanced prompting
- **Day 20**: Deployment

---

## 🤔 Final Reflection

1. **Achievement:** What are you most proud of in this project?
2. **Learning:** What was the hardest part of the course? What clicked for you?
3. **Application:** How will you use these skills in your career?
4. **Next Steps:** What will you build next with Three.js + AI?
5. **Feedback:** What would you add to this course?

---

## 🎉 Congratulations!

You've completed the **Three.js + AI Portfolio Course**!

**What you've built:**
- ✅ Full-stack 3D web application
- ✅ AI-powered scene generation
- ✅ Conversational interface with memory
- ✅ Production-ready deployment
- ✅ Complete personal portfolio

**Skills acquired:**
- Three.js (scenes, lighting, materials, models, performance)
- Prompt engineering (system prompts, few-shot, chain-of-thought)
- LLM API integration (Claude/OpenAI)
- Full-stack JavaScript (frontend + serverless)
- Deployment & production best practices

**Next Steps:**
1. Share your portfolio URL in the course community
2. Add it to your resume/LinkedIn
3. Build 2-3 more projects to solidify learning
4. Contribute to open-source Three.js projects
5. Help others learn!

---

## 📬 Stay Connected

- **Portfolio Showcase**: Share your deployed URL!
- **GitHub**: Open-source your code (great for recruiters)
- **Twitter/LinkedIn**: Post about what you built
- **Course Feedback**: Help improve future versions

**You did it.** 🚀 Now go build amazing things.

[← Previous: Day 20 - Deployment & Production](./day-20-brief.md) | [Course Home](../README.md)
