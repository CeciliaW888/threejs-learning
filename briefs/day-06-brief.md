# Day 6: Cameras and OrbitControls

[← Previous: Day 5 - Lighting](./day-05-brief.md) | [Course Home](../README.md) | [Next: Day 7 - Basic Interaction →](./day-07-brief.md)

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

In Three.js, the camera determines what the user sees. Unlike real cameras that capture light, Three.js cameras define a viewing frustum - a pyramid-shaped volume of space that gets rendered. Objects inside this frustum are visible; objects outside are "culled" (not rendered) for performance.

The most common camera is `PerspectiveCamera`, which mimics how human eyes see the world: objects farther away appear smaller. This creates natural depth perception. The alternative is `OrthographicCamera`, which has no perspective distortion - like architectural blueprints where parallel lines stay parallel.

### PerspectiveCamera Parameters Explained

```javascript
new THREE.PerspectiveCamera(fov, aspect, near, far)
```

**FOV (Field of View)**: Vertical viewing angle in degrees. Higher = wider view (fish-eye effect), lower = zoomed-in (telephoto). Human eyes are roughly 50-60°. Game cameras often use 75-90° for more dramatic perspectives.

**Aspect Ratio**: Width divided by height. Almost always `window.innerWidth / window.innerHeight` to match your screen. Incorrect aspect ratio causes stretching.

**Near Clipping Plane**: Minimum distance - anything closer is invisible. Prevents objects "inside" the camera from rendering. Usually 0.1 or 1.

**Far Clipping Plane**: Maximum distance - anything farther is invisible. Prevents rendering distant objects for performance. Balance between view distance and performance (100-10000 typical).

Think of it like adjusting binoculars: FOV is zoom level, aspect is the eyepiece shape, near/far is the focus range.

### OrbitControls: Interactive Navigation

OrbitControls (from `three/examples/jsm/controls/OrbitControls.js`) adds mouse/touch interaction to orbit around a target point. It's essential for portfolio sites - users expect to rotate and examine 3D objects.

**Core interactions**:
- Left-click drag: Rotate around target
- Right-click drag: Pan (move camera parallel to screen)
- Scroll wheel: Zoom in/out
- Touch: Pinch zoom, two-finger rotate

The camera orbits around a `target` point (default 0,0,0). You can change this target to focus on any object.

### Camera Animation

Cameras can move smoothly using animation loops or tweening libraries (like GSAP). Common patterns:

**Following an object**: Update camera position to track a moving object
**Camera paths**: Pre-defined routes the camera follows
**Smooth transitions**: Tween between two camera positions/rotations

For VR/AR or first-person experiences, you'd update camera position/rotation every frame based on device sensors or keyboard input.

> **Key Insight:** The camera is just another Object3D - it has position, rotation, and can be parented to groups. You can animate it like any other object.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **FOV** | Field of View - vertical angle in degrees | 75° = normal, 120° = wide-angle |
| **Aspect Ratio** | Width / Height of viewport | 16:9 = 1.777, 4:3 = 1.333 |
| **Frustum** | Pyramid-shaped viewing volume between near and far planes | What the camera can "see" |
| **Clipping Plane** | Near/far boundaries - objects outside are not rendered | near=0.1, far=1000 |
| **OrbitControls** | Mouse/touch controls to rotate camera around a target | Industry standard for 3D viewers |
| **Damping** | Inertia effect - camera continues moving after input stops | Makes interaction feel smooth/weighty |
| **Target** | Point in 3D space the camera looks at and orbits around | controls.target.set(x, y, z) |
| **Zoom** | Moving camera closer/farther from target | Not a true zoom (changes FOV) |

---

## 💻 Code Examples

### Example 1: PerspectiveCamera Setup and Configuration

```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();

// Create camera with common settings
const camera = new THREE.PerspectiveCamera(
    75,                                      // FOV: wider than human eye for immersion
    window.innerWidth / window.innerHeight,  // Aspect: match window
    0.1,                                     // Near: close to camera
    1000                                     // Far: render up to 1000 units away
);

// Position camera (default is 0,0,0 - inside objects!)
camera.position.set(5, 5, 5);  // Pull back and up

// Point camera at a specific point
camera.lookAt(0, 0, 0);  // Look at scene origin

// Adjust FOV dynamically (creates zoom effect)
camera.fov = 50;  // Narrower = more zoomed in
camera.updateProjectionMatrix();  // REQUIRED after changing camera params

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add some geometry to see the effect
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

**What's happening:** We create a camera with typical settings and position it back from the origin. The `lookAt` method points the camera at a specific point. When you change camera properties like `fov`, you MUST call `updateProjectionMatrix()` to apply the changes.

### Example 2: Adding OrbitControls

```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// After creating camera and renderer
const controls = new OrbitControls(camera, renderer.domElement);

// Configure controls
controls.enableDamping = true;    // Smooth inertia
controls.dampingFactor = 0.05;    // Lower = more inertia
controls.screenSpacePanning = false;  // Pan in plane of orbit
controls.minDistance = 2;         // Closest zoom
controls.maxDistance = 20;        // Farthest zoom
controls.maxPolarAngle = Math.PI / 2;  // Prevent going below ground

