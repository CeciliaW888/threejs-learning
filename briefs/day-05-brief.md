# Day 5: Lighting Your 3D Scene

[← Previous: Day 4 - Materials](./day-04-brief.md) | [Course Home](../README.md) | [Next: Day 6 - Cameras & Controls →](./day-06-brief.md)

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

Lighting is what makes 3D scenes feel real. Without lights, only MeshBasicMaterial (which ignores lighting) will be visible - everything else is black. Good lighting creates depth, mood, and guides the viewer's attention. The same 3D model can look friendly and inviting or dark and ominous based purely on lighting.

Think of lighting like photography or cinematography. A portrait photographer uses key lights, fill lights, and backlights to shape a subject. Three.js provides similar tools: directional lights (like the sun), point lights (like light bulbs), spotlights (focused beams), and ambient lights (general illumination).

### The Four Essential Light Types

**AmbientLight**: Illuminates all objects equally from all directions. No shadows, no directionality. Think of it as the baseline lighting - prevents pitch-black shadows. Use it sparingly (low intensity) to soften harsh shadows, not as the primary light source.

```javascript
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft gray light
```

**DirectionalLight**: Parallel rays like sunlight. Position doesn't matter (only direction). Creates consistent shadows as if from an infinite distance. Perfect for outdoor scenes, simulating the sun or moon.

```javascript
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);  // Direction from origin to this point
```

**PointLight**: Radiates equally in all directions from a point, like a light bulb. Intensity decreases with distance. Great for lamps, torches, glowing objects.

```javascript
const pointLight = new THREE.PointLight(0xff0000, 1, 100);  // color, intensity, distance
pointLight.position.set(0, 5, 0);
```

**SpotLight**: Focused cone of light, like a flashlight or stage spotlight. Has position, target, angle, and penumbra (soft edge). Most complex but most cinematic.

```javascript
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(10, 10, 10);
spotLight.target.position.set(0, 0, 0);
spotLight.angle = Math.PI / 6;  // 30-degree cone
```

### Light Properties

All lights share common properties:

**color**: RGB hex value (0xffffff = white)  
**intensity**: Brightness (1 = normal, 2 = double, 0.5 = half)  
**position**: Where the light is in 3D space  
**castShadow**: Whether this light creates shadows (expensive!)

Additional properties vary by type:
- PointLight/SpotLight: **distance** (how far light travels before fading)
- PointLight/SpotLight: **decay** (how quickly light fades, 2 = physically accurate)
- SpotLight: **angle** (cone width in radians)
- SpotLight: **penumbra** (soft edge, 0-1 where 1 = very soft)

### Shadows: Adding Depth

Shadows require three steps:

1. **Enable shadows on the renderer**:
```javascript
renderer.shadowMap.enabled = true;
```

2. **Tell lights to cast shadows**:
```javascript
directionalLight.castShadow = true;
```

3. **Tell objects to cast and receive shadows**:
```javascript
mesh.castShadow = true;     // This object creates shadows
plane.receiveShadow = true; // This object shows shadows on its surface
```

Shadows are expensive (require additional render passes), so use them strategically. Not every light needs shadows. In games, often only the main directional light (sun) casts shadows.

### Lighting Setups

Professional 3D artists use standard lighting setups:

**Three-Point Lighting**:
- Key light (main, bright, directional)
- Fill light (softer, opposite side, reduces harsh shadows)
- Back light (behind subject, creates rim/edge lighting)

**Studio Lighting**:
- Bright ambient (simulates bounced light in white studio)
- Soft directional from above-front

**Dramatic Lighting**:
- Low ambient (dark shadows)
- Strong directional from side (high contrast)
- Optional colored lights for mood

> **Key Insight:** Lighting is as important as modeling. Great lighting can make simple geometry look amazing; poor lighting can ruin detailed models.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **AmbientLight** | Uniform lighting from all directions, no shadows | Base illumination |
| **DirectionalLight** | Parallel rays like sunlight, direction matters | Outdoor sun |
| **PointLight** | Radiates from a point like a light bulb | Lamp, torch |
| **SpotLight** | Focused cone like a flashlight | Stage light |
| **Intensity** | Brightness multiplier (1 = normal, 2 = double bright) | Controls light strength |
| **Shadow Map** | Texture storing depth information for shadows | Rendered from light's POV |
| **Penumbra** | Soft edge on spotlight (0 = hard edge, 1 = very soft) | Creates realistic falloff |
| **Light Decay** | How quickly light fades with distance (2 = realistic) | Physically-based attenuation |

---

## 💻 Code Examples

### Example 1: Basic Lighting Setup

```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a scene with sphere and plane
const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5 });
const sphere = new THREE.Mesh(sphereGeo, material);
sphere.position.y = 1;
scene.add(sphere);

const planeGeo = new THREE.PlaneGeometry(10, 10);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;  // Rotate to be horizontal
scene.add(plane);

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);  // Soft gray
scene.add(ambientLight);

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

**What's happening:** We create a sphere floating above a plane. The ambient light provides base illumination (prevents pitch black). The directional light creates defined highlights and shadows. Notice how the sphere's shading changes based on the light position - this is how we perceive 3D depth.

### Example 2: Enabling Shadows

```javascript
// Enable shadows on renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Soft shadows

