// Minimal service worker — enables PWA installability ("Add to Home Screen").
// Network passthrough with no precache, so a frequently-redeployed static site
// never serves stale assets.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {
  // No-op handler: let the browser handle every request normally. Its presence
  // is what makes the app installable.
})
