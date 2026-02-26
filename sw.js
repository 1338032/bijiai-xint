const CACHE_NAME = 'bijiAI-v2.8.0';
const CACHE_URLS = [
  './',
  './笔记AI.html',
  './manifest.json'
];

// 安装时缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 网络优先策略：有网用网络，没网用缓存
self.addEventListener('fetch', event => {
  // 只缓存同源的GET请求，不缓存API调用
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/v1/')) return;
  if (event.request.url.includes('api.')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 请求成功，更新缓存
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络失败，尝试从缓存读取
        return caches.match(event.request);
      })
  );
});