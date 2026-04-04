# Day 4: Materials and Textures

[← Previous: Day 3 - Geometries](./day-03-geometries.md) | [Course Home](../README.md) | [Next: Day 5 - Lighting →](./day-05-lighting.md)

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

If geometry is the skeleton of a 3D object, materials are its skin. They determine how surfaces look — whether they're shiny or matte, transparent or opaque, and how they interact with light in the scene. Three.js gives you several material types, each with a different balance of visual quality and performance.

**MeshBasicMaterial** is the simplest. It shows a flat color and completely ignores lighting — it always looks the same regardless of how many lights you add. Think of it like construction paper: flat, uniform, no depth. It's perfect for debugging, wireframes, or stylized flat-shaded visuals where you don't want lighting to interfere.

**MeshLambertMaterial** takes the next step by responding to light with diffuse reflection. This means surfaces get brighter where light hits them and darker in shadow, but there are no shiny spots. It looks like chalk, unpolished wood, or fabric — matte surfaces that scatter light equally in all directions.

**MeshPhongMaterial** adds specular highlights — those bright, shiny spots you see on plastic, polished surfaces, or anything with a sheen. The `shininess` property controls how tight and intense those highlights are. Higher values create smaller, more focused highlights (like polished metal); lower values create broader, softer highlights.

**MeshStandardMaterial** uses Physically-Based Rendering (PBR), the same approach professional game engines and 3D software use for realistic materials. Instead of abstract "shininess," it uses two intuitive properties: `roughness` (0 = mirror-smooth, 1 = completely matte) and `metalness` (0 = non-metallic like plastic, 1 = fully metallic like gold). This is the industry standard for realistic rendering.

**MeshPhysicalMaterial** extends Standard with advanced effects like clearcoat (car paint), sheen (fabric), and transmission (glass). Most realistic, but most expensive to compute.

The golden rule: **use the simplest material that achieves your visual goal.** MeshBasicMaterial is roughly 10x faster than MeshStandardMaterial because it skips all lighting calculations entirely.

### Textures: Wrapping Images on Geometry

A texture is an image mapped onto a 3D surface. Instead of a flat red cube, you can wrap a brick photograph onto it to create a realistic brick wall. Three.js uses UV mapping to accomplish this — each vertex on your geometry has UV coordinates (values between 0 and 1) that define which pixel on the texture image corresponds to that point on the surface.

You can layer multiple textures on a single material, each controlling a different visual property:

- **map** — The base color (also called albedo or diffuse map)
- **normalMap** — Fakes surface bumps using RGB data, adding visual detail without extra geometry
- **roughnessMap** — Varies how rough or smooth the surface is across different areas
- **metalnessMap** — Varies metallic properties across the surface
- **aoMap** — Ambient occlusion, which darkens crevices and creases for depth

A realistic rock, for example, might combine a color map, a normal map for bumpiness, and a roughness map so some areas appear polished while others are rough.

### Loading Textures

Three.js provides `TextureLoader` to load images asynchronously:

```javascript
const loader = new THREE.TextureLoader();
const texture = loader.load('path/to/image.jpg');
```

The texture loads in the background. You can assign it to a material immediately — Three.js renders a blank surface until the image arrives, then updates automatically. For production code, use callbacks to handle success and errors:

```javascript
loader.load('image.jpg',
    (texture) => { /* loaded successfully */ },
    (progress) => { /* loading progress */ },
    (error) => { /* something went wrong */ }
);
```

**Supported formats:** JPG, PNG, SVG, GIF. For best GPU performance, use power-of-two dimensions (256, 512, 1024, 2048 pixels).

### Texture Properties

Once loaded, textures have properties that control how they're applied to surfaces:

- **repeat** — How many times to tile the texture (e.g., `repeat.set(4, 4)` creates a 4×4 grid)
- **wrapS / wrapT** — What happens at the edges: `RepeatWrapping` tiles infinitely, `MirroredRepeatWrapping` creates mirror patterns, `ClampToEdgeWrapping` stretches the last pixel
- **rotation** — Rotates the texture on the surface (in radians)
- **offset** — Shifts the texture position (great for scrolling effects)
- **minFilter / magFilter** — Controls sampling quality when textures are scaled up or down

