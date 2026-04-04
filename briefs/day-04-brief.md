# Day 4: Materials and Textures

[← Previous: Day 3 - Geometries](./day-03-brief.md) | [Course Home](../README.md) | [Next: Day 5 - Lighting →](./day-05-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Understand the different material types in Three.js and when to use each
2. Apply colors, transparency, and properties to materials
3. Load and apply image textures to geometries
4. Use the TextureLoader to manage texture loading
5. Configure texture properties (repeat, wrap, rotation)

**Difficulty:** 🟢 Beginner  
**Estimated Time:** 1 hour (25 min reading + 35 min hands-on)

---

## 📚 Core Concepts

### Material Types: From Simple to Realistic

Materials determine how surfaces interact with light and appear visually. Three.js provides materials ranging from basic (no lighting calculations) to physically-based (realistic light interaction).

**MeshBasicMaterial**: Flat color, no lighting. Always looks the same regardless of lights. Great for debugging, wireframes, or flat-shaded aesthetics. Think of it as construction paper - matte, uniform color.

**MeshLambertMaterial**: Responds to light with diffuse reflection (matte surfaces). Cheaper computationally than Phong. Looks like chalk, unpolished wood, or fabric.

**MeshPhongMaterial**: Adds specular highlights (shiny spots). Good for plastics, polished surfaces, or anything with a sheen. The `shininess` property controls how focused the highlights are.

**MeshStandardMaterial**: Physically-based rendering (PBR). Industry standard for realistic materials. Uses `roughness` (0=mirror, 1=matte) and `metalness` (0=non-metal, 1=metal). This is what professional game engines and 3D software use.

**MeshPhysicalMaterial**: Extends StandardMaterial with clearcoat, sheen, and transmission (glass). Most realistic but most expensive to compute.

The golden rule: use the simplest material that achieves your visual goal. MeshBasicMaterial is 10x faster than MeshStandardMaterial.

### Textures: Wrapping Images on Geometry

A texture is an image mapped onto a 3D surface. Instead of a flat red color, you can wrap a brick photo onto a cube to create a realistic brick. Three.js uses UV mapping - each vertex has UV coordinates (0-1 range) that define where on the texture image that point samples from.

**Common texture types**:
- **map**: Base color/albedo (the diffuse color of the surface)
- **normalMap**: Fake surface bumps using RGB data (adds detail without geometry)
- **roughnessMap**: Varies how rough/smooth the surface is
- **metalnessMap**: Varies metallic properties across the surface
- **aoMap**: Ambient occlusion (shadows in crevices)

You can combine multiple textures on one material. A rock might have a color map, normal map for bumpiness, and roughness map for varied shiny/matte areas.

### Loading Textures

Three.js provides `TextureLoader` for loading images asynchronously:

```javascript
const loader = new THREE.TextureLoader();
const texture = loader.load('path/to/image.jpg');
```

The texture loads in the background. You can use it immediately - Three.js shows a blank material until the image loads, then updates automatically. For production, use the callback to know when loading completes:

```javascript
loader.load('image.jpg', 
    (texture) => { /* success */ },
    (progress) => { /* loading */ },
    (error) => { /* error */ }
);
```

**Supported formats**: JPG, PNG, SVG, GIF. Power-of-two dimensions (256, 512, 1024, 2048) are most efficient for GPU memory.

### Texture Properties

Textures aren't just images - they have properties that control how they're applied:

**repeat**: How many times to tile the texture  
**wrapS/wrapT**: What to do at edges (repeat, clamp, mirror)  
**rotation**: Rotate the texture on the surface  
**offset**: Shift the texture position  
**minFilter/magFilter**: How to sample when scaled up/down

> **Key Insight:** Materials + Textures = Visual realism. Geometry defines shape, materials define interaction with light, textures add detail.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Diffuse** | Light scattered equally in all directions (matte) | Chalk, unpolished wood |
| **Specular** | Light reflected in mirror-like direction (shiny) | Plastic, metal, water |
| **PBR** | Physically-Based Rendering - realistic light simulation | MeshStandardMaterial |
| **UV Mapping** | 2D coordinates (0-1) that map texture to geometry | Unwrapping a box into a flat pattern |
| **Albedo** | Base color without lighting (same as diffuse map) | The "true" color of a surface |
| **Normal Map** | RGB image encoding surface normals (fakes bumps) | Makes flat surface look detailed |
| **Metalness** | How metallic a surface is (0=non-metal, 1=full metal) | 0=plastic, 1=gold |
| **Roughness** | How rough/smooth surface is (0=mirror, 1=matte) | 0=polished, 1=sand |

---

## 💻 Code Examples

### Example 1: Material Comparison

```javascript
import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add light (required for Lambert, Phong, Standard materials)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Create spheres with different materials
const geometry = new THREE.SphereGeometry(1, 32, 32);

const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    new THREE.MeshLambertMaterial({ color: 0xff0000 }),
    new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100 }),
    new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5, metalness: 0 })
];

materials.forEach((mat, i) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.x = (i - 1.5) * 2.5;
    scene.add(mesh);
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            child.rotation.y += 0.01;
        }
    });
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** Four identical spheres with different materials show how each reacts to light. BasicMaterial ignores the light entirely. Lambert shows soft shading. Phong adds bright specular highlights. Standard uses PBR for realistic appearance. Notice how changing materials dramatically changes the visual without touching geometry.

### Example 2: Loading and Applying Textures

```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
    'https://threejs.org/examples/textures/uv_grid_opengl.jpg',
    // onLoad callback (optional)
    () => { console.log('Texture loaded!'); },
    // onProgress callback (optional)
    undefined,
    // onError callback
    (err) => { console.error('Texture loading error:', err); }
);

