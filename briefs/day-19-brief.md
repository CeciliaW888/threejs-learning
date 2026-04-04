# Day 19: Advanced Prompting Techniques

[← Previous: Day 18 - Memory & Context](./day-18-brief.md) | [Course Home](../README.md) | [Next: Day 20 - Deployment & Production Best Practices →](./day-20-brief.md)

---

## 🎯 Learning Objectives

By the end of today, you will be able to:

1. Use chain-of-thought prompting for better scene generation
2. Implement self-critique and refinement loops
3. Apply few-shot learning patterns effectively
4. Use structured output modes (JSON schema enforcement)
5. Debug and improve prompts systematically

**Difficulty:** 🟡 Intermediate  
**Estimated Time:** 1 hour (30 min reading + 30 min hands-on)

---

## 📚 Core Concepts

### Chain-of-Thought Prompting

Instead of asking for the final output directly, ask the AI to "think out loud" first:

**Basic Prompt:**
```
Create a 3D scene for a workspace.
```

**Chain-of-Thought Prompt:**
```
Create a 3D scene for a workspace.

Before generating the JSON, think through:
1. What objects are essential for a workspace?
2. How should they be arranged logically?
3. What lighting would make it feel productive?
4. What colors and materials fit a professional setting?

Then output the scene JSON.
```

The AI produces better results when it reasons step-by-step.

### Self-Critique Pattern

Make the AI review its own output:

```javascript
// Step 1: Generate scene
const scene = await generateScene("futuristic office");

// Step 2: Critique
const critique = await critiqueScene(scene, `
Review this scene JSON for:
- Realism: Are objects positioned logically?
- Aesthetics: Does it look good?
- Technical correctness: Valid values, sensible scales?

Output: {"issues": ["list of problems"], "score": 0-10}
`);

// Step 3: Refine if needed
if (critique.score < 7) {
    const improved = await refineScene(scene, critique.issues);
    return improved;
}
```

This two-step process catches issues before rendering.

### JSON Schema Enforcement

Some APIs support enforced structured output:

```javascript
// OpenAI structured outputs (beta)
const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: messages,
    response_format: {
        type: "json_schema",
        json_schema: {
            name: "scene_schema",
            schema: {
                type: "object",
                properties: {
                    objects: { type: "array", items: { ... } },
                    lights: { type: "array", items: { ... } },
                    // ...
                },
                required: ["objects", "lights", "camera"]
            }
        }
    }
});
```

This *guarantees* valid JSON structure (but not semantic correctness).

### Few-Shot Optimization

Quality examples > quantity. 2-3 perfect examples beat 10 mediocre ones:

```javascript
const fewShotExamples = [
    {
        input: "A zen meditation room",
        output: {
            objects: [
                { name: "floor", geometry: "plane", position: [0,0,0], 
                  material: { color: "#e8d5b7", roughness: 0.9 } },
                { name: "cushion", geometry: "cylinder", position: [0,0.1,0],
                  scale: [0.8,0.2,0.8], material: { color: "#8b0000", roughness: 0.8 } },
                { name: "incense-holder", geometry: "box", position: [1,0.05,0],
                  scale: [0.15,0.05,0.05], material: { color: "#444", roughness: 0.6 } }
            ],
            lights: [
                { type: "ambient", color: "#ffeedd", intensity: 0.6 },
                { type: "directional", color: "#fffacd", intensity: 0.8,
                  position: [3,8,5], castShadow: true }
            ],
            camera: { position: [3,2,3], lookAt: [0,0.3,0], fov: 50 },
            environment: { background: "#f5e6d3" }
        }
    }
    // 1-2 more high-quality examples
];
```

### Debugging Prompt Failures

Systematic approach when prompts fail:

1. **Test isolation** — Remove all context, test with minimal prompt
2. **Add constraints gradually** — Start simple, add rules one by one
3. **Log intermediate outputs** — See AI's reasoning before final JSON
4. **Compare temperature settings** — 0 vs 0.3 vs 0.7
5. **Try different models** — Claude vs GPT-4 vs GPT-3.5

> **Key Insight:** Advanced prompting is about controlling AI behavior precisely. Chain-of-thought adds reasoning. Self-critique adds quality control. Few-shot adds examples. Together, they dramatically improve reliability.