// Configure directional light for shadows
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.mapSize.width = 2048;   // Higher = sharper shadows
directionalLight.shadow.mapSize.height = 2048;

// Objects cast and receive shadows
sphere.castShadow = true;
plane.receiveShadow = true;

// Optional: Visualize shadow camera (for debugging)
const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);
```

**What's happening:** Shadows require GPU to render the scene from the light's perspective, creating a depth map. The shadow camera defines the area where shadows are calculated. Higher `mapSize` creates sharper shadows but uses more memory. `PCFSoftShadowMap` creates soft shadow edges (more realistic than hard edges).

### Example 3: Three-Point Lighting

```javascript
// Key light (main, bright, from front-right)
const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(5, 5, 5);
keyLight.castShadow = true;
scene.add(keyLight);

// Fill light (softer, from left, no shadows)
const fillLight = new THREE.DirectionalLight(0x8080ff, 0.4);  // Slightly blue
fillLight.position.set(-5, 3, 0);
scene.add(fillLight);

// Back light (rim light, from behind, creates edge highlights)
const backLight = new THREE.DirectionalLight(0xffff80, 0.6);  // Warm yellow
backLight.position.set(0, 3, -5);
scene.add(backLight);

// Ambient light (subtle, prevents pure black)
const ambient = new THREE.AmbientLight(0x404040, 0.2);
scene.add(ambient);
```

**What's happening:** This professional setup creates depth and definition. The key light is the main source. The fill light brightens shadows on the opposite side (notice the slight blue tint for color variation). The back light creates a bright rim around the subject, separating it from the background. Together, they create a three-dimensional, professional look.

> **💡 Try it:** Move the key light position and watch how shadows and highlights change. Try colored lights (red key, blue fill) for dramatic effects.

---

## ✏️ Hands-On Exercises

### Exercise 1: Light Type Comparison (⏱️ ~20 min)

**Goal:** Understand how each light type behaves differently

**Instructions:**
1. Create a scene with one sphere
2. Add ONLY an AmbientLight - observe the flat, shadowless look
3. Replace with DirectionalLight - see the gradient shading
4. Replace with PointLight positioned to the side - notice falloff
5. Replace with SpotLight aimed at the sphere - see the focused beam
6. Document what each light type is best used for

**Expected Output:**
Understanding when to use each light type based on visual results.

---

### Exercise 2: Shadow Setup (⏱️ ~25 min)

**Goal:** Enable and configure realistic shadows

**Instructions:**
1. Create a scene with multiple objects (sphere, cube, cylinder)
2. Add a large plane as the ground
3. Add a DirectionalLight
4. Enable shadows on renderer, light, and objects
5. Adjust shadow camera frustum to cover all objects
6. Increase shadow map resolution to 2048
7. Use CameraHelper to visualize shadow camera

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
If shadows don't appear, check: renderer.shadowMap.enabled, light.castShadow, object.castShadow, plane.receiveShadow
</details>

<details>
<summary>Hint 2</summary>
Shadow camera frustum must encompass all shadow-casting objects. Use CameraHelper to debug.
</details>

---

### Exercise 3: Mood Lighting (⏱️ ~25 min)

**Goal:** Create distinct atmospheres using lighting

**Instructions:**
1. Create a simple scene (sphere on plane)
2. Lighting Setup A: "Sunny Day" (bright white directional, warm ambient)
3. Lighting Setup B: "Dramatic Night" (dark blue ambient, strong white directional from side)
4. Lighting Setup C: "Neon City" (dark ambient, multiple colored PointLights)
5. Use a button or key press to switch between setups

**Expected Output:**
Three distinct moods showing the power of lighting to transform a scene.

---

## 📖 Curated Resources

### Must-Read

1. **Lights in Three.js** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/lights/Light
   - Why: Complete reference for all light types and properties

2. **Shadows** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/shadows
   - Why: Deep dive into shadow configuration and optimization

### Video Resources

3. **Three.js Lighting Tutorial** — (Search for recent lighting tutorials)
   - Why: Visual demonstration of light types and shadow setup

### Deep Dives (optional)

4. **Three-Point Lighting in Photography** — General resource
   - Why: Understanding professional lighting principles applicable to 3D

---

## 🤔 Reflection Questions

1. **Comprehension:** Why does AmbientLight not create any shadows?
   - *Think about: How is it different from directional light?*

2. **Application:** When would you use a PointLight instead of a DirectionalLight?
   - *Think about: Real-world light sources and their behavior*

3. **Connection:** How do lights and materials work together to create realism?

4. **Critical Thinking:** Why are shadows computationally expensive?

5. **Personal:** What lighting setup will you use for your AI portfolio?

---

## ➡️ Next Steps

**Tomorrow:** [Day 6: Cameras and Controls](./day-06-brief.md) — Learn about different camera types and how to add user interaction with orbit controls

Now that you can create beautiful lighting, tomorrow we'll explore camera controls to let users navigate your 3D scenes interactively.

**Before moving on, make sure you can:**
- [ ] Add and configure all four main light types
- [ ] Enable shadows on lights and objects
- [ ] Create a three-point lighting setup
- [ ] Adjust light intensity and color for mood
- [ ] Understand the performance cost of shadows

[← Previous: Day 4 - Materials](./day-04-brief.md) | [Course Home](../README.md) | [Next: Day 6 - Cameras & Controls →](./day-06-brief.md)
