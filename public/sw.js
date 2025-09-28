const CACHE_NAME = 'nodewave-static-v1';
const API_CACHE = 'nodewave-api-v1';

const CORE_ASSETS = [
	'/',
	'/index.html',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => Promise.all(keys.map((k) => { if (k !== CACHE_NAME && k !== API_CACHE) return caches.delete(k); }))).then(() => self.clients.claim()),
	);
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// API requests: network-first with cache fallback
	if (url.pathname.startsWith('/api') || url.pathname.startsWith('/blog-posts') || url.pathname.startsWith('/authors') || url.pathname.startsWith('/categories') || url.pathname.startsWith('/tags')) {
		event.respondWith(
			fetch(event.request)
				.then((res) => {
					const cloned = res.clone();
					caches.open(API_CACHE).then((cache) => cache.put(event.request, cloned));
					return res;
				})
				.catch(() => caches.match(event.request).then((r) => r || new Response(null, { status: 503 }))),
		);
		return;
	}

	// For navigation & static assets: cache-first then network fallback
	event.respondWith(
		caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
			// only cache GET requests
			if (event.request.method === 'GET' && res && res.status === 200) {
				caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
			}
			return res;
		}).catch(() => cached)),
	);
});

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
