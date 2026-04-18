# Day 1: Introduction to 3D on the Web & Three.js

[Course Home](../README.md) | [Next: Day 2 - Your First Three.js Scene →](./day-02-first-scene.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Explain what Three.js is and why it's used for 3D web graphics
2. Understand the basic components of a 3D scene (Scene, Camera, Renderer)
3. Describe the difference between WebGL and Three.js
4. Identify real-world applications of 3D on the web
5. Set up a basic development environment for Three.js

**Difficulty:** 🟢 Beginner
**Estimated Time:** 1 hour (30 min reading + 30 min hands-on)

---

## 📚 Core Concepts

### What is Three.js?

Think of Three.js like LEGO blocks for 3D web graphics. Just as LEGO provides pre-made bricks that snap together to build complex structures, Three.js provides pre-built components that work together to create 3D scenes in your browser. Without it, you'd be writing thousands of lines of low-level WebGL code just to draw a simple cube.

Three.js is a JavaScript library that makes WebGL (Web Graphics Library) accessible and manageable. WebGL is a powerful but complex API that lets browsers render 3D graphics using the GPU. While WebGL gives you direct control over the graphics pipeline, Three.js wraps that complexity in an intuitive API. Instead of writing shader code and managing buffer arrays, you can create 3D objects, apply materials, add lighting, and animate scenes with just a few lines of JavaScript.

The library was created by Ricardo Cabello (Mr.doob) in 2010 and has become the industry standard for 3D web graphics. It's used by companies like Google, NASA, Apple, and thousands of creative studios worldwide.

### Why 3D on the Web Matters

The web has evolved from static documents to interactive applications. 3D graphics are the next frontier, enabling experiences that were previously only possible in native apps or game engines.

**Accessibility**: No downloads, no installations. Users can access 3D experiences instantly through their browser, regardless of their operating system. A VR museum tour, a product configurator, or an interactive data visualization is just a URL away.

**Reach**: With WebGL support in all modern browsers (Chrome, Firefox, Safari, Edge), your 3D content can reach billions of devices — from desktop computers to smartphones and VR headsets.

**Integration**: 3D can seamlessly integrate with HTML, CSS, and JavaScript. You can overlay UI elements on 3D scenes, respond to DOM events, and use the entire web platform ecosystem. This is what makes 3D portfolios so powerful — you get the richness of a 3D experience with the flexibility of the web.

### The Three Essential Components

Every Three.js application revolves around three core concepts (hence the name "Three.js"):

**1. Scene** — This is your 3D world, a container that holds all your objects, lights, and cameras. Think of it like a movie set where you place actors (3D models), lights, and cameras. The scene itself doesn't have size limits; it's an infinite coordinate space where you position things.

**2. Camera** — This defines what the viewer sees. Just like in filmmaking, you can have different camera types: perspective cameras (realistic depth perception, where objects farther away look smaller) or orthographic cameras (no perspective distortion, used for technical drawings or 2D-style games). The camera's position and orientation determine the viewpoint.

**3. Renderer** — This is the engine that takes your scene and camera and draws them onto an HTML canvas element. It handles all the complex WebGL calls, shader compilation, and GPU communication. You tell it "render this scene from this camera's viewpoint" and it produces the final image.

These three components work together in a continuous loop: the renderer repeatedly draws the scene as viewed through the camera, creating smooth animation at 60 frames per second.

### WebGL vs Three.js

To draw a single colored triangle in raw WebGL, you need roughly 100+ lines of code — vertex shaders, fragment shaders, buffer creation, attribute binding, and more. In Three.js, you can create a full 3D scene with lighting and animation in about 20 lines. Three.js doesn't replace WebGL; it sits on top of it, translating your high-level instructions into the low-level WebGL commands the GPU understands.

This abstraction means you can focus on *what* you want to create rather than *how* the GPU should render it. When you need more control, Three.js still gives you access to custom shaders and raw WebGL features.

### Real-World Applications

Three.js powers diverse applications across industries:

- **E-commerce**: Product configurators (Nike shoe customizer, furniture visualizers)
- **Education**: Interactive 3D models (molecular structures, historical reconstructions)
- **Data Visualization**: Complex datasets rendered in 3D space
- **Gaming**: Browser-based games and interactive experiences
- **Architecture**: Virtual tours and building visualizations
- **Art & Creative**: Generative art, music visualizations, WebXR experiences
- **Portfolios**: Immersive developer portfolios that stand out from flat websites

> **Key Insight:** Three.js democratizes 3D web development by handling the complex WebGL code, letting you focus on creativity rather than low-level graphics programming.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **WebGL** | Low-level JavaScript API for rendering 3D graphics using the GPU | The foundation that Three.js is built upon |
| **Scene** | Container object that holds all 3D objects, lights, and cameras | `const scene = new THREE.Scene()` |
| **Camera** | Defines the viewpoint from which the scene is rendered | PerspectiveCamera for realistic 3D, OrthographicCamera for 2D-style |
| **Renderer** | Takes the scene and camera and renders them to a canvas | `WebGLRenderer` converts your 3D world into pixels |
| **Mesh** | Combination of geometry (shape) and material (appearance) | A cube with a red surface is a mesh |
| **Geometry** | The shape/structure of a 3D object (vertices and faces) | BoxGeometry, SphereGeometry, custom shapes |
| **Material** | Defines how a surface looks (color, texture, shininess) | MeshBasicMaterial, MeshStandardMaterial |
| **Canvas** | HTML element where the 3D graphics are drawn | `<canvas>` element in your HTML |

---

## 💻 Code Examples

### Example 1: Basic Three.js HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Three.js Scene</title>
    <style>
        body { 
            margin: 0; 
            overflow: hidden; 
        }
        canvas { 
            display: block; 
        }
    </style>
</head>
<body>
    <!-- Three.js will create the canvas element here -->
    <script type="module" src="/main.js"></script>
</body>
</html>
```

**What's happening:** This minimal HTML template sets up a full-screen 3D canvas. The CSS removes default margins and prevents scrollbars, which is standard for immersive 3D experiences. The script is loaded as a module so we can use ES6 imports.

### Example 2: Installing Three.js with Vite

```bash
# Create a new project folder
mkdir threejs-ai-portfolio
cd threejs-ai-portfolio

# Initialize with Vite (fast modern build tool)
npm create vite@latest . -- --template vanilla

# Install Three.js
npm install three

# Start development server
npm run dev
```

**What's happening:** We're using Vite, a modern build tool that provides instant server start and hot module replacement. This is the recommended way to set up Three.js projects in 2024+. Vite handles all the bundling and module resolution automatically.

### Example 3: Understanding the Render Loop

```javascript
// Conceptual example — this shows the core pattern of every Three.js app

// 1. Setup (runs once)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new THREE.WebGLRenderer();

// 2. Animation loop (runs 60 times per second)
function animate() {
    requestAnimationFrame(animate);  // Schedule next frame
    
    // Update objects here
    // (rotate, move, change materials, etc.)
    
    renderer.render(scene, camera);  // Draw the frame
}

animate();  // Start the loop
```

**What's happening:** This pattern is the heartbeat of Three.js. The `requestAnimationFrame` function tells the browser to call our `animate` function before the next repaint (typically 60 FPS). Inside the loop, we update our scene and then render it. This continuous cycle creates smooth animation.

> **💡 Try it:** Before moving to Day 2, set up your development environment. Install Node.js (if you haven't already), create a project with Vite, and verify you can run `npm run dev` successfully.

---

## ✏️ Hands-On Exercises

### Exercise 1: Environment Setup (⏱️ ~20 min)

**Goal:** Get your development environment ready for the course

**Instructions:**
1. Install Node.js (LTS version) from nodejs.org if you don't have it
2. Create a new folder called `threejs-ai-portfolio`
3. Open a terminal in that folder
4. Run `npm create vite@latest . -- --template vanilla`
5. Run `npm install` to install dependencies
6. Run `npm install three` to add Three.js
7. Run `npm run dev` and open the localhost URL in your browser
8. Verify you see the Vite welcome page

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Stretch Goal:** Explore the project structure. What files did Vite create? What's in `package.json`?

---

### Exercise 2: Explore Three.js Documentation (⏱️ ~15 min)

**Goal:** Familiarize yourself with the Three.js documentation

**Instructions:**
1. Go to https://threejs.org/docs/
2. Find the documentation for `Scene`, `PerspectiveCamera`, and `WebGLRenderer`
3. Read the descriptions and look at the properties/methods
4. Browse the examples page (https://threejs.org/examples/)
5. Click on 3–5 examples that interest you and view their source code

**Expected Output:** Understanding of where to find information when you need it. The Three.js docs are well-organized by category (Core, Cameras, Lights, etc.).

---

### Exercise 3: Research Real-World Three.js Sites (⏱️ ~15 min)

**Goal:** See professional Three.js applications in action

**Instructions:**
1. Visit these showcase sites:
   - https://threejs.org/ (official homepage)
   - https://bruno-simon.com/ (award-winning portfolio)
   - https://www.awwwards.com/ (search for "Three.js")
2. For each site, identify:
   - What 3D elements are used?
   - How does 3D enhance the user experience?
   - What types of interactions are available?
3. Write down 2–3 ideas for your own AI portfolio

**Hints (if stuck):**
<details>
<summary>Hint 1</summary>
Look for interactive elements — things that respond to mouse movement, scroll, or clicks.
</details>

<details>
<summary>Hint 2</summary>
Think about how 3D can showcase your work in unique ways. Could projects be displayed as floating cards in 3D space? Could your skills be visualized as a particle system?
</details>

---

## 📖 Curated Resources

### Must-Read

1. **Three.js Fundamentals** — Three.js Official Docs
   - 🔗 https://threejs.org/manual/#en/fundamentals (~15 min read)
   - Why: Comprehensive introduction to core concepts with live code examples

2. **WebGL and Three.js** — MDN Web Docs
   - 🔗 https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API (~10 min)
   - Why: Understand what WebGL is and why we use Three.js instead of raw WebGL

### Video Resources

3. **Build a Mindblowing 3D Portfolio Website** — Fireship
   - 🎥 https://www.youtube.com/watch?v=Q7AOvWpIVHU
   - Why: Quick, high-energy overview of what's possible with Three.js — great for motivation

4. **Vibe Coding Three.js** — Robot Bobby (2025)
   - 🎥 https://www.youtube.com/watch?v=GL0HAJ8xjww
   - Why: See the modern AI-assisted workflow — building a scene without hand-typing every line

### Deep Dives (optional)

5. **The Beauty of Mathematics in Computer Graphics** — Inigo Quilez
   - 🔗 https://iquilezles.org/articles/
   - Why: Advanced mathematical concepts behind 3D graphics (for the mathematically curious)

---

## 🤔 Reflection Questions

1. **Comprehension:** What are the three essential components of every Three.js application, and what role does each play?
   - *Think about: How do they work together to create what you see on screen?*

2. **Application:** How could 3D graphics enhance your personal portfolio compared to a traditional 2D website?
   - *Think about: What unique experiences can 3D provide that 2D can't?*

3. **Connection:** Why do you think Three.js became popular instead of developers writing raw WebGL?
   - *Think about: What problems does abstraction solve?*

4. **Critical Thinking:** What are potential downsides of using 3D on the web? (Performance, accessibility, etc.)

5. **Personal:** Which example from the showcase sites inspired you most, and why?

---

## ➡️ Next Steps

**Tomorrow:** [Day 2: Your First Three.js Scene](./day-02-first-scene.md) — Create your first rotating cube and understand the scene graph

Now that you understand what Three.js is and have your environment set up, tomorrow we'll write actual code and see a 3D object rendering in your browser. You'll create the classic "Hello World" of 3D graphics: a spinning cube.

**Before moving on, make sure you can:**
- [ ] Explain what Three.js is and why it's useful
- [ ] Identify the three core components (Scene, Camera, Renderer)
- [ ] Access the Three.js documentation and find information
- [ ] Have a working development environment with Vite and Three.js installed

[Course Home](../README.md) | [Next: Day 2 - Your First Three.js Scene →](./day-02-first-scene.md)
