# Day 8: Animation Fundamentals

[← Previous: Day 7 - Week 1 Review](./day-07-brief.md) | [Course Home](../README.md) | [Next: Day 9 - Advanced Animation →](./day-09-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Animate object properties (position, rotation, scale) smoothly
2. Use THREE.Clock for time-based animation
3. Create looping animations with Math.sin/cos
4. Implement easing functions for natural movement
5. Understand delta time and frame-independent animation

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1 hour (25 min reading + 35 min hands-on)

---

## 📚 Core Concepts

### Time-Based vs Frame-Based Animation

**Frame-based** animation increments values by a fixed amount each frame:
```javascript
cube.rotation.y += 0.01; // Rotates different speeds on different devices!
```

Problem: On a 120Hz monitor, this runs twice as fast as on 60Hz. Not good for consistent user experience.

**Time-based** animation uses delta time (seconds since last frame):
```javascript
const clock = new THREE.Clock();
function animate() {
    const deltaTime = clock.getDelta();
    cube.rotation.y += deltaTime * 1; // 1 radian per second, consistent across devices
}
```

Delta time ensures animation speed is consistent regardless of frame rate.

### THREE.Clock for Animation Timing

```javascript
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime(); // Total time since clock started
    const deltaTime = clock.getDelta();          // Time since last frame
    
    // Use elapsedTime for repeating patterns
    cube.position.y = Math.sin(elapsedTime) * 2;
    
    // Use deltaTime for incremental movement
    cube.rotation.x += deltaTime * 0.5;
}
```

### Oscillating Motion with Math Functions

`Math.sin()` and `Math.cos()` create smooth back-and-forth motion:

```javascript
// Bobbing up and down
object.position.y = Math.sin(elapsedTime * speed) * amplitude;

// Circular motion
object.position.x = Math.cos(elapsedTime) * radius;
object.position.z = Math.sin(elapsedTime) * radius;

// Figure-8 pattern
object.position.x = Math.sin(elapsedTime) * 3;
object.position.z = Math.sin(elapsedTime * 2) * 3;
```

### Easing Functions

Easing makes motion feel natural - objects accelerate and decelerate smoothly rather than moving at constant speed.

**Linear**: Constant speed (boring)  
**Ease In**: Slow start, fast end  
**Ease Out**: Fast start, slow end  
**Ease In-Out**: Slow start and end, fast middle  

```javascript
// Ease-out function
function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Usage in animation
const progress = (elapsedTime % 2) / 2; // 0 to 1 over 2 seconds, repeating
const eased = easeOut(progress);
cube.position.x = eased * 5; // Moves 0 to 5 with ease-out
```

> **Key Insight:** Animation is about controlling change over time. Master time-based animation for smooth, professional-looking motion.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Delta Time** | Time elapsed since last frame (seconds) | 0.016s at 60 FPS |
| **Elapsed Time** | Total time since animation start | 5.2 seconds |
| **THREE.Clock** | Utility for tracking time | `clock.getElapsedTime()` |
| **Easing** | Non-linear interpolation for natural motion | Ease-in, ease-out, ease-in-out |
| **Oscillation** | Back-and-forth motion | Pendulum, waves |
| **Linear Interpolation (Lerp)** | Blend between two values | `a + (b - a) * t` |
| **Frame Independence** | Animation speed not tied to FPS | Using deltaTime |

---

## 💻 Code Examples

### Example 1: Basic Time-Based Animation

```javascript
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
scene.add(cube);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Rotate at constant speed (1 revolution per 2π seconds)
    cube.rotation.y = elapsedTime;
    
    // Bob up and down
    cube.position.y = Math.sin(elapsedTime * 2) * 0.5;
    
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** Using `elapsedTime` creates time-based animations that look identical on any device. The cube rotates at 1 radian/second and bobs at 2 cycles/second with 0.5 unit amplitude.

### Example 2: Circular Motion and Patterns

```javascript
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(sphere);

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Circular orbit
    const radius = 3;
    sphere.position.x = Math.cos(elapsedTime) * radius;
    sphere.position.z = Math.sin(elapsedTime) * radius;
    
    // Also rotate the sphere itself
    sphere.rotation.y = elapsedTime * 2;
    
    renderer.render(scene, camera);
}
```

**What's happening:** `Math.cos` and `Math.sin` create circular motion. The sphere orbits around the origin at radius 3 while also spinning on its own axis.

### Example 3: Smooth Transitions with Lerp

```javascript
let targetPosition = new THREE.Vector3(0, 0, 0);
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
scene.add(cube);

