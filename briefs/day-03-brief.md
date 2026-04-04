# Day 3: Exploring Three.js Geometries

[← Previous: Day 2 - First Scene](./day-02-brief.md) | [Course Home](../README.md) | [Next: Day 4 - Materials & Textures →](./day-04-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Create and customize at least 5 different built-in Three.js geometries
2. Understand geometry parameters and how they affect the shape
3. Combine multiple geometries into a complex scene
4. Position, scale, and rotate objects to create compositions
5. Use BufferGeometry to understand how 3D shapes are constructed

**Difficulty:** 🟢 Beginner
**Estimated Time:** 1 hour (25 min reading + 35 min hands-on)

---

## 📚 Core Concepts

### What Is Geometry?

Think of geometry like a wireframe skeleton. Imagine building a character for a video game - you start with a frame of bones (the geometry), then you wrap it in skin and clothes (the material). The geometry defines the shape: a sphere, a box, a pyramid, or anything custom.

In Three.js, geometry is made up of **vertices** (points in 3D space) and **faces** (triangles connecting those points). Every 3D shape, no matter how complex, is built from triangles. Why triangles? Because three points always define a flat plane, making them perfect for graphics rendering. A cube has 8 vertices and 12 triangular faces (2 triangles per side × 6 sides).

Modern Three.js uses `BufferGeometry`, which stores vertex data efficiently in arrays. This is much faster than the old `Geometry` class because it sends data directly to the GPU without conversion.

### Built-in Geometries

Three.js provides 13 primitive geometries out of the box:

**Box**: Rectangular prism (including cubes)
**Sphere**: Perfect sphere (like a ball)
**Cylinder**: Can create cylinders, cones, or truncated cones
**Torus**: Donut shape
**Plane**: Flat rectangular surface
**Circle**: Flat circle
**Cone**: Pyramid with circular base
**Dodecahedron**: 12-sided polyhedron
**Icosahedron**: 20-sided polyhedron (great for low-poly spheres)
**Octahedron**: 8-sided polyhedron
**Tetrahedron**: 4-sided pyramid
**TorusKnot**: Twisted torus (complex knot shapes)
**Ring**: Flat donut (2D torus)

Each geometry has parameters that control its appearance. For example, a sphere's `widthSegments` and `heightSegments` control how smooth it looks - more segments = smoother but more polygons = slower performance.

### Understanding Segments and Detail

Segments determine how many subdivisions a shape has. More segments create smoother curves but increase the polygon count. Here's the tradeoff:

**Low poly (few segments)**:
- Faster to render
- Lower memory usage
- Stylized, geometric aesthetic
- Visible facets/edges

**High poly (many segments)**:
- Slower to render
- Higher memory usage
- Smooth, realistic appearance
- Curved surfaces look perfect

For a sphere, `new THREE.SphereGeometry(1, 32, 32)` creates a very smooth ball with 32 horizontal and vertical segments. `new THREE.SphereGeometry(1, 8, 6)` creates a low-poly geodesic dome aesthetic. Both are spheres, but they serve different artistic purposes.

### Positioning, Scaling, and Rotating

Every Object3D (including meshes) has three transform properties:

**Position**: Where the object is in 3D space (x, y, z coordinates)
```javascript
mesh.position.set(2, 1, -5);  // x=2, y=1, z=-5
mesh.position.x += 0.5;        // Move right by 0.5 units
```

**Rotation**: Orientation around each axis (in radians)
```javascript
mesh.rotation.set(0, Math.PI / 4, 0);  // Rotate 45° around Y-axis
mesh.rotation.y = Math.PI;              // 180° rotation
```

**Scale**: Size multiplier (1 = normal, 2 = double size, 0.5 = half size)
```javascript
mesh.scale.set(2, 1, 1);  // Double width, keep height/depth
mesh.scale.setScalar(0.5); // Half size in all dimensions
```

These transforms are relative to the object's parent in the scene graph. If you add a child object to a mesh and rotate the parent, the child rotates with it while maintaining its relative position.

> **Key Insight:** Geometry defines the shape, but transforms (position, rotation, scale) define where and how that shape exists in your 3D world.

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
| **Scene Graph** | Tree structure of parent-child object relationships | Children inherit parent transforms |

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

// Create different geometries in a grid layout
const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.7, 32, 32),
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    new THREE.TorusGeometry(0.5, 0.2, 16, 100),
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.IcosahedronGeometry(0.7, 0)
];

