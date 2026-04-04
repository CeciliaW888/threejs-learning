# Day 5: Lighting Your 3D Scene

[← Previous: Day 4 - Materials & Textures](./day-04-materials-textures.md) | [Course Home](../README.md) | [Next: Day 6 - Cameras & Controls →](./day-06-cameras-controls.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Understand the four main light types in Three.js and their use cases
2. Configure light properties (color, intensity, position, target)
3. Create realistic lighting setups using multiple lights
4. Understand shadows and how to enable them
5. Combine lights and materials for specific moods and atmospheres

**Difficulty:** 🟢 Beginner  
**Estimated Time:** 1 hour (25 min reading + 35 min hands-on)

---

## 📚 Core Concepts

### Why Lighting Matters

Lighting is what makes 3D scenes feel real. Without lights, only MeshBasicMaterial is visible — everything else renders pitch black. The same 3D model can look friendly and inviting or dark and ominous based purely on how you light it.

Think of it like photography. A portrait photographer carefully positions key lights, fill lights, and backlights to shape a subject's face. Three.js gives you the same tools: directional lights act like the sun, point lights work like light bulbs, spotlights create focused beams, and ambient lights provide general baseline illumination.

### The Four Essential Light Types

**AmbientLight** illuminates all objects equally from every direction. No shadows, no directionality — it's like being in a brightly-lit room where light bounces off every surface. Use it sparingly (low intensity) as a baseline to prevent pitch-black shadows, not as your primary light source.

```javascript
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft gray, half intensity
```

**DirectionalLight** sends parallel rays, like sunlight. The light's position defines the direction rays come from (imagine a line from `position` toward the origin), but because the rays are parallel, the actual distance doesn't matter — just the angle. It creates consistent shadows across the entire scene, making it perfect for outdoor environments.

```javascript
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5); // Light comes FROM this direction
```

**PointLight** radiates equally in all directions from a single point — exactly like a bare light bulb. Its intensity decreases with distance, controlled by the `distance` and `decay` properties. Set `decay` to 2 for physically-accurate falloff. Great for lamps, torches, glowing orbs, or any localized light source.

```javascript
const pointLight = new THREE.PointLight(0xff0000, 1, 100); // Red, intensity 1, range 100
pointLight.position.set(0, 5, 0);
```

**SpotLight** is the most cinematic — a focused cone of light like a flashlight or stage spotlight. It has both position and target, plus `angle` (cone width) and `penumbra` (soft edge). More complex to set up but creates the most dramatic effects.

```javascript
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(10, 10, 10);
spotLight.target.position.set(0, 0, 0);
spotLight.angle = Math.PI / 6;   // 30-degree cone
spotLight.penumbra = 0.3;         // Soft edges
```

### Light Properties

All lights share common properties:

| Property | Description |
|----------|-------------|
| **color** | RGB hex value (0xffffff = white, 0xff0000 = red) |
| **intensity** | Brightness multiplier (1 = normal, 2 = double, 0.5 = half) |
| **position** | Where the light exists in 3D space |
| **castShadow** | Whether this light creates shadows (off by default — expensive!) |

Additional properties vary by type:
- **PointLight / SpotLight:** `distance` (range before fading to zero), `decay` (falloff rate, 2 = physically realistic)
- **SpotLight:** `angle` (cone width in radians), `penumbra` (soft edge, 0 = hard, 1 = very soft)

### Shadows: Adding Depth

Shadows instantly ground objects in a scene — without them, objects look like they're floating. But shadows are computationally expensive because they require rendering the scene from the light's perspective to create a depth map. Three.js makes you opt in to shadows deliberately:

**Step 1 — Enable on the renderer:**
```javascript
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft, realistic edges
```

**Step 2 — Tell the light to cast shadows:**
```javascript
directionalLight.castShadow = true;
```

**Step 3 — Tell objects to participate:**
```javascript
sphere.castShadow = true;      // This object creates shadows
ground.receiveShadow = true;   // This object displays shadows on its surface
```

Not every light needs shadows. In practice, often only the main directional light (the "sun") casts shadows — adding shadows to every PointLight would tank performance.

### Professional Lighting Setups

3D artists use standard lighting setups borrowed from photography and film:

**Three-Point Lighting** is the industry standard:
- **Key light** — Main light, brightest, creates primary shadows (usually directional)
- **Fill light** — Softer, placed opposite the key, fills in dark shadows
- **Back light** — Behind the subject, creates a bright rim/edge that separates it from the background

**Studio Lighting:** Bright ambient (simulating bounced light in a white studio) plus a soft directional from above-front. Clean, even, professional.

**Dramatic Lighting:** Very low ambient (deep shadows), a strong directional from the side (high contrast), and optional colored lights for mood. Think film noir or horror games.

> **Key Insight:** Lighting is as important as modeling. Great lighting can make simple geometry look amazing; poor lighting can ruin the most detailed models. Spend as much time on lights as you do on objects.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **AmbientLight** | Uniform lighting from all directions, no shadows | Baseline illumination to soften darkness |
| **DirectionalLight** | Parallel rays like sunlight, direction-based | Outdoor sun/moon in scenes |
| **PointLight** | Radiates from a single point like a light bulb | Lamps, torches, glowing objects |
| **SpotLight** | Focused cone of light like a flashlight | Stage lighting, car headlights |
| **Intensity** | Brightness multiplier (1 = normal) | 0.5 = dim mood light, 2 = harsh spotlight |
| **Shadow Map** | Depth texture rendered from the light's perspective | Higher resolution = sharper shadows |
| **Penumbra** | Soft edge on a spotlight cone (0 = hard, 1 = very soft) | Creates realistic light falloff |
| **Light Decay** | How quickly light fades with distance | decay=2 is physically accurate |

---

## 💻 Code Examples

### Example 1: Basic Lighting Setup

```javascript
// basic-lighting.js
// Purpose: Set up a sphere on a plane with ambient + directional light

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// A red sphere floating above a gray ground plane
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5 })
);
sphere.position.y = 1;
scene.add(sphere);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x808080 })
);
ground.rotation.x = -Math.PI / 2; // Lay it flat
scene.add(ground);

// Ambient light prevents pitch-black shadows
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Directional light creates defined highlights and depth
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** The ambient light provides a base level of illumination — without it, the sphere's shadow side would be completely black. The directional light creates the gradient from bright to dark across the sphere's surface, which is how our brains perceive 3D depth. Try removing the ambient light to see how harsh pure directional lighting looks.

### Example 2: Enabling Shadows

```javascript
// shadows.js
// Purpose: Enable and configure realistic shadows

// Enable shadow rendering on the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadow edges

// Configure the directional light for shadows
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -10;     // Shadow camera frustum
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.mapSize.width = 2048;  // Higher = sharper shadows
directionalLight.shadow.mapSize.height = 2048;

// Objects opt in to shadow casting/receiving
sphere.castShadow = true;       // Sphere casts a shadow
ground.receiveShadow = true;    // Ground displays the shadow

// Debug helper — visualize the shadow camera frustum
const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);
```

**What's happening:** Shadows require the GPU to render the scene from the light's point of view, creating a depth map. The shadow camera frustum defines the area where shadows are calculated — objects outside it won't cast shadows. Higher `mapSize` creates sharper shadows but uses more GPU memory. `PCFSoftShadowMap` produces soft, realistic shadow edges instead of jagged hard edges.

### Example 3: Three-Point Lighting

```javascript
// three-point-lighting.js
// Purpose: Professional lighting setup with key, fill, and back lights

