# Day 3: Exploring Three.js Geometries & Materials

[← Previous: Day 2 - First Scene](./day-02-first-scene.md) | [Course Home](../README.md) | [Next: Day 4 - Materials & Textures →](./day-04-materials-textures.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Create and customize at least 5 different built-in Three.js geometries
2. Understand geometry parameters and how they affect the shape
3. Combine multiple geometries into a complex scene
4. Position, scale, and rotate objects to create compositions
5. Use Groups to build hierarchical structures in the scene graph

**Difficulty:** 🟢 Beginner
**Estimated Time:** 1 hour (25 min reading + 35 min hands-on)

---

## 📚 Core Concepts

### What Is Geometry?

Think of geometry like a wireframe skeleton. Imagine building a character for a video game — you start with a frame of bones (the geometry), then you wrap it in skin and clothes (the material). The geometry defines the shape: a sphere, a box, a pyramid, or anything custom.

In Three.js, geometry is made up of **vertices** (points in 3D space) and **faces** (triangles connecting those points). Every 3D shape, no matter how complex, is built from triangles. Why triangles? Because three points always define a flat plane, making them the most reliable primitive for graphics rendering. A cube has 8 vertices and 12 triangular faces (2 triangles per side × 6 sides).

Modern Three.js uses `BufferGeometry`, which stores vertex data efficiently in typed arrays. This is much faster than the old `Geometry` class because it sends data directly to the GPU without conversion.

### Built-in Geometries

Three.js provides 13 primitive geometries out of the box. Here are the most commonly used:

- **BoxGeometry** — Rectangular prism (including cubes)
- **SphereGeometry** — Perfect sphere (like a ball)
- **CylinderGeometry** — Cylinders, cones, or truncated cones
- **TorusGeometry** — Donut shape
- **PlaneGeometry** — Flat rectangular surface
- **ConeGeometry** — Pyramid with circular base
- **IcosahedronGeometry** — 20-sided polyhedron (great for low-poly spheres)
- **TorusKnotGeometry** — Twisted torus (complex knot shapes)
- **RingGeometry** — Flat donut (2D torus)

Each geometry has parameters that control its appearance. For example, a sphere's `widthSegments` and `heightSegments` control how smooth it looks — more segments = smoother but more polygons = slower performance.

### Understanding Segments and Detail

Segments determine how many subdivisions a shape has. More segments create smoother curves but increase the polygon count. Here's the tradeoff:

**Low poly (few segments):**
- Faster to render
- Lower memory usage
- Stylized, geometric aesthetic
- Visible facets/edges

**High poly (many segments):**
- Slower to render
- Higher memory usage
- Smooth, realistic appearance
- Curved surfaces look perfect

For a sphere, `new THREE.SphereGeometry(1, 32, 32)` creates a very smooth ball. `new THREE.SphereGeometry(1, 8, 6)` creates a low-poly geodesic look. Both are spheres, but they serve different artistic purposes. The choice depends on your style — many modern portfolios actually embrace the low-poly aesthetic.

### Positioning, Scaling, and Rotating

Every Object3D (including meshes) has three transform properties:

**Position** — Where the object is in 3D space:
```javascript
mesh.position.set(2, 1, -5);   // x=2, y=1, z=-5
mesh.position.x += 0.5;         // Move right by 0.5 units
```

**Rotation** — Orientation around each axis (in radians):
```javascript
mesh.rotation.set(0, Math.PI / 4, 0);  // Rotate 45° around Y-axis
mesh.rotation.y = Math.PI;              // 180° rotation
```

**Scale** — Size multiplier (1 = normal, 2 = double, 0.5 = half):
```javascript
mesh.scale.set(2, 1, 1);      // Double width, keep height/depth
mesh.scale.setScalar(0.5);    // Half size in all dimensions
```

These transforms are relative to the object's parent in the scene graph. If you add a child object to a mesh and rotate the parent, the child rotates with it while maintaining its relative position.

### Groups: Organizing Your Scene

A `THREE.Group` is an empty container that can hold multiple meshes. It's like a folder that groups related objects together. When you transform the group, all children transform with it. This is essential for building complex objects from simple primitives — a robot from boxes, a snowman from spheres, a house from rectangles.

> **Key Insight:** Geometry defines the shape, but transforms (position, rotation, scale) define where and how that shape exists in your 3D world. Groups let you treat multiple shapes as a single unit.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Vertex** | A single point in 3D space (x, y, z) | Corner of a cube |
| **Face** | Triangle formed by 3 vertices | Basic unit of all 3D surfaces |
| **Segments** | Number of subdivisions in a geometry | Higher = smoother curves |
| **BufferGeometry** | Efficient geometry format using typed arrays | Modern standard in Three.js |
| **Polygon Count** | Total number of triangular faces | Lower = better performance |
| **Radians** | Unit for measuring angles (π radians = 180°) | `Math.PI` = 180°, `Math.PI * 2` = 360° |
| **Transform** | Position, rotation, or scale operation | Moving an object is a transform |
| **Group** | Empty container for organizing multiple meshes | `new THREE.Group()` |

---

## 💻 Code Examples

### Example 1: Geometry Showcase

```javascript
// geometry-showcase.js
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create different geometries
const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.7, 32, 32),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    new THREE.TorusGeometry(0.5, 0.2, 16, 100),
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.IcosahedronGeometry(0.7, 0)
];

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

// Position geometries in a 2×3 grid
geometries.forEach((geo, i) => {
    const mesh = new THREE.Mesh(geo, material);
    const x = (i % 3) * 2.5 - 2.5;        // -2.5, 0, 2.5
    const y = Math.floor(i / 3) * 2 - 1;   // 1, -1
    mesh.position.set(x, y, 0);
    scene.add(mesh);
});

function animate() {
    requestAnimationFrame(animate);
    scene.children.forEach(mesh => {
        if (mesh instanceof THREE.Mesh) {
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
        }
    });
    renderer.render(scene, camera);
}

animate();
```

**What's happening:** We create six different geometries and arrange them in a 2×3 grid. The wireframe material lets us see the structure of each geometry — how many triangles make up each shape. The modulo operator (`%`) calculates column position, and `Math.floor(i / 3)` calculates row position.

### Example 2: Customizing Geometry Parameters

```javascript
// Different sphere detail levels
const lowPoly = new THREE.SphereGeometry(1, 8, 6);       // Blocky
const medPoly = new THREE.SphereGeometry(1, 16, 12);     // Faceted
const highPoly = new THREE.SphereGeometry(1, 32, 32);    // Smooth
const ultraPoly = new THREE.SphereGeometry(1, 64, 64);   // Ultra smooth

// Cone variations — changing sides changes the shape entirely
const cone = new THREE.ConeGeometry(1, 2, 32);    // Standard cone
const pyramid = new THREE.ConeGeometry(1, 2, 4);  // 4-sided = pyramid!
const triPrism = new THREE.ConeGeometry(1, 2, 3); // 3-sided = triangular

// Partial geometries — cut shapes using angle parameters
const halfSphere = new THREE.SphereGeometry(
    1,            // radius
    32, 32,       // segments
    0,            // phiStart (horizontal start angle)
    Math.PI,      // phiLength — half circle horizontally
    0,            // thetaStart (vertical start angle)
    Math.PI / 2   // thetaLength — quarter arc vertically
);
```

**What's happening:** Each geometry has parameters that dramatically change its appearance. Fewer segments create a faceted, stylized look. You can even create partial geometries (half-spheres, pie slices) by adjusting the angle parameters. A cone with 4 sides is actually a pyramid!

### Example 3: Building Compositions with Groups

```javascript
// Create a simple robot head from primitives
const headGroup = new THREE.Group();

// Main head (box)
const headGeo = new THREE.BoxGeometry(2, 2, 2);
const headMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
const head = new THREE.Mesh(headGeo, headMat);
headGroup.add(head);

// Eyes (spheres)
const eyeGeo = new THREE.SphereGeometry(0.2, 16, 16);
const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });

const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
leftEye.position.set(-0.5, 0.3, 1.01);   // Left side, slightly forward
headGroup.add(leftEye);

const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
rightEye.position.set(0.5, 0.3, 1.01);    // Right side, slightly forward
headGroup.add(rightEye);

// Antenna (cylinder)
const antennaGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
const antennaMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const antenna = new THREE.Mesh(antennaGeo, antennaMat);
antenna.position.set(0, 1.5, 0);          // On top of head
headGroup.add(antenna);

scene.add(headGroup);

// Rotating the group rotates ALL parts together
function animate() {
    requestAnimationFrame(animate);
    headGroup.rotation.y += 0.01;  // Whole head turns
    renderer.render(scene, camera);
}
```

**What's happening:** We use a `Group` to organize multiple meshes into a single unit. The group acts as a parent, so when we rotate it, all children (head, eyes, antenna) rotate together while maintaining their relative positions. This is the power of the scene graph — hierarchical transformations make complex animations simple.

> **💡 Try it:** Create a simple scene using only primitive geometries — maybe a house (boxes for walls, cone for roof, cylinder for chimney) or a tree (cone for foliage, cylinder for trunk).

---

## ✏️ Hands-On Exercises

### Exercise 1: Geometry Parameter Explorer (⏱️ ~15 min)

**Goal:** Understand how parameters affect geometry appearance

**Instructions:**
1. Create a sphere with different segment counts: 4, 8, 16, 32
2. Position them side-by-side using `position.set()`
3. Use wireframe material to see the structure
4. Observe how smoothness changes with more segments
5. Try: which segment count looks "good enough" to you?

**Expected Output:** Four spheres of increasing smoothness, from blocky icosahedron to perfect sphere.

**Stretch Goal:** Create partial geometries (half-sphere, quarter-torus) using angle parameters.

---

### Exercise 2: Create a Solar System (⏱️ ~25 min)

**Goal:** Use groups and transformations to create orbiting objects

**Instructions:**
1. Create a central "sun" (large yellow sphere, radius 1.5)
2. Create an "earth" (smaller blue sphere, radius 0.5)
3. Put earth in a `THREE.Group` called `earthOrbit`
4. Position earth at x=5 within its group
5. Rotate the group (not the earth) in the animation loop to make it orbit
6. Add a "moon" (tiny grey sphere, radius 0.15) as a child of earth
7. Position moon at x=1 relative to earth
8. Make the moon orbit earth by rotating earth slightly faster

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Use `THREE.Group()` for the orbit. Add earth to the group, then add the group to the scene. Rotating the group makes earth orbit the origin.
</details>

<details>
<summary>Hint 2</summary>
For the moon: add it directly to the earth mesh (not the group). Then rotate earth around its Y axis — the moon will orbit with it.
</details>

**Expected Output:** A central sun, earth orbiting around it, and moon orbiting earth.

---

### Exercise 3: Low-Poly Scene (⏱️ ~20 min)

**Goal:** Create a stylized scene using low-poly geometries

**Instructions:**
1. Use low segment counts (4–8) for all geometries
2. Create at least 5 objects (trees, mountains, buildings, clouds)
3. Use different colors for each object
4. Arrange them into a coherent scene
5. Try both wireframe and solid materials — which looks better?

**Expected Output:** A scene with visible facets and angular shapes, giving it a minimalist geometric style popular in modern web design.

---

## 📖 Curated Resources

### Must-Read

1. **Primitives** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/primitives
   - Why: Comprehensive guide to all built-in geometries with live interactive examples

2. **BufferGeometry** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/core/BufferGeometry
   - Why: Understanding the modern geometry format that powers all Three.js shapes

### Video Resources

3. **Build a Mindblowing 3D Portfolio Website** — Fireship
   - 🎥 https://www.youtube.com/watch?v=Q7AOvWpIVHU (⚠️ VERIFIED, 12 min)
   - Why: See how geometries and compositions come together in a real portfolio

### Deep Dives (optional)

4. **Custom BufferGeometry** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/core/BufferGeometry (Section: "Example")
   - Why: Learn to create completely custom shapes from scratch by defining vertices manually

---

## 🤔 Reflection Questions

1. **Comprehension:** What's the tradeoff between low-poly and high-poly geometries?
   - *Think about: Performance vs visual quality — when would you choose each?*

2. **Application:** How would you create a snowman using only primitive geometries?
   - *Think about: Which shapes, what sizes, how to position them*

3. **Connection:** How does the scene graph (parent-child relationships) make complex animations easier?
   - *Think about: The solar system exercise — what would happen without groups?*

4. **Critical Thinking:** Why are all 3D shapes made of triangles instead of squares or other polygons?
   - *Think about: What's mathematically special about three points in space?*

5. **Personal:** Which geometry do you find most interesting or useful for your portfolio project?

---

## ➡️ Next Steps

**Tomorrow:** [Day 4: Materials & Textures](./day-04-materials-textures.md) — Learn how to make your geometries look realistic with materials, lighting, and textures

Now that you can create any shape, tomorrow we'll make them beautiful. You'll learn about different material types, how lighting interacts with surfaces, and how to apply image textures to give objects realistic appearances.

**Before moving on, make sure you can:**
- [ ] Create at least 5 different geometries from memory
- [ ] Adjust geometry parameters to change appearance
- [ ] Position, rotate, and scale objects in 3D space
- [ ] Use Groups to create hierarchical structures
- [ ] Explain what vertices and faces are

[← Previous: Day 2 - First Scene](./day-02-first-scene.md) | [Course Home](../README.md) | [Next: Day 4 - Materials & Textures →](./day-04-materials-textures.md)
