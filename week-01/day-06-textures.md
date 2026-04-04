# Day 6: Cameras and OrbitControls

[← Previous: Day 5 - Lighting](./day-05-lighting.md) | [Course Home](../README.md) | [Next: Day 7 - Mini-Project →](./day-07-mini-project.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Understand PerspectiveCamera parameters (FOV, aspect, near, far)
2. Compare PerspectiveCamera vs OrthographicCamera use cases
3. Implement OrbitControls for mouse-based camera navigation
4. Configure OrbitControls properties (damping, zoom limits, rotation limits)
5. Animate camera movement programmatically

**Difficulty:** 🟢 Beginner
**Estimated Time:** 1 hour (20 min reading + 40 min hands-on)

---

## 📚 Core Concepts

### The Camera is Your Viewpoint

In Three.js, the camera determines what the user sees. Unlike real cameras that capture light, Three.js cameras define a **viewing frustum** — a pyramid-shaped volume of space that gets rendered. Objects inside this frustum are visible; objects outside are "culled" (not rendered) for performance.

Think of it like looking through a window. The window frame determines what you can see, and you can only see things between the glass and the horizon — not things behind you or past the horizon. The camera's parameters control the shape and size of that window.

The most common camera is `PerspectiveCamera`, which mimics how human eyes see the world: objects farther away appear smaller. This creates natural depth perception — the same reason train tracks appear to converge in the distance. The alternative is `OrthographicCamera`, which has no perspective distortion — like architectural blueprints where parallel lines stay parallel regardless of distance.

### PerspectiveCamera Parameters

```javascript
new THREE.PerspectiveCamera(fov, aspect, near, far)
```

**FOV (Field of View):** The vertical viewing angle in degrees. Higher values give a wider view (like a fish-eye lens), lower values give a narrower, zoomed-in view (like a telephoto lens). Human eyes see roughly 50-60°. Game cameras often use 75-90° for a more immersive feel.

**Aspect Ratio:** Width divided by height of your viewport. Almost always set to `window.innerWidth / window.innerHeight` to match the screen. Get this wrong and everything looks stretched — like watching a widescreen movie on a square TV.

**Near Clipping Plane:** The minimum render distance. Anything closer than this is invisible. Set it to 0.1 or 1 to prevent objects "inside" the camera from rendering. Setting it to 0 causes depth-buffer precision issues (Z-fighting), so always keep it above zero.

**Far Clipping Plane:** The maximum render distance. Anything farther than this disappears. Keeps the renderer from wasting effort on distant objects you can't meaningfully see. Typical values range from 100 to 10,000 depending on your scene scale.

### OrbitControls: Interactive Navigation

Portfolio sites need to feel alive. Visitors expect to rotate, zoom, and explore 3D scenes with their mouse or fingers. That's what `OrbitControls` gives you — it's imported from `three/examples/jsm/controls/OrbitControls.js` and wires up all the standard interactions:

- **Left-click drag:** Rotate the camera around a target point
- **Right-click drag:** Pan (move the camera parallel to the screen)
- **Scroll wheel:** Zoom in/out
- **Touch:** Pinch to zoom, two-finger drag to rotate

The camera orbits around a `target` point, which defaults to (0, 0, 0). You can change this to make the camera orbit around any object. The most important setting is **damping** — it adds inertia so the camera keeps gliding after you stop dragging. Without it, movement feels abrupt and mechanical. With it, your scene feels polished and premium.

A few key configuration options:

- `minDistance` / `maxDistance` — prevent users from zooming too close or too far
- `maxPolarAngle` — stop the camera from going below the ground plane (set to `Math.PI / 2`)
- `autoRotate` — slowly spin the scene when the user isn't interacting (great for hero sections)
- `enablePan` — disable panning if you want orbit-only behavior

### Camera Animation

Cameras are just another `Object3D` in Three.js — they have position, rotation, and can be animated like anything else. Common animation patterns include:

**Smooth transitions:** Tween the camera from one position to another using linear interpolation (`lerpVectors`). Pair this with an easing function for natural acceleration/deceleration.

**Auto-orbit:** Set `controls.autoRotate = true` and the scene slowly spins, creating a showcase effect perfect for portfolio landing pages.

**Camera paths:** Pre-define a series of positions and smoothly move through them — great for guided tours of a 3D scene.

The key to good camera animation is easing. Linear movement (constant speed) looks robotic. Ease-in-out movement (accelerate then decelerate) looks natural. The code examples below show how to implement both approaches.

> **Key Insight:** The camera is just another Object3D — it has position, rotation, and can be parented to groups. You can animate it like any other object in your scene.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **FOV** | Field of View — vertical viewing angle in degrees | 75° = normal view, 120° = wide-angle |
| **Aspect Ratio** | Width / Height of viewport | 16:9 screen = 1.777 |
| **Frustum** | Pyramid-shaped viewing volume between near and far planes | The invisible box defining what the camera "sees" |
| **Clipping Plane** | Near/far boundaries — objects outside are not rendered | near=0.1, far=1000 |
| **OrbitControls** | Mouse/touch controls to rotate camera around a target | Standard for any 3D product viewer |
| **Damping** | Inertia effect — camera glides after input stops | Makes interaction feel smooth and polished |
| **Target** | The 3D point the camera orbits around | `controls.target.set(0, 1, 0)` |
| **Lerp** | Linear interpolation — smoothly blending between two values | Moving camera from position A to position B |

---

## 💻 Code Examples

### Example 1: PerspectiveCamera Setup and Configuration

```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();

// Create camera — these are the most common "good defaults"
const camera = new THREE.PerspectiveCamera(
    75,                                      // FOV: wider than human eye for immersion
    window.innerWidth / window.innerHeight,  // Aspect: match the browser window
    0.1,                                     // Near: very close to camera
    1000                                     // Far: render up to 1000 units away
);

// Position camera — default is 0,0,0 which puts you INSIDE objects!
camera.position.set(5, 5, 5);  // Pull back and up for a nice angle

// Point camera at the scene origin
camera.lookAt(0, 0, 0);

// Dynamically change FOV (creates a zoom effect)
camera.fov = 50;  // Narrower = more zoomed in
camera.updateProjectionMatrix();  // REQUIRED after changing camera params!

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a test cube so we can see something
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
);
scene.add(cube);

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** We create a camera with typical settings and pull it back from the origin so it's not stuck inside objects. The critical detail: whenever you change camera properties like `fov` at runtime, you **must** call `updateProjectionMatrix()` — otherwise the change is ignored.

### Example 2: Adding OrbitControls

```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// After creating camera and renderer...
const controls = new OrbitControls(camera, renderer.domElement);

// Enable damping for that smooth, premium feel
controls.enableDamping = true;
controls.dampingFactor = 0.05;    // Lower = more glide, higher = snappier

// Prevent users from going too close or too far
controls.minDistance = 2;
controls.maxDistance = 20;

// Stop camera from going below the floor
controls.maxPolarAngle = Math.PI / 2;

// Disable panning — orbit only (cleaner for portfolios)
controls.enablePan = false;

// Auto-rotate when idle — perfect for hero sections
controls.autoRotate = true;
controls.autoRotateSpeed = 2;

// Change what the camera orbits around
controls.target.set(0, 1, 0);  // Orbit 1 unit above ground

// CRITICAL: Update controls every frame when damping is enabled
function animate() {
    requestAnimationFrame(animate);
    controls.update();  // This calculates the inertia each frame
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** OrbitControls takes the camera and DOM element, then listens for mouse/touch events. The `update()` call in the animation loop is **required** when damping is enabled — it's what creates the smooth gliding effect by gradually reducing velocity each frame.

### Example 3: Smooth Camera Animation

```javascript
// Animate camera to a target position with easing
function moveCameraTo(targetPos, duration = 1000) {
    const startPos = camera.position.clone();
    const startTime = Date.now();

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);  // 0 → 1

        // Ease-in-out: accelerate then decelerate
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Interpolate between start and target positions
        camera.position.lerpVectors(startPos, targetPos, eased);

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }

    animateCamera();
}

// Usage: move camera to (10, 5, 10) over 2 seconds
moveCameraTo(new THREE.Vector3(10, 5, 10), 2000);
```

**What's happening:** We capture the starting position, then each frame calculate how far through the animation we are. The easing function transforms linear progress into smooth acceleration/deceleration. `lerpVectors` does the actual interpolation between start and end positions.

> **💡 Try it:** Set up OrbitControls with damping enabled, then try disabling it (`enableDamping = false`). Feel the difference — damping makes your scene feel professional instead of mechanical.

---

## ✏️ Hands-On Exercises

### Exercise 1: Camera Parameter Exploration (⏱️ ~15 min)

**Goal:** Understand how FOV and clipping planes affect the view

**Instructions:**
1. Create a scene with 5 cubes at different distances (z = -5, 0, 5, 10, 20)
2. Give each cube a different color so you can tell them apart
3. Start with FOV = 75, near = 0.1, far = 100
4. Change FOV to 30 — observe the "zoomed in" telephoto effect
5. Change FOV to 120 — observe the wide-angle distortion
6. Set far = 15 — watch distant cubes vanish
7. Set near = 10 — watch close cubes disappear

**Expected Output:** A clear understanding of how each camera parameter controls what's visible and how objects appear.

---

### Exercise 2: OrbitControls Configuration (⏱️ ~25 min)

**Goal:** Configure OrbitControls for a portfolio-like experience

**Instructions:**
1. Create a scene with a sphere or torus at the center
2. Add OrbitControls with damping enabled (dampingFactor = 0.05)
3. Set min/max distance to prevent extreme zoom (2-20 range)
4. Set `maxPolarAngle = Math.PI / 2` to prevent going underground
5. Disable panning (`enablePan = false`) for orbit-only behavior
6. Enable auto-rotation (`autoRotate = true, autoRotateSpeed = 2`)

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Make sure controls.update() is inside your animation loop — auto-rotation and damping both need it
</details>

<details>
<summary>Hint 2</summary>
If auto-rotate stops when you interact, that's expected — it pauses during user input and resumes after
</details>

---

### Exercise 3: Camera Showcase (⏱️ ~30 min)

**Goal:** Create a multi-view scene with smooth camera switching

**Instructions:**
1. Create a scene with several objects arranged in a layout
2. Define 3 camera positions: front view (0, 2, 10), side view (10, 2, 0), top view (0, 10, 0)
3. Add keyboard listeners for keys 1, 2, 3 to trigger each view
4. Use the `moveCameraTo` function from Example 3 to animate between positions
5. Make transitions take 1.5 seconds with smooth easing

**Expected Output:** Pressing 1, 2, or 3 smoothly animates the camera to different viewpoints around your scene.

---

## 📖 Curated Resources

### Must-Read

1. **PerspectiveCamera** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
   - Why: Complete parameter reference and all available methods

2. **OrbitControls** — Three.js Examples Docs
   - 🔗 https://threejs.org/docs/#examples/en/controls/OrbitControls
   - Why: Every configuration option explained with defaults

### Deep Dives (optional)

3. **Three.js Camera Examples** — Official Examples
   - 🔗 https://threejs.org/examples/?q=camera
   - Why: Interactive demos showing cameras in action

4. **OrthographicCamera** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/cameras/OrthographicCamera
   - Why: Understand the alternative camera type for 2D-style views

---

## 🤔 Reflection Questions

1. **Comprehension:** What happens if you set the near clipping plane to 0? Why is that a problem?
   - *Think about: Depth buffer precision and Z-fighting*

2. **Application:** When would you use OrthographicCamera instead of PerspectiveCamera?
   - *Think about: Architectural visualization, 2D games, CAD software, isometric views*

3. **Connection:** How does FOV affect the sense of speed in racing games?
   - *Think about: Wide FOV makes peripheral objects streak past faster*

4. **Critical Thinking:** Why is it important to call `controls.update()` every frame when damping is enabled?
   - *Think about: Where does the inertia calculation happen?*

5. **Personal:** What camera settings and controls will feel best for your AI portfolio site?

---

## ➡️ Next Steps

**Tomorrow:** [Day 7: Week 1 Review & Mini-Project](./day-07-mini-project.md) — Build a complete interactive 3D gallery combining everything from this week

Now that you can set up cameras and let users navigate your scene with OrbitControls, tomorrow you'll put it all together — scenes, geometries, materials, lighting, and cameras — into one cohesive mini-project.

**Before moving on, make sure you can:**
- [ ] Create and configure a PerspectiveCamera with appropriate parameters
- [ ] Set up OrbitControls with damping and sensible limits
- [ ] Adjust camera parameters dynamically (and remember `updateProjectionMatrix`)
- [ ] Animate camera position smoothly with easing
- [ ] Configure auto-rotation and orbit constraints

[← Previous: Day 5 - Lighting](./day-05-lighting.md) | [Course Home](../README.md) | [Next: Day 7 - Mini-Project →](./day-07-mini-project.md)
