# Day 14: Week 2 Mini-Project — Prompt-Driven Scene Generator

[← Previous: Day 13 - Mapping Language to 3D](./day-13-brief.md) | [Course Home](../README.md) | [Next: Day 15 - Intro to LLM APIs →](./day-15-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Build a complete text-to-3D scene generator (the Week 2 capstone)
2. Create a UI with a text input that generates 3D scenes
3. Connect prompt templates with the SceneBuilder from Day 13
4. Handle the full flow: user input → prompt construction → JSON parse → 3D render
5. Add polish: loading states, error handling, scene transitions

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1.5 hours (15 min review + 75 min building)

---

## 📚 Core Concepts

### What We're Building

A web app where you type a scene description (e.g., "a cozy reading nook with a bookshelf and warm lighting") and see a 3D scene appear in the browser. For now, we'll simulate the AI part with pre-built scene templates and manual Claude/ChatGPT usage. In Week 3, we'll connect real API calls.

**Architecture:**

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Text Input  │ →  │  Prompt      │ →  │  JSON Scene  │ →  │  Three.js    │
│  (UI)        │    │  Template    │    │  Data        │    │  Scene       │
└─────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### The UI Layer

Keep it minimal — a text input, a generate button, and the 3D canvas:

```html
<div id="ui-overlay">
    <div id="input-container">
        <input type="text" id="scene-prompt" 
               placeholder="Describe a 3D scene..." />
        <button id="generate-btn">Generate Scene</button>
    </div>
    <div id="loading" style="display: none;">
        <span>Building scene...</span>
    </div>
    <div id="error" style="display: none;"></div>
</div>
<canvas id="three-canvas"></canvas>
```

### Pre-Built Scene Templates (Simulation Mode)

Until we connect real APIs in Week 3, use keyword matching to select pre-built scenes:

```javascript
const sceneTemplates = {
    workspace: { /* desk, laptop, lamp scene */ },
    garden: { /* zen garden with stones */ },
    gallery: { /* art gallery with pedestals */ },
    space: { /* floating planets and stars */ },
};

function matchTemplate(userInput) {
    const input = userInput.toLowerCase();
    for (const [key, template] of Object.entries(sceneTemplates)) {
        if (input.includes(key)) return template;
    }
    return sceneTemplates.workspace; // default
}
```

This gives you a working demo now. Week 3 replaces `matchTemplate` with real LLM calls.

### Scene Transitions

Abruptly swapping scenes feels jarring. Add smooth transitions:

```javascript
async function transitionToScene(newSceneData) {
    // Fade out current scene
    await fadeOut(scene, 500);
    
    // Build new scene
    builder.build(newSceneData);
    
    // Fade in new scene
    await fadeIn(scene, 500);
}
```

> **Key Insight:** This mini-project is a vertical slice of the final portfolio. It proves the concept works end-to-end. Don't aim for perfection — aim for "it works and demonstrates the idea."

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Vertical Slice** | End-to-end demo of all layers | Input → Processing → Output |
| **Template Matching** | Selecting pre-built responses by keyword | "garden" → garden scene JSON |
| **Scene Transition** | Smooth visual change between scenes | Fade out old → fade in new |
| **UI Overlay** | HTML elements on top of 3D canvas | Input field, buttons |
| **Loading State** | Visual feedback during processing | Spinner, "Building scene..." |

---

## 💻 Code Examples

### Example 1: Complete Mini-Project Structure

```javascript
// main.js - Prompt-Driven Scene Generator
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneBuilder } from './SceneBuilder.js';

// ===== THREE.JS SETUP =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5, 5, 10);

const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('three-canvas'),
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ===== SCENE BUILDER =====
const builder = new SceneBuilder(scene, camera);

// ===== SCENE TEMPLATES =====
const templates = {
    workspace: {
        objects: [
            { name: "floor", geometry: "plane", position: [0, 0, 0], rotation: [-1.5708, 0, 0], scale: [20, 20, 1], material: { color: "#2a2a3a", roughness: 0.8 } },
            { name: "desk", geometry: "box", position: [0, 0.75, 0], rotation: [0, 0, 0], scale: [3, 0.08, 1.5], material: { color: "#5c3a1e", roughness: 0.6 } },
            { name: "monitor", geometry: "box", position: [0, 1.4, -0.4], rotation: [0, 0, 0], scale: [1.6, 0.9, 0.05], material: { color: "#111111", roughness: 0.2, metalness: 0.8 } },
            { name: "screen-glow", geometry: "box", position: [0, 1.4, -0.38], rotation: [0, 0, 0], scale: [1.4, 0.75, 0.01], material: { color: "#4488ff", roughness: 1, emissive: "#4488ff", emissiveIntensity: 0.3 } },
            { name: "keyboard", geometry: "box", position: [0, 0.82, 0.2], rotation: [0.1, 0, 0], scale: [0.8, 0.03, 0.3], material: { color: "#333333", roughness: 0.5, metalness: 0.3 } },
            { name: "mug", geometry: "cylinder", position: [1.1, 0.87, 0.3], rotation: [0, 0, 0], scale: [0.12, 0.16, 0.12], material: { color: "#cc4444", roughness: 0.7 } },
            { name: "chair-seat", geometry: "box", position: [0, 0.45, 0.9], rotation: [0, 0, 0], scale: [0.6, 0.08, 0.6], material: { color: "#1a1a1a", roughness: 0.5 } },
        ],
        lights: [
            { type: "ambient", color: "#303050", intensity: 0.3 },
            { type: "directional", color: "#ffffff", intensity: 0.8, position: [5, 10, 5], castShadow: true },
            { type: "point", color: "#4488ff", intensity: 0.5, position: [0, 2, -0.3] }
        ],
        camera: { position: [4, 3, 4], lookAt: [0, 1, 0], fov: 60 },
        environment: { background: "#0a0a1a" }
    },
    
    garden: {
        objects: [
            { name: "ground", geometry: "plane", position: [0, 0, 0], rotation: [-1.5708, 0, 0], scale: [20, 20, 1], material: { color: "#3a5a3a", roughness: 0.9 } },
            { name: "rock-1", geometry: "icosahedron", position: [-2, 0.4, 1], rotation: [0.3, 0.5, 0], scale: [0.8, 0.6, 0.8], material: { color: "#777777", roughness: 0.9 } },
            { name: "rock-2", geometry: "icosahedron", position: [1.5, 0.3, -1], rotation: [0.1, 1.2, 0.2], scale: [0.6, 0.5, 0.7], material: { color: "#888888", roughness: 0.85 } },
            { name: "bridge", geometry: "box", position: [0, 0.3, 0], rotation: [0, 0.4, 0.15], scale: [3, 0.1, 0.8], material: { color: "#8B4513", roughness: 0.7 } },
            { name: "lantern-base", geometry: "box", position: [3, 0.4, 2], rotation: [0, 0.3, 0], scale: [0.3, 0.8, 0.3], material: { color: "#666666", roughness: 0.6 } },
            { name: "lantern-top", geometry: "cone", position: [3, 1, 2], rotation: [0, 0, 0], scale: [0.5, 0.4, 0.5], material: { color: "#555555", roughness: 0.6 } },
            { name: "water", geometry: "plane", position: [-1, 0.02, -2], rotation: [-1.5708, 0, 0], scale: [4, 4, 1], material: { color: "#224466", roughness: 0.1, metalness: 0.3, opacity: 0.7 } },
        ],
        lights: [
            { type: "ambient", color: "#556655", intensity: 0.4 },
            { type: "directional", color: "#ffe8cc", intensity: 1.2, position: [-5, 8, 3], castShadow: true },
            { type: "point", color: "#ffaa44", intensity: 0.6, position: [3, 1.2, 2] }
        ],
        camera: { position: [6, 4, 6], lookAt: [0, 0, 0], fov: 55 },
        environment: { background: "#1a2a1a" }
    },
    
    gallery: {
        objects: [
            { name: "floor", geometry: "plane", position: [0, 0, 0], rotation: [-1.5708, 0, 0], scale: [20, 20, 1], material: { color: "#f5f5f0", roughness: 0.6 } },
            { name: "pedestal-1", geometry: "cylinder", position: [-3, 0.75, 0], rotation: [0, 0, 0], scale: [1, 1.5, 1], material: { color: "#ffffff", roughness: 0.3 } },
            { name: "art-1", geometry: "torus", position: [-3, 2, 0], rotation: [1.5, 0, 0], scale: [0.8, 0.8, 0.8], material: { color: "#ff4444", roughness: 0.2, metalness: 0.8 } },
            { name: "pedestal-2", geometry: "cylinder", position: [0, 0.75, 0], rotation: [0, 0, 0], scale: [1, 1.5, 1], material: { color: "#ffffff", roughness: 0.3 } },
            { name: "art-2", geometry: "icosahedron", position: [0, 2, 0], rotation: [0, 0.5, 0], scale: [0.7, 0.7, 0.7], material: { color: "#44aaff", roughness: 0.1, metalness: 0.9 } },
            { name: "pedestal-3", geometry: "cylinder", position: [3, 0.75, 0], rotation: [0, 0, 0], scale: [1, 1.5, 1], material: { color: "#ffffff", roughness: 0.3 } },
            { name: "art-3", geometry: "sphere", position: [3, 2, 0], rotation: [0, 0, 0], scale: [0.6, 0.6, 0.6], material: { color: "#FFD700", roughness: 0.05, metalness: 1 } },
        ],
        lights: [
            { type: "ambient", color: "#ffffff", intensity: 0.3 },
            { type: "spot", color: "#ffffff", intensity: 2, position: [-3, 5, 2], castShadow: true },
            { type: "spot", color: "#ffffff", intensity: 2, position: [0, 5, 2], castShadow: true },
            { type: "spot", color: "#ffffff", intensity: 2, position: [3, 5, 2], castShadow: true }
        ],
        camera: { position: [0, 3, 8], lookAt: [0, 1.5, 0], fov: 50 },
        environment: { background: "#f0f0f0" }
    }
};

// ===== SCENE MATCHING =====
function getSceneForPrompt(prompt) {
    const p = prompt.toLowerCase();
    if (p.includes('garden') || p.includes('zen') || p.includes('nature')) return templates.garden;
    if (p.includes('gallery') || p.includes('art') || p.includes('museum')) return templates.gallery;
    if (p.includes('work') || p.includes('desk') || p.includes('office') || p.includes('code')) return templates.workspace;
    
    // Default: pick randomly
    const keys = Object.keys(templates);
    return templates[keys[Math.floor(Math.random() * keys.length)]];
}

// ===== UI HANDLERS =====
const promptInput = document.getElementById('scene-prompt');
const generateBtn = document.getElementById('generate-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

async function generateScene() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Show loading
    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';
    generateBtn.disabled = true;

    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get scene data
        const sceneData = getSceneForPrompt(prompt);
        
        // Build scene
        builder.build(sceneData);
        
        console.log(`✅ Scene generated for: "${prompt}"`);
    } catch (err) {
        console.error('Scene generation failed:', err);
        errorEl.textContent = `Error: ${err.message}`;
        errorEl.style.display = 'block';
    } finally {
        loadingEl.style.display = 'none';
        generateBtn.disabled = false;
    }
}

generateBtn.addEventListener('click', generateScene);
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateScene();
});

// ===== ANIMATION LOOP =====
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// ===== WINDOW RESIZE =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load default scene
builder.build(templates.workspace);
```

**What's happening:** This is the complete mini-project. It has a UI for text input, template matching for scene selection, the SceneBuilder from Day 13, and proper loading/error states. The simulated delay makes it feel like an API call.

### Example 2: CSS for the UI Overlay

```css
/* style.css */
* { margin: 0; padding: 0; box-sizing: border-box; }

body { 
    overflow: hidden;
    font-family: 'Inter', -apple-system, sans-serif;
}

#three-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

#ui-overlay {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

#input-container {
    display: flex;
    gap: 8px;
    background: rgba(10, 10, 26, 0.85);
    backdrop-filter: blur(10px);
    padding: 12px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

#scene-prompt {
    width: 400px;
    padding: 10px 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

#scene-prompt:focus {
    border-color: #4488ff;
}

#scene-prompt::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

#generate-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #4488ff, #6644ff);
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
}

#generate-btn:hover { opacity: 0.9; }
#generate-btn:active { transform: scale(0.97); }
#generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

#loading {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(10, 10, 26, 0.9);
    padding: 20px 30px;
    border-radius: 12px;
    color: #4488ff;
    font-size: 16px;
}

#error {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 50, 50, 0.9);
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
}
```

---

## ✏️ Hands-On Exercises

### Exercise 1: Build the Mini-Project (⏱️ ~45 min)

**Goal:** Create the complete prompt-driven scene generator

**Instructions:**
1. Set up the HTML structure with canvas and UI overlay
2. Style the UI (use the CSS from Example 2 or design your own)
3. Implement the SceneBuilder (from Day 13)
4. Create at least 3 scene templates (workspace, garden, gallery)
5. Wire up the UI: input → template match → build scene
6. Test with various prompts

**Expected Output:**
A working web app where typing "zen garden" shows a garden scene, "office" shows a workspace, etc.

---

### Exercise 2: Add Scene Transitions (⏱️ ~15 min)

**Goal:** Smooth transitions between generated scenes

**Instructions:**
1. When generating a new scene, fade the current scene's objects to transparent
2. After fade completes, clear and build the new scene
3. Fade new objects from transparent to opaque
4. Use `requestAnimationFrame` for smooth animation

**Hints:**
<details>
<summary>Hint 1</summary>
Set all materials to `transparent: true`, then animate opacity from 1→0 and 0→1.
</details>

---

### Exercise 3: Extend with More Templates (⏱️ ~15 min)

**Goal:** Add creativity and depth to your scene library

**Instructions:**
1. Add 2 more scene templates: "space" (planets, stars) and "city" (buildings, roads)
2. Improve keyword matching to handle more synonyms
3. Add a "random" option that generates from a random template
4. Add a "history" feature that remembers the last 5 prompts
5. Show template name in a small label after generation

**Expected Output:**
5+ unique scene templates with smart keyword matching.

---

## 📖 Curated Resources

### Must-Read

1. **Three.js Manual — Custom Geometries** — Three.js
   - 🔗 https://threejs.org/manual/#en/custom-buffergeometry
   - Why: Understand how to extend the builder with custom shapes

2. **Easings Cheat Sheet** — easings.net
   - 🔗 https://easings.net/
   - Why: Visual reference for scene transition easing functions

### Video Resources

3. **Build a Mindblowing 3D Portfolio Website** — Fireship
   - 🎥 https://www.youtube.com/watch?v=Q7AOvWpIVHU (⚠️ VERIFIED, 12 min)
   - Why: Inspiration for the final portfolio look and feel

---

## 🤔 Reflection Questions

1. **Comprehension:** Why do we use template matching now instead of real AI? What changes in Week 3?

2. **Application:** How would you make the scene transitions feel more "magical" — what visual effects could you add?

3. **Connection:** Which concepts from Week 1 (scenes, materials, lighting) were most critical for making templates look good?

4. **Critical Thinking:** What are the limitations of template matching vs. real AI generation?

5. **Personal:** Show your mini-project to someone — what's their reaction? What would they want to try?

---

## ➡️ Next Steps

**Next week:** [Day 15: Intro to LLM APIs](./day-15-brief.md) — Replace template matching with real AI calls

🎉 **Congratulations!** You've completed Week 2. You now have:
- ✅ 3D model loading
- ✅ Professional lighting and shadows
- ✅ Performance optimization knowledge
- ✅ Prompt engineering fundamentals
- ✅ A JSON-to-Three.js scene builder
- ✅ A working text-to-3D demo

Week 3 connects real AI APIs, adds memory and context, and builds the final AI Portfolio Generator.

**Before moving on, make sure you can:**
- [ ] Type a scene description and see a 3D scene appear
- [ ] Handle loading states and errors gracefully
- [ ] Create at least 3 distinct scene templates
- [ ] Clear and rebuild scenes without issues
- [ ] Explain the full pipeline from text to 3D

[← Previous: Day 13 - Mapping Language to 3D](./day-13-brief.md) | [Course Home](../README.md) | [Next: Day 15 - Intro to LLM APIs →](./day-15-brief.md)
