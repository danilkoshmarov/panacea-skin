const CACHE_NAME="panacea-skin-v07-offline";
const MODEL_CACHE_PREFIX="panacea-acne-model-";
const ASSETS=["./","./index.html","./manifest.webmanifest","./app-v02.css","./app-v02.js","./icon.svg"];

self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.filter(key=>key!==CACHE_NAME&&!key.startsWith(MODEL_CACHE_PREFIX)).map(key=>caches.delete(key))
 )).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;

 if(req.mode==="navigate"){
  event.respondWith(fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put("./index.html",copy));}
   return response;
  }).catch(()=>caches.match("./index.html")));
  return;
 }

 event.respondWith(caches.match(req).then(cached=>{
  if(cached)return cached;
  return fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
   return response;
  });
 }));
});
