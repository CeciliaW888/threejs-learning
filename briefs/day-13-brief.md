# Day 13: Mapping Natural Language to 3D Parameters

[← Previous: Day 12 - Intro to Prompt Engineering](./day-12-brief.md) | [Course Home](../README.md) | [Next: Day 14 - Week 2 Mini-Project →](./day-14-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Build a JSON-to-Three.js scene renderer (the "scene builder")
2. Parse AI-generated scene descriptions into live 3D objects
3. Handle edge cases: missing fields, invalid values, unknown geometries
4. Create a mapping layer between natural language concepts and Three.js parameters
5. Test the full pipeline: text → JSON → 3D scene

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1 hour (25 min reading + 35 min hands-on)

---

## 📚 Core Concepts

### The Translation Layer

Yesterday you learned to prompt AI for structured JSON. Today you build the other half: code that reads that JSON and creates actual Three.js objects. Think of it as a translator between two languages:

```
Human English → [AI/Prompt] → JSON Schema → [Scene Builder] → Three.js Objects
```

The scene builder is deterministic — given the same JSON, it always produces the same scene. This makes it testable and debuggable, separate from the unpredictable AI layer.

### Architecture: The Scene Builder

```javascript
class SceneBuilder {
    constructor(scene) {
        this.scene = scene;
        this.objects = new Map();  // Track created objects by name
    }
    
    build(sceneData) {
        this.clear();                          // Remove old objects
        this.createObjects(sceneData.objects);  // Build meshes
        this.createLights(sceneData.lights);    // Add lights
        this.setupCamera(sceneData.camera);     // Position camera
        this.setupEnvironment(sceneData.environment);
    }
    
    clear() { /* dispose and remove everything */ }
}
```

This separation of concerns is important. The AI generates data. The scene builder creates visuals. They don't know about each other — only the JSON schema connects them.

### Geometry Mapping

Map string names to Three.js geometry constructors:

```javascript
const geometryMap = {
    'box':          (s) => new THREE.BoxGeometry(s[0], s[1], s[2]),
    'sphere':       (s) => new THREE.SphereGeometry(s[0] * 0.5, 32, 32),
    'cylinder':     (s) => new THREE.CylinderGeometry(s[0] * 0.5, s[0] * 0.5, s[1], 32),
    'cone':         (s) => new THREE.ConeGeometry(s[0] * 0.5, s[1], 32),
    'torus':        (s) => new THREE.TorusGeometry(s[0] * 0.5, s[0] * 0.15, 16, 48),
    'plane':        (s) => new THREE.PlaneGeometry(s[0], s[2] || s[1]),
    'icosahedron':  (s) => new THREE.IcosahedronGeometry(s[0] * 0.5, 1),
};
```

The function takes the scale array, so the AI doesn't need to know about Three.js constructor parameters — it just says "box" with a scale of [2, 1, 3] and the builder handles the rest.

### Defensive Parsing

AI output can be messy. Your parser needs to handle:

- **Missing fields**: Use sensible defaults
- **Invalid geometry names**: Fall back to a box
- **Out-of-range values**: Clamp to valid ranges
- **Non-numeric values**: Parse or default
- **Extra fields**: Ignore them (don't crash)

```javascript
function safeParseObject(data) {
    return {
        name: data.name || `object-${Date.now()}`,
        geometry: geometryMap[data.geometry] ? data.geometry : 'box',
        position: parseVector3(data.position, [0, 0, 0]),
        rotation: parseVector3(data.rotation, [0, 0, 0]),
        scale: parseVector3(data.scale, [1, 1, 1]),
        material: {
            type: data.material?.type || 'standard',
            color: parseColor(data.material?.color, '#888888'),
            roughness: clamp(data.material?.roughness ?? 0.5, 0, 1),
            metalness: clamp(data.material?.metalness ?? 0, 0, 1),
            opacity: clamp(data.material?.opacity ?? 1, 0, 1),
        }
    };
}
```

### Semantic Mapping: Concepts to Parameters

Some natural language concepts need translation beyond simple geometry:

| Natural Language | 3D Translation |
|-----------------|----------------|
| "floating" | position.y > ground level |
| "tiny" | scale × 0.3 |
| "huge" | scale × 3.0 |
| "glowing" | emissive material + point light |
| "transparent" | opacity < 1, transparent: true |
| "metallic" | metalness: 0.9, roughness: 0.1 |
| "wooden" | color: brown, roughness: 0.8 |
| "glass" | opacity: 0.3, metalness: 0.1, roughness: 0.0 |

You can handle this either in the prompt (tell AI to use specific values for "glowing") or in the builder (detect special keywords and apply effects).

> **Key Insight:** The scene builder should be forgiving. If the AI makes a small mistake, the builder should still produce something visible rather than crashing. Graceful degradation > hard failures.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Scene Builder** | Class that converts JSON to Three.js objects | `sceneBuilder.build(jsonData)` |
| **Geometry Map** | Dictionary mapping names to constructors | `'sphere' → SphereGeometry` |
| **Defensive Parsing** | Handling missing/invalid data gracefully | Defaults for missing fields |
| **Semantic Mapping** | Translating concepts to parameters | "glowing" → emissive material |
| **Clamping** | Restricting values to valid range | `Math.max(0, Math.min(1, value))` |
| **Schema Validation** | Checking data matches expected structure | JSON Schema or custom validation |

---

## 💻 Code Examples

### Example 1: Complete Scene Builder

```javascript
import * as THREE from 'three';

class SceneBuilder {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.createdObjects = [];
    }

    // Geometry factories
    static geometryMap = {
        'box': (s) => new THREE.BoxGeometry(s[0], s[1], s[2]),
        'sphere': (s) => new THREE.SphereGeometry(Math.max(...s) * 0.5, 32, 32),
        'cylinder': (s) => new THREE.CylinderGeometry(s[0] * 0.5, s[0] * 0.5, s[1], 32),
        'cone': (s) => new THREE.ConeGeometry(s[0] * 0.5, s[1], 32),
        'torus': (s) => new THREE.TorusGeometry(s[0] * 0.5, Math.min(...s) * 0.3, 16, 48),
        'plane': (s) => new THREE.PlaneGeometry(s[0], s[2] || s[1]),
        'icosahedron': (s) => new THREE.IcosahedronGeometry(Math.max(...s) * 0.5, 1),
    };

    // Material factory
    createMaterial(matData) {
        const params = {
            color: new THREE.Color(matData.color || '#888888'),
            roughness: this.clamp(matData.roughness ?? 0.5, 0, 1),
            metalness: this.clamp(matData.metalness ?? 0, 0, 1),
        };

        if (matData.opacity !== undefined && matData.opacity < 1) {
            params.transparent = true;
            params.opacity = this.clamp(matData.opacity, 0, 1);
        }

        if (matData.emissive) {
            params.emissive = new THREE.Color(matData.emissive);
            params.emissiveIntensity = matData.emissiveIntensity || 0.5;
        }

        switch (matData.type) {
            case 'physical':
                return new THREE.MeshPhysicalMaterial(params);
            case 'basic':
                return new THREE.MeshBasicMaterial({ 
                    color: params.color, 
                    transparent: params.transparent,
                    opacity: params.opacity 
                });
            default:
                return new THREE.MeshStandardMaterial(params);
        }
    }

    // Create a single object from JSON
    createObject(data) {
        const scale = this.parseVec3(data.scale, [1, 1, 1]);
        
        // Get geometry (fall back to box)
        const geoFactory = SceneBuilder.geometryMap[data.geometry] 
            || SceneBuilder.geometryMap['box'];
        const geometry = geoFactory(scale);

        // Create material
        const material = this.createMaterial(data.material || {});

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = data.name || 'unnamed';
        mesh.position.fromArray(this.parseVec3(data.position, [0, 0, 0]));
        mesh.rotation.fromArray(this.parseVec3(data.rotation, [0, 0, 0]));
        
        // Shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    // Create all objects
    createObjects(objectsData) {
        if (!Array.isArray(objectsData)) return;
        
        objectsData.forEach((objData) => {
            try {
                const mesh = this.createObject(objData);
                this.scene.add(mesh);
                this.createdObjects.push(mesh);
            } catch (e) {
                console.warn(`Failed to create object "${objData.name}":`, e);
            }
        });
    }

    // Create lights
    createLights(lightsData) {
        if (!Array.isArray(lightsData)) {
            // Default lighting if none specified
            const ambient = new THREE.AmbientLight(0x404040, 0.5);
            const dir = new THREE.DirectionalLight(0xffffff, 1);
            dir.position.set(5, 10, 5);
            this.scene.add(ambient, dir);
            this.createdObjects.push(ambient, dir);
            return;
        }

        lightsData.forEach((lightData) => {
            let light;
            const color = new THREE.Color(lightData.color || '#ffffff');
            const intensity = lightData.intensity ?? 1;

            switch (lightData.type) {
                case 'ambient':
                    light = new THREE.AmbientLight(color, intensity);
                    break;
                case 'point':
                    light = new THREE.PointLight(color, intensity, 50);
                    break;
                case 'spot':
                    light = new THREE.SpotLight(color, intensity);
                    break;
                case 'directional':
                default:
                    light = new THREE.DirectionalLight(color, intensity);
                    break;
            }

            if (lightData.position && light.position) {
                light.position.fromArray(this.parseVec3(lightData.position, [5, 10, 5]));
            }

            if (lightData.castShadow && light.castShadow !== undefined) {
                light.castShadow = true;
                if (light.shadow) {
                    light.shadow.mapSize.set(1024, 1024);
                }
            }

            this.scene.add(light);
            this.createdObjects.push(light);
        });
    }

    // Setup camera from data
    setupCamera(cameraData) {
        if (!cameraData) return;
        
        if (cameraData.position) {
            this.camera.position.fromArray(this.parseVec3(cameraData.position, [5, 5, 10]));
        }
        if (cameraData.lookAt) {
            this.camera.lookAt(...this.parseVec3(cameraData.lookAt, [0, 0, 0]));
        }
        if (cameraData.fov) {
            this.camera.fov = this.clamp(cameraData.fov, 30, 120);
            this.camera.updateProjectionMatrix();
        }
    }

    // Setup environment
    setupEnvironment(envData) {
        if (!envData) return;
        if (envData.background) {
            this.scene.background = new THREE.Color(envData.background);
        }
    }

    // Build entire scene from JSON
    build(sceneData) {
        this.clear();
        this.createObjects(sceneData.objects);
        this.createLights(sceneData.lights);
        this.setupCamera(sceneData.camera);
        this.setupEnvironment(sceneData.environment);
        console.log(`Scene built: ${this.createdObjects.length} objects created`);
    }

    // Clean up previous scene
    clear() {
        this.createdObjects.forEach((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            this.scene.remove(obj);
        });
        this.createdObjects = [];
    }

    // Utility: parse array to Vector3 values
    parseVec3(arr, fallback) {
        if (!Array.isArray(arr) || arr.length < 3) return [...fallback];
        return arr.map((v, i) => (typeof v === 'number' && isFinite(v)) ? v : fallback[i]);
    }

    // Utility: clamp value to range
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, Number(value) || min));
    }
}

export { SceneBuilder };
```

**What's happening:** This is the complete scene builder class. It handles geometry creation, material creation, lighting, camera setup, and cleanup. Every method has fallback defaults and error handling. You'll reuse this class throughout the rest of the course.

### Example 2: Using the Scene Builder

```javascript
import { SceneBuilder } from './SceneBuilder.js';

// Setup Three.js (abbreviated)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
// ... renderer, controls setup ...

const builder = new SceneBuilder(scene, camera);

// Test with hardcoded JSON (simulating AI output)
const testScene = {
    objects: [
        {
            name: "floor",
            geometry: "plane",
            position: [0, 0, 0],
            rotation: [-1.5708, 0, 0],
            scale: [20, 20, 1],
            material: { type: "standard", color: "#333333", roughness: 0.8, metalness: 0.2 }
        },
        {
            name: "pedestal",
            geometry: "cylinder",
            position: [0, 0.5, 0],
            rotation: [0, 0, 0],
            scale: [1.5, 1, 1.5],
            material: { type: "standard", color: "#ffffff", roughness: 0.3, metalness: 0.1 }
        },
        {
            name: "trophy",
            geometry: "icosahedron",
            position: [0, 1.5, 0],
            rotation: [0, 0.5, 0],
            scale: [0.8, 0.8, 0.8],
            material: { type: "standard", color: "#FFD700", roughness: 0.1, metalness: 0.9 }
        }
    ],
    lights: [
        { type: "ambient", color: "#404060", intensity: 0.4 },
        { type: "directional", color: "#ffffff", intensity: 1.5, position: [5, 10, 5], castShadow: true },
        { type: "point", color: "#4488ff", intensity: 0.8, position: [-3, 3, -3] }
    ],
    camera: { position: [4, 3, 4], lookAt: [0, 1, 0], fov: 60 },
    environment: { background: "#0a0a1a" }
};

builder.build(testScene);
```

**What's happening:** We test the builder with hardcoded JSON before connecting AI. This ensures the builder works correctly, independent of AI output quality. Tomorrow's mini-project will connect real AI output to this builder.

### Example 3: JSON Extraction from AI Response

```javascript
// AI sometimes wraps JSON in markdown code blocks or adds text
function extractJSON(text) {
    // Try direct parse first
    try {
        return JSON.parse(text);
    } catch (e) {
        // Not pure JSON
    }
    
    // Try extracting from code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
            // Invalid JSON in code block
        }
    }
    
    // Try finding JSON object in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            // Found braces but not valid JSON
        }
    }
    
    throw new Error('Could not extract valid JSON from AI response');
}
```

**What's happening:** Even with good prompts, AI sometimes wraps JSON in markdown or adds explanatory text. This extractor tries multiple strategies to find valid JSON in the response.

---

## ✏️ Hands-On Exercises

### Exercise 1: Build the Scene Builder (⏱️ ~20 min)

**Goal:** Implement the SceneBuilder class in your project

**Instructions:**
1. Create `src/SceneBuilder.js` with the code from Example 1
2. Create a test file that imports and uses it
3. Test with the sample JSON from Example 2
4. Verify all objects appear correctly positioned
5. Test the clear() method — does it properly clean up?

**Expected Output:**
A 3D scene rendered from JSON data, with a golden icosahedron on a white pedestal.

---

### Exercise 2: Edge Case Testing (⏱️ ~15 min)

**Goal:** Make the builder bulletproof

**Instructions:**
1. Test with missing geometry: `{ "name": "test", "position": [0,0,0] }`
2. Test with invalid values: `{ "geometry": "nonexistent", "material": { "roughness": 5 } }`
3. Test with empty objects array: `{ "objects": [] }`
4. Test with completely invalid JSON structure
5. Each test should produce something (even a default box) instead of crashing

**Expected Output:**
Builder handles all edge cases gracefully with console warnings.

---

### Exercise 3: Semantic Enhancement (⏱️ ~20 min)

**Goal:** Add natural language concept support

**Instructions:**
1. Add support for "emissive" / "glowing" materials
2. Add support for "transparent" / "glass" materials
3. Add a "group" feature — objects can contain children
4. Add support for a "floor" shorthand that auto-creates a ground plane
5. Test each enhancement with appropriate JSON input

**Expected Output:**
Glowing objects, glass materials, and grouped objects rendering correctly.

---

## 📖 Curated Resources

### Must-Read

1. **Creating a Scene** — Three.js Manual
   - 🔗 https://threejs.org/manual/#en/creating-a-scene
   - Why: Refresher on programmatic scene creation (what the builder automates)

2. **JSON Schema Specification** — json-schema.org
   - 🔗 https://json-schema.org/learn/getting-started-step-by-step
   - Why: Formal approach to defining and validating JSON structures

### Video Resources

3. **Getting Started with THREE.JS** — DesignCourse
   - 🎥 https://www.youtube.com/watch?v=pUgWfqWZWmM (⚠️ VERIFIED, 20 min)
   - Why: Review of programmatic scene building patterns

### Deep Dives (optional)

4. **Design Patterns: Factory Pattern** — Refactoring Guru
   - 🔗 https://refactoring.guru/design-patterns/factory-method
   - Why: The geometry/material mapping is a factory pattern — understanding it helps you extend it

---

## 🤔 Reflection Questions

1. **Comprehension:** Why do we separate the AI prompt layer from the scene building layer?

2. **Application:** How would you extend the builder to support loading GLTF models from a URL specified in the JSON?

3. **Connection:** How does the defensive parsing relate to the validation you built in Day 12?

4. **Critical Thinking:** Should the scene builder support animations? What would that JSON look like?

5. **Personal:** What features does your portfolio's scene builder need that aren't covered yet?

---

## ➡️ Next Steps

**Tomorrow:** [Day 14: Week 2 Mini-Project — Prompt-Driven Scene Generator](./day-14-brief.md) — Connect everything into a working prototype where you type a description and see a 3D scene

You now have both halves of the AI-to-3D pipeline: prompts that generate JSON (Day 12) and a builder that renders JSON as 3D scenes (today). Tomorrow you'll connect them into a working demo.

**Before moving on, make sure you can:**
- [ ] Build a 3D scene from JSON data using SceneBuilder
- [ ] Handle missing and invalid data gracefully
- [ ] Extract JSON from messy AI responses
- [ ] Map geometry names to Three.js constructors
- [ ] Clear and rebuild scenes without memory leaks

[← Previous: Day 12 - Intro to Prompt Engineering](./day-12-brief.md) | [Course Home](../README.md) | [Next: Day 14 - Week 2 Mini-Project →](./day-14-brief.md)
