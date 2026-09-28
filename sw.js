// Service worker de la Salle des machines : garde les pages et les ressources pour jouer hors ligne.
// Pense à changer VERSION à chaque ajout de machine pour que les téléphones récupèrent la nouvelle liste.
const VERSION = 'salle-v1';
const FICHIERS = [
  './', 'index.html', 'manifest.webmanifest', 'app/icones/icone-192.png', 'app/icones/icone-512.png',
  'jeux/dead-city-3d.html', 'jeux/dead-city.html', 'jeux/champi-pop-3d.html', 'jeux/champi-pop.html', 'jeux/constella-3d.html', 'jeux/constella.html',
  'app/vignettes/dead-city-3d.jpg', 'app/vignettes/champi-pop-3d.jpg', 'app/vignettes/constella-3d.jpg',
  'app/vignettes/dead-city-3d-large.jpg', 'app/vignettes/champi-pop-3d-large.jpg', 'app/vignettes/constella-3d-large.jpg',
];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
// réseau d'abord pour les pages (nouvelles versions), cache d'abord pour le reste (Three.js, polices, images)
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const page = req.mode === 'navigate' || req.destination === 'iframe' || req.url.endsWith('.html');
  e.respondWith(page
    ? fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req, { ignoreSearch: true }))
    : caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return r; })));
});