// Click to set new target position
window.addEventListener('click', (event) => {
    targetPosition.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        0
    );
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Lerp toward target (smooth follow)
    const lerpSpeed = 2; // Higher = faster
    cube.position.lerp(targetPosition, deltaTime * lerpSpeed);
    
    renderer.render(scene, camera);
}
animate();
```

**What's happening:** `lerp()` smoothly interpolates between current and target position. The cube "chases" the target position with a spring-like effect. Click anywhere to set new targets.

> **💡 Try it:** Create a spiral animation by combining circular motion with vertical movement: `y = elapsedTime`, `x/z = circular`.

---

## ✏️ Hands-On Exercises

### Exercise 1: Animation Playground (⏱️ ~20 min)

**Goal:** Create multiple animated objects with different patterns

**Instructions:**
1. Create 3 cubes in different positions
2. Cube 1: Rotate continuously on Y-axis
3. Cube 2: Scale up/down using Math.sin (1 to 2 scale)
4. Cube 3: Move in a figure-8 pattern
5. Ensure all animations use time-based approach (THREE.Clock)

**Expected Output:**
Three cubes with distinct, smooth animation patterns.

---

### Exercise 2: Easing Showcase (⏱️ ~25 min)

**Goal:** Implement and compare different easing functions

**Instructions:**
1. Create 4 spheres in a row
2. Implement: linear, ease-in, ease-out, ease-in-out
3. Make all spheres move 0 to 5 on X-axis over 2 seconds, looping
4. Observe how easing changes the feel of motion
5. Label each sphere with console.log to identify easing type

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Use `(elapsedTime % duration) / duration` to get 0-1 progress that loops
</details>

---

### Exercise 3: Interactive Animation (⏱️ ~25 min)

**Goal:** Create animation that responds to user input

**Instructions:**
1. Create a cube
2. On mouse move, set a target rotation
3. Use lerp to smoothly rotate toward target
4. Add color change based on rotation amount
5. Make sure motion feels smooth and responsive

**Expected Output:**
Cube that smoothly follows mouse movement with color feedback.

---

## 📖 Curated Resources

### Must-Read

1. **Animation System** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/animation
   - Why: Official guide to animation techniques

2. **Easing Functions Cheat Sheet** — easings.net
   - 🔗 https://easings.net/
   - Why: Visual reference for all easing types

### Video Resources

3. **Three.js Animation Tutorial** — (Search recent tutorials)
   - Why: Visual demonstration of animation patterns

---

## 🤔 Reflection Questions

1. **Comprehension:** Why is delta-time animation better than frame-based?
2. **Application:** How would you create a pendulum swing animation?
3. **Connection:** How do easing functions make animations feel more natural?
4. **Critical Thinking:** When would you use `getElapsedTime()` vs `getDelta()`?
5. **Personal:** What animations will you use in your AI portfolio?

---

## ➡️ Next Steps

**Tomorrow:** [Day 9: Advanced Animation with Tweening](./day-09-brief.md) — Learn GSAP library for complex animation sequences

**Before moving on, make sure you can:**
- [ ] Use THREE.Clock for time-based animation
- [ ] Create oscillating motion with Math.sin/cos
- [ ] Implement basic easing functions
- [ ] Animate position, rotation, and scale
- [ ] Understand delta time vs elapsed time

[← Previous: Day 7 - Week 1 Review](./day-07-brief.md) | [Course Home](../README.md) | [Next: Day 9 - Advanced Animation →](./day-09-brief.md)
