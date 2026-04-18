# Day 9: Loading & Using 3D Models (GLTF/GLB Format)

[← Previous: Day 8 - Animation Fundamentals](./day-08-brief.md) | [Course Home](../README.md) | [Next: Day 10 - Shadows & Realistic Lighting →](./day-10-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Understand the GLTF/GLB file format and why it's the "JPEG of 3D"
2. Load external 3D models into a Three.js scene using GLTFLoader
3. Navigate model structure (scenes, meshes, animations)
4. Position, scale, and rotate loaded models
5. Find and use free 3D models from online repositories

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1 hour (25 min reading + 35 min hands-on)

---

## 📚 Core Concepts

### Why Load External Models?

So far, you've built 3D objects with code — boxes, spheres, torus knots. That's great for learning, but real-world 3D applications use models created in tools like Blender, Maya, or Cinema 4D. These models have far more detail than what you'd want to write by hand: intricate meshes, baked textures, animation rigs, and complex material setups.

For our AI portfolio, we'll need models to make the scene look professional. Think of it like web development: you don't draw every icon pixel-by-pixel — you use SVG files. Similarly, you load 3D models rather than coding every vertex.

### The GLTF Format

**glTF** (GL Transmission Format) is the standard file format for 3D on the web, maintained by the Khronos Group (the same people behind WebGL and OpenGL). It's often called the "JPEG of 3D" because it's designed to be efficient, compact, and universally supported.

**Two variants:**

| Format | Extension | Description |
|--------|-----------|-------------|
| **glTF** | `.gltf` + `.bin` + textures | Separate files — JSON descriptor, binary geometry data, and image textures. Good for debugging. |
| **GLB** | `.glb` | Single binary file containing everything. Smaller, faster to load. Best for production. |

**What's inside a GLTF file:**
- **Meshes**: The 3D geometry (vertices, faces)
- **Materials**: Surface appearance (colors, textures, PBR properties)
- **Textures**: Image files mapped onto surfaces
- **Animations**: Keyframe data for movement
- **Scene hierarchy**: Parent-child relationships between objects
- **Cameras & Lights**: Optional scene configuration

### GLTFLoader: Your Model Loading Tool

Three.js provides `GLTFLoader` as an addon (not part of the core library). When you load a GLTF file, it returns a structured object containing the entire scene graph.

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load(
    '/models/my-model.glb',     // Path to model
    (gltf) => {                  // Success callback
        scene.add(gltf.scene);   // Add to your scene
    },
    (progress) => {              // Progress callback
        console.log(`${(progress.loaded / progress.total * 100)}% loaded`);
    },
    (error) => {                 // Error callback
        console.error('Model loading failed:', error);
    }
);
```

The loaded `gltf` object has this structure:
- `gltf.scene` — The root `THREE.Group` containing all meshes
- `gltf.scenes` — Array of all scenes in the file
- `gltf.animations` — Array of `THREE.AnimationClip` objects
- `gltf.cameras` — Array of cameras defined in the file
- `gltf.asset` — Metadata (version, generator, copyright)

### DRACOLoader: Compressed Models

For large models, DRACO compression can reduce file sizes by 90%+. Three.js supports this through `DRACOLoader`:

```javascript
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');  // Path to DRACO decoder files

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
```

### Where to Find Free 3D Models

| Source | URL | Notes |
|--------|-----|-------|
| **Sketchfab** | sketchfab.com | Huge library, filter by "downloadable" |
| **Poly Pizza** | poly.pizza | Simple low-poly models, great for web |
| **Kenney** | kenney.nl | Game-ready asset packs, CC0 license |
| **Three.js Examples** | github.com/mrdoob/three.js/tree/dev/examples/models | Official example models |
| **glTF Sample Models** | github.com/KhronosGroup/glTF-Sample-Models | Reference models for testing |

> **Key Insight:** Always check model licenses before using them in your portfolio. CC0 and CC-BY are safest. GLB format loads fastest on the web — prefer it over separate .gltf files.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **GLTF** | GL Transmission Format — standard 3D file format for web | `.gltf` (JSON) + `.bin` (data) |
| **GLB** | Binary GLTF — single-file variant | `model.glb` (all-in-one) |
| **GLTFLoader** | Three.js addon for loading GLTF/GLB files | `new GLTFLoader()` |
| **DRACOLoader** | Decoder for DRACO-compressed meshes | 90%+ size reduction |
| **Scene Graph** | Tree structure of parent-child 3D objects | `gltf.scene` contains child meshes |
| **Animation Clip** | Recorded animation data from the model | Walk cycles, idle animations |
| **Asset Pipeline** | Process of getting models from creation to web | Blender → Export GLB → Load in Three.js |

---

## 💻 Code Examples

### Example 1: Basic Model Loading

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting (models need light to be visible!)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Load model
const loader = new GLTFLoader();
loader.load('/models/robot.glb', (gltf) => {
    const model = gltf.scene;
    
    // Adjust model transform
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);  // Adjust if model is too big/small
    
    scene.add(model);
    console.log('Model loaded!', model);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** We import GLTFLoader, create an instance, and use `.load()` to asynchronously fetch the model. Once loaded, `gltf.scene` is a standard Three.js Group that we add to our scene. Lighting is essential — without it, PBR materials on the model will appear black.

### Example 2: Exploring Model Structure

```javascript
loader.load('/models/character.glb', (gltf) => {
    const model = gltf.scene;
    
    // Traverse all objects in the model
    model.traverse((child) => {
        console.log(child.name, child.type);
        
        // Find meshes specifically
        if (child.isMesh) {
            console.log('  Material:', child.material.name);
            console.log('  Vertices:', child.geometry.attributes.position.count);
            
            // Enable shadows on all meshes
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    // Access specific parts by name
    const head = model.getObjectByName('Head');
    if (head) {
        head.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    }
    
    scene.add(model);
});
```

**What's happening:** `traverse()` walks through every object in the model's hierarchy. This lets you enable shadows on all meshes, swap materials, or find specific named parts. Model parts are named by the 3D artist in their modeling software.

### Example 3: Loading with Progress & Error Handling

```javascript
// Loading manager for tracking multiple models
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = () => {
    console.log('Loading started');
    document.getElementById('loading').style.display = 'flex';
};

loadingManager.onProgress = (url, loaded, total) => {
    const progress = (loaded / total) * 100;
    document.getElementById('progress').textContent = `${Math.round(progress)}%`;
};

loadingManager.onLoad = () => {
    console.log('All assets loaded');
    document.getElementById('loading').style.display = 'none';
};

loadingManager.onError = (url) => {
    console.error('Failed to load:', url);
};

const loader = new GLTFLoader(loadingManager);

// Load multiple models
const modelPaths = ['/models/desk.glb', '/models/laptop.glb', '/models/plant.glb'];

modelPaths.forEach((path) => {
    loader.load(path, (gltf) => {
        scene.add(gltf.scene);
    });
});
```

**What's happening:** `THREE.LoadingManager` tracks progress across multiple assets. This is essential for showing loading screens — users shouldn't see a blank screen while models download. The progress callback fires as each asset completes.

> **💡 Try it:** Download a free model from Poly Pizza (poly.pizza), put the .glb file in your project's `public/models/` folder, and load it into your scene.

---

## ✏️ Hands-On Exercises

### Exercise 1: Load Your First Model (⏱️ ~15 min)

**Goal:** Successfully load an external 3D model into your scene

**Instructions:**
1. Download a free GLB model from https://poly.pizza (search "robot" or "desk")
2. Create a `public/models/` folder in your project
3. Place the `.glb` file inside
4. Use GLTFLoader to load it into your scene
5. Add appropriate lighting (ambient + directional)
6. Add OrbitControls to inspect the model

**Expected Output:**
A 3D model visible in your browser that you can orbit around with the mouse.

**Stretch Goal:** Load 3 different models and position them like a room.

---

### Exercise 2: Model Inspector (⏱️ ~20 min)

**Goal:** Explore and modify a loaded model's properties

**Instructions:**
1. Load any GLTF model
2. Use `traverse()` to log all object names and types
3. Find a specific mesh by name and change its material color
4. Enable shadow casting on all meshes
5. Scale the model to fit nicely in a 10x10x10 bounding box

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
To auto-scale a model: compute its bounding box with `new THREE.Box3().setFromObject(model)`, get the size, then scale by `desiredSize / maxDimension`.
</details>

---

### Exercise 3: Portfolio Scene Setup (⏱️ ~25 min)

**Goal:** Create the foundation for your portfolio's 3D scene

**Instructions:**
1. Load a desk/workspace model (or create a simple one with primitives)
2. Add a floor plane with a grid material
3. Position the camera for a nice default view
4. Add a loading progress indicator (HTML overlay)
5. Handle loading errors gracefully with a fallback message

**Expected Output:**
A workspace scene with smooth loading experience and error handling.

---

## 📖 Curated Resources

### Must-Read

1. **Loading 3D Models** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/load-gltf (~10 min read)
   - Why: Official guide covering GLTF loading patterns and best practices

2. **GLTFLoader Documentation** — Three.js Docs
   - 🔗 https://threejs.org/docs/#examples/en/loaders/GLTFLoader
   - Why: API reference for all GLTFLoader options

### Video Resources

3. **Three.js Tutorial: How to Load a Model** — Robot Bobby (2024)
   - 🎥 https://www.youtube.com/watch?v=ylyLefnMc1c
   - Why: Loading 3D models and HDR environments with GLTFLoader — exact topic, recent video

### Deep Dives (optional)

5. **glTF 2.0 Specification** — Khronos Group
   - 🔗 https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
   - Why: Understand what's actually inside a GLTF file (for the technically curious)

---

## 🤔 Reflection Questions

1. **Comprehension:** What's the difference between .gltf and .glb formats? When would you use each?

2. **Application:** How would you handle loading a large model (50MB+) without making users wait on a blank screen?

3. **Connection:** How does the model's scene graph relate to the Three.js scene graph you learned about in Week 1?

4. **Critical Thinking:** What could go wrong when loading a model created in Blender into Three.js? How would you debug it?

5. **Personal:** What kind of 3D models would best represent your skills and projects in a portfolio?

---

## ➡️ Next Steps

**Tomorrow:** [Day 10: Shadows & Realistic Lighting](./day-10-brief.md) — Make your models and scenes look professional with advanced lighting and shadow techniques

Now that you can load external models, tomorrow we'll make them look great. Professional 3D scenes rely on careful lighting and shadow configuration — the same model can look amateur or stunning depending on how it's lit.

**Before moving on, make sure you can:**
- [ ] Load a GLTF/GLB model into a Three.js scene
- [ ] Navigate the loaded model's structure with traverse()
- [ ] Adjust position, scale, and rotation of loaded models
- [ ] Set up a loading progress indicator
- [ ] Find free 3D models online

[← Previous: Day 8 - Animation Fundamentals](./day-08-brief.md) | [Course Home](../README.md) | [Next: Day 10 - Shadows & Realistic Lighting →](./day-10-brief.md)
