# Day 16: Building a Text-to-3D Pipeline

[← Previous: Day 15 - Intro to LLM APIs](./day-15-brief.md) | [Course Home](../README.md) | [Next: Day 17 - Real-Time Scene Modifications →](./day-17-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Connect Claude API responses directly to Three.js scene generation
2. Parse LLM JSON output and create 3D objects programmatically
3. Handle async API calls without blocking the UI
4. Build a complete text-to-3D pipeline (input → API → render)
5. Add loading states and error handling for production use

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1 hour

---

## 📚 Core Concepts

### The Full Pipeline

User types "cozy reading nook" → API generates JSON → Three.js creates scene

This is the core of our AI portfolio generator. Today we connect all the pieces.

### Key Components

1. **API Client** - Calls Claude with structured prompts
2. **JSON Parser** - Validates and extracts scene data
3. **Scene Builder** - Creates Three.js objects from JSON
4. **UI Controller** - Manages loading states and errors

### Code Example: Complete Pipeline

```javascript
import * as THREE from 'three';
import Anthropic from '@anthropic-ai/sdk';

class AISceneGenerator {
  constructor(apiKey) {
    this.client = new Anthropic({ apiKey });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  async generateFromText(prompt) {
    try {
      // 1. Show loading state
      this.showLoading();
      
      // 2. Call API
      const sceneData = await this.callAPI(prompt);
      
      // 3. Clear existing scene
      this.clearScene();
      
      // 4. Build new scene from JSON
      this.buildScene(sceneData);
      
      // 5. Render
      this.render();
      
      this.hideLoading();
      return { success: true };
      
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
      return { success: false, error: error.message };
    }
  }

  async callAPI(prompt) {
    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: `Generate 3D scene JSON. Schema:
{
  "objects": [{"type": "box"|"sphere"|"cylinder", "position": [x,y,z], "color": "#hex", "scale": [x,y,z]}],
  "lights": [{"type": "ambient"|"directional"|"point", "position": [x,y,z], "intensity": number, "color": "#hex"}],
  "camera": {"position": [x,y,z], "lookAt": [x,y,z]}
}`,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return JSON.parse(message.content[0].text);
  }

  buildScene(data) {
    // Add objects
    data.objects.forEach(obj => {
      let geometry;
      switch(obj.type) {
        case 'box': geometry = new THREE.BoxGeometry(...obj.scale); break;
        case 'sphere': geometry = new THREE.SphereGeometry(obj.scale[0]); break;
        case 'cylinder': geometry = new THREE.CylinderGeometry(...obj.scale); break;
      }
      
      const material = new THREE.MeshStandardMaterial({ color: obj.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...obj.position);
      this.scene.add(mesh);
    });
    
    // Add lights
    data.lights.forEach(light => {
      let lightObj;
      switch(light.type) {
        case 'ambient':
          lightObj = new THREE.AmbientLight(light.color, light.intensity);
          break;
        case 'directional':
          lightObj = new THREE.DirectionalLight(light.color, light.intensity);
          lightObj.position.set(...light.position);
          break;
        case 'point':
          lightObj = new THREE.PointLight(light.color, light.intensity);
          lightObj.position.set(...light.position);
          break;
      }
      this.scene.add(lightObj);
    });
    
    // Position camera
    this.camera.position.set(...data.camera.position);
    this.camera.lookAt(new THREE.Vector3(...data.camera.lookAt));
  }

  clearScene() {
    while(this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  showLoading() {
    document.getElementById('loading').style.display = 'block';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError(message) {
    alert(`Error: ${message}`);
  }
}

// Usage
const generator = new AISceneGenerator(process.env.ANTHROPIC_API_KEY);
document.getElementById('generateBtn').onclick = () => {
  const prompt = document.getElementById('prompt').value;
  generator.generateFromText(prompt);
};
```

---

## ✏️ Hands-On Exercises

### Exercise 1: Build the Full Pipeline (⏱️ ~45 min)

1. Set up HTML with input field, generate button, loading indicator
2. Implement the AISceneGenerator class above
3. Test with different prompts
4. Add error handling for invalid JSON

### Exercise 2: Add Animation Loop (⏱️ ~15 min)

Make objects rotate after generation:

```javascript
animate() {
  requestAnimationFrame(() => this.animate());
  
  this.scene.children.forEach(child => {
    if (child.isMesh) {
      child.rotation.y += 0.01;
    }
  });
  
  this.renderer.render(this.scene, this.camera);
}
```

---

## 📖 Curated Resources

1. **Three.js Scene Management** - https://threejs.org/docs/#api/en/scenes/Scene
2. **Async/Await Best Practices** - https://javascript.info/async-await

---

## 🤔 Reflection Questions

1. Why do we clear the scene before adding new objects?
2. How would you handle API timeouts (>30 seconds)?
3. What happens if the AI returns invalid JSON?

---

## ➡️ Next Steps

**Tomorrow:** Day 17 - Real-Time Scene Modifications — Add streaming API responses and handle incremental updates like "make it darker" or "add a table".

**Before moving on, make sure you can:**
- [ ] Generate a scene from text input
- [ ] Handle API errors gracefully
- [ ] Clear and rebuild scenes programmatically

[← Previous: Day 15 - Intro to LLM APIs](./day-15-brief.md) | [Course Home](../README.md) | [Next: Day 17 - Real-Time Scene Modifications →](./day-17-brief.md)