---

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Chain-of-Thought** | Ask AI to reason before answering | "Think step-by-step, then output JSON" |
| **Self-Critique** | AI reviews its own output | "Rate this scene 0-10 and list issues" |
| **Few-Shot Learning** | Provide example input→output pairs | 2-3 perfect scene examples |
| **JSON Schema** | Strict output format enforcement | OpenAI structured outputs |
| **Temperature Sweep** | Testing multiple temperature values | Try 0, 0.3, 0.5, 0.7, 1.0 |
| **Prompt Decomposition** | Breaking complex tasks into steps | Generate → Critique → Refine |

---

## 💻 Code Examples

### Example 1: Chain-of-Thought Scene Generator

```javascript
async function generateSceneWithReasoning(prompt) {
    const enhancedPrompt = `Generate a 3D scene for: "${prompt}"

REASONING STEPS (think through these before outputting JSON):
1. Scene Purpose: What is this scene for? What mood should it convey?
2. Essential Objects: What 3-5 objects are absolutely necessary?
3. Spatial Layout: How should objects be arranged? What's the focal point?
4. Lighting Strategy: What type of lighting best suits this scene?
5. Color Palette: What colors support the mood and purpose?
6. Material Choices: Rough/smooth? Metallic/matte? Why?

After reasoning through the above, output the complete scene JSON.`;

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 6000, // More tokens for reasoning + output
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: enhancedPrompt }]
    });

    const fullText = response.content[0].text;
    
    // Extract JSON (AI will output reasoning text + JSON)
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    const sceneData = JSON.parse(jsonMatch[0]);
    
    // Log reasoning for debugging
    const reasoning = fullText.substring(0, fullText.indexOf('{'));
    console.log('AI Reasoning:', reasoning);
    
    return sceneData;
}
```

**What's happening:** We ask the AI to think through design decisions before generating JSON. This produces more thoughtful, coherent scenes. The reasoning is logged for debugging but not used in rendering.

### Example 2: Self-Critique Loop

```javascript
async function generateWithSelfCritique(prompt, maxIterations = 2) {
    let scene = await generateScene(prompt);
    let iteration = 1;

    while (iteration <= maxIterations) {
        // Critique the scene
        const critiquePrompt = `Review this 3D scene JSON:
${JSON.stringify(scene, null, 2)}

Rate it on these criteria (0-10 each):
- Realism: Are positions/scales logical?
- Aesthetics: Does it look good?
- Completeness: All necessary elements present?
- Technical: Valid values, no errors?

Output:
{
  "scores": {"realism": X, "aesthetics": X, "completeness": X, "technical": X},
  "issues": ["list specific problems"],
  "suggestions": ["list improvements"]
}`;

        const critiqueResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            temperature: 0.2,
            messages: [{ role: 'user', content: critiquePrompt }]
        });

        const critique = JSON.parse(critiqueResponse.content[0].text);
        const avgScore = Object.values(critique.scores).reduce((a,b) => a+b, 0) / 4;

        console.log(`Iteration ${iteration} - Score: ${avgScore.toFixed(1)}/10`);
        console.log('Issues:', critique.issues);

        if (avgScore >= 8.0 || iteration === maxIterations) {
            return scene; // Good enough or max iterations reached
        }

        // Refine based on critique
        const refinePrompt = `The scene has these issues:
${critique.issues.join('\n')}

Suggestions:
${critique.suggestions.join('\n')}

Generate an improved version of the scene addressing these problems.

Original scene:
${JSON.stringify(scene, null, 2)}`;

        const refinedResponse = await generateScene(refinePrompt);
        scene = refinedResponse;
        iteration++;
    }

    return scene;
}
```

**What's happening:** Generate a scene, critique it, refine it, repeat until score >= 8/10 or max iterations. This catches common issues like objects floating in mid-air or bad scaling.

### Example 3: Optimized Few-Shot System

