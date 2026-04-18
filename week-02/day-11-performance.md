# Day 11: Performance Optimization Basics

[← Previous: Day 10 - Shadows & Realistic Lighting](./day-10-brief.md) | [Course Home](../README.md) | [Next: Day 12 - Intro to Prompt Engineering →](./day-12-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Measure rendering performance with the Stats panel and Chrome DevTools
2. Understand the main performance bottlenecks in Three.js (draw calls, geometry, textures)
3. Apply key optimization techniques: instancing, LOD, geometry merging
4. Optimize textures and materials for web delivery
5. Use disposal patterns to prevent memory leaks

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1 hour (30 min reading + 30 min hands-on)

---

## 📚 Core Concepts

### Why Performance Matters

Your AI portfolio needs to run smoothly on laptops, not just gaming PCs. A beautiful scene that stutters at 15fps on a MacBook Air is worse than a simple scene at solid 60fps. Users will close a slow 3D site within seconds.

The target: **60fps consistently** (or at minimum 30fps on mobile). That gives you ~16.6ms per frame to update logic, traverse the scene graph, and render everything.

### Measuring Performance

**Stats.js Panel:**
```javascript
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
    stats.begin();
    // ... your render code ...
    stats.end();
    requestAnimationFrame(animate);
}
```

This gives you FPS, frame time (ms), and memory usage in real-time.

**Renderer Info:**
```javascript
console.log(renderer.info.render);
// { calls: 42, triangles: 125000, points: 0, lines: 0 }

console.log(renderer.info.memory);
// { geometries: 15, textures: 8 }
```

`renderer.info.render.calls` is your **draw call count** — one of the most important numbers. Each draw call is a command to the GPU. More draw calls = more overhead.

### The Big Three Bottlenecks

**1. Draw Calls** (CPU-bound)
Each unique mesh with its own material is one draw call. 100 separate cubes = 100 draw calls. Even if each cube is trivial, the CPU overhead of issuing 100 commands adds up.

**Fix:** Merge geometries, use InstancedMesh, reduce unique material count.

**2. Triangle Count** (GPU-bound)
More triangles means more work for the GPU per frame. A single high-poly model (500K+ triangles) can tank performance.

**Fix:** Use lower-poly models, Level of Detail (LOD), simplify geometry.

**3. Texture Memory** (Memory-bound)
Large textures eat VRAM. A single 4096x4096 texture uses ~64MB of GPU memory. Multiple large textures can exceed device limits.

**Fix:** Compress textures, use appropriate sizes, share textures between materials.

### InstancedMesh: The Draw Call Killer

When you need many copies of the same geometry + material (trees, particles, buildings), `InstancedMesh` renders them all in a single draw call:

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 });

// 1000 cubes in ONE draw call (instead of 1000)
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);

const dummy = new THREE.Object3D();
for (let i = 0; i < 1000; i++) {
    dummy.position.set(
        (Math.random() - 0.5) * 50,
        Math.random() * 10,
        (Math.random() - 0.5) * 50
    );
    dummy.rotation.set(Math.random(), Math.random(), Math.random());
    dummy.scale.setScalar(0.5 + Math.random());
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
}

scene.add(instancedMesh);
```

### Level of Detail (LOD)

Show simpler models when objects are far from camera:

```javascript
const lod = new THREE.LOD();

// High detail (close up)
lod.addLevel(highPolyMesh, 0);     // Show when distance < 10
// Medium detail  
lod.addLevel(medPolyMesh, 10);     // Show when distance 10-30
// Low detail (far away)
lod.addLevel(lowPolyMesh, 30);     // Show when distance > 30

scene.add(lod);

// Update in animation loop
function animate() {
    lod.update(camera);
    // ...
}
```

### Geometry Merging

Combine multiple static meshes into one to reduce draw calls:

```javascript
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const geometries = [];
for (let i = 0; i < 100; i++) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(i * 2, 0, 0);  // Position each before merging
    geometries.push(geo);
}

