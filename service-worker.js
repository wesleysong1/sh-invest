const CACHE_VERSION = 'shinheung-invest-v3';
const STATIC_ASSETS = [
  './index.html',
  './teacher.html',
];

// 설치: 정적 파일 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선 (항상 최신 버전 사용)
self.addEventListener('fetch', event => {
  // Supabase API는 캐싱 안 함
  if (event.request.url.includes('supabase.co')) return;
  // CDN 폰트/라이브러리도 캐싱
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