> **Key Insight:** Materials + Textures = Visual realism. Geometry defines shape, materials define how surfaces interact with light, and textures add visual detail. Together, they transform simple shapes into convincing objects.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Diffuse** | Light scattered equally in all directions (matte appearance) | Chalk, unpolished wood, fabric |
| **Specular** | Light reflected in a mirror-like direction (shiny spots) | Plastic, polished metal, water |
| **PBR** | Physically-Based Rendering — simulates realistic light behavior | MeshStandardMaterial in Three.js |
| **UV Mapping** | 2D coordinates (0-1) that map texture pixels to geometry vertices | Unwrapping a box into a flat pattern |
| **Albedo** | The base color of a surface without any lighting applied | The "true" color you'd see in neutral light |
| **Normal Map** | RGB image encoding surface normals to fake bumps and detail | Makes a flat wall look like rough bricks |
| **Metalness** | How metallic a surface appears (0 = non-metal, 1 = full metal) | 0 = rubber, 0.5 = brushed steel, 1 = gold |
| **Roughness** | How rough or smooth a surface is (0 = mirror, 1 = matte) | 0 = polished chrome, 1 = sandpaper |

---

## 💻 Code Examples

### Example 1: Material Comparison

```javascript
// material-comparison.js
// Purpose: Show four identical spheres with different material types

import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light is required for Lambert, Phong, Standard materials
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Same geometry, four different materials
const geometry = new THREE.SphereGeometry(1, 32, 32);

const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }),        // Ignores light
    new THREE.MeshLambertMaterial({ color: 0xff0000 }),      // Matte shading
    new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100 }), // Shiny
    new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5, metalness: 0 }) // PBR
];

materials.forEach((mat, i) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.x = (i - 1.5) * 2.5;  // Space them out evenly
    scene.add(mesh);
});

function animate() {
    requestAnimationFrame(animate);
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) child.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** Four identical spheres, each with a different material, reveal how dramatically material choice affects appearance. BasicMaterial is uniformly red regardless of lighting. Lambert shows soft gradients. Phong adds bright specular highlights. Standard uses PBR for the most realistic result. Same shape, same light — completely different looks.

### Example 2: Loading and Applying Textures

```javascript
// textured-cube.js
// Purpose: Load an image texture and apply it to a rotating cube

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load a UV test texture from Three.js examples
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
    'https://threejs.org/examples/textures/uv_grid_opengl.jpg',
    () => { console.log('Texture loaded!'); },     // Success
    undefined,                                      // Progress (unused)
    (err) => { console.error('Error:', err); }      // Error handler
);

// Apply texture as the base color map
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

**What's happening:** The TextureLoader fetches an image asynchronously and applies it as the `map` property — the base color of the surface. The UV grid texture is especially useful because it shows exactly how the image wraps around each face of the cube, making UV mapping visible and intuitive.

### Example 3: Texture Transformation

```javascript
// texture-transforms.js
// Purpose: Demonstrate repeat, rotation, offset, and mirroring

const textureLoader = new THREE.TextureLoader();

// Repeating texture — tiles 4×4 across the surface
const tiledTexture = textureLoader.load('brick.jpg');
tiledTexture.wrapS = THREE.RepeatWrapping;    // Tile horizontally
tiledTexture.wrapT = THREE.RepeatWrapping;    // Tile vertically
tiledTexture.repeat.set(4, 4);                // 4×4 grid

// Rotated texture — spin 45 degrees around center
const rotatedTexture = textureLoader.load('wood.jpg');
rotatedTexture.rotation = Math.PI / 4;        // 45° in radians
rotatedTexture.center.set(0.5, 0.5);          // Rotate around center, not corner

// Scrolling texture — animate offset for moving water effect
const scrollTexture = textureLoader.load('pattern.jpg');
scrollTexture.wrapS = THREE.RepeatWrapping;
scrollTexture.wrapT = THREE.RepeatWrapping;
// In your animate loop: scrollTexture.offset.x += 0.001;

// Mirrored texture — creates symmetrical patterns
const mirrorTexture = textureLoader.load('tile.jpg');
mirrorTexture.wrapS = THREE.MirroredRepeatWrapping;
mirrorTexture.wrapT = THREE.MirroredRepeatWrapping;
mirrorTexture.repeat.set(2, 2);
```