```javascript
const HIGH_QUALITY_EXAMPLES = [
    {
        description: "minimal tech workspace",
        scene: {
            objects: [
                { name: "desk", geometry: "box", position: [0,0.75,0], scale: [2.5,0.08,1.2], 
                  material: { color: "#2a2a2a", roughness: 0.7, metalness: 0.1 } },
                { name: "monitor", geometry: "box", position: [0,1.4,-0.4], scale: [1.2,0.7,0.05],
                  material: { color: "#111111", roughness: 0.2, metalness: 0.8 } },
                { name: "screen-glow", geometry: "box", position: [0,1.4,-0.38], scale: [1.1,0.6,0.01],
                  material: { color: "#4488ff", emissive: "#4488ff", emissiveIntensity: 0.4 } },
                { name: "keyboard", geometry: "box", position: [0,0.82,0.15], scale: [0.6,0.03,0.25],
                  material: { color: "#1a1a1a", roughness: 0.5 } }
            ],
            lights: [
                { type: "ambient", color: "#404060", intensity: 0.3 },
                { type: "directional", color: "#ffffff", intensity: 0.8, position: [5,10,5], castShadow: true },
                { type: "point", color: "#4488ff", intensity: 0.6, position: [0,1.5,-0.3] }
            ],
            camera: { position: [3,2.5,3], lookAt: [0,1,0], fov: 60 },
            environment: { background: "#0a0a1a" }
        }
    }
];

function buildFewShotPrompt(userRequest) {
    let prompt = `You are an expert 3D scene designer. Study these examples:\n\n`;
    
    HIGH_QUALITY_EXAMPLES.forEach((ex, i) => {
        prompt += `EXAMPLE ${i+1}:\n`;
        prompt += `Description: "${ex.description}"\n`;
        prompt += `Scene: ${JSON.stringify(ex.scene)}\n\n`;
    });
    
    prompt += `Now create a scene for: "${userRequest}"\n`;
    prompt += `Follow the same structure and quality as the examples above.`;
    
    return prompt;
}
```

**What's happening:** We provide 1-2 perfect example scenes. The AI learns the expected quality level, object naming conventions, material choices, and lighting patterns. Results are much more consistent.

---

## ✏️ Hands-On Exercises

### Exercise 1: Chain-of-Thought (⏱️ ~15 min)

**Goal:** Implement reasoning-before-output

**Instructions:**
1. Add chain-of-thought prompting from Example 1
2. Test with complex requests: "a cozy library," "futuristic lab," "outdoor café"
3. Compare output quality with/without reasoning
4. Log and read the AI's reasoning — does it make sense?

**Expected Output:**
Better scene coherence and thoughtful design decisions.

---

### Exercise 2: Self-Critique Loop (⏱️ ~20 min)

**Goal:** Add quality control through self-review

**Instructions:**
1. Implement the self-critique function from Example 2
2. Test with 5 different scenes
3. Log scores and issues for each iteration
4. Calculate average improvement (iteration 1 vs final score)

**Expected Output:**
Measurable quality improvement through iteration.

---

### Exercise 3: Few-Shot Optimization (⏱️ ~15 min)

**Goal:** Build a library of high-quality example scenes

**Instructions:**
1. Create 3 perfect example scenes for different use cases
2. Implement few-shot prompt building from Example 3
3. Test scene generation with/without examples
4. Compare consistency and quality

**Expected Output:**
More consistent outputs that match example quality.

---

## 📖 Curated Resources

### Must-Read

1. **Prompt Engineering Guide** — Anthropic
   - 🔗 https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering
   - Why: Comprehensive guide to all prompting techniques

2. **Chain-of-Thought Prompting** — Research Paper
   - 🔗 https://arxiv.org/abs/2201.11903
   - Why: Original research on reasoning prompts (optional deep dive)

---

## 🤔 Reflection Questions

1. **Comprehension:** Why does chain-of-thought improve output quality?

2. **Application:** How would you use self-critique for validating portfolio content (text, project descriptions)?

3. **Connection:** How does few-shot learning relate to the examples we used in Day 12?

4. **Critical Thinking:** What's the cost trade-off of self-critique loops? (2x API calls, longer wait)

5. **Personal:** Which technique improved your scenes most: chain-of-thought, self-critique, or few-shot?

---

## ➡️ Next Steps

**Tomorrow:** [Day 20: Deployment & Production Best Practices](./day-20-brief.md) — Prepare your app for real users

You've mastered advanced prompting. Tomorrow we'll focus on deployment: hosting, environment variables, error monitoring, and making your app production-ready.

**Before moving on, make sure you can:**
- [ ] Use chain-of-thought for complex scene generation
- [ ] Implement self-critique and refinement loops
- [ ] Build effective few-shot prompt libraries
- [ ] Debug prompts systematically
- [ ] Measure quality improvements from advanced techniques

[← Previous: Day 18 - Memory & Context](./day-18-brief.md) | [Course Home](../README.md) | [Next: Day 20 - Deployment & Production →](./day-20-brief.md)
