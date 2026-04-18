# Day 10: Shadows & Realistic Lighting

[← Previous: Day 9 - Loading 3D Models](./day-09-brief.md) | [Course Home](../README.md) | [Next: Day 11 - Performance Optimization →](./day-11-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Configure shadow maps for realistic shadows in Three.js
2. Understand shadow map resolution, bias, and performance trade-offs
3. Create mood and atmosphere with environment maps and HDR lighting
4. Use tone mapping to achieve cinematic or photorealistic looks
5. Combine multiple lighting techniques for production-quality scenes

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1 hour (25 min reading + 35 min hands-on)

---

## 📚 Core Concepts

### The Shadow Pipeline

Shadows in Three.js aren't free — they require extra rendering passes. Here's how it works:

1. **Shadow Map Rendering**: For each shadow-casting light, Three.js renders the scene from the light's perspective into a depth texture (shadow map)
2. **Shadow Comparison**: During the main render, each pixel checks whether it's "seen" by the light using the shadow map
3. **Shadow Display**: Pixels in shadow are darkened; pixels lit by the light are bright

This means: more shadow-casting lights = more render passes = lower performance.

### Enabling Shadows (The Three Steps)

Every shadow setup requires three things:

```javascript
// Step 1: Enable shadows on the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows

// Step 2: Light must cast shadows
directionalLight.castShadow = true;

// Step 3: Objects must cast AND/OR receive shadows
model.castShadow = true;    // This object creates shadows
floor.receiveShadow = true;  // This object shows shadows on its surface
```

Miss any step and shadows won't appear. This is the #1 debugging issue.

### Shadow Map Quality

Shadow maps are textures — their resolution determines shadow sharpness:

```javascript
directionalLight.shadow.mapSize.width = 2048;   // Default: 512
directionalLight.shadow.mapSize.height = 2048;

// Camera frustum (what area the shadow covers)
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
```

**Shadow bias** prevents "shadow acne" (weird striping patterns):
```javascript
directionalLight.shadow.bias = -0.0001;
directionalLight.shadow.normalBias = 0.02;
```

### Environment Maps & HDR Lighting

The most dramatic upgrade to scene quality comes from environment maps. Instead of placing individual lights, you wrap the entire scene in a high-dynamic-range (HDR) image that provides natural, omnidirectional lighting.

```javascript
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const rgbeLoader = new RGBELoader();
rgbeLoader.load('/textures/environment.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    
    scene.background = environmentMap;     // Visible background
    scene.environment = environmentMap;     // Lighting for all PBR materials
});
```

This single change makes PBR materials (MeshStandardMaterial, MeshPhysicalMaterial) look dramatically better because they now have realistic reflections and indirect lighting.

### Tone Mapping

HDR lighting produces values above 1.0 (brighter than white). Tone mapping compresses these values into the displayable range:

```javascript
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic look
renderer.toneMappingExposure = 1.0;                  // Brightness control
```

| Tone Mapping | Look | Use Case |
|-------------|------|----------|
| `NoToneMapping` | Raw, washed out | Debugging |
| `LinearToneMapping` | Even, flat | Neutral scenes |
| `ReinhardToneMapping` | Soft, gentle | Product shots |
| `ACESFilmicToneMapping` | Cinematic, contrasty | Portfolio, showcase |
| `AgXToneMapping` | Modern cinema, accurate | Best overall quality |

> **Key Insight:** The combination of HDR environment map + ACES tone mapping + PBR materials is what makes Three.js scenes look "professional" vs "hobby project." It's often the single biggest quality upgrade.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Shadow Map** | Depth texture rendered from light's perspective | Higher resolution = sharper shadows |
| **PCFSoftShadowMap** | Smooth shadow edges via percentage-closer filtering | `renderer.shadowMap.type` |
| **Shadow Bias** | Offset to prevent shadow acne artifacts | `-0.0001` to `-0.001` |
| **Environment Map** | HDR image wrapping the scene for lighting | `.hdr` or `.exr` files |
| **HDR** | High Dynamic Range — brightness values above 1.0 | Captures real-world light intensity |
| **Tone Mapping** | Compressing HDR values to displayable range | ACES, Reinhard, AgX |
| **Exposure** | Overall brightness multiplier | `toneMappingExposure` |
| **Contact Shadows** | Soft shadows where objects meet surfaces | Adds grounding to objects |

---

## 💻 Code Examples

### Example 1: Production Shadow Setup

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Shadow setup
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

document.body.appendChild(renderer.domElement);

// Directional light (sun)
const sunLight = new THREE.DirectionalLight(0xfff5e6, 2);
sunLight.position.set(10, 15, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -15;
sunLight.shadow.camera.right = 15;
sunLight.shadow.camera.top = 15;
sunLight.shadow.camera.bottom = -15;
sunLight.shadow.bias = -0.0001;
sunLight.shadow.normalBias = 0.02;
scene.add(sunLight);

// Ambient fill
const ambientLight = new THREE.AmbientLight(0x6688cc, 0.4);
scene.add(ambientLight);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Objects with shadows
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.3, metalness: 0.7 })
);
sphere.position.y = 1;
sphere.castShadow = true;
scene.add(sphere);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** This sets up production-quality shadows with soft edges, correct bias to prevent artifacts, and a large enough shadow camera to cover the scene. The ACES tone mapping adds a cinematic feel.

### Example 2: HDR Environment Lighting