const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00, 
    wireframe: true 
});

// Position geometries in a 2x3 grid
geometries.forEach((geo, i) => {
    const mesh = new THREE.Mesh(geo, material);
    
    // Calculate grid position
    const x = (i % 3) * 2.5 - 2.5;  // -2.5, 0, 2.5
    const y = Math.floor(i / 3) * 2 - 1;  // 1, -1
    
    mesh.position.set(x, y, 0);
    scene.add(mesh);
});

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate all meshes
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

**What's happening:** We create six different geometries and arrange them in a 2×3 grid. The wireframe material lets us see the structure of each geometry. The modulo operator (`%`) calculates column position, and `Math.floor(i / 3)` calculates row position. All geometries rotate together, showing their unique structures.

### Example 2: Customizing Geometry Parameters

```javascript
// Different sphere detail levels
const lowPolySphere = new THREE.SphereGeometry(
    1,    // radius
    8,    // widthSegments (horizontal)
    6     // heightSegments (vertical)
);

const mediumPolySphere = new THREE.SphereGeometry(1, 16, 12);
const highPolySphere = new THREE.SphereGeometry(1, 32, 32);
const ultraSphere = new THREE.SphereGeometry(1, 64, 64);

// Cone variations
const cone = new THREE.ConeGeometry(1, 2, 32);      // Standard cone
const pyramid = new THREE.ConeGeometry(1, 2, 4);    // 4-sided = pyramid
const flatCone = new THREE.ConeGeometry(1, 2, 3);   // 3-sided = triangle

// Partial geometries
const halfSphere = new THREE.SphereGeometry(
    1,
    32, 32,
    0,              // phiStart (horizontal start angle)
    Math.PI,        // phiLength (horizontal angle length) - half circle
    0,              // thetaStart (vertical start angle)
    Math.PI / 2     // thetaLength (vertical angle length) - quarter arc
);
```

**What's happening:** Each geometry has parameters that dramatically change its appearance. Fewer segments create a faceted, stylized look. More segments create smooth curves. You can even create partial geometries (half-spheres, pie-slice cones) by adjusting the angle parameters.

### Example 3: Building Compositions

```javascript
// Create a simple robot head
const headGroup = new THREE.Group();  // Group to hold all parts

// Main head (box)
const headGeo = new THREE.BoxGeometry(2, 2, 2);
const headMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
const head = new THREE.Mesh(headGeo, headMat);
headGroup.add(head);

// Eyes (spheres)
const eyeGeo = new THREE.SphereGeometry(0.2, 16, 16);
const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });

const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
leftEye.position.set(-0.5, 0.3, 1.01);  // Slightly in front of head
headGroup.add(leftEye);

const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
rightEye.position.set(0.5, 0.3, 1.01);
headGroup.add(rightEye);

// Antenna (cylinder)
const antennaGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
const antennaMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const antenna = new THREE.Mesh(antennaGeo, antennaMat);
antenna.position.set(0, 1.5, 0);
headGroup.add(antenna);

scene.add(headGroup);

// Now rotating headGroup rotates ALL parts together
function animate() {
    requestAnimationFrame(animate);
    headGroup.rotation.y += 0.01;
    renderer.render(scene, camera);
}
```

**What's happening:** We use a `Group` to organize multiple meshes. The group acts as a parent, so when we rotate it, all children (head, eyes, antenna) rotate together while maintaining their relative positions. This is the power of the scene graph - hierarchical transformations.

