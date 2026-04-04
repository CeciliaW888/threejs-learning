# Day 7: Week 1 Review & Mini-Project

[← Previous: Day 6 - Cameras](./day-06-brief.md) | [Course Home](../README.md) | [Next: Day 8 - Animation Basics →](./day-08-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Review and consolidate all Week 1 concepts (scenes, geometries, materials, lighting, cameras)
2. Build a complete interactive 3D scene from scratch
3. Combine multiple Three.js features into one cohesive project
4. Troubleshoot common issues independently
5. Identify your knowledge gaps and areas for deeper practice

**Difficulty:** 🟢 Beginner
**Estimated Time:** 1 hour (10 min review + 50 min project)

---

## 📚 Core Concepts Review

### Week 1 Recap: The Fundamentals

This week you built a strong foundation in Three.js:

**Day 1**: Introduction - What Three.js is, why it matters, development environment setup  
**Day 2**: First Scene - The big three (Scene, Camera, Renderer), meshes, animation loops  
**Day 3**: Geometries - Built-in shapes, segments, positioning, scene graph hierarchy  
**Day 4**: Materials - Material types, PBR concepts, texture loading and application  
**Day 5**: Lighting - Light types, shadow configuration, three-point lighting setups  
**Day 6**: Cameras - FOV parameters, OrbitControls, camera animation  

These six concepts form the core of every Three.js application. You can build surprisingly complex scenes by combining them creatively.

### The Minimum Viable 3D Scene

Every Three.js scene requires:
1. **Scene** - container for everything
2. **Camera** - defines viewpoint (usually PerspectiveCamera)
3. **Renderer** - draws scene to canvas (WebGLRenderer)
4. **Geometry** - shapes (BoxGeometry, SphereGeometry, etc.)
5. **Material** - appearance (at minimum MeshBasicMaterial, better with MeshStandardMaterial)
6. **Mesh** - combines geometry + material
7. **Light** - illuminates materials that react to light (except BasicMaterial)
8. **Animation Loop** - renders continuously, enables animation

If any piece is missing or misconfigured, you'll see a black screen or errors.

### Common Gotchas (from Week 1)

**Black screen?**
- Camera position at 0,0,0 (inside objects)
- No lights with non-Basic materials
- Camera looking wrong direction
- Renderer not added to DOM

**Performance issues?**
- Too many segments on geometries
- Shadow maps with high resolution
- Too many lights casting shadows
- Not using BufferGeometry

**Visual issues?**
- Incorrect aspect ratio (stretching)
- Forgot `updateProjectionMatrix()` after camera changes
- Forgot `controls.update()` with damping enabled
- Wrong material for your lighting setup

> **Key Insight:** Most Three.js problems come from missing configuration, not code errors. Triple-check your setup before debugging complex issues.

---

## 🔑 Key Terminology Review

| Term | Definition | Week 1 Day |
|------|-----------|------------|
| **Scene Graph** | Tree of parent-child 3D objects | Day 2, 3 |
| **Mesh** | Geometry + Material = visible object | Day 2 |
| **BufferGeometry** | Efficient vertex data storage | Day 3 |
| **PBR** | Physically-Based Rendering (realistic materials) | Day 4 |
| **Texture Mapping** | Wrapping 2D images on 3D surfaces | Day 4 |
| **Three-Point Lighting** | Key + Fill + Back professional setup | Day 5 |
| **Shadow Map** | Depth texture rendered from light's POV | Day 5 |
| **FOV** | Field of View - camera's viewing angle | Day 6 |
| **OrbitControls** | Mouse-based camera navigation | Day 6 |
| **Damping** | Smooth inertia in controls | Day 6 |

---

## 💻 Mini-Project: Interactive 3D Gallery

### Project Goal

Build a simple 3D art gallery where:
- Multiple objects are displayed on pedestals
- Users can orbit around with mouse controls
- Scene has realistic lighting and shadows
- Objects have different materials and textures
- Scene is responsive to window resize

### Project Requirements

**Scene Setup** (20 points):
- [ ] Create scene, camera (FOV 75), renderer
- [ ] Set up OrbitControls with damping
- [ ] Handle window resize
- [ ] Add background color or skybox

**Geometry & Layout** (20 points):
- [ ] Create 3-5 different geometries (sphere, cube, torus, etc.)
- [ ] Position them in an interesting layout
- [ ] Add a floor plane
- [ ] Use groups to organize objects

**Materials** (20 points):
- [ ] Use at least 3 different material types
- [ ] Apply at least one texture
- [ ] Use PBR materials (MeshStandardMaterial) for realism
- [ ] Vary roughness and metalness values

**Lighting** (20 points):
- [ ] Implement three-point lighting (or similar multi-light setup)
- [ ] Enable shadows on at least one light
- [ ] Configure shadow-casting and receiving objects
- [ ] Use appropriate ambient light intensity

**Interaction** (10 points):
- [ ] OrbitControls configured with reasonable limits
- [ ] Auto-rotate option (optional)
- [ ] Smooth camera movement

**Polish** (10 points):
- [ ] Clean, organized code with comments
- [ ] No console errors
- [ ] Smooth performance (60 FPS)
- [ ] Aesthetically pleasing composition

### Starter Code Template

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
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

// ===== YOUR CODE HERE =====
// Add lights, geometries, materials, textures

// Floor
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x404040,
    roughness: 0.8 
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Example object (add more!)
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.3,
        metalness: 0.7
    })
);
sphere.position.y = 1;
sphere.castShadow = true;
scene.add(sphere);