const mergedGeometry = mergeGeometries(geometries);
const mesh = new THREE.Mesh(mergedGeometry, material);
scene.add(mesh);  // 100 cubes, 1 draw call
```

**Trade-off:** You can't move or animate individual cubes after merging. Use for static scenery only.

### Texture Optimization

```javascript
// Use power-of-two sizes: 256, 512, 1024, 2048
// Avoid odd sizes like 1000x750

// Compress textures with KTX2 for GPU-native compression
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

// Dispose unused textures to free memory
texture.dispose();
material.dispose();
geometry.dispose();
```

### Memory Management

Three.js doesn't automatically free GPU memory. You must manually dispose:

```javascript
function removeObject(obj) {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
        } else {
            obj.material.dispose();
        }
    }
    obj.parent?.remove(obj);
}
```

> **Key Insight:** The fastest optimization is the work you don't do. Fewer objects, simpler materials, smaller textures. Start simple and add complexity only where the user's eye focuses.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Draw Call** | Single GPU command to render a mesh | Each Mesh = 1+ draw calls |
| **InstancedMesh** | Renders many copies in one draw call | 1000 trees as one draw call |
| **LOD** | Level of Detail — simpler models at distance | High/med/low poly versions |
| **Geometry Merging** | Combining meshes into one | Static scenery optimization |
| **Dispose** | Free GPU memory for unused resources | `geometry.dispose()` |
| **Frustum Culling** | Skip rendering off-screen objects | Automatic in Three.js |
| **Stats.js** | FPS/memory monitoring panel | Debug overlay |

---

## 💻 Code Examples

### Example 1: Performance Monitoring Dashboard

```javascript
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
stats.showPanel(0); // 0=fps, 1=ms, 2=memory
document.body.appendChild(stats.dom);

// Custom renderer info display
const infoDiv = document.createElement('div');
infoDiv.style.cssText = 'position:fixed;bottom:0;left:0;background:rgba(0,0,0,0.7);color:white;padding:8px;font-family:monospace;font-size:12px;';
document.body.appendChild(infoDiv);

function animate() {
    stats.begin();
    
    renderer.render(scene, camera);
    
    // Update info every 60 frames
    if (renderer.info.render.frame % 60 === 0) {
        const info = renderer.info;
        infoDiv.textContent = 
            `Draw calls: ${info.render.calls} | ` +
            `Triangles: ${info.render.triangles.toLocaleString()} | ` +
            `Geometries: ${info.memory.geometries} | ` +
            `Textures: ${info.memory.textures}`;
    }
    
    stats.end();
    requestAnimationFrame(animate);
}
```

**What's happening:** We display real-time FPS and detailed renderer statistics. Watching draw calls and triangle counts while adding content tells you exactly when you're approaching performance limits.

### Example 2: InstancedMesh with Per-Instance Colors

```javascript
const count = 500;
const geometry = new THREE.IcosahedronGeometry(0.5, 2);
const material = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.5 });

const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
instancedMesh.castShadow = true;

const dummy = new THREE.Object3D();
const color = new THREE.Color();

for (let i = 0; i < count; i++) {
    dummy.position.set(
        (Math.random() - 0.5) * 40,
        Math.random() * 15,
        (Math.random() - 0.5) * 40
    );
    dummy.scale.setScalar(0.5 + Math.random() * 1.5);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
    
    // Per-instance color
    color.setHSL(Math.random(), 0.7, 0.5);
    instancedMesh.setColorAt(i, color);
}

instancedMesh.instanceMatrix.needsUpdate = true;
instancedMesh.instanceColor.needsUpdate = true;
scene.add(instancedMesh);

// Result: 500 objects, 1 draw call!
```

**What's happening:** Each instance gets its own position, scale, rotation, and color — but it's all rendered in a single draw call. This is 500x more efficient than creating 500 separate meshes.

### Example 3: Proper Cleanup on Scene Change

```javascript
function disposeScene(scene) {
    scene.traverse((object) => {
        if (object.isMesh) {
            object.geometry.dispose();
            
            if (Array.isArray(object.material)) {
                object.material.forEach(disposeMaterial);
            } else {
                disposeMaterial(object.material);
            }
        }
    });
    
    // Clear scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
}