// Apply texture to material
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshBasicMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** The TextureLoader fetches an image from a URL. The `map` property applies it as the base color texture. Notice the UV grid texture shows how the image wraps around the cube - this is useful for debugging UV mapping. The texture loads asynchronously but you can use it immediately.

### Example 3: Texture Transformation

```javascript
// Repeating texture
const texture = textureLoader.load('brick.jpg');
texture.wrapS = THREE.RepeatWrapping;  // Horizontal repeat
texture.wrapT = THREE.RepeatWrapping;  // Vertical repeat
texture.repeat.set(4, 4);  // Tile 4x4 times

// Rotating texture
const rotatedTexture = textureLoader.load('wood.jpg');
rotatedTexture.rotation = Math.PI / 4;  // 45 degrees
rotatedTexture.center.set(0.5, 0.5);    // Rotate around center

// Offset texture (sliding)
const offsetTexture = textureLoader.load('pattern.jpg');
offsetTexture.offset.set(0.5, 0.5);  // Shift by half

// Mirrored texture
const mirrorTexture = textureLoader.load('tile.jpg');
mirrorTexture.wrapS = THREE.MirroredRepeatWrapping;
mirrorTexture.wrapT = THREE.MirroredRepeatWrapping;
mirrorTexture.repeat.set(2, 2);
```

**What's happening:** Texture properties let you control how images are mapped. `repeat` creates tiling (great for floors/walls). `rotation` spins the texture. `offset` shifts it. Wrapping modes control edge behavior - `RepeatWrapping` tiles infinitely, `MirroredRepeatWrapping` creates symmetrical patterns.

> **💡 Try it:** Load a texture and animate its `offset` property in the render loop to create scrolling effects (like moving water or conveyor belt).

---

## ✏️ Hands-On Exercises

### Exercise 1: Material Showcase (⏱️ ~20 min)

**Goal:** Compare all five material types visually

**Instructions:**
1. Create 5 spheres in a row
2. Apply each material type: Basic, Lambert, Phong, Standard, Physical
3. Add directional light to the scene
4. Observe how each reacts to light
5. Try changing light position - which materials respond?

**Expected Output:**
Five spheres showing clear visual differences based on lighting interaction.

**Stretch Goal:** Add a slider to control metalness and roughness on StandardMaterial in real-time.

---

### Exercise 2: Textured Cube (⏱️ ~20 min)

**Goal:** Load and apply a texture to geometry

**Instructions:**
1. Find or use a texture image (256x256 or larger, power-of-two dimensions recommended)
2. Load it with TextureLoader
3. Apply to a cube using MeshBasicMaterial
4. Make the texture repeat 2x2
5. Animate the texture offset to create a scrolling effect

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Free textures: https://polyhaven.com/textures or use Three.js example textures
</details>

<details>
<summary>Hint 2</summary>
Animate offset in the render loop: `texture.offset.x += 0.001;`
</details>

---

### Exercise 3: PBR Material Creation (⏱️ ~25 min)

**Goal:** Create realistic materials using PBR workflow

**Instructions:**
1. Create a sphere with MeshStandardMaterial
2. Load a color texture for the `map` property
3. Experiment with roughness values (0, 0.25, 0.5, 0.75, 1.0)
4. Experiment with metalness values (0, 0.5, 1.0)
5. Create three spheres: matte plastic, shiny metal, rough stone

**Expected Output:**
Three spheres with distinctly different surface properties demonstrating PBR concepts.

---

## 📖 Curated Resources

### Must-Read

1. **Materials Overview** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/materials/Material
   - Why: Complete reference for all material types

2. **Textures in Three.js** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/textures
   - Why: Deep dive into texture loading, configuration, and optimization

### Video Resources

3. **PBR Materials Explained** — (Search for Three.js PBR tutorials)
   - Why: Understanding physically-based rendering concepts

### Deep Dives (optional)

4. **Free PBR Textures** — Poly Haven
   - 🔗 https://polyhaven.com/textures
   - Why: High-quality CC0 textures for realistic materials

---

## 🤔 Reflection Questions

1. **Comprehension:** Why does MeshBasicMaterial not react to lights while MeshStandardMaterial does?
   - *Think about: What calculations happen for each material type*

2. **Application:** When would you choose MeshPhongMaterial over MeshStandardMaterial?
   - *Think about: Performance vs realism tradeoffs*

3. **Connection:** How do normal maps create the illusion of detail without adding geometry?

4. **Critical Thinking:** Why are power-of-two texture dimensions (256, 512, 1024) recommended?

5. **Personal:** What material type will you use most for your AI portfolio project?

---

## ➡️ Next Steps

**Tomorrow:** [Day 5: Lighting Your Scene](./day-05-brief.md) — Learn about different light types and how they affect materials and create atmosphere

Now that you understand materials, tomorrow we'll explore the other half of the visual equation: lighting. You'll learn about ambient, directional, point, and spot lights, and how to use them to create mood and realism.

**Before moving on, make sure you can:**
- [ ] Explain the difference between Basic, Lambert, Phong, and Standard materials
- [ ] Load and apply textures to materials
- [ ] Configure texture repeat, wrap, and rotation
- [ ] Understand what roughness and metalness control in PBR
- [ ] Know when to use each material type

[← Previous: Day 3 - Geometries](./day-03-brief.md) | [Course Home](../README.md) | [Next: Day 5 - Lighting →](./day-05-brief.md)
