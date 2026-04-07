# Day 12: Intro to Prompt Engineering for 3D

[← Previous: Day 11 - Performance Optimization](./day-11-brief.md) | [Course Home](../README.md) | [Next: Day 13 - Mapping Language to 3D Parameters →](./day-13-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Understand what prompt engineering is and why it matters for AI-3D integration
2. Write structured prompts that produce consistent, parseable output
3. Use system prompts, few-shot examples, and output formatting
4. Design prompts specifically for generating 3D scene descriptions
5. Handle common prompt failure modes (hallucination, inconsistency, ambiguity)

**Difficulty:** 🟡 Intermediate
**Estimated Time:** 1 hour (30 min reading + 30 min hands-on)

---

## 📚 Core Concepts

### What is Prompt Engineering?

Prompt engineering is the skill of communicating with AI language models (like Claude and GPT) to get useful, reliable output. It's not about magic words — it's about being clear, specific, and structured in your instructions.

For our AI portfolio project, prompt engineering is the bridge between natural language ("create a futuristic workspace") and Three.js code (position, rotation, material parameters). The better your prompts, the more reliably your AI agent can generate 3D scenes.

### The Anatomy of a Good Prompt

A well-structured prompt has several layers:

**1. System Prompt (Role & Rules)**
Sets the AI's behavior, constraints, and output format.

```
You are a 3D scene designer that converts text descriptions into 
Three.js scene parameters. You ALWAYS output valid JSON. You NEVER 
include explanatory text outside the JSON block.
```

**2. Context (What the AI Needs to Know)**
Provide the vocabulary of available objects, materials, and constraints.

```
Available geometries: box, sphere, cylinder, cone, torus, plane
Available materials: standard, physical, basic
Color format: hex string (e.g., "#ff4444")
Position range: -10 to 10 on each axis
```

**3. Task (What You Want)**
Be specific about the desired output.

```
Convert this description into a scene: "A red cube floating above a blue floor"
```

**4. Format (How to Structure Output)**
Show exactly what the output should look like.

```json
{
  "objects": [
    {
      "name": "string",
      "geometry": "box|sphere|cylinder|...",
      "position": [x, y, z],
      "rotation": [x, y, z],
      "scale": [x, y, z],
      "material": {
        "type": "standard",
        "color": "#hex",
        "roughness": 0-1,
        "metalness": 0-1
      }
    }
  ],
  "lights": [...],
  "camera": {...}
}
```

### Few-Shot Prompting

Give examples of input → output pairs so the AI learns the pattern:

```
Example 1:
Input: "A green sphere on a white table"
Output: {
  "objects": [
    { "name": "table", "geometry": "box", "position": [0, 0.5, 0], 
      "scale": [3, 0.1, 2], "material": { "color": "#ffffff" } },
    { "name": "sphere", "geometry": "sphere", "position": [0, 1.5, 0], 
      "scale": [0.5, 0.5, 0.5], "material": { "color": "#44aa44" } }
  ]
}

Example 2:
Input: "A tall red cylinder next to a blue cube"
Output: {
  "objects": [
    { "name": "cylinder", "geometry": "cylinder", "position": [-1, 1.5, 0], 
      "scale": [0.5, 3, 0.5], "material": { "color": "#ff4444" } },
    { "name": "cube", "geometry": "box", "position": [1, 0.5, 0], 
      "scale": [1, 1, 1], "material": { "color": "#4444ff" } }
  ]
}

Now convert: "A golden ring hovering above a dark platform"
```

### Common Prompt Failure Modes

**Hallucination**: AI invents geometries or properties that don't exist in Three.js
- **Fix**: Explicitly list what's available. "Choose ONLY from: box, sphere, cylinder, cone, torus, plane"

**Inconsistency**: Same prompt gives wildly different outputs each time
- **Fix**: Use structured JSON output, provide examples, lower temperature

**Ambiguity**: "Make it look nice" doesn't translate to specific numbers
- **Fix**: Constrain ranges. "roughness must be between 0.0 and 1.0"

**Format Breaking**: AI adds explanation text mixed into JSON
- **Fix**: "Output ONLY valid JSON. No text before or after the JSON block."

### Temperature and Determinism

When calling LLM APIs, `temperature` controls randomness:
- **temperature: 0** — Most deterministic (same input = same output)
- **temperature: 0.3-0.5** — Slight variation, still structured
- **temperature: 0.7-1.0** — Creative, varied outputs
- **temperature: 1.5+** — Chaotic, unpredictable

For 3D scene generation, start with **temperature: 0.3** — creative enough to produce interesting scenes, structured enough to produce valid JSON.

> **Key Insight:** Prompt engineering for code generation (which includes 3D parameters) is fundamentally about constraining outputs. The more you specify what's valid, the more reliable your results.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **System Prompt** | Instructions that set AI's role and rules | "You are a 3D scene designer..." |
| **Few-Shot** | Providing examples of desired input→output | 2-3 example scene conversions |
| **Zero-Shot** | Asking without examples | "Convert this to a 3D scene" |
| **Temperature** | Controls output randomness (0-2) | 0.3 for structured, 1.0 for creative |
| **Hallucination** | AI inventing non-existent things | "ConeGeometry" when only BoxGeometry exists |
| **Schema** | Defined structure for output | JSON with specific fields |
| **Structured Output** | Forcing response into a specific format | JSON-only responses |
| **Chain of Thought** | Asking AI to reason step-by-step | "First identify objects, then assign properties" |

---

## 💻 Code Examples

### Example 1: Scene Description Schema

```javascript
// Define the schema for 3D scene output
const sceneSchema = {
    objects: [
        {
            name: "descriptive-name",
            geometry: "box | sphere | cylinder | cone | torus | plane",
            position: [0, 0, 0],  // x, y, z
            rotation: [0, 0, 0],  // radians
            scale: [1, 1, 1],     // x, y, z multiplier
            material: {
                type: "standard",  // standard | physical | basic
                color: "#ffffff",
                roughness: 0.5,    // 0 (mirror) to 1 (matte)
                metalness: 0.0,    // 0 (plastic) to 1 (metal)
                opacity: 1.0       // 0 (invisible) to 1 (solid)
            }
        }
    ],
    lights: [
        {
            type: "directional | ambient | point | spot",
            color: "#ffffff",
            intensity: 1.0,
            position: [5, 10, 5],  // Not needed for ambient
            castShadow: false
        }
    ],
    camera: {
        position: [0, 5, 10],
        lookAt: [0, 0, 0],
        fov: 75
    },
    environment: {
        background: "#1a1a2e",
        fog: false
    }
};
```

**What's happening:** We define a clear schema for AI output. This becomes part of your prompt — tell the AI "output must match this exact structure." The schema maps directly to Three.js constructors, making parsing straightforward.

### Example 2: Building a System Prompt

```javascript
const systemPrompt = `You are a Three.js scene designer. You convert natural language 
descriptions into structured JSON that can be directly used to create Three.js scenes.

RULES:
1. Output ONLY valid JSON - no markdown, no explanation, no code fences
2. Use ONLY these geometries: box, sphere, cylinder, cone, torus, plane, icosahedron
3. All positions must be within [-20, 20] range on each axis
4. All colors must be valid hex strings (e.g., "#ff4444")
5. roughness and metalness must be between 0.0 and 1.0
6. Always include at least one light source
7. Objects should be positioned logically (on surfaces, not floating randomly)
8. Ground/floor plane should be at y=0

OUTPUT SCHEMA:
{
  "objects": [{ "name", "geometry", "position", "rotation", "scale", "material" }],
  "lights": [{ "type", "color", "intensity", "position", "castShadow" }],
  "camera": { "position", "lookAt", "fov" },
  "environment": { "background" }
}

EXAMPLES:
Input: "A simple desk with a lamp"
Output: {"objects":[{"name":"desk-top","geometry":"box","position":[0,0.75,0],"rotation":[0,0,0],"scale":[2,0.05,1],"material":{"type":"standard","color":"#8B4513","roughness":0.7,"metalness":0.1}},{"name":"desk-leg-1","geometry":"cylinder","position":[-0.9,0.375,-0.4],"rotation":[0,0,0],"scale":[0.05,0.75,0.05],"material":{"type":"standard","color":"#696969","roughness":0.5,"metalness":0.8}},{"name":"lamp-base","geometry":"cylinder","position":[0.7,0.8,0.3],"rotation":[0,0,0],"scale":[0.15,0.05,0.15],"material":{"type":"standard","color":"#333333","roughness":0.3,"metalness":0.9}},{"name":"lamp-shade","geometry":"cone","position":[0.7,1.2,0.3],"rotation":[3.14,0,0],"scale":[0.2,0.3,0.2],"material":{"type":"standard","color":"#FFFDD0","roughness":0.9,"metalness":0.0}}],"lights":[{"type":"ambient","color":"#404060","intensity":0.3},{"type":"point","color":"#FFE4B5","intensity":1.5,"position":[0.7,1.1,0.3],"castShadow":true}],"camera":{"position":[3,3,3],"lookAt":[0,0.75,0],"fov":60},"environment":{"background":"#1a1a2e"}}`;
```

**What's happening:** This system prompt is comprehensive: it defines the AI's role, constrains its options, specifies exact output format, and provides a worked example. The more detailed your system prompt, the more reliable the output.

### Example 3: Prompt Testing Function

```javascript
// Test prompts locally before connecting to APIs
function testPromptOutput(jsonString) {
    try {
        const scene = JSON.parse(jsonString);
        
        // Validate structure
        const errors = [];
        
        if (!scene.objects || !Array.isArray(scene.objects)) {
            errors.push('Missing or invalid "objects" array');
        }
        
        const validGeometries = ['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'icosahedron'];
        
        scene.objects?.forEach((obj, i) => {
            if (!validGeometries.includes(obj.geometry)) {
                errors.push(`Object ${i}: invalid geometry "${obj.geometry}"`);
            }
            if (!obj.position || obj.position.length !== 3) {
                errors.push(`Object ${i}: invalid position`);
            }
            if (obj.material?.color && !/^#[0-9a-fA-F]{6}$/.test(obj.material.color)) {
                errors.push(`Object ${i}: invalid color "${obj.material.color}"`);
            }
        });
        
        if (errors.length > 0) {
            console.error('Validation errors:', errors);
            return { valid: false, errors };
        }
        
        console.log(`✅ Valid scene with ${scene.objects.length} objects`);
        return { valid: true, scene };
    } catch (e) {
        console.error('JSON parse error:', e.message);
        return { valid: false, errors: [e.message] };
    }
}
```

**What's happening:** Before wiring up real AI APIs, build a validator. This catches issues early and helps you refine your prompt until the AI consistently produces valid output.

> **💡 Try it:** Open Claude or ChatGPT. Paste the system prompt from Example 2, then ask: "Create a cozy reading corner with a bookshelf and armchair." Validate the JSON output with the validator from Example 3.

---

## ✏️ Hands-On Exercises

### Exercise 1: Prompt Design Workshop (⏱️ ~15 min)

**Goal:** Write and test prompts for 3D scene generation

**Instructions:**
1. Copy the system prompt from Example 2
2. Open Claude (claude.ai) or ChatGPT
3. Paste the system prompt, then try these inputs:
   - "A futuristic workspace with a holographic display"
   - "A zen garden with stones and a small bridge"
   - "A game trophy shelf with 3 awards"
4. Check if each output is valid JSON
5. Check if geometries and values are within constraints
6. Note which prompts produce good vs. poor results

**Expected Output:**
Valid JSON scene descriptions for each input, with notes on what worked and what didn't.

---

### Exercise 2: Build a Validator (⏱️ ~20 min)

**Goal:** Create a robust JSON scene validator

**Instructions:**
1. Implement the validator from Example 3 in your project
2. Add checks for: valid light types, camera within reasonable range, scale > 0
3. Test with intentionally bad JSON (missing fields, wrong types)
4. Add a "fix" mode that fills in defaults for missing fields
5. Run validation on all your Exercise 1 outputs

**Expected Output:**
A reusable validation function that catches common AI output issues.

---

### Exercise 3: Prompt Iteration (⏱️ ~15 min)

**Goal:** Improve prompts through testing

**Instructions:**
1. Start with a minimal prompt: "Convert to 3D scene JSON: a castle on a hill"
2. Test it — note what goes wrong
3. Add constraints — test again
4. Add an example — test again
5. Document what each improvement fixed
6. Find the minimal prompt that produces consistently valid output

**Expected Output:**
A documented progression from bad to good prompt with specific improvement notes.

---

## 📖 Curated Resources

### Must-Read

1. **Prompt Engineering Guide** — Anthropic Documentation
   - 🔗 https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
   - Why: Official best practices for writing prompts, directly applicable to our project

2. **OpenAI Prompt Engineering Guide** — OpenAI
   - 🔗 https://platform.openai.com/docs/guides/prompt-engineering
   - Why: Complementary perspective on structured output prompting

### Video Resources

3. **Prompt Engineering for Beginners: Full Workshop** — 9x
   - 🎥 https://www.youtube.com/watch?v=QnZYrD5ia7c (⚠️ VERIFIED)
   - Why: Comprehensive workshop covering all prompt engineering fundamentals

### Deep Dives (optional)

4. **Structured Outputs** — OpenAI Documentation
   - 🔗 https://platform.openai.com/docs/guides/structured-outputs
   - Why: Advanced technique for guaranteeing JSON output format

---

## 🤔 Reflection Questions

1. **Comprehension:** Why is few-shot prompting more reliable than zero-shot for structured output?

2. **Application:** How would you modify the system prompt to support animated scenes (objects that move over time)?

3. **Connection:** How does the schema from today map to the Three.js constructors you learned in Week 1?

4. **Critical Thinking:** What happens if a user asks for something outside your geometry list (e.g., "a detailed car")? How should the AI handle it?

5. **Personal:** What 5 scene descriptions would you want your portfolio AI to handle well?

---

## ➡️ Next Steps

**Tomorrow:** [Day 13: Mapping Natural Language to 3D Parameters](./day-13-brief.md) — Build the JavaScript that turns AI JSON output into actual Three.js objects

Today you learned to talk to AI about 3D scenes. Tomorrow you'll build the code that listens — a parser that takes the JSON from your prompts and creates real Three.js objects in the browser.

**Before moving on, make sure you can:**
- [ ] Write a system prompt with role, rules, and format specification
- [ ] Use few-shot examples to improve output consistency
- [ ] Validate AI output against a schema
- [ ] Identify and fix common prompt failure modes
- [ ] Produce valid scene JSON from natural language descriptions

[← Previous: Day 11 - Performance Optimization](./day-11-brief.md) | [Course Home](../README.md) | [Next: Day 13 - Mapping Language to 3D Parameters →](./day-13-brief.md)