function disposeMaterial(material) {
    // Dispose all textures
    for (const key in material) {
        const value = material[key];
        if (value && typeof value.dispose === 'function') {
            value.dispose();
        }
    }
    material.dispose();
}
```

**What's happening:** When switching scenes (which our AI portfolio will do), you must clean up GPU resources. Without disposal, memory usage grows until the browser tab crashes.

---

## ✏️ Hands-On Exercises

### Exercise 1: Performance Baseline (⏱️ ~10 min)

**Goal:** Measure your current scene's performance

**Instructions:**
1. Add Stats.js to your portfolio scene from previous days
2. Log `renderer.info` to the console
3. Record: FPS, draw calls, triangles, geometries, textures
4. Try adding 100 spheres — watch how metrics change
5. Try adding 1000 spheres — at what point does FPS drop?

**Expected Output:**
Understanding of your baseline performance numbers.

---

### Exercise 2: Instancing Challenge (⏱️ ~20 min)

**Goal:** Render 5000 objects at 60fps

**Instructions:**
1. Create 5000 cubes using individual Meshes — measure FPS
2. Replace with InstancedMesh — measure FPS improvement
3. Add per-instance random colors
4. Animate instances by updating matrices in the loop
5. Compare draw calls before/after

**Expected Output:**
Dramatic FPS improvement (likely 5-20fps → 60fps).

---

### Exercise 3: Optimize Your Portfolio Scene (⏱️ ~20 min)

**Goal:** Apply optimizations to your portfolio project

**Instructions:**
1. Audit your scene: log draw calls, triangles, texture count
2. Identify the biggest bottleneck (draws? triangles? textures?)
3. Apply at least 2 optimizations from today's lesson
4. Measure before/after FPS
5. Add proper dispose() calls for when scene elements change

**Expected Output:**
Measurable performance improvement with documented before/after numbers.

---

## 📖 Curated Resources

### Must-Read

1. **How to Dispose of Objects** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/cleanup (~10 min read)
   - Why: Essential for preventing memory leaks in dynamic scenes

2. **Optimization Tips** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/optimize-lots-of-objects
   - Why: Official guidance on handling large numbers of objects

### Video Resources

3. **Three.js Optimization - Best Practices and Techniques** — Valentin's Coding Book
   - 🎥 https://www.youtube.com/watch?v=dc5iJVInpPY
   - Why: Comprehensive walkthrough of optimization techniques with live examples

4. **Better Performance With LOD in Three.js** — Wael Yasmina
   - 🎥 https://www.youtube.com/watch?v=IsRBxh4Jb18
   - Why: Practical LOD implementation tutorial

### Deep Dives (optional)

5. **Chrome DevTools Performance Panel** — Google
   - 🔗 https://developer.chrome.com/docs/devtools/performance
   - Why: Profile JavaScript execution, find frame budget bottlenecks

---

## 🤔 Reflection Questions

1. **Comprehension:** What's the difference between CPU-bound and GPU-bound performance issues? Which do draw calls affect?

2. **Application:** Your scene has 200 identical trees. What's the best optimization approach?

3. **Connection:** How does the shadow map resolution from Day 10 affect performance?

4. **Critical Thinking:** When would geometry merging be a BAD idea?

5. **Personal:** What performance target will you set for your portfolio? (FPS, load time, memory?)

---

## ➡️ Next Steps

**Tomorrow:** [Day 12: Intro to Prompt Engineering for 3D](./day-12-brief.md) — Start bridging the gap between AI and 3D graphics

You now have the technical foundation for building performant 3D scenes. Starting tomorrow, we shift gears to the AI side of this course. You'll learn how to write prompts that describe 3D scenes, which will later power the AI-driven portfolio generator.

**Before moving on, make sure you can:**
- [ ] Measure FPS, draw calls, and triangle count
- [ ] Use InstancedMesh for many identical objects
- [ ] Properly dispose of geometries, materials, and textures
- [ ] Identify your scene's primary performance bottleneck
- [ ] Maintain 60fps in your portfolio scene

[← Previous: Day 10 - Shadows & Realistic Lighting](./day-10-brief.md) | [Course Home](../README.md) | [Next: Day 12 - Intro to Prompt Engineering →](./day-12-brief.md)
