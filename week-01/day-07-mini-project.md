# Day 7: Week 1 Review & Mini-Project

[← Previous: Day 6 - Cameras](./day-06-textures.md) | [Course Home](../README.md) | [Next: Day 8 - Animation Basics →](../week-02/day-08-animation.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Review and consolidate all Week 1 concepts (scenes, geometries, materials, lighting, cameras)
2. Build a complete interactive 3D scene from scratch
3. Combine multiple Three.js features into one cohesive project
4. Troubleshoot common issues independently
5. Identify knowledge gaps and areas for deeper practice

**Difficulty:** 🟢 Beginner
**Estimated Time:** 1 hour (10 min review + 50 min project)

---

## 📚 Core Concepts

### Week 1 Recap: The Fundamentals

This week you built a real foundation. Let's map what you learned and how it all connects:

**Day 1 — Introduction:** What Three.js is, why it matters for web portfolios, setting up your development environment with Vite.

**Day 2 — First Scene:** The essential trio (Scene, Camera, Renderer), creating meshes, writing the animation loop that keeps everything running.

**Day 3 — Geometries:** Built-in shapes (boxes, spheres, tori), controlling detail with segments, positioning objects in 3D space, using groups for hierarchy.

**Day 4 — Materials:** The visual layer — material types from BasicMaterial to StandardMaterial, PBR concepts (roughness, metalness), loading and applying textures.

**Day 5 — Lighting:** Bringing scenes to life — light types (ambient, directional, point, spot), configuring shadows, three-point lighting for professional results.

**Day 6 — Cameras:** Your viewpoint into the scene — PerspectiveCamera parameters, OrbitControls for user navigation, camera animation with easing.

These six concepts form the core of **every** Three.js application. From a simple product viewer to a complex interactive portfolio — it's all combinations of scenes, geometries, materials, lights, and cameras.

### The Minimum Viable 3D Scene

Every Three.js scene needs these pieces working together:

1. **Scene** — the container that holds everything
2. **Camera** — defines what the user sees (usually PerspectiveCamera)
3. **Renderer** — draws the scene to a `<canvas>` element (WebGLRenderer)
4. **Geometry** — the shape of objects (BoxGeometry, SphereGeometry, etc.)
5. **Material** — the appearance of objects (color, roughness, metalness)
6. **Mesh** — combines geometry + material into a visible object
7. **Light** — illuminates materials that react to light (everything except BasicMaterial)
8. **Animation Loop** — calls `requestAnimationFrame` to render continuously

If any piece is missing or misconfigured, you'll see a black screen or errors. That's actually the most common Three.js frustration — not broken code, but a missing piece in the setup chain.

### Common Gotchas (Your Week 1 Debugging Checklist)

**Black screen?** This is the #1 issue. Check these in order:
- Camera position still at (0, 0, 0) — you're inside your objects
- Using StandardMaterial but forgot to add lights
- Camera looking the wrong direction — try `camera.lookAt(0, 0, 0)`
- Renderer not appended to the DOM — `document.body.appendChild(renderer.domElement)`

**Objects look wrong?**
- Stretching = incorrect aspect ratio (didn't match window dimensions)
- Flat/unlit = wrong material for your lighting setup (BasicMaterial ignores lights)
- Forgot `updateProjectionMatrix()` after changing camera properties
- Forgot `controls.update()` in animation loop with damping enabled

**Performance problems?**
- Too many segments on geometries (32 is usually enough for spheres)
- Shadow maps with unnecessarily high resolution
- Too many lights casting shadows (each shadow = extra render pass)

> **Key Insight:** Most Three.js problems come from missing configuration, not code errors. When something doesn't look right, check your setup chain before debugging complex logic.

---

## 🔑 Key Terminology Review

| Term | Definition | From |
|------|-----------|------|
| **Scene Graph** | Tree of parent-child 3D objects | Day 2-3 |
| **Mesh** | Geometry + Material = visible object | Day 2 |
| **BufferGeometry** | Efficient vertex data storage format | Day 3 |
| **PBR** | Physically-Based Rendering — realistic material model | Day 4 |
| **Texture Mapping** | Wrapping 2D images onto 3D surfaces | Day 4 |
| **Three-Point Lighting** | Key + Fill + Back light — professional setup | Day 5 |
| **Shadow Map** | Depth texture rendered from light's perspective | Day 5 |
| **FOV** | Field of View — camera's vertical viewing angle | Day 6 |
| **OrbitControls** | Mouse/touch-based camera navigation | Day 6 |
| **Damping** | Inertia effect for smooth, polished controls | Day 6 |

---

## 💻 Mini-Project: Interactive 3D Gallery

### Project Goal

Build a 3D art gallery where multiple objects sit on a floor, lit with professional lighting, and users can orbit around the scene with mouse controls. This combines **everything** from Week 1.

### Starter Code

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);  // Dark blue background

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(8, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ===== FLOOR =====
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x404040, roughness: 0.8 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// ===== YOUR GALLERY OBJECTS =====
// Add 3-5 objects with different geometries and materials:

// Object 1: Metallic red sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3, metalness: 0.7 })
);
sphere.position.set(-3, 1, 0);
sphere.castShadow = true;
scene.add(sphere);

// Object 2: Matte blue cube
// TODO: Add more objects!

// ===== LIGHTS =====
// TODO: Implement three-point lighting (key + fill + ambient)

// ===== ANIMATION LOOP =====
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// ===== HANDLE WINDOW RESIZE =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### Requirements Checklist

**Scene Setup** (20 points):
- [ ] Scene, camera (FOV 75), renderer with antialiasing
- [ ] OrbitControls with damping enabled
- [ ] Window resize handler
- [ ] Background color set

**Geometry & Layout** (20 points):
- [ ] 3-5 different geometry types (sphere, cube, torus, cylinder, etc.)
- [ ] Objects positioned in an interesting layout (not all stacked)
- [ ] Floor plane that receives shadows
- [ ] At least one group to organize related objects

**Materials** (20 points):
- [ ] At least 3 different material configurations
- [ ] Vary roughness and metalness values across objects
- [ ] Use MeshStandardMaterial for PBR realism
- [ ] At least one texture applied (optional but encouraged)

**Lighting** (20 points):
- [ ] Multi-light setup (ambient + at least 2 directional/point/spot)
- [ ] Shadows enabled on at least one light
- [ ] Objects configured for castShadow / receiveShadow
- [ ] Balanced lighting (not too bright, not too dark)

**Interaction & Polish** (20 points):
- [ ] OrbitControls with reasonable zoom limits
- [ ] Optional: auto-rotation for showcase effect
- [ ] Clean code with comments
- [ ] Smooth 60 FPS performance

### Stretch Goals

If you finish early:
- Add rotating or floating objects (animate in the loop)
- Create "pedestal" groups (cylinder base + object on top)
- Add a second camera angle with keyboard switching (from Day 6)
- Experiment with post-processing effects (preview for later weeks)

---

## ✏️ Hands-On Exercises

### Exercise 1: Quick Knowledge Check (⏱️ ~10 min)

**Goal:** Test your retention of Week 1 concepts

Answer these without looking at notes, then check:
1. What three objects does every Three.js scene require at minimum?
2. What's the key difference between MeshBasicMaterial and MeshStandardMaterial?
3. What are the 3 steps to enable shadows in Three.js?
4. What does the FOV parameter in PerspectiveCamera control?
5. Why must you call `updateProjectionMatrix()` after changing camera properties?

<details>
<summary>Check your answers</summary>

1. Scene, Camera, Renderer
2. BasicMaterial ignores lights (always fully lit); StandardMaterial reacts to lights with PBR
3. Enable on renderer (`renderer.shadowMap.enabled = true`), set light to cast shadows (`light.castShadow = true`), set objects to cast/receive shadows
4. The vertical viewing angle in degrees — wider = more visible, narrower = zoomed in
5. The camera internally uses a projection matrix for rendering; changing properties doesn't update it automatically
</details>

---

### Exercise 2: Build the Gallery (⏱️ ~40 min)

**Goal:** Complete the mini-project above using the starter code

Work through the requirements checklist. Add your own objects, lighting, and materials. Make it look good — this is your first complete Three.js scene!

**Hints (if stuck):**
<details>
<summary>Hint: Lighting setup</summary>
Start with ambient light (intensity ~0.3) for base illumination, then add a directional light (intensity ~1.0) positioned above and to the side for the key light. A second dimmer light from the opposite side works as fill.
</details>

<details>
<summary>Hint: Interesting layout</summary>
Arrange objects in a semicircle or grid pattern. Use different Y positions (some on the floor, some floating). Vary scale for visual interest.
</details>

---

### Exercise 3: Troubleshooting Practice (⏱️ ~10 min)

**Goal:** Develop your debugging instincts

Create a broken scene on purpose with these issues, then fix each one:
1. Camera at (0, 0, 0) — inside objects
2. MeshStandardMaterial with no lights added
3. `shadowMap.enabled = true` but objects don't have `castShadow` set
4. OrbitControls damping enabled but `controls.update()` missing from loop

Document what each bug looks like (black screen? flat objects? no shadows?) so you can recognize them instantly in future projects.

---

## 📖 Curated Resources

### Must-Review

1. **Your Week 1 Notes** — Review Day 1-6 guides
   - Why: Consolidation is where real learning happens — re-reading solidifies concepts

2. **Three.js Fundamentals** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/fundamentals
   - Why: Official refresher covering the core setup pattern

### Project Inspiration

3. **Three.js Examples Gallery** — Official Examples
   - 🔗 https://threejs.org/examples/
   - Why: Browse what's possible — great for sparking ideas for your gallery

4. **Three.js Editor** — Online Scene Builder
   - 🔗 https://threejs.org/editor/
   - Why: Experiment with objects, lights, and materials visually before coding

---

## 🤔 Reflection Questions

1. **Comprehension:** Which Week 1 concept did you find most challenging, and why?
   - *Think about: What needed the most re-reading or experimentation?*

2. **Application:** How would you optimize a scene with 100 objects for smooth performance?
   - *Think about: Geometry detail, shadow settings, material complexity, draw calls*

3. **Connection:** How do all six days of concepts work together? What breaks if you remove any one piece?
   - *Think about: The dependency chain from scene → camera → renderer → mesh → material → light*

4. **Critical Thinking:** What's still confusing or unclear from this week? What would you want to revisit?

5. **Personal:** What kind of 3D scene are you most excited to build for your AI portfolio?

---

## ➡️ Next Steps

**Tomorrow:** [Day 8: Animation Basics](../week-02/day-08-animation.md) — Learn to animate objects with loops, tweening, and the Clock object

You've mastered the foundations! Week 2 builds on everything you learned with animation techniques, loading 3D models (GLTF format), shaders, and performance optimization.

**Week 2 Preview:**
- Day 8-9: Animation techniques (Clock, tweening, keyframes)
- Day 10-11: Loading 3D models (GLTF)
- Day 12: Shaders and custom materials
- Day 13: Performance optimization
- Day 14: AI prompt patterns for 3D scenes

**Before moving on, make sure you can:**
- [ ] Build a complete 3D scene from scratch without referencing notes
- [ ] Configure lighting that looks realistic (not flat or blown out)
- [ ] Apply materials with varied roughness/metalness for visual interest
- [ ] Set up interactive camera controls with damping and limits
- [ ] Troubleshoot common issues (black screen, missing shadows, stretched objects)

[← Previous: Day 6 - Cameras](./day-06-textures.md) | [Course Home](../README.md) | [Next: Day 8 - Animation Basics →](../week-02/day-08-animation.md)