// Key light — main source, bright, from front-right
const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(5, 5, 5);
keyLight.castShadow = true;
scene.add(keyLight);

// Fill light — softer, from the left, reduces harsh shadows
const fillLight = new THREE.DirectionalLight(0x8080ff, 0.4); // Slightly blue tint
fillLight.position.set(-5, 3, 0);
scene.add(fillLight);

// Back light — behind subject, creates edge highlights
const backLight = new THREE.DirectionalLight(0xffff80, 0.6); // Warm yellow
backLight.position.set(0, 3, -5);
scene.add(backLight);

// Subtle ambient — prevents pure black in deep shadows
const ambient = new THREE.AmbientLight(0x404040, 0.2);
scene.add(ambient);
```

**What's happening:** This professional three-point setup creates depth and definition. The key light is the primary source creating the main shadows. The fill light (notice the subtle blue tint) brightens the shadow side so it's not pure black. The warm back light creates a bright rim around the subject, visually separating it from the background. Together, they give objects a three-dimensional, professional quality.

> **💡 Try it:** Change the key light to red and the fill to blue for a dramatic neon look. Then try moving the key light to directly above — how does it change the mood?

---

## ✏️ Hands-On Exercises

### Exercise 1: Light Type Comparison (⏱️ ~20 min)

**Goal:** See how each light type behaves differently

**Instructions:**
1. Create a scene with one sphere on a plane
2. Start with ONLY an AmbientLight — observe the flat, shadowless look
3. Replace with a DirectionalLight — see gradient shading appear
4. Replace with a PointLight positioned to the side — notice the falloff
5. Replace with a SpotLight aimed at the sphere — see the focused cone
6. Write a sentence describing what each light type is best used for

**Expected Output:**
Understanding of when to use each light type based on visual results.

---

### Exercise 2: Shadow Setup (⏱️ ~25 min)

**Goal:** Enable and configure realistic shadows

**Instructions:**
1. Create a scene with a sphere, cube, and cylinder on a ground plane
2. Add a DirectionalLight from above-front
3. Enable shadows on the renderer, light, and all objects
4. Adjust the shadow camera frustum to cover all objects
5. Set shadow map resolution to 2048
6. Use CameraHelper to visualize the shadow camera

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Shadows not appearing? Check all four requirements: renderer.shadowMap.enabled, light.castShadow, object.castShadow, ground.receiveShadow
</details>

<details>
<summary>Hint 2</summary>
Shadow camera frustum must encompass all shadow-casting objects. Use CameraHelper to debug — if objects are outside the visible frustum, they won't cast shadows.
</details>

---

### Exercise 3: Mood Lighting (⏱️ ~25 min)

**Goal:** Create three distinct atmospheres using only lighting changes

**Instructions:**
1. Create a simple scene (sphere on a plane)
2. **Setup A: "Sunny Day"** — Bright white directional + warm low-intensity ambient
3. **Setup B: "Dramatic Night"** — Dark blue ambient + strong white directional from the side
4. **Setup C: "Neon City"** — Very dark ambient + multiple colored PointLights (red, blue, purple)
5. Use keyboard keys (1, 2, 3) to switch between setups

**Expected Output:**
Three distinct moods from the exact same geometry — demonstrating the transformative power of lighting.

---

## 📖 Curated Resources

### Must-Read

1. **Lights in Three.js** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/lights/Light
   - Why: Complete reference for all light types, properties, and configuration

2. **Shadows** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/shadows
   - Why: Step-by-step guide to shadow configuration, optimization, and common pitfalls

### Deep Dives (optional)

3. **Three-Point Lighting** — General photography/cinematography resource
   - Why: Understanding these principles from photography translates directly to 3D — the concepts are identical

---

## 🤔 Reflection Questions

1. **Comprehension:** Why does AmbientLight not create any shadows?
   - *Think about: What information does a shadow require that ambient light can't provide?*

2. **Application:** When would you use a PointLight instead of a DirectionalLight?
   - *Think about: Real-world light sources — which ones have a specific position vs. direction?*

3. **Connection:** How do lights and materials work together? What happens to a MeshStandardMaterial with roughness=0 under a bright spotlight?
   - *Think about: Yesterday's material properties and how they respond to today's lighting*

4. **Critical Thinking:** Why are shadows computationally expensive, and what strategies can reduce their cost?
   - *Think about: What the GPU actually does to compute a shadow — it's rendering twice*

5. **Personal:** What lighting setup will you use for your AI portfolio? Professional studio? Moody dramatic? Colorful neon?

---

## ➡️ Next Steps

**Tomorrow:** [Day 6: Cameras and Controls](./day-06-cameras-controls.md) — Learn about different camera types and how to add user interaction with OrbitControls

Now that you can create beautiful lighting, tomorrow we'll add interactivity. OrbitControls let users rotate, zoom, and pan around your 3D scene — transforming a static view into an explorable world.

**Before moving on, make sure you can:**
- [ ] Add and configure all four main light types
- [ ] Enable shadows on renderer, lights, and objects
- [ ] Create a three-point lighting setup
- [ ] Adjust light intensity and color to set different moods
- [ ] Understand the performance cost of shadows and when to use them

[← Previous: Day 4 - Materials & Textures](./day-04-materials-textures.md) | [Course Home](../README.md) | [Next: Day 6 - Cameras & Controls →](./day-06-cameras-controls.md)
