# Day 2: Your First Three.js Scene — The Rotating Cube

[← Previous: Day 1 - Introduction](./day-01-intro-threejs.md) | [Course Home](../README.md) | [Next: Day 3 - Geometries & Materials →](./day-03-geometries-materials.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Create a complete Three.js scene with all required components
2. Add a 3D mesh (geometry + material) to your scene
3. Implement a render loop for animation
4. Position and rotate objects in 3D space
5. Handle window resizing for responsive 3D graphics

**Difficulty:** 🟢 Beginner
**Estimated Time:** 1 hour (20 min reading + 40 min hands-on)

---

## 📚 Core Concepts

### The Scene Graph

Think of a Three.js scene like a family tree. The `Scene` object is the root, and everything else — cameras, lights, meshes — are children. When you add an object to the scene with `scene.add(mesh)`, you're creating a parent-child relationship. This hierarchy matters because transformations (position, rotation, scale) apply to children relative to their parents.

In Three.js, this parent-child system is called the "scene graph." It's a tree structure where each node can have position, rotation, and scale. If you rotate a parent object, all its children rotate with it. This is incredibly powerful for creating complex animations — imagine a solar system where planets orbit the sun, and moons orbit planets. The scene graph handles all that nested motion automatically.

### Meshes: Geometry Meets Material

A `Mesh` is the most fundamental 3D object in Three.js. It combines two concepts:

**Geometry** — The shape. A collection of vertices (points in 3D space) and faces (triangles connecting those points). Three.js provides built-in geometries like `BoxGeometry`, `SphereGeometry`, `PlaneGeometry`, and more. You can also create custom geometries by defining vertices manually.

**Material** — The appearance. How the surface reflects light, its color, texture, and visual properties. Materials range from simple (`MeshBasicMaterial` — no lighting needed) to complex (`MeshStandardMaterial` — realistic physically-based rendering).

When you create a mesh, you're saying "take this shape and give it this appearance." It's like 3D printing: the geometry is the 3D model file, and the material is whether you print in red plastic, metal, or wood.

### The Coordinate System

Three.js uses a right-handed coordinate system:
- **X-axis**: Left (−) to Right (+)
- **Y-axis**: Down (−) to Up (+)
- **Z-axis**: Back (−) to Front (+), toward the camera

The origin (0, 0, 0) is the center of your scene. When you position an object at `(2, 1, -5)`, you're saying "2 units right, 1 unit up, 5 units away from the camera."

Understanding this coordinate system is crucial because everything — camera position, object placement, lighting — is defined in these coordinates.

### The Render Loop

Animation in Three.js happens through continuous re-rendering. The `requestAnimationFrame` function is the browser's way of saying "call this function right before the next screen refresh." On most monitors, that's 60 times per second (60 FPS).

Here's the pattern every Three.js animation follows:

1. Update state (rotate object, move camera, etc.)
2. Render the scene
3. Request next frame
4. Repeat

This loop creates smooth animation. Even if you want a static scene (no animation), you still need this loop to handle interactions like resizing the window or responding to user input.

> **Key Insight:** Three.js is declarative — you describe *what* you want (a red cube at position X), not *how* to draw it. The renderer figures out the WebGL commands needed.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Mesh** | Combination of geometry (shape) and material (appearance) | `new THREE.Mesh(geometry, material)` |
| **BoxGeometry** | Built-in geometry for creating rectangular boxes/cubes | `new THREE.BoxGeometry(1, 1, 1)` creates a 1×1×1 cube |
| **MeshBasicMaterial** | Simplest material — flat color, no lighting effects | Good for debugging, not realistic |
| **PerspectiveCamera** | Camera that mimics human eye perspective (far = smaller) | `new THREE.PerspectiveCamera(fov, aspect, near, far)` |
| **WebGLRenderer** | Renders scenes using WebGL to a canvas element | Handles all GPU communication |
| **requestAnimationFrame** | Browser API for scheduling smooth animations | Syncs with screen refresh rate (~60 FPS) |
| **Scene Graph** | Tree structure of parent-child relationships between objects | scene → mesh → child mesh |
| **Aspect Ratio** | Width divided by height (e.g., 16:9 = 1.777) | Prevents distortion in camera view |

---

## 💻 Code Examples

### Example 1: Complete Rotating Cube

```javascript
// main.js
import * as THREE from 'three';

// 1. Create the scene
const scene = new THREE.Scene();

// 2. Create the camera
// Parameters: FOV (degrees), aspect ratio, near clip, far clip
const camera = new THREE.PerspectiveCamera(
    75,                                      // FOV: wider angle = more visible
    window.innerWidth / window.innerHeight,  // Aspect ratio: match window
    0.1,                                     // Near: don't render closer than this
    1000                                     // Far: don't render farther than this
);
camera.position.z = 5;  // Move camera back so we can see the cube

// 3. Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);  // Add canvas to page

// 4. Create a cube
const geometry = new THREE.BoxGeometry(1, 1, 1);  // Width, Height, Depth
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });  // Green
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);  // Add cube to scene

// 5. Animation loop
function animate() {
    requestAnimationFrame(animate);  // Schedule next frame
    
    // Rotate the cube
    cube.rotation.x += 0.01;  // Rotate around X-axis
    cube.rotation.y += 0.01;  // Rotate around Y-axis
    
    renderer.render(scene, camera);  // Render the scene
}

animate();  // Start the animation
```

**What's happening:** This is the "Hello World" of Three.js. We create a scene, camera, and renderer (the big three), then add a green cube. The animation loop rotates the cube slightly each frame, creating smooth rotation. The cube rotates around both X and Y axes simultaneously, giving it a tumbling effect.

### Example 2: Handling Window Resize

```javascript
// Add this after creating the renderer
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();  // MUST call this after changing camera properties
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
}
```

**What's happening:** When the window resizes, we update two things: the camera's aspect ratio (so the view doesn't stretch) and the renderer's size (so it matches the new window). The `updateProjectionMatrix()` call is crucial — it recalculates the camera's internal projection matrix based on the new aspect ratio.

### Example 3: Different Colors and Materials

```javascript
// Try different colors (hexadecimal format)
const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const purpleMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });

// Or use CSS color names
const yellowMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' });

// Transparent material
const transparentMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00, 
    transparent: true, 
    opacity: 0.5 
});

// Wireframe mode (useful for debugging)
const wireframeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    wireframe: true 
});
```

**What's happening:** Materials have many properties beyond color. `transparent` and `opacity` let you create see-through objects. `wireframe` shows just the edges of the geometry, which is great for understanding mesh structure. You can use hex colors (`0xRRGGBB`) or CSS color names.

> **💡 Try it:** Change the cube's rotation speed. What happens if you make one axis faster than the other? What if you use negative values?

---

## ✏️ Hands-On Exercises

### Exercise 1: Create Your First Scene (⏱️ ~20 min)

**Goal:** Build a working Three.js scene from scratch

**Instructions:**
1. Open your project from Day 1
2. Replace the contents of `main.js` with Example 1 above
3. Run `npm run dev` and open the browser
4. Verify you see a green rotating cube
5. Open the browser console — check for any errors

**Expected Output:** A green cube rotating smoothly in the center of the screen against a black background.

**Stretch Goal:** Add a second cube at a different position. Make it rotate at a different speed.

---

### Exercise 2: Experiment with Colors and Rotation (⏱️ ~15 min)

**Goal:** Understand how to modify mesh properties

**Instructions:**
1. Change the cube's color to your favorite color
2. Try making it transparent (opacity 0.5)
3. Change the rotation speeds (try `0.001`, `0.05`, or negative values)
4. Rotate around only one axis (comment out the other rotation lines)
5. Try wireframe mode

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Colors can be hex (0xFF5733) or names ('orange'). Don't forget the 0x prefix for hex!
</details>

<details>
<summary>Hint 2</summary>
Rotation values are in radians per frame. Smaller = slower, bigger = faster. Negative values reverse direction.
</details>

---

### Exercise 3: Multi-Cube Scene (⏱️ ~25 min)

**Goal:** Create a scene with multiple objects at different positions

**Instructions:**
1. Create 3 cubes with different colors
2. Position them at: (-2, 0, 0), (0, 0, 0), and (2, 0, 0)
3. Make each rotate at different speeds
4. Add a wireframe cube at (0, 2, 0) that doesn't rotate
5. Add window resize handling from Example 2

**Expected Output:** Four cubes in a horizontal and vertical arrangement, three rotating at different speeds, one static wireframe.

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Use `mesh.position.set(x, y, z)` to position each cube after creating it.
</details>

<details>
<summary>Hint 2</summary>
You can give each cube a name (e.g., `cube1`, `cube2`) and reference them individually in the animate function.
</details>

---

## 📖 Curated Resources

### Must-Read

1. **Creating a Scene** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/fundamentals (Section: "Creating a Scene")
   - Why: Official guide with interactive examples showing the exact code we wrote today

2. **PerspectiveCamera** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
   - Why: Deep dive into camera parameters (FOV, near, far) and what they control

### Video Resources

3. **Learn Three.js from Scratch** — Chris Courses
   - 🎥 https://www.youtube.com/watch?v=YK1Sw_hnm58 (⚠️ VERIFIED, first 15 min)
   - Why: Step-by-step walkthrough of creating your first scene

### Deep Dives (optional)

4. **requestAnimationFrame Explained** — MDN
   - 🔗 https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   - Why: Understand the animation timing mechanism at a deeper level

---

## 🤔 Reflection Questions

1. **Comprehension:** Why do we need to call `requestAnimationFrame` continuously instead of just once?
   - *Think about: How does animation work at a fundamental level?*

2. **Application:** What would happen if you set the camera's Z position to 0 instead of 5?
   - *Think about: Where is the cube positioned, and where would the camera be?*

3. **Connection:** How is the scene graph similar to the DOM (Document Object Model) in HTML?
   - *Think about: Parent-child relationships, how changes cascade down*

4. **Critical Thinking:** Why might using `MeshBasicMaterial` not look realistic? What's missing?

5. **Personal:** Which rotation speed felt most pleasing to you, and why?

---

## ➡️ Next Steps

**Tomorrow:** [Day 3: Exploring Geometries & Materials](./day-03-geometries-materials.md) — Learn about all the built-in shapes Three.js provides and how to customize them

Now that you can create and render objects, tomorrow we'll explore the variety of geometries Three.js offers — spheres, cylinders, toruses, and more. You'll learn how to control their parameters and combine multiple shapes into compositions.

**Before moving on, make sure you can:**
- [ ] Create a scene, camera, and renderer from memory
- [ ] Add a mesh to the scene and position it
- [ ] Implement an animation loop
- [ ] Handle window resizing
- [ ] Explain what a Mesh is (geometry + material)

[← Previous: Day 1 - Introduction](./day-01-intro-threejs.md) | [Course Home](../README.md) | [Next: Day 3 - Geometries & Materials →](./day-03-geometries-materials.md)
