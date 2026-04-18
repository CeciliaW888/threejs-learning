# Three.js Learning

> Build an AI-powered 3D portfolio generator in 21 days

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-c4825a)](https://CeciliaW888.github.io/threejs-learning/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Days](https://img.shields.io/badge/Course-21_Days-blue.svg)](#course-outline)

## About This Course

Learn Three.js from the ground up and build an AI-powered 3D portfolio generator. Starting with 3D fundamentals (scenes, cameras, lighting, materials), progressing through advanced techniques (models, shadows, performance), then integrating AI (prompt engineering, LLM APIs, text-to-3D pipelines) to create a portfolio that generates 3D scenes from natural language descriptions.

**Duration:** 21 days (3 weeks)
**Daily commitment:** 1 hour
**Language:** English
**Level:** Beginner → Advanced

## Learning Goals

By the end of this course, you will be able to:

- Build interactive 3D scenes with Three.js (scenes, cameras, lighting, materials, textures)
- Load and display 3D models (GLTF/GLB) with professional lighting and shadows
- Optimize 3D scenes for 60fps performance on any device
- Write structured prompts that generate parseable 3D scene descriptions
- Build a JSON-to-Three.js scene builder (text → 3D pipeline)
- Integrate Claude/OpenAI APIs for AI-powered scene generation
- Add conversation memory and user profiles to your AI agent
- Deploy a production-ready 3D portfolio with serverless API proxy

## Course Outline

### Week 1: Three.js Foundations

| Day | Topic | Type |
|-----|-------|------|
| 1 | [Introduction to 3D on the Web & Three.js](./week-01/day-01-intro-threejs.md) | Foundations |
| 2 | [Setting Up Your First Scene](./week-01/day-02-first-scene.md) | Foundations |
| 3 | [Geometries & Materials](./week-01/day-03-geometries-materials.md) | Concepts |
| 4 | [Materials Deep Dive](./week-01/day-04-materials-textures.md) | Concepts |
| 5 | [Lighting Fundamentals](./week-01/day-05-lighting.md) | Concepts |
| 6 | [Textures & Asset Loading](./week-01/day-06-textures.md) | Concepts |
| 7 | [Mini Project — 3D Product Showcase](./week-01/day-07-mini-project.md) | Project |

### Week 2: Advanced Techniques + Prompt Engineering

| Day | Topic | Type |
|-----|-------|------|
| 8 | [Animation Fundamentals](./week-02/day-08-animation.md) | Concepts |
| 9 | [Loading 3D Models (GLTF/GLB)](./week-02/day-09-loading-models.md) | Concepts |
| 10 | [Shadows & Realistic Lighting](./week-02/day-10-shadows-lighting.md) | Concepts |
| 11 | [Performance Optimization](./week-02/day-11-performance.md) | Advanced |
| 12 | [Intro to Prompt Engineering for 3D](./week-02/day-12-prompt-engineering.md) | Concepts |
| 13 | [Mapping Natural Language to 3D Parameters](./week-02/day-13-language-to-3d.md) | Advanced |
| 14 | [Mini Project — Prompt-Driven Scene Generator](./week-02/day-14-mini-project.md) | Project |

### Week 3: AI Integration & Portfolio

| Day | Topic | Type |
|-----|-------|------|
| 15 | [Introduction to LLM APIs (Claude & OpenAI)](./week-03/day-15-llm-apis.md) | Concepts |
| 16 | [Building a Text-to-3D Pipeline](./week-03/day-16-text-to-3d-pipeline.md) | Advanced |
| 17 | [Real-Time Scene Modifications](./week-03/day-17-realtime-modifications.md) | Advanced |
| 18 | [Adding Memory & Context to AI Agent](./week-03/day-18-memory-context.md) | Concepts |
| 19 | [Advanced Prompting Techniques](./week-03/day-19-advanced-prompting.md) | Advanced |
| 20 | [Deployment & Production Best Practices](./week-03/day-20-deployment.md) | Advanced |
| 21 | [Final Project — AI Portfolio Generator](./week-03/day-21-final-project.md) | Project |

## Get Started

### Learn Online

Visit the PWA course website on GitHub Pages (installable, works offline):

```
https://CeciliaW888.github.io/threejs-learning/
```

### Learn Locally

```bash
# 1. Clone the course repo
git clone https://github.com/CeciliaW888/threejs-learning.git
cd threejs-learning

# 2. Open the daily study guides
# macOS/Linux:
open week-01/day-01-intro-threejs.md
# Windows:
start week-01/day-01-intro-threejs.md

# 3. Or run the course website locally (requires a server for module loading)
cd website
python -m http.server 8080
# Then open http://localhost:8080 in your browser
```

### Deploy to Your Own GitHub Pages

1. Fork this repo to your GitHub account
2. Go to **Settings → Pages**
3. Set Source to **GitHub Actions**
4. Push to `main` branch to trigger auto-deploy (workflow included)
5. Visit `https://<your-username>.github.io/threejs-learning/`

### Install as PWA

1. Open the course website in Chrome/Edge
2. Click the "Install" icon in the address bar, or the install prompt on the page
3. Once installed, open directly from your desktop/home screen — works offline

## Repo Structure

```
threejs-learning/
├── README.md
├── .github/workflows/deploy.yml
├── week-01/          # Days 1-7: Foundations
│   ├── day-01-intro-threejs.md
│   ├── day-02-first-scene.md
│   └── ...
├── week-02/          # Days 8-14: Advanced + Prompt Engineering
│   ├── day-08-animation.md
│   ├── day-09-loading-models.md
│   └── ...
├── week-03/          # Days 15-21: AI Integration
│   ├── day-15-llm-apis.md
│   ├── day-16-text-to-3d-pipeline.md
│   └── ...
├── diagrams/
└── website/
    ├── index.html
    ├── styles.css
    ├── main.js
    ├── manifest.json
    ├── sw.js
    ├── offline.html
    ├── modules/
    ├── diagrams/
    └── icons/
```

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js Journey (Bruno Simon)](https://threejs-journey.com/)
- [Anthropic API Docs](https://docs.anthropic.com/en/api/getting-started)
- [Poly Haven — Free HDRIs & Textures](https://polyhaven.com/)
- [Poly Pizza — Free 3D Models](https://poly.pizza/)

## License

MIT — See [LICENSE](./LICENSE).