> **💡 Try it:** Create a simple scene using only primitive geometries - maybe a house (boxes for walls/roof, cylinder for chimney) or a tree (cone for foliage, cylinder for trunk).

---

## ✏️ Hands-On Exercises

### Exercise 1: Geometry Parameter Explorer (⏱️ ~15 min)

**Goal:** Understand how parameters affect geometry appearance

**Instructions:**
1. Create a sphere with different segment counts: 4, 8, 16, 32
2. Position them side-by-side
3. Use wireframe material to see the structure
4. Observe how smoothness changes
5. Check the browser console - how many vertices does each have?

**Expected Output:**
Four spheres of increasing smoothness, from blocky icosahedron to perfect sphere.

**Stretch Goal:** Try creating partial geometries (half-sphere, quarter-torus).

---

### Exercise 2: Create a Solar System (⏱️ ~25 min)

**Goal:** Use groups and transformations to create orbiting objects

**Instructions:**
1. Create a central "sun" (large sphere)
2. Create an "earth" (smaller sphere) 
3. Put earth in a group
4. Position earth away from the origin (e.g., x=5)
5. Rotate the group (not the earth) to make it orbit
6. Add a "moon" as a child of earth
7. Make the moon orbit earth

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Use THREE.Group() to create parent objects. Add earth to earthOrbit group, add moon to earth directly.
</details>

<details>
<summary>Hint 2</summary>
Rotate the group, not the planet. The planet should only spin on its own axis.
</details>

**Expected Output:**
A central sun, earth orbiting around it, and moon orbiting earth.

---

### Exercise 3: Low-Poly Scene (⏱️ ~20 min)

**Goal:** Create a stylized scene using low-poly geometries

**Instructions:**
1. Use low segment counts (4-8) for all geometries
2. Create at least 5 objects (trees, mountains, buildings)
3. Use different colors for each object
4. Arrange them into a simple scene
5. Use wireframe mode to showcase the low-poly aesthetic

**Expected Output:**
A scene with visible facets and angular shapes, giving it a minimalist geometric style.

---

## 📖 Curated Resources

### Must-Read

1. **BufferGeometry** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/core/BufferGeometry
   - Why: Understanding the modern geometry format

2. **Geometries Overview** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/primitives
   - Why: Comprehensive guide to all built-in geometries with live examples

### Video Resources

3. **Three.js Geometries Explained** — (Search for recent tutorials)
   - Why: Visual demonstration of each geometry type

### Deep Dives (optional)

4. **Custom BufferGeometry** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/core/BufferGeometry
   - Why: Learn to create completely custom shapes from scratch

---

## 🤔 Reflection Questions

1. **Comprehension:** What's the tradeoff between low-poly and high-poly geometries?
   - *Think about: Performance vs visual quality*

2. **Application:** How would you create a snowman using only primitive geometries?
   - *Think about: Which shapes and how to combine them*

3. **Connection:** How does the scene graph make complex animations easier?

4. **Critical Thinking:** Why are all 3D shapes made of triangles instead of squares or other polygons?

5. **Personal:** Which geometry do you find most interesting or useful?

---

## ➡️ Next Steps

**Tomorrow:** [Day 4: Materials and Textures](./day-04-brief.md) — Learn how to make your geometries look realistic with materials, colors, and textures

Now that you can create any shape, tomorrow we'll make them beautiful. You'll learn about different material types, how lighting affects them, and how to apply image textures.

**Before moving on, make sure you can:**
- [ ] Create at least 5 different geometries from memory
- [ ] Adjust geometry parameters to change appearance
- [ ] Position, rotate, and scale objects
- [ ] Use groups to create hierarchical structures
- [ ] Explain what vertices and faces are

[← Previous: Day 2 - First Scene](./day-02-brief.md) | [Course Home](../README.md) | [Next: Day 4 - Materials & Textures →](./day-04-brief.md)