// ===== LIGHTS =====
// TODO: Add three-point lighting

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
```

### Stretch Goals

If you finish early, try these enhancements:
- Add animated elements (rotating objects)
- Implement texture scrolling or animation
- Create a "pedestal" group (base + object)
- Add post-processing effects
- Load a custom 3D model (preview for Week 2)

---

## ✏️ Hands-On Exercises

### Exercise 1: Quick Knowledge Check (⏱️ ~10 min)

**Goal:** Test your understanding of Week 1 concepts

**Questions:**
1. What three objects are required in every Three.js scene?
2. What's the difference between MeshBasicMaterial and MeshStandardMaterial?
3. How do you enable shadows in Three.js? (3 steps)
4. What does the FOV parameter control in PerspectiveCamera?
5. Why must you call `updateProjectionMatrix()` after changing camera properties?

Write answers, then check against course material.

---

### Exercise 2: Build the Gallery (⏱️ ~40 min)

**Goal:** Complete the mini-project above

Follow the requirements checklist and build your interactive 3D gallery. Use what you learned this week!

---

### Exercise 3: Troubleshooting Practice (⏱️ ~10 min)

**Goal:** Fix intentionally broken code

Download or create a broken scene with these issues:
- Camera at origin (inside objects)
- Missing light with non-Basic materials
- Shadows enabled but objects not configured
- Controls damping without update() call

Fix each issue and document what was wrong.

---

## 📖 Curated Resources

### Must-Review

1. **Week 1 Course Materials** — Your own notes
   - Review Day 1-6 briefs
   - Why: Consolidate learning

2. **Three.js Fundamentals** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/fundamentals
   - Why: Official refresher on core concepts

### Project Inspiration

3. **Three.js Examples** — Official Examples
   - 🔗 https://threejs.org/examples/
   - Why: See what's possible, get ideas for your gallery

---

## 🤔 Reflection Questions

1. **Comprehension:** Which Week 1 concept did you find most challenging, and why?

2. **Application:** How would you optimize a scene with 100 objects for better performance?
   - *Think about: Geometry complexity, materials, shadows, rendering*

3. **Connection:** How do all Week 1 concepts work together to create a complete scene?

4. **Critical Thinking:** What's still confusing or unclear from this week?

5. **Personal:** What type of 3D scene are you most excited to build for your AI portfolio?

---

## ➡️ Next Steps

**Tomorrow:** [Day 8: Animation Basics](./day-08-brief.md) — Learn to animate objects with loops, tweening, and the Clock object

You've mastered the foundations! Week 2 builds on this base with animation, advanced geometries (GLTF models), shaders, and prompt engineering for AI integration.

**Week 2 Preview:**
- Day 8-9: Animation techniques
- Day 10-11: Loading 3D models (GLTF)
- Day 12: Shaders and custom materials
- Day 13: Performance optimization
- Day 14: AI prompt patterns for 3D scenes

**Before moving on, make sure you can:**
- [ ] Build a complete 3D scene from scratch
- [ ] Configure lighting for realism
- [ ] Apply materials and textures
- [ ] Set up interactive camera controls
- [ ] Troubleshoot black screens and common issues

[← Previous: Day 6 - Cameras](./day-06-brief.md) | [Course Home](../README.md) | [Next: Day 8 - Animation Basics →](./day-08-brief.md)