```javascript
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Load HDR environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/textures/studio_small.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    
    // Use for both background and lighting
    scene.background = texture;
    scene.environment = texture;
    
    // Or use a solid color background with HDR lighting only
    // scene.background = new THREE.Color(0x1a1a2e);
    // scene.environment = texture;
});

// With environment map, PBR materials look incredible
const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 1.0
});

const matte = new THREE.MeshStandardMaterial({
    color: 0xff6644,
    roughness: 0.9,
    metalness: 0.0
});
```

**What's happening:** The HDR environment map provides natural lighting from all directions. Setting `scene.environment` automatically lights all PBR materials. Chrome (low roughness, high metalness) reflects the environment clearly. Matte materials (high roughness) get soft diffuse lighting.

### Example 3: Shadow Helper for Debugging

```javascript
// Visualize shadow camera frustum
const shadowHelper = new THREE.CameraHelper(sunLight.shadow.camera);
scene.add(shadowHelper);

// Visualize light direction
const lightHelper = new THREE.DirectionalLightHelper(sunLight, 2);
scene.add(lightHelper);

// Remove helpers in production
// scene.remove(shadowHelper);
// scene.remove(lightHelper);
```

**What's happening:** Helpers are essential for debugging shadows. The CameraHelper shows exactly what area the shadow map covers. If objects are outside this frustum, they won't cast shadows. Adjust the shadow camera bounds to fit your scene.

> **💡 Try it:** Download a free HDR from https://polyhaven.com/hdris and use it as your scene's environment map. Compare the difference with and without it.

---

## ✏️ Hands-On Exercises

### Exercise 1: Shadow Configuration (⏱️ ~15 min)

**Goal:** Set up production-quality shadows

**Instructions:**
1. Create a scene with a floor plane and 3-5 objects at different heights
2. Add a directional light with shadow casting enabled
3. Configure shadow map resolution to 2048x2048
4. Add shadow helpers to visualize the shadow camera
5. Adjust shadow camera bounds to fit your scene exactly
6. Fine-tune shadow bias to eliminate shadow acne

**Expected Output:**
Clean, soft shadows with no artifacts on all objects.

---

### Exercise 2: HDR Environment Setup (⏱️ ~20 min)

**Goal:** Transform your scene with environment-based lighting

**Instructions:**
1. Download a free HDR from https://polyhaven.com/hdris (try "studio_small" or "venice_sunset")
2. Load it with RGBELoader
3. Apply as both background and environment
4. Create 5 spheres with different roughness values (0, 0.25, 0.5, 0.75, 1.0)
5. Set all to metalness 1.0 and observe reflections
6. Try different tone mapping modes and compare

**Expected Output:**
A row of spheres ranging from mirror-like to matte, all naturally lit by the HDR.

---

### Exercise 3: Portfolio Lighting (⏱️ ~20 min)

**Goal:** Light your Day 9 portfolio scene professionally

**Instructions:**
1. Start from your Day 9 exercise (loaded model on floor)
2. Add HDR environment lighting
3. Configure shadows on your model (traverse and enable castShadow)
4. Use ACES tone mapping with 1.0-1.5 exposure
5. Add a subtle ambient light for fill
6. Compare before/after — screenshot both!

**Expected Output:**
Your portfolio scene looking dramatically better with professional lighting.

---

## 📖 Curated Resources

### Must-Read

1. **Shadows** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/shadows (~15 min read)
   - Why: Comprehensive guide to shadow configuration and debugging

2. **Poly Haven** — Free HDR Environment Maps
   - 🔗 https://polyhaven.com/hdris
   - Why: High-quality, free HDRIs for your projects (CC0 license)

### Video Resources

3. **Realistic Reflections in Three.js with Environment Mapping** — Dan Greenheck (2024)
   - 🎥 https://www.youtube.com/watch?v=7gtrBJzm2xE
   - Why: PBR materials, HDR environment maps, and realistic lighting setup

4. **Three.js Lighting Tutorial: HemisphereLight + DirectionalLight (Crisp Shadows)** — Pixel Grid UI (2025)
   - 🎥 https://www.youtube.com/watch?v=bRCfC9ZASR8
   - Why: Focused shadow setup with directional and hemisphere lights

### Deep Dives (optional)

5. **Physically Based Rendering** — Learn OpenGL
   - 🔗 https://learnopengl.com/PBR/Theory
   - Why: Understand the math behind why HDR + PBR materials look so good

---

## 🤔 Reflection Questions

1. **Comprehension:** Why does enabling shadows require changes to the renderer, the light, AND the objects?

2. **Application:** If your shadows look blurry, what two settings would you adjust first?

3. **Connection:** How does tone mapping relate to the material concepts from Day 4?

4. **Critical Thinking:** Why might you want to use an HDR for lighting but NOT as the visible background?

5. **Personal:** What mood/atmosphere do you want for your portfolio? Warm studio? Cool minimal? Dark dramatic?

---

## ➡️ Next Steps

**Tomorrow:** [Day 11: Performance Optimization Basics](./day-11-brief.md) — Learn to keep your scene running at 60fps as you add more content

Your scene is starting to look professional. But as you add more models, higher-resolution shadows, and HDR environments, performance becomes critical. Tomorrow we'll learn how to measure and optimize.

**Before moving on, make sure you can:**
- [ ] Configure shadow maps with proper resolution and bias
- [ ] Use CameraHelper to debug shadow frustum
- [ ] Load and apply HDR environment maps
- [ ] Set up tone mapping for cinematic looks
- [ ] Light a scene that looks professional

[← Previous: Day 9 - Loading 3D Models](./day-09-brief.md) | [Course Home](../README.md) | [Next: Day 11 - Performance Optimization →](./day-11-brief.md)