**What's happening:** Texture properties control how images are mapped onto surfaces. `repeat` creates tiling — great for floors and walls. `rotation` spins the texture. `offset` shifts it, and when animated, creates scrolling effects like flowing water or a conveyor belt. `MirroredRepeatWrapping` alternates the image direction for seamless symmetrical patterns.

> **💡 Try it:** Load a texture and animate its `offset` property in the render loop to create a scrolling water effect. Then try animating `rotation` for a spinning vortex!

---

## ✏️ Hands-On Exercises

### Exercise 1: Material Showcase (⏱️ ~20 min)

**Goal:** Compare all five material types visually

**Instructions:**
1. Create 5 spheres in a row (Basic, Lambert, Phong, Standard, Physical)
2. Add a DirectionalLight to the scene
3. Observe how each material reacts differently to the same light
4. Try moving the light position — which materials respond?
5. Add labels or colors to identify each sphere

**Expected Output:**
Five spheres showing clear visual differences — from flat (Basic) to realistic (Physical).

**Stretch Goal:** Add a slider to control metalness and roughness on StandardMaterial in real-time.

---

### Exercise 2: Textured Cube (⏱️ ~20 min)

**Goal:** Load and apply a texture with repeating and scrolling

**Instructions:**
1. Find a texture image (try https://polyhaven.com/textures or use the Three.js UV grid)
2. Load it with TextureLoader and apply to a cube
3. Set the texture to repeat 2×2
4. Animate the texture offset in your render loop for a scrolling effect

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Don't forget to set wrapS and wrapT to THREE.RepeatWrapping before setting repeat values.
</details>

<details>
<summary>Hint 2</summary>
Animate offset in the render loop: `texture.offset.x += 0.001;`
</details>

---

### Exercise 3: PBR Material Creation (⏱️ ~25 min)

**Goal:** Create three objects with distinctly different PBR surface properties

**Instructions:**
1. Create three spheres using MeshStandardMaterial
2. **Matte plastic:** roughness=0.9, metalness=0, bright color
3. **Shiny metal:** roughness=0.1, metalness=1.0, gold or silver color
4. **Rough stone:** roughness=0.8, metalness=0, gray color with a texture map
5. Add good lighting (ambient + directional) so PBR properties are visible

**Expected Output:**
Three spheres that look convincingly like plastic, metal, and stone.

---

## 📖 Curated Resources

### Must-Read

1. **Materials Overview** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/materials/Material
   - Why: Complete reference for all material types and their properties

2. **Textures in Three.js** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/textures
   - Why: Deep dive into texture loading, configuration, and optimization techniques

### Deep Dives (optional)

3. **Free PBR Textures** — Poly Haven
   - 🔗 https://polyhaven.com/textures
   - Why: High-quality CC0 textures for realistic materials — perfect for practicing PBR workflows

---

## 🤔 Reflection Questions

1. **Comprehension:** Why does MeshBasicMaterial not react to lights while MeshStandardMaterial does?
   - *Think about: What calculations each material type performs during rendering*

2. **Application:** When would you choose MeshPhongMaterial over MeshStandardMaterial?
   - *Think about: Performance vs realism tradeoffs — when does "good enough" beat "physically accurate"?*

3. **Connection:** How do normal maps create the illusion of surface detail without adding more geometry?
   - *Think about: What information do surface normals communicate to the lighting system?*

4. **Critical Thinking:** Why are power-of-two texture dimensions (256, 512, 1024) recommended?
   - *Think about: How GPUs handle memory allocation and mipmapping*

5. **Personal:** What material type will you use most for your AI portfolio project, and why?

---

## ➡️ Next Steps

**Tomorrow:** [Day 5: Lighting Your Scene](./day-05-lighting.md) — Learn about different light types and how they create depth, mood, and atmosphere

Now that you understand materials, tomorrow we explore the other half of the visual equation: lighting. You'll learn about ambient, directional, point, and spot lights, and how to combine them for professional-looking scenes.

**Before moving on, make sure you can:**
- [ ] Explain the difference between Basic, Lambert, Phong, and Standard materials
- [ ] Load and apply textures to materials using TextureLoader
- [ ] Configure texture repeat, wrap, and rotation properties
- [ ] Understand what roughness and metalness control in PBR
- [ ] Know when to use each material type based on performance needs

[← Previous: Day 3 - Geometries](./day-03-geometries.md) | [Course Home](../README.md) | [Next: Day 5 - Lighting →](./day-05-lighting.md)