// Change orbit target (what camera orbits around)
controls.target.set(0, 1, 0);  // Orbit around point 1 unit above ground

// IMPORTANT: Update controls every frame when damping is enabled
function animate() {
    requestAnimationFrame(animate);
    controls.update();  // Required if damping is enabled
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** OrbitControls takes the camera and the DOM element to attach mouse events to. Damping creates smooth, momentum-based movement. The `update()` call in the animation loop is required when damping is enabled - it calculates the inertia effect each frame.

### Example 3: Camera Animation

```javascript
// Smooth camera movement to a target position
function moveCameraTo(targetPos, duration = 1000) {
    const startPos = camera.position.clone();
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);  // 0 to 1
        
        // Ease-in-out function for smooth acceleration/deceleration
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Lerp (linear interpolation) between start and target
        camera.position.lerpVectors(startPos, targetPos, eased);
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    
    animateCamera();
}

// Usage: Move camera to position (10, 5, 10) over 2 seconds
moveCameraTo(new THREE.Vector3(10, 5, 10), 2000);
```

**What's happening:** We create a smooth animation using linear interpolation (`lerpVectors`) combined with an easing function. The easing curve makes the camera accelerate at the start and decelerate at the end, feeling more natural than linear movement. This pattern works for any animated property, not just camera position.

> **💡 Try it:** Set up OrbitControls, then try disabling damping vs enabling it. Feel the difference in interaction smoothness.

---

## ✏️ Hands-On Exercises

### Exercise 1: Camera Parameter Exploration (⏱️ ~15 min)

**Goal:** Understand how FOV and clipping planes affect the view

**Instructions:**
1. Create a scene with multiple cubes at different distances (z: -5, 0, 5, 10, 20)
2. Start with FOV = 75, near = 0.1, far = 100
3. Change FOV to 30 - observe the "zoomed in" effect
4. Change FOV to 120 - observe the wide-angle distortion
5. Set far = 15 - see distant cubes disappear
6. Set near = 10 - see close cubes disappear

**Expected Output:**
Understanding how camera parameters control what's visible and how it looks.

---

### Exercise 2: OrbitControls Configuration (⏱️ ~25 min)

**Goal:** Configure OrbitControls for a portfolio-like experience

**Instructions:**
1. Create a scene with a 3D object (sphere or model)
2. Add OrbitControls with damping enabled
3. Set min/max distance to prevent too-close or too-far views
4. Set maxPolarAngle to prevent camera going below the ground
5. Disable pan (set `enablePan = false`) - orbit only
6. Add auto-rotation when idle (`autoRotate = true, autoRotateSpeed = 2`)

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
controls.autoRotate requires controls.update() in the animation loop
</details>

---

### Exercise 3: Camera Showcase (⏱️ ~30 min)

**Goal:** Create a multi-view scene with camera switching

**Instructions:**
1. Create a scene with several objects
2. Define 3 camera positions/angles (front view, side view, top view)
3. Add buttons or keyboard keys (1, 2, 3) to switch between views
4. Animate camera movement between positions (use lerp or GSAP)
5. Make transitions smooth (1-2 second duration)

**Expected Output:**
A scene where pressing keys smoothly animates the camera to different viewpoints.

---

## 📖 Curated Resources

### Must-Read

1. **PerspectiveCamera** — Three.js Docs
   - 🔗 https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
   - Why: Complete parameter reference and methods

2. **OrbitControls** — Three.js Examples
   - 🔗 https://threejs.org/docs/#examples/en/controls/OrbitControls
   - Why: All configuration options explained

### Video Resources

3. **Three.js Camera Controls Tutorial** — (Search for recent OrbitControls tutorials)
   - Why: Visual demonstration of controls configuration

### Deep Dives (optional)

4. **Understanding Projection Matrices** — (Advanced math resource)
   - Why: How cameras mathematically transform 3D to 2D

---

## 🤔 Reflection Questions

1. **Comprehension:** What happens if you set the near clipping plane to 0?
   - *Think about: What's the minimum distance a camera can see?*

2. **Application:** When would you use OrthographicCamera instead of PerspectiveCamera?
   - *Think about: Games, architectural visualization, CAD software*

3. **Connection:** How does FOV affect the sense of speed in racing games?

4. **Critical Thinking:** Why is it important to call `controls.update()` every frame when damping is enabled?

5. **Personal:** What camera settings will feel best for your AI portfolio?

---

## ➡️ Next Steps

**Tomorrow:** [Day 7: Basic User Interaction](./day-07-brief.md) — Learn to detect mouse clicks, raycasting, and respond to user input

Now that users can navigate your scene with OrbitControls, tomorrow we'll add interactivity - clicking objects, hovering, and responding to user actions.

**Before moving on, make sure you can:**
- [ ] Create and configure a PerspectiveCamera
- [ ] Set up OrbitControls with damping
- [ ] Adjust camera parameters (FOV, near, far)
- [ ] Animate camera position smoothly
- [ ] Configure orbit limits and auto-rotation

[← Previous: Day 5 - Lighting](./day-05-brief.md) | [Course Home](../README.md) | [Next: Day 7 - Basic Interaction →](./day-07-brief.md)
