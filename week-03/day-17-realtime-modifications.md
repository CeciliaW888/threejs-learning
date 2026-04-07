# Day 17: Real-Time Scene Modifications

[← Previous: Day 16](./day-16-brief.md) | [Course Home](../README.md) | [Next: Day 18 →](./day-18-brief.md)

## 🎯 Learning Objectives
1. Implement streaming API responses for real-time updates
2. Handle incremental scene modifications ("make it darker")
3. Manage scene state across multiple commands
4. Build undo/redo functionality

**Difficulty:** 🔴 Advanced | **Time:** 1 hour

## 📚 Core Concepts

### Streaming vs Single Response
- Single: Wait for complete JSON, then render
- Streaming: Receive tokens as they arrive, update incrementally

### Modification Commands
- Additive: "add a table"
- Transformative: "make it darker", "rotate the chair"
- Subtractive: "remove the lamp"

### Code Example: Streaming Handler
```javascript
async modifyScene(command) {
  const stream = await this.client.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    system: `You are modifying an existing 3D scene. Current state: ${JSON.stringify(this.sceneState)}. Output ONLY the changes as JSON.`,
    messages: [{ role: 'user', content: command }]
  });

  let buffer = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      buffer += chunk.delta.text;
      this.tryParseAndApply(buffer);
    }
  }
}
```

## ✏️ Exercise: Build a Modification UI
1. Add command input field
2. Implement streaming modifications
3. Show live updates as AI responds

## 📖 Resources
- Anthropic Streaming Docs: https://docs.anthropic.com/en/api/messages-streaming

[← Previous](./day-16-brief.md) | [Next →](./day-18-brief.md)
