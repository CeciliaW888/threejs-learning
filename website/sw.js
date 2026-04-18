// Service Worker for Three.js Learning PWA
const CACHE_NAME = 'threejs-course-v4';
const urlsToCache = [
  './',
  './index.html',
  './offline.html',
  './styles.css',
  './main.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  // Lesson modules
  './modules/01-intro-threejs.html',
  './modules/02-first-scene.html',
  './modules/03-geometries-materials.html',
  './modules/04-materials-textures.html',
  './modules/05-lighting.html',
  './modules/06-textures.html',
  './modules/07-mini-project.html',
  './modules/08-animation.html',
  './modules/09-loading-models.html',
  './modules/10-shadows-lighting.html',
  './modules/11-performance.html',
  './modules/12-prompt-engineering.html',
  './modules/13-language-to-3d.html',
  './modules/14-mini-project.html',
  './modules/15-llm-apis.html',
  './modules/16-text-to-3d-pipeline.html',
  './modules/17-realtime-modifications.html',
  './modules/18-memory-context.html',
  './modules/19-advanced-prompting.html',
  './modules/20-deployment.html',
  './modules/21-final-project.html',
  // Quiz data
  './data/quiz-01.json',
  './data/quiz-02.json',
  './data/quiz-03.json',
  './data/quiz-04.json',
  './data/quiz-05.json',
  './data/quiz-06.json',
  './data/quiz-07.json',
  './data/quiz-08.json',
  './data/quiz-09.json',
  './data/quiz-10.json',
  './data/quiz-11.json',
  './data/quiz-12.json',
  './data/quiz-13.json',
  './data/quiz-14.json',
  './data/quiz-15.json',
  './data/quiz-16.json',
  './data/quiz-17.json',
  './data/quiz-18.json',
  './data/quiz-19.json',
  './data/quiz-20.json',
  './data/quiz-21.json',
  // Flashcards
  './data/flashcards.json',
  // Diagrams
  './diagrams/ai-to-3d-pipeline.svg',
  './diagrams/render-pipeline.svg',
  './diagrams/scene-graph.svg'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        await cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network-first for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate' || event.request.url.endsWith('.html')) {
    // Network-first for HTML pages (always get latest content)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./offline.html')))
    );
    return;
  }
  // Cache-first for static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
      .catch(() => { /* no fallback for non-navigation requests */ })
  );
});
